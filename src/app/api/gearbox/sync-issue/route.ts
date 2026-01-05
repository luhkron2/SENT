import { NextRequest, NextResponse } from 'next/server';
import { getGearboxClient } from '@/lib/gearbox';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const syncSchema = z.object({
  issueId: z.string(),
  fleetNumber: z.string(),
  description: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validation = syncSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid request data' },
        { status: 400 }
      );
    }

    const { issueId, fleetNumber, description, severity } = validation.data;

    const gearboxClient = getGearboxClient();
    
    const faultReport = await gearboxClient.createFaultReport({
      fleet_number: fleetNumber,
      description,
      report_date: new Date().toISOString().split('T')[0],
      severity: severity?.toLowerCase(),
      status: 'open',
    });

    logger.info(`Issue ${issueId} synced to Gearbox as fault report ${faultReport.id}`);

    return NextResponse.json({
      success: true,
      gearboxFaultId: faultReport.id,
      issueId,
    });
  } catch (error) {
    logger.error('Failed to sync issue to Gearbox:', error instanceof Error ? error : undefined);
    
    if (error instanceof Error && error.message.includes('not configured')) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    return NextResponse.json(
      { error: 'Failed to sync issue to Gearbox' },
      { status: 500 }
    );
  }
}
