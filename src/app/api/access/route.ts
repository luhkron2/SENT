import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { secureCompare } from '@/lib/utils';
import { logger } from '@/lib/logger';

const accessSchema = z.object({
  accessType: z.enum(['operations', 'workshop', 'admin']),
  password: z.string().min(1),
});

// Get passwords from environment variables with fallbacks for development
const ACCESS_PASSWORDS: Record<string, string> = {
  operations: process.env.OPERATIONS_PASSWORD || 'SENATIONAL07',
  workshop: process.env.WORKSHOP_PASSWORD || 'SENATIONAL04',
  admin: process.env.ADMIN_PASSWORD || 'admin123',
};

const isProduction = process.env.NODE_ENV === 'production';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validated = accessSchema.parse(body);

    const expectedPassword = ACCESS_PASSWORDS[validated.accessType];
    
    if (!expectedPassword) {
      return NextResponse.json(
        { error: 'Invalid access type' },
        { status: 400 }
      );
    }

    // Use secure timing-safe comparison
    const isValid = secureCompare(validated.password, expectedPassword);

    if (isValid) {
      const redirectMap: Record<string, string> = {
        operations: '/operations',
        workshop: '/workshop',
        admin: '/admin'
      };

      const response = NextResponse.json({
        success: true,
        accessType: validated.accessType,
        redirect: redirectMap[validated.accessType]
      });
      
      // Set cookie with proper production/development settings
      response.cookies.set('accessLevel', validated.accessType, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      
      logger.info('Access granted', { accessType: validated.accessType });
      return response;
    } else {
      logger.warn('Invalid password attempt', { accessType: validated.accessType });
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    logger.error('Access API error', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
