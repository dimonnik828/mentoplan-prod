// app/api/admin/ttk/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const ttks = await prisma.tTK.findMany({
      orderBy: { title: 'asc' },
    });
    return NextResponse.json(ttks);
  } catch (error) {
    console.error('[TTK GET]', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

// POST временно отключён, чтобы избежать ошибок с несуществующими полями
export async function POST(request: Request) {
  return NextResponse.json({ error: 'Создание ТТК временно недоступно' }, { status: 501 });
}