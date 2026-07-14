// app/api/audits/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { auditUpdateSchema } from '@/lib/validations';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return apiHandler({
    request,
    handler: async () => {
      const audit = await prisma.audit.findUnique({
        where: { id: params.id },
      });
      if (!audit) {
        return NextResponse.json(
          { error: 'Аудит не найден' },
          { status: 404 }
        );
      }
      return NextResponse.json(audit);
    },
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return apiHandler({
    request,
    schema: auditUpdateSchema,
    handler: async (parsed) => {
      // Проверка соответствия id в пути и в теле
      if (parsed.id !== params.id) {
        return NextResponse.json(
          { error: 'ID в пути не совпадает с телом' },
          { status: 400 }
        );
      }

      // Удаляем id из данных для обновления
      const { id, ...data } = parsed;

      const audit = await prisma.audit.update({
        where: { id: params.id },
        data,
      });

      return NextResponse.json({ success: true, data: audit });
    },
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return apiHandler({
    request,
    handler: async () => {
      await prisma.audit.delete({
        where: { id: params.id },
      });
      return NextResponse.json({ success: true });
    },
  });
}