// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname;

  // Защищаем все роуты, начинающиеся с /api/admin/
  if (url.startsWith('/api/admin/')) {
    const token = request.headers.get('x-admin-token');

    // Сравниваем с токеном из переменных окружения
    if (token !== process.env.ADMIN_API_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

// Применяем middleware только к /api/admin/...
export const config = {
  matcher: '/api/admin/:path*',
};