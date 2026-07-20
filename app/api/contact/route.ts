import { NextRequest, NextResponse } from 'next/server';

// Хранилище для отслеживания запросов (в памяти, сбрасывается при перезапуске)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS = 3;          // максимум сообщений
const WINDOW_MS = 10 * 60 * 1000; // за 10 минут

export async function POST(request: NextRequest) {
  try {
    // 1. Получаем IP отправителя
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : request.ip || 'unknown';

    // 2. Проверяем лимит
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (record && now < record.resetTime) {
      if (record.count >= MAX_REQUESTS) {
        return NextResponse.json(
          { error: 'Слишком много сообщений. Попробуйте позже.' },
          { status: 429 }
        );
      }
      record.count++;
    } else {
      // Новый интервал
      rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    }

    // 3. Обрабатываем форму
    const body = await request.json();
    const { name, email, message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Сообщение обязательно' }, { status: 400 });
    }

    const text = `📩 Новое сообщение с mentoplan.ru\n\n👤 Имя: ${name || 'не указано'}\n💬 Сообщение:\n${message}`;

    const tgResponse = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'HTML',
        }),
      }
    );

    if (!tgResponse.ok) {
      const errData = await tgResponse.json();
      console.error('Telegram API error:', errData);
      throw new Error('Ошибка отправки в Telegram');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Не удалось отправить сообщение' }, { status: 500 });
  }
}