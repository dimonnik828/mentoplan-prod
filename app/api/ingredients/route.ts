import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: { name: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      ingredients: products.map((p) => p.name),
    });
  } catch (error) {
    console.error('❌ Ошибка при получении ингредиентов:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить ингредиенты' },
      { status: 500 }
    );
  }
}