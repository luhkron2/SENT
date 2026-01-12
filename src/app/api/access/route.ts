import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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

    // Simple direct comparison
    const isValid = validated.password === expectedPassword;

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
      response.cookies.set('accessLevel', validated.accessType, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      return response;
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
