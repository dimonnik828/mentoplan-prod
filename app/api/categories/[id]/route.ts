// app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { categoryUpdateSchema } from '@/lib/validations';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return apiHandler({
    request,
    handler: async () => {
      const category = await prisma.category.findUnique({
        where: { id: params.id },
      });
      if (!category) {
        return NextResponse.json(
          { error: 'Категория не найдена' },
          { status: 404 }
        );
      }
      return NextResponse.json(category);
    },
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return apiHandler({
    request,
    schema: categoryUpdateSchema,
    handler: async (parsed) => {
      const updateData: any = {};
      if (parsed.name !== undefined) updateData.name = parsed.name;
      if (parsed.parentId !== undefined) updateData.parentId = parsed.parentId;

      const category = await prisma.category.update({
        where: { id: params.id },
        data: updateData,
      });

      return NextResponse.json({ success: true, data: category });
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
      await prisma.category.delete({
        where: { id: params.id },
      });
      return NextResponse.json({ success: true });
    },
  });
}