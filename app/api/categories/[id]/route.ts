// app/api/categories/[id]/route.ts
import { NextResponse } from 'next/server';
import { categoryUpdateSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const category = await prisma.category.findUnique({ where: { id: params.id } });
    if (!category) return NextResponse.json({ error: 'Категория не найдена' }, { status: 404 });
    return NextResponse.json(category);
  } catch (error) {
    console.error('[API categories/[id] GET]', error);
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

    const parsed = categoryUpdateSchema.parse(body);

    const updateData: any = {};
    if (parsed.name !== undefined) updateData.name = parsed.name;
    if (parsed.parentId !== undefined) updateData.parentId = parsed.parentId;

    const category = await prisma.category.update({ where: { id: params.id }, data: updateData });
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message })) },
        { status: 400 }
      );
    }
    console.error('[API categories/[id] PUT]', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API categories/[id] DELETE]', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}