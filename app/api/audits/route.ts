import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const audits = await prisma.audit.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        address: true,
        revenue: true,
        createdAt: true,
        profitPercent: true,
        healthIndex: true,
      },
    });
    return NextResponse.json(audits);
  } catch (error) {
    console.error('Ошибка получения списка аудитов:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}