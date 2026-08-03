import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST — сохранить сообщение
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, message } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Сообщение не может быть пустым' }, { status: 400 });
    }

    const contact = await prisma.contactMessage.create({
      data: {
        name: name || 'Аноним',
        message: message.trim(),
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, id: contact.id });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// GET — получить все сообщения
export async function GET() {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Contact GET error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// DELETE — удалить сообщение по id
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID не указан' }, { status: 400 });
    }

    await prisma.contactMessage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact DELETE error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}