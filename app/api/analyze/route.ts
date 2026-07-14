// app/api/admin/ttk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { ttkCreateSchema } from '@/lib/validations';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  return apiHandler({
    request,
    handler: async () => {
      const ttks = await prisma.tTK.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(ttks);
    },
  });
}

export async function POST(request: NextRequest) {
  return apiHandler({
    request,
    schema: ttkCreateSchema,
    handler: async (parsed) => {
      const ttk = await prisma.tTK.create({
        data: {
          name: parsed.name,
          description: parsed.description || '',
          price: parsed.price,
          categoryId: parsed.categoryId ?? null,
        },
      });

      if (parsed.ingredients?.length) {
        // Предполагаем, что модель TTKIngredient существует и связывает TTK с ингредиентами
        for (const ing of parsed.ingredients) {
          await prisma.tTKIngredient.create({
            data: {
              ttkId: ttk.id,
              ingredientId: ing.ingredientId,
              quantity: ing.quantity,
            },
          });
        }
      }

      return NextResponse.json({ success: true, data: ttk }, { status: 201 });
    },
  });
}