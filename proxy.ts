import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Защита страницы /admin/analytics
  if (pathname.startsWith('/admin/analytics')) {
    const token = request.cookies.get('admin_token')?.value;
    if (token !== 'true') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Защита API /api/admin/* (кроме /api/admin/login и /api/admin/analytics/track)
  if (
    pathname.startsWith('/api/admin/') &&
    !pathname.startsWith('/api/admin/login') &&
    !pathname.startsWith('/api/admin/analytics/track')
  ) {
    const token = request.cookies.get('admin_token')?.value;
    if (token !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/analytics/:path*', '/api/admin/:path*'],
};