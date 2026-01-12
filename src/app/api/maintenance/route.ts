import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for creating a maintenance schedule
const createMaintenanceSchema = z.object({
  fleetNumber: z.string(),
  title: z.string(),
  description: z.string().optional(),
  type: z.enum(['PREVENTIVE', 'CORRECTIVE', 'PREDICTIVE', 'INSPECTION']).default('PREVENTIVE'),
  scheduledAt: z.string().datetime(),
  assignedToId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  estimatedHours: z.number().optional(),
  cost: z.number().optional(),
  notes: z.string().optional(),
  recurring: z.boolean().default(false),
  recurringInterval: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  tasks: z.array(z.object({
    name: z.string(),
    description: z.string().optional()
  })).optional()
});

// GET - List all maintenance schedules with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fleetNumber = searchParams.get('fleetNumber');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = {};

    if (fleetNumber) {
      where.fleetNumber = fleetNumber;
    }
    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }
    if (startDate || endDate) {
      const dateFilter: { gte?: Date; lte?: Date } = {};
      if (startDate) {
        dateFilter.gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.lte = new Date(endDate);
      }
      where.scheduledAt = dateFilter;
    }

    const schedules = await prisma.maintenanceSchedule.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tasks: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('Error fetching maintenance schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch maintenance schedules' },
      { status: 500 }
    );
  }
}

// POST - Create a new maintenance schedule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createMaintenanceSchema.parse(body);

    // Calculate next recurring date if recurring
    let recurringNextDate: Date | null = null;
    if (validatedData.recurring && validatedData.recurringInterval) {
      const scheduledDate = new Date(validatedData.scheduledAt);
      recurringNextDate = calculateNextDate(scheduledDate, validatedData.recurringInterval);
    }

    const schedule = await prisma.maintenanceSchedule.create({
      data: {
        fleetNumber: validatedData.fleetNumber,
        title: validatedData.title,
        description: validatedData.description,
        type: validatedData.type,
        scheduledAt: new Date(validatedData.scheduledAt),
        assignedToId: validatedData.assignedToId,
        priority: validatedData.priority,
        estimatedHours: validatedData.estimatedHours,
        cost: validatedData.cost,
        notes: validatedData.notes,
        recurring: validatedData.recurring,
        recurringInterval: validatedData.recurringInterval,
        recurringNextDate,
        tasks: validatedData.tasks ? {
          create: validatedData.tasks.map(task => ({
            name: task.name,
            description: task.description
          }))
        } : undefined
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tasks: true
      }
    });

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating maintenance schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create maintenance schedule' },
      { status: 500 }
    );
  }
}

// Helper function to calculate next recurring date
function calculateNextDate(date: Date, interval: string): Date {
  const nextDate = new Date(date);
  switch (interval) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }
  return nextDate;
}
