// app/api/audits/latest/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const audit = await prisma.audit.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    if (!audit) {
      return NextResponse.json({ error: 'Аудиты не найдены' }, { status: 404 });
    }
    return NextResponse.json(audit);
  } catch (error) {
    console.error('[API audits/latest]', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}