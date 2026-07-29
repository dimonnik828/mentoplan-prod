import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    console.log('API login called, password:', password);
    console.log('Env ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD);

    if (password === process.env.ADMIN_PASSWORD) {
      // Важно: cookies() возвращает Promise, нужно await
      const cookieStore = await cookies();
        cookieStore.set('admin_token', 'true', {
          httpOnly: true,
          secure: false,          // ← HTTP
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60,
        });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
  } catch (err) {
    console.error('Login API error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}