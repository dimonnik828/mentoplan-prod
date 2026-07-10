import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Проверка ключа администратора
function isAdmin(request: NextRequest): boolean {
  const key = request.headers.get('x-admin-key');
  return key === process.env.ADMIN_API_KEY;
}

// GET список (с фильтрами, как в публичном, но с дополнительными полями)
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const category = searchParams.get('category');
  const q = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const where: any = {};
  if (type) where.type = type;
  if (category) where.category = category;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { number: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [ttks, total] = await Promise.all([
    prisma.tTK.findMany({
      where,
      orderBy: { title: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.tTK.count({ where }),
  ]);

  return NextResponse.json({
    data: ttks,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// POST создание новой ТТК
export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  // Валидация обязательных полей
  const { title, number, ingredients, technology, presentation, storage, quality, type, category, proteins, fats, carbs, calories, engineer, responsible } = body;
  if (!title || !ingredients || !technology) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const newTTK = await prisma.tTK.create({
    data: {
      title,
      number: number || null,
      ingredients,
      technology,
      presentation: presentation || null,
      storage: storage || null,
      quality: quality || null,
      type: type || 'блюдо',
      category: category || null,
      proteins: proteins || null,
      fats: fats || null,
      carbs: carbs || null,
      calories: calories || null,
      engineer: engineer || null,
      responsible: responsible || null,
    },
  });
  return NextResponse.json(newTTK, { status: 201 });
}