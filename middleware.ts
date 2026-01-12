import { NextRequest, NextResponse } from 'next/server';

const rateLimit = new Map<string, { count: number; resetTime: number }>();
function isRateLimited(ip: string, limit = 50, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimit.get(ip);
  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }
  if (record.count >= limit) {
    return true;
  }
  record.count++;
  return false;
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessLevel = req.cookies.get('accessLevel')?.value;
  const ip =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    'unknown';

  // Debug logging for admin routes
  if (pathname.startsWith('/admin')) {
    console.log(`[MIDDLEWARE] Admin route: ${pathname}, accessLevel: ${accessLevel}`);
  }

  if (pathname.startsWith('/api/')) {
    if (isRateLimited(ip, 50, 60000)) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/report', '/access', '/api/issues', '/api/upload', '/api/mappings', '/api/access', '/api/auth'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected routes
  const protectedRoutes = ['/workshop', '/operations', '/schedule', '/issues', '/admin', '/fleet'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  const roleFromAccess =
    accessLevel === 'operations'
      ? 'OPERATIONS'
      : accessLevel === 'workshop'
        ? 'WORKSHOP'
        : accessLevel === 'admin'
          ? 'ADMIN'
          : undefined;

  if (isProtectedRoute && !roleFromAccess) {
    console.log(`[MIDDLEWARE] Redirecting to access: ${pathname}, no access level found`);
    const accessUrl = new URL('/access', req.url);
    return NextResponse.redirect(accessUrl);
  }

  // Role-based gates
  // Role-based gates - only redirect if no valid role
  if (!roleFromAccess && isProtectedRoute) {
    console.log(`[MIDDLEWARE] Redirecting to access: ${pathname}, no access level found`);
    const accessUrl = new URL('/access', req.url);
    return NextResponse.redirect(accessUrl);
  }

  // Admin-only routes
  if (pathname.startsWith('/admin')) {
    if (roleFromAccess !== 'ADMIN') {
      console.log(`[MIDDLEWARE] Admin access denied: ${pathname}, role: ${roleFromAccess}`);
      return NextResponse.redirect(new URL('/', req.url));
    }
    console.log(`[MIDDLEWARE] Admin access granted: ${pathname}, role: ${roleFromAccess}`);
  }

  if (pathname.startsWith('/operations')) {
    if (roleFromAccess !== 'OPERATIONS' && roleFromAccess !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  if (pathname.startsWith('/workshop')) {
    if (roleFromAccess !== 'WORKSHOP' && roleFromAccess !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Check /schedule, /issues, /fleet (but not /admin/issues, /admin/workorders, etc.)
  if (!pathname.startsWith('/admin') && (pathname.startsWith('/schedule') || pathname.startsWith('/issues') || pathname.startsWith('/fleet'))) {
    if (roleFromAccess !== 'WORKSHOP' && roleFromAccess !== 'OPERATIONS' && roleFromAccess !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  const response = NextResponse.next();
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "media-src 'self' blob:",
  ].join('; ');
  response.headers.set('Content-Security-Policy', csp);
  if (isProtectedRoute) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.svg$|favicon.ico).*)'],
};

