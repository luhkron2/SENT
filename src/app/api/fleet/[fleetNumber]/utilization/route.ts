import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { fleetNumber: string } }
) {
  try {
    const fleetNumber = params.fleetNumber;
    
    // Mock fleet utilization calculation
    // In production, this would integrate with fleet management system
    const fleetNum = parseInt(fleetNumber);
    
    // Calculate utilization based on fleet number patterns
    let baseUtilization = 85; // Default 85%
    
    if (fleetNum >= 400 && fleetNum < 450) {
      // Express routes - higher utilization
      baseUtilization = 92;
    } else if (fleetNum >= 300 && fleetNum < 400) {
      // Priority routes
      baseUtilization = 88;
    } else if (fleetNum >= 200 && fleetNum < 300) {
      // Standard routes
      baseUtilization = 85;
    } else {
      // Local/backup routes
      baseUtilization = 75;
    }
    
    // Add some randomness to simulate real-world variation
    const variation = (Math.random() - 0.5) * 10; // ±5%
    const utilization = Math.max(60, Math.min(100, baseUtilization + variation));
    
    return NextResponse.json({
      fleetNumber,
      utilization: Math.round(utilization),
      category: fleetNum >= 400 ? 'EXPRESS' : fleetNum >= 300 ? 'PRIORITY' : fleetNum >= 200 ? 'STANDARD' : 'LOCAL',
      lastUpdated: new Date().toISOString(),
      metrics: {
        hoursActive: Math.round(utilization * 0.24), // Hours per day
        milesPerDay: Math.round(utilization * 5), // Approximate miles
        routeEfficiency: Math.round(utilization * 0.95) // Route completion rate
      }
    });
    
  } catch (error) {
    console.error('Fleet utilization error:', error);
    return NextResponse.json(
      { error: 'Failed to get fleet utilization' },
      { status: 500 }
    );
  }
}