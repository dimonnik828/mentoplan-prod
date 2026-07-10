import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const latestAudit = await prisma.audit.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!latestAudit) {
      return NextResponse.json({ error: 'Аудитов пока нет' }, { status: 404 });
    }

    return NextResponse.json(latestAudit);
  } catch (error) {
    console.error('Ошибка получения последнего аудита:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}