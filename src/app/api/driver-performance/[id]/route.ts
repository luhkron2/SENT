import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updatePerformanceSchema = z.object({
  driverName: z.string().optional(),
  driverEmail: z.string().email().optional(),
  fleetNumber: z.string().optional(),
  periodStart: z.string().datetime().optional(),
  periodEnd: z.string().datetime().optional(),
  issuesReported: z.number().optional(),
  issuesResolved: z.number().optional(),
  avgResponseTime: z.number().optional(),
  safeDrivingScore: z.number().optional(),
  fuelEfficiency: z.number().optional(),
  onTimeDeliveryRate: z.number().optional(),
  notes: z.string().optional()
});

// GET - Get a single driver performance record by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const record = await prisma.driverPerformance.findUnique({
      where: { id: params.id }
    });

    if (!record) {
      return NextResponse.json(
        { error: 'Driver performance record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error('Error fetching driver performance record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch driver performance record' },
      { status: 500 }
    );
  }
}

// PUT - Update a driver performance record
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updatePerformanceSchema.parse(body);

    const updateData: Record<string, unknown> = { ...validatedData };

    // Convert date strings to Date objects
    if (validatedData.periodStart) {
      updateData.periodStart = new Date(validatedData.periodStart);
    }
    if (validatedData.periodEnd) {
      updateData.periodEnd = new Date(validatedData.periodEnd);
    }

    const record = await prisma.driverPerformance.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json({ record });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating driver performance record:', error);
    return NextResponse.json(
      { error: 'Failed to update driver performance record' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a driver performance record
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.driverPerformance.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Driver performance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting driver performance record:', error);
    return NextResponse.json(
      { error: 'Failed to delete driver performance record' },
      { status: 500 }
    );
  }
}
