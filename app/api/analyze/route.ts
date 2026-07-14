// app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import { analyzeSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // --- Защита Content-Type ---
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Требуется application/json' },
        { status: 415 }
      );
    }

    // --- Ограничение размера запроса (2 МБ) ---
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Тело запроса слишком большое' },
        { status: 413 }
      );
    }

    // --- Парсинг JSON ---
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Некорректный JSON' },
        { status: 400 }
      );
    }

    // --- Валидация с помощью Zod ---
    const parsed = analyzeSchema.parse(body);

    // --- Сохранение в базу данных (пример) ---
    const audit = await prisma.audit.create({
      data: {
        name: parsed.name || '',
        address: parsed.address || '',
        venueType: parsed.venueType || 'cafe',
        totalArea: parsed.totalArea,
        hallArea: parsed.hallArea,
        seats: parsed.seats,
        staffCount: parsed.staffCount,
        avgCheck: parsed.avgCheck,
        revenue: parsed.revenue,
        rent: parsed.rent,
        utilities: parsed.utilities,
        payroll: parsed.payroll,
        managementCosts: parsed.managementCosts,
        costOfGoods: parsed.costOfGoods,
        otherExpenses: parsed.otherExpenses,
      },
    });

    // --- Успешный ответ ---
    return NextResponse.json({
      success: true,
      data: audit, // или просто parsed
    });
  } catch (error) {
    // --- Обработка ошибок валидации ---
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Ошибка валидации',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    // --- Ошибка базы данных или другая неожиданная ---
    console.error('[API analyze]', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}