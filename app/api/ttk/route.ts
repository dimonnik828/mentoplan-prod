// app/api/ttk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(20),
  // Если нужен поиск или фильтрация, можно добавить параметры:
  // search: z.string().optional(),
  // category: z.string().optional(),
});

export async function GET(request: NextRequest) {
  // Проверка токена – защита от несанкционированного доступа
  const token = request.headers.get('x-admin-token');
  if (token !== process.env.ADMIN_API_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return apiHandler({
    request,
    handler: async () => {
      const { searchParams } = new URL(request.url);
      const rawParams = Object.fromEntries(searchParams.entries());
      const parsed = querySchema.parse(rawParams);
      const page = parsed.page;
      const limit = parsed.limit;
      const skip = (page - 1) * limit;

      // Используем модель TTK
      const [ttkCards, total] = await Promise.all([
        prisma.tTK.findMany({
          orderBy: { title: 'asc' },
          skip,
          take: limit,
        }),
        prisma.tTK.count(),
      ]);

      // Маппим все нужные поля в единый формат для фронта
      const data = ttkCards.map(card => ({
        id: card.id,
        title: card.title,
        number: card.number,
        applicationArea: card.applicationArea,
        portionNorm: card.portionNorm,
        technology: card.technology,
        presentation: card.presentation,
        storage: card.storage,
        quality: card.quality,
        proteins: card.proteins,
        fats: card.fats,
        carbs: card.carbs,
        calories: card.calories,
        engineer: card.engineer,
        responsible: card.responsible,
        approvalDate: card.approvalDate,
        category: card.category,
        note: card.note,
        organization: card.organization,
        sourcePage: card.sourcePage,
        totalOutputKg: card.totalOutputKg,
        type: card.type,
        normUnit: card.normUnit,
        receiptName: card.receiptName,
        ingredients: card.ingredients,
        createdAt: card.createdAt,
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
    },
  });
}