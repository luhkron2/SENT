import { NextRequest, NextResponse } from 'next/server';
import { getGearboxClient } from '@/lib/gearbox';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter');

    const gearboxClient = getGearboxClient();
    const vehicles = await gearboxClient.getVehicles(filter ? { filter } : undefined);

    return NextResponse.json({ vehicles });
  } catch (error) {
    logger.error('Failed to fetch Gearbox vehicles:', error instanceof Error ? error : undefined);
    
    if (error instanceof Error && error.message.includes('not configured')) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch vehicles from Gearbox' },
      { status: 500 }
    );
  }
}
