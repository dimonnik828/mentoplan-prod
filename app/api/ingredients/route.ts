// app/api/ingredients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { ingredientCreateSchema } from '@/lib/validations';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  return apiHandler({
    request,
    handler: async () => {
      const ingredients = await prisma.ingredient.findMany({
        orderBy: { name: 'asc' },
      });
      return NextResponse.json(ingredients);
    },
  });
}

export async function POST(request: NextRequest) {
  return apiHandler({
    request,
    schema: ingredientCreateSchema,
    handler: async (parsed) => {
      const ingredient = await prisma.ingredient.create({
        data: {
          name: parsed.name,
          unit: parsed.unit,
          pricePerUnit: parsed.pricePerUnit,
        },
      });
      return NextResponse.json(
        { success: true, data: ingredient },
        { status: 201 }
      );
    },
  });
}