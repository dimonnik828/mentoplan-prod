// app/api/audits/route.ts
import { NextResponse } from 'next/server';
import { auditCreateSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Проверка Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Требуется application/json' },
        { status: 415 }
      );
    }

    // Ограничение размера (2 МБ)
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Тело запроса слишком большое' },
        { status: 413 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Некорректный JSON' },
        { status: 400 }
      );
    }

    // Валидация
    const parsed = auditCreateSchema.parse(body);

    // Сохранение аудита в БД
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

    return NextResponse.json({ success: true, data: audit });
  } catch (error) {
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

    console.error('[API audit]', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}