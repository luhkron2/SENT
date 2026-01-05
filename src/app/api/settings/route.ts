import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const settingsSchema = z.object({
  siteName: z.string().min(1),
  maintenanceMode: z.boolean(),
  allowGuestReports: z.boolean(),
  autoArchiveDays: z.number().min(7).max(365),
  notificationsEnabled: z.boolean(),
  emailAlerts: z.boolean(),
  syncInterval: z.number().min(1).max(60),
});

let systemSettings = {
  siteName: 'SE Repairs',
  maintenanceMode: false,
  allowGuestReports: true,
  autoArchiveDays: 90,
  notificationsEnabled: true,
  emailAlerts: true,
  syncInterval: 15,
};

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(systemSettings);
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validation = settingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid settings' },
        { status: 400 }
      );
    }

    systemSettings = { ...systemSettings, ...validation.data };

    logger.info('System settings updated', { settings: systemSettings });

    return NextResponse.json(systemSettings);
  } catch (error) {
    logger.error('Failed to update settings', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
