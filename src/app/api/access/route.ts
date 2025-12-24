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

function buildSuccessResponse(accessType: 'operations' | 'workshop') {
  const response = NextResponse.json({
    success: true,
    accessType,
    redirect: accessType === 'operations' ? '/operations' : '/workshop',
  });

  const cookieOptions = {
    httpOnly: false,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 12,
    secure: process.env.NODE_ENV === 'production',
  };

  response.cookies.set('accessAuth', 'true', cookieOptions);
  response.cookies.set('accessLevel', accessType, cookieOptions);

  return response;
}

function buildInvalidResponse(message: string, status = 401) {
  const response = NextResponse.json({ error: message }, { status });
  response.cookies.set('accessAuth', '', { path: '/', maxAge: 0 });
  response.cookies.set('accessLevel', '', { path: '/', maxAge: 0 });
  return response;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validated = accessSchema.parse(body);

    // dY"` MASTER PASSWORD CHECK - Always grants access
    if (validated.password === 'KRON@04') {
      return buildSuccessResponse(validated.accessType);
    }

    const expectedPassword = ACCESS_PASSWORDS[validated.accessType];

    if (!expectedPassword) {
      return buildInvalidResponse('Invalid access type', 400);
    }

    const isValid = secureCompare(validated.password, expectedPassword);

    if (isValid) {
      return buildSuccessResponse(validated.accessType);
    } else {
      return buildInvalidResponse('Invalid password');
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
