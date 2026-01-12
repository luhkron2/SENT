import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const querySchema = z.object({
  category: z.string().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  fleetNumber: z.string().optional(),
  days: z.string().transform(Number).optional()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validated = querySchema.parse({
      category: searchParams.get('category'),
      severity: searchParams.get('severity'),
      fleetNumber: searchParams.get('fleetNumber'),
      days: searchParams.get('days')
    });

    // Mock historical repair time data
    // In production, this would query your maintenance database
    const baseRepairTimes = {
      'Engine': { LOW: 2, MEDIUM: 4, HIGH: 8, CRITICAL: 12 },
      'Brakes': { LOW: 1, MEDIUM: 2, HIGH: 4, CRITICAL: 6 },
      'Transmission': { LOW: 3, MEDIUM: 6, HIGH: 12, CRITICAL: 24 },
      'Electrical': { LOW: 0.5, MEDIUM: 1, HIGH: 3, CRITICAL: 6 },
      'Suspension': { LOW: 2, MEDIUM: 3, HIGH: 6, CRITICAL: 8 },
      'Tires': { LOW: 0.5, MEDIUM: 1, HIGH: 2, CRITICAL: 3 },
      'Body': { LOW: 1, MEDIUM: 2, HIGH: 4, CRITICAL: 8 },
      'Other': { LOW: 1, MEDIUM: 2, HIGH: 4, CRITICAL: 6 }
    };

    const category = validated.category || 'Other';
    const severity = validated.severity || 'MEDIUM';
    
    const categoryTimes = baseRepairTimes[category as keyof typeof baseRepairTimes] || baseRepairTimes.Other;
    const baseTime = categoryTimes[severity];
    
    // Add some variation to simulate real-world data
    const variation = (Math.random() - 0.5) * 2; // ±1 hour variation
    const averageHours = Math.max(0.5, baseTime + variation);
    
    // Generate mock historical data points
    const historicalData = Array.from({ length: 10 }, (_, i) => ({
      date: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      hours: Math.max(0.5, baseTime + (Math.random() - 0.5) * 4),
      issueCount: Math.floor(Math.random() * 5) + 1
    })).reverse();

    return NextResponse.json({
      category,
      severity,
      averageHours: Math.round(averageHours * 10) / 10,
      medianHours: Math.round((averageHours * 0.9) * 10) / 10,
      minHours: Math.round((averageHours * 0.5) * 10) / 10,
      maxHours: Math.round((averageHours * 1.8) * 10) / 10,
      sampleSize: Math.floor(Math.random() * 50) + 20,
      confidence: 0.85 + Math.random() * 0.1,
      trend: Math.random() > 0.5 ? 'improving' : 'stable',
      historicalData,
      lastUpdated: new Date().toISOString(),
      insights: [
        `${category} repairs typically take ${Math.round(averageHours)} hours`,
        `${severity} severity issues average ${Math.round(averageHours)} hours`,
        historicalData.length > 5 ? 'Sufficient historical data available' : 'Limited historical data'
      ]
    });

  } catch (error) {
    console.error('Repair time analytics error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get repair time analytics' },
      { status: 500 }
    );
  }
}