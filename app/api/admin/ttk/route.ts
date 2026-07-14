// app/api/admin/ttk/route.ts
import { NextResponse } from 'next/server';
import { ttkCreateSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  // Здесь можно добавить пагинацию, фильтрацию, но пока просто список
  try {
    const ttks = await prisma.tTK.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(ttks);
  } catch (error) {
    console.error('[API admin/ttk GET]', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json({ error: 'Требуется application/json' }, { status: 415 });
    }

    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Тело запроса слишком большое' }, { status: 413 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Некорректный JSON' }, { status: 400 });
    }

    const parsed = ttkCreateSchema.parse(body);

    const ttk = await prisma.tTK.create({
      data: {
        name: parsed.name,
        description: parsed.description || '',
        price: parsed.price,
        categoryId: parsed.categoryId || null,
        // ingredients – обычно связь many-to-many, ее нужно обрабатывать отдельно
      },
    });

    // Если есть ингредиенты в запросе, можно привязать их через connect
    if (parsed.ingredients && parsed.ingredients.length > 0) {
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
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message })) },
        { status: 400 }
      );
    }
    console.error('[API admin/ttk POST]', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}