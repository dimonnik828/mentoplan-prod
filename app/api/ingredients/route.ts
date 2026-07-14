// app/api/ingredients/route.ts
import { NextResponse } from 'next/server';
import { ingredientCreateSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const ingredients = await prisma.ingredient.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(ingredients);
  } catch (error) {
    console.error('[API ingredients GET]', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) return NextResponse.json({ error: 'Требуется application/json' }, { status: 415 });
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 2 * 1024 * 1024) return NextResponse.json({ error: 'Тело запроса слишком большое' }, { status: 413 });

    let body;
    try { body = await request.json(); } catch { return NextResponse.json({ error: 'Некорректный JSON' }, { status: 400 }); }

    const parsed = ingredientCreateSchema.parse(body);

    const ingredient = await prisma.ingredient.create({
      data: {
        name: parsed.name,
        unit: parsed.unit,
        pricePerUnit: parsed.pricePerUnit,
      },
    });
    return NextResponse.json({ success: true, data: ingredient }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message })) },
        { status: 400 }
      );
    }
    console.error('[API ingredients POST]', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}