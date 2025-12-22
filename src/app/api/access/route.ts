import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { secureCompare } from '@/lib/utils';

const accessSchema = z.object({
  accessType: z.enum(['operations', 'workshop']),
  password: z.string().min(1),
});

// Get passwords from environment variables with fallbacks for development
const ACCESS_PASSWORDS: Record<string, string> = {
  operations: process.env.OPERATIONS_PASSWORD || 'ops123',
  workshop: process.env.WORKSHOP_PASSWORD || 'workshop123',
};

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

    const isValid = secureCompare(validated.password, expectedPassword);

    if (isValid) {
      return NextResponse.json({ 
        success: true, 
        accessType: validated.accessType,
        redirect: validated.accessType === 'operations' ? '/operations' : '/workshop'
      });
    } else {
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
