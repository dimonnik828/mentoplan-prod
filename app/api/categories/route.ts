// app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { categoryCreateSchema } from '@/lib/validations';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  return apiHandler({
    request,
    handler: async () => {
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
      });
      return NextResponse.json(categories);
    },
  });
}

export async function POST(request: NextRequest) {
  return apiHandler({
    request,
    schema: categoryCreateSchema,
    handler: async (parsed) => {
      const category = await prisma.category.create({
        data: {
          name: parsed.name,
          parentId: parsed.parentId ?? null,
        },
      });
      return NextResponse.json({ success: true, data: category }, { status: 201 });
    },
  });
}