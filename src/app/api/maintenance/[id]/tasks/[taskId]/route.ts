import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateTaskSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
  notes: z.string().optional()
});

// PUT - Update a maintenance task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    const updateData: Record<string, unknown> = { ...validatedData };

    // If marking as completed, set completedAt
    if (validatedData.completed === true) {
      updateData.completedAt = new Date();
    } else if (validatedData.completed === false) {
      updateData.completedAt = null;
    }

    const task = await prisma.maintenanceTask.update({
      where: { id: params.taskId },
      data: updateData
    });

    return NextResponse.json({ task });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating maintenance task:', error);
    return NextResponse.json(
      { error: 'Failed to update maintenance task' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a maintenance task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    await prisma.maintenanceTask.delete({
      where: { id: params.taskId }
    });

    return NextResponse.json({ message: 'Maintenance task deleted successfully' });
  } catch (error) {
    console.error('Error deleting maintenance task:', error);
    return NextResponse.json(
      { error: 'Failed to delete maintenance task' },
      { status: 500 }
    );
  }
}
