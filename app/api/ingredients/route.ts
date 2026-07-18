// app/api/ttk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(1000), // можно запросить все 753
});

export async function GET(request: NextRequest) {
  // Проверка токена
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

      const [ttkCards, total] = await Promise.all([
        prisma.tTK.findMany({
          orderBy: { title: 'asc' },
          skip,
          take: limit,
        }),
        prisma.tTK.count(),
      ]);

      const data = ttkCards.map(card => ({
        id: card.id,
        title: card.title,
        number: card.number,
        category: card.category,
        calories: card.calories,
        proteins: card.proteins,
        fats: card.fats,
        carbs: card.carbs,
        technology: card.technology,
        presentation: card.presentation,
        storage: card.storage,
        quality: card.quality,
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