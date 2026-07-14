// app/api/ingredients/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { ingredientUpdateSchema } from '@/lib/validations';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return apiHandler({
    request,
    handler: async () => {
      const ingredient = await prisma.ingredient.findUnique({
        where: { id: params.id },
      });
      if (!ingredient) {
        return NextResponse.json(
          { error: 'Ингредиент не найден' },
          { status: 404 }
        );
      }
      return NextResponse.json(ingredient);
    },
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return apiHandler({
    request,
    schema: ingredientUpdateSchema,
    handler: async (parsed) => {
      const updateData: any = {};
      if (parsed.name !== undefined) updateData.name = parsed.name;
      if (parsed.unit !== undefined) updateData.unit = parsed.unit;
      if (parsed.pricePerUnit !== undefined) updateData.pricePerUnit = parsed.pricePerUnit;

      const ingredient = await prisma.ingredient.update({
        where: { id: params.id },
        data: updateData,
      });

      return NextResponse.json({ success: true, data: ingredient });
    },
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return apiHandler({
    request,
    handler: async () => {
      await prisma.ingredient.delete({
        where: { id: params.id },
      });
      return NextResponse.json({ success: true });
    },
  });
}