// app/api/ingredients/[id]/route.ts
import { NextResponse } from 'next/server';
import { ingredientUpdateSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const ingredient = await prisma.ingredient.findUnique({ where: { id: params.id } });
    if (!ingredient) return NextResponse.json({ error: 'Ингредиент не найден' }, { status: 404 });
    return NextResponse.json(ingredient);
  } catch (error) {
    console.error('[API ingredients/[id] GET]', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) return NextResponse.json({ error: 'Требуется application/json' }, { status: 415 });
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 2 * 1024 * 1024) return NextResponse.json({ error: 'Тело запроса слишком большое' }, { status: 413 });

    let body;
    try { body = await request.json(); } catch { return NextResponse.json({ error: 'Некорректный JSON' }, { status: 400 }); }

    const parsed = ingredientUpdateSchema.parse(body);

    const updateData: any = {};
    if (parsed.name !== undefined) updateData.name = parsed.name;
    if (parsed.unit !== undefined) updateData.unit = parsed.unit;
    if (parsed.pricePerUnit !== undefined) updateData.pricePerUnit = parsed.pricePerUnit;

    const ingredient = await prisma.ingredient.update({ where: { id: params.id }, data: updateData });
    return NextResponse.json({ success: true, data: ingredient });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message })) },
        { status: 400 }
      );
    }
    console.error('[API ingredients/[id] PUT]', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.ingredient.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API ingredients/[id] DELETE]', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}