import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createPerformanceSchema = z.object({
  driverName: z.string(),
  driverEmail: z.string().email().optional(),
  fleetNumber: z.string().optional(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  issuesReported: z.number().default(0),
  issuesResolved: z.number().default(0),
  avgResponseTime: z.number().optional(),
  safeDrivingScore: z.number().optional(),
  fuelEfficiency: z.number().optional(),
  onTimeDeliveryRate: z.number().optional(),
  notes: z.string().optional()
});

// GET - List all driver performance records with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const driverName = searchParams.get('driverName');
    const fleetNumber = searchParams.get('fleetNumber');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = {};

    if (driverName) {
      where.driverName = driverName;
    }
    if (fleetNumber) {
      where.fleetNumber = fleetNumber;
    }
    if (startDate || endDate) {
      where.periodStart = {};
      if (startDate) {
        (where.periodStart as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.periodStart as Record<string, Date>).lte = new Date(endDate);
      }
    }

    const records = await prisma.driverPerformance.findMany({
      where,
      orderBy: {
        periodStart: 'desc'
      }
    });

    // Calculate aggregate statistics
    const uniqueDrivers = new Set(records.map(r => r.driverName));
    const totalIssuesReported = records.reduce((sum, r) => sum + r.issuesReported, 0);
    const totalIssuesResolved = records.reduce((sum, r) => sum + r.issuesResolved, 0);
    const avgResponseTime = records
      .filter(r => r.avgResponseTime !== null)
      .reduce((sum, r) => sum + (r.avgResponseTime || 0), 0) / 
      records.filter(r => r.avgResponseTime !== null).length || 0;
    const avgSafeDrivingScore = records
      .filter(r => r.safeDrivingScore !== null)
      .reduce((sum, r) => sum + (r.safeDrivingScore || 0), 0) / 
      records.filter(r => r.safeDrivingScore !== null).length || 0;

    return NextResponse.json({ 
      records,
      stats: {
        uniqueDrivers: uniqueDrivers.size,
        totalIssuesReported,
        totalIssuesResolved,
        avgResponseTime,
        avgSafeDrivingScore,
        totalRecords: records.length
      }
    });
  } catch (error) {
    console.error('Error fetching driver performance records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch driver performance records' },
      { status: 500 }
    );
  }
}

// POST - Create a new driver performance record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createPerformanceSchema.parse(body);

    const record = await prisma.driverPerformance.create({
      data: {
        driverName: validatedData.driverName,
        driverEmail: validatedData.driverEmail,
        fleetNumber: validatedData.fleetNumber,
        periodStart: new Date(validatedData.periodStart),
        periodEnd: new Date(validatedData.periodEnd),
        issuesReported: validatedData.issuesReported,
        issuesResolved: validatedData.issuesResolved,
        avgResponseTime: validatedData.avgResponseTime,
        safeDrivingScore: validatedData.safeDrivingScore,
        fuelEfficiency: validatedData.fuelEfficiency,
        onTimeDeliveryRate: validatedData.onTimeDeliveryRate,
        notes: validatedData.notes
      }
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating driver performance record:', error);
    return NextResponse.json(
      { error: 'Failed to create driver performance record' },
      { status: 500 }
    );
  }
}
