import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createTaskSchema = z.object({
  name: z.string(),
  description: z.string().optional()
});

// GET - Get all tasks for a maintenance schedule
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tasks = await prisma.maintenanceTask.findMany({
      where: { maintenanceScheduleId: params.id },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching maintenance tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch maintenance tasks' },
      { status: 500 }
    );
  }
}

// POST - Create a new task for a maintenance schedule
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    const task = await prisma.maintenanceTask.create({
      data: {
        maintenanceScheduleId: params.id,
        name: validatedData.name,
        description: validatedData.description
      }
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating maintenance task:', error);
    return NextResponse.json(
      { error: 'Failed to create maintenance task' },
      { status: 500 }
    );
  }
}
