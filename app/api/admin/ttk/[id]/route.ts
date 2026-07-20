import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Дожидаемся промиса params
    const { id } = await params;
    const cardId = parseInt(id, 10);

    if (isNaN(cardId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const card = await prisma.tTK.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(card);
  } catch (error) {
    console.error('TTK detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}