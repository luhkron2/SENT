import { NextResponse } from 'next/server';
import { getGearboxClient } from '@/lib/gearbox';
import { logger } from '@/lib/logger';

export async function GET(): Promise<NextResponse> {
  try {
    const gearboxClient = getGearboxClient();
    const services = await gearboxClient.getServices();

    return NextResponse.json({ services });
  } catch (error) {
    logger.error('Failed to fetch Gearbox services:', error instanceof Error ? error : undefined);
    
    if (error instanceof Error && error.message.includes('not configured')) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch services from Gearbox' },
      { status: 500 }
    );
  }
}
