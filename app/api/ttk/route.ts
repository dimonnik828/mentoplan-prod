// app/api/ttk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Схема для query-параметров пагинации
const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  // search: z.string().optional(), // можно добавить поиск позже
});

export async function GET(request: NextRequest) {
  try {
    // 1. Извлекаем и валидируем query-параметры
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());

    let page: number, limit: number;
    try {
      const parsed = querySchema.parse(rawParams);
      page = parsed.page;
      limit = parsed.limit;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Ошибка валидации параметров',
            details: error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }
      throw error; // не ZodError — пробрасываем дальше
    }

    const skip = (page - 1) * limit;

    // 2. Запрашиваем данные
    const [techCards, total] = await Promise.all([
      prisma.techCard.findMany({
        orderBy: { dishName: 'asc' },
        skip,
        take: limit,
      }),
      prisma.techCard.count(),
    ]);

    const data = techCards.map(card => ({
      id: card.id,
      title: card.dishName,
      number: card.cardNumber,
      applicationArea: card.applicationArea,
      portionNorm: card.portionNorm,
      technology: card.technology,
      technologySource: card.technologySource,
      servingRequirements: card.servingRequirements,
      totalOutputKg: card.totalOutputKg,
      proteins: card.proteinsPer100g,
      fats: card.fatsPer100g,
      carbs: card.carbsPer100g,
      calories: card.caloriesPer100g,
      note: card.note,
      sourcePage: card.sourcePage,
      createdAt: card.createdAt,
      ingredients: [],
    }));

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('❌ Ошибка при загрузке ТТК:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}