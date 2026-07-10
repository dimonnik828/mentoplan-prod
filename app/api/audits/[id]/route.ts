import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const audit = await prisma.audit.findUnique({
      where: { id: params.id },
    });
    if (!audit) {
      return NextResponse.json({ error: 'Аудит не найден' }, { status: 404 });
    }
    return NextResponse.json(audit);
  } catch (error) {
    console.error('Ошибка получения аудита:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}