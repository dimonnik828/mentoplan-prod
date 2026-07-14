// app/api/audits/[id]/route.ts
import { NextResponse } from 'next/server';
import { auditUpdateSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const audit = await prisma.audit.findUnique({ where: { id: params.id } });
    if (!audit) return NextResponse.json({ error: 'Аудит не найден' }, { status: 404 });
    return NextResponse.json(audit);
  } catch (error) {
    console.error('[API audits/[id] GET]', error);
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

    const parsed = auditUpdateSchema.parse({ ...body, id: params.id });

    const updateData: any = {};
    if (parsed.name !== undefined) updateData.name = parsed.name;
    if (parsed.address !== undefined) updateData.address = parsed.address;
    // ... остальные поля

    const audit = await prisma.audit.update({ where: { id: params.id }, data: updateData });
    return NextResponse.json({ success: true, data: audit });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message })) },
        { status: 400 }
      );
    }
    console.error('[API audits/[id] PUT]', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.audit.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API audits/[id] DELETE]', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}