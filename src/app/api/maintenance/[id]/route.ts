import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateMaintenanceSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(['PREVENTIVE', 'CORRECTIVE', 'PREDICTIVE', 'INSPECTION']).optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE']).optional(),
  scheduledAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  assignedToId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  estimatedHours: z.number().optional(),
  actualHours: z.number().optional(),
  cost: z.number().optional(),
  notes: z.string().optional(),
  recurring: z.boolean().optional(),
  recurringInterval: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional()
});

// GET - Get a single maintenance schedule by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const schedule = await prisma.maintenanceSchedule.findUnique({
      where: { id: params.id },
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
      }
    });

    if (!schedule) {
      return NextResponse.json(
        { error: 'Maintenance schedule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error('Error fetching maintenance schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch maintenance schedule' },
      { status: 500 }
    );
  }
}

// PUT - Update a maintenance schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateMaintenanceSchema.parse(body);

    const updateData: Record<string, unknown> = { ...validatedData };

    // Convert date strings to Date objects
    if (validatedData.scheduledAt) {
      updateData.scheduledAt = new Date(validatedData.scheduledAt);
    }
    if (validatedData.completedAt) {
      updateData.completedAt = new Date(validatedData.completedAt);
    }

    // If marking as completed, set completedAt if not provided
    if (validatedData.status === 'COMPLETED' && !updateData.completedAt) {
      updateData.completedAt = new Date();
    }

    // If this is a recurring maintenance and it's completed, create next occurrence
    let nextSchedule = null;
    if (validatedData.status === 'COMPLETED') {
      const existingSchedule = await prisma.maintenanceSchedule.findUnique({
        where: { id: params.id },
        include: {
          tasks: true
        }
      });

      if (existingSchedule?.recurring && existingSchedule.recurringInterval && existingSchedule.recurringNextDate) {
        // Create next occurrence
        const nextDate = new Date(existingSchedule.recurringNextDate);
        const intervalAfterNext = calculateNextDate(nextDate, existingSchedule.recurringInterval);

        nextSchedule = await prisma.maintenanceSchedule.create({
          data: {
            fleetNumber: existingSchedule.fleetNumber,
            title: existingSchedule.title,
            description: existingSchedule.description,
            type: existingSchedule.type,
            scheduledAt: nextDate,
            assignedToId: existingSchedule.assignedToId,
            priority: existingSchedule.priority,
            estimatedHours: existingSchedule.estimatedHours,
            cost: existingSchedule.cost,
            notes: existingSchedule.notes,
            recurring: existingSchedule.recurring,
            recurringInterval: existingSchedule.recurringInterval,
            recurringNextDate: intervalAfterNext,
            tasks: {
              create: existingSchedule.tasks.map((task) => ({
                name: task.name,
                description: task.description ?? undefined
              }))
            }
          }
        });

        // Update current schedule to reference next occurrence
        updateData.recurringNextDate = nextDate;
      }
    }

    const schedule = await prisma.maintenanceSchedule.update({
      where: { id: params.id },
      data: updateData,
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
      }
    });

    return NextResponse.json({ 
      schedule,
      nextSchedule 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating maintenance schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update maintenance schedule' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a maintenance schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.maintenanceSchedule.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Maintenance schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting maintenance schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete maintenance schedule' },
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
