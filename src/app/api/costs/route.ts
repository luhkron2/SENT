import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createCostSchema = z.object({
  issueId: z.string().optional(),
  workOrderId: z.string().optional(),
  maintenanceScheduleId: z.string().optional(),
  category: z.enum(['parts', 'labor', 'external', 'other']),
  description: z.string(),
  amount: z.number().positive(),
  currency: z.string().default('AUD'),
  supplier: z.string().optional(),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.string().datetime().optional()
});

// GET - List all cost records with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const issueId = searchParams.get('issueId');
    const workOrderId = searchParams.get('workOrderId');
    const maintenanceScheduleId = searchParams.get('maintenanceScheduleId');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = {};

    if (issueId) {
      where.issueId = issueId;
    }
    if (workOrderId) {
      where.workOrderId = workOrderId;
    }
    if (maintenanceScheduleId) {
      where.maintenanceScheduleId = maintenanceScheduleId;
    }
    if (category) {
      where.category = category;
    }
    if (startDate || endDate) {
      const dateFilter: { gte?: Date; lte?: Date } = {};
      if (startDate) {
        dateFilter.gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.lte = new Date(endDate);
      }
      where.createdAt = dateFilter;
    }

    const costs = await prisma.costRecord.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate totals by category
    const totals = costs.reduce((acc, cost) => {
      if (!acc[cost.category]) {
        acc[cost.category] = { count: 0, total: 0 };
      }
      const categoryData = acc[cost.category];
      if (categoryData) {
        categoryData.count += 1;
        categoryData.total += cost.amount;
      }
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    const grandTotal = costs.reduce((sum, cost) => sum + cost.amount, 0);

    return NextResponse.json({ 
      costs, 
      totals,
      grandTotal,
      count: costs.length
    });
  } catch (error) {
    console.error('Error fetching cost records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cost records' },
      { status: 500 }
    );
  }
}

// POST - Create a new cost record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createCostSchema.parse(body);

    const cost = await prisma.costRecord.create({
      data: {
        issueId: validatedData.issueId,
        workOrderId: validatedData.workOrderId,
        maintenanceScheduleId: validatedData.maintenanceScheduleId,
        category: validatedData.category,
        description: validatedData.description,
        amount: validatedData.amount,
        currency: validatedData.currency,
        supplier: validatedData.supplier,
        invoiceNumber: validatedData.invoiceNumber,
        invoiceDate: validatedData.invoiceDate ? new Date(validatedData.invoiceDate) : null
      }
    });

    return NextResponse.json({ cost }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating cost record:', error);
    return NextResponse.json(
      { error: 'Failed to create cost record' },
      { status: 500 }
    );
  }
}
