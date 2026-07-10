import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Возвращаем все записи без фильтров, пагинации и связей
    const techCards = await prisma.techCard.findMany({
      orderBy: { dishName: 'asc' },
      take: 100, // ограничим для теста
    });

    // Преобразуем в нужный формат
    const data = techCards.map((card) => ({
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
      ingredients: [], // пока без ингредиентов
    }));

    return NextResponse.json({
      data,
      pagination: {
        page: 1,
        limit: 100,
        total: data.length,
        pages: 1,
      },
    });
  } catch (error) {
    console.error('❌ Ошибка при загрузке ТТК:', error);
    return NextResponse.json(
      { error: 'Ошибка: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}