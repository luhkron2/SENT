import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateCostSchema = z.object({
  category: z.enum(['parts', 'labor', 'external', 'other']).optional(),
  description: z.string().optional(),
  amount: z.number().positive().optional(),
  currency: z.string().optional(),
  supplier: z.string().optional(),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.string().datetime().optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.string().datetime().optional()
});

// GET - Get a single cost record by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cost = await prisma.costRecord.findUnique({
      where: { id: params.id }
    });

    if (!cost) {
      return NextResponse.json(
        { error: 'Cost record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ cost });
  } catch (error) {
    console.error('Error fetching cost record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cost record' },
      { status: 500 }
    );
  }
}

// PUT - Update a cost record
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateCostSchema.parse(body);

    const updateData: Record<string, unknown> = { ...validatedData };

    // Convert date strings to Date objects
    if (validatedData.invoiceDate) {
      updateData.invoiceDate = new Date(validatedData.invoiceDate);
    }
    if (validatedData.approvedAt) {
      updateData.approvedAt = new Date(validatedData.approvedAt);
    }

    const cost = await prisma.costRecord.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json({ cost });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating cost record:', error);
    return NextResponse.json(
      { error: 'Failed to update cost record' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a cost record
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.costRecord.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Cost record deleted successfully' });
  } catch (error) {
    console.error('Error deleting cost record:', error);
    return NextResponse.json(
      { error: 'Failed to delete cost record' },
      { status: 500 }
    );
  }
}
