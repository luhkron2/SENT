import { NextResponse } from 'next/server';

export function GET() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const robotsTxt = isProduction
    ? `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /operations
Disallow: /workshop

Sitemap: ${process.env.NEXT_PUBLIC_APP_URL || 'https://serepairs.com.au'}/sitemap.xml
`
    : `User-agent: *
Disallow: /
`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}