// app/api/ttk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(request: NextRequest) {
  return apiHandler({
    request,
    handler: async () => {
      const { searchParams } = new URL(request.url);
      const rawParams = Object.fromEntries(searchParams.entries());
      const parsed = querySchema.parse(rawParams);
      const page = parsed.page;
      const limit = parsed.limit;
      const skip = (page - 1) * limit;

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
    },
  });
}