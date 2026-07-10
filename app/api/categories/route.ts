import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Получаем уникальные значения application_area и type
    const categories = await prisma.techCard.findMany({
      select: { applicationArea: true },
      distinct: ['applicationArea'],
      where: { applicationArea: { not: null } },
    });

    const types = await prisma.techCard.findMany({
      select: { type: true },
      distinct: ['type'],
      where: { type: { not: null } },
    });

    return NextResponse.json({
      categories: categories.map((c) => c.applicationArea).filter(Boolean),
      types: types.map((t) => t.type).filter(Boolean),
    });
  } catch (error) {
    console.error('❌ Ошибка при получении категорий:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить категории' },
      { status: 500 }
    );
  }
}