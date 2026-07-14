// app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { categoryCreateSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('[API categories GET]', error);
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

    const parsed = categoryCreateSchema.parse(body);

    const category = await prisma.category.create({
      data: {
        name: parsed.name,
        parentId: parsed.parentId || null,
      },
    });
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message })) },
        { status: 400 }
      );
    }
    console.error('[API categories POST]', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}