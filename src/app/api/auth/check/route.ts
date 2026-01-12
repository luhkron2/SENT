import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const accessLevel = request.cookies.get('accessLevel')?.value;
  
  console.log('[AUTH CHECK] accessLevel cookie:', accessLevel);
  
  if (accessLevel && ['operations', 'workshop', 'admin'].includes(accessLevel)) {
    return NextResponse.json({
      authenticated: true,
      accessLevel,
    });
  }
  
  return NextResponse.json({
    authenticated: false,
    accessLevel: null,
  });
}
