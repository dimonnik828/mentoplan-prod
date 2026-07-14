// app/api/audits/latest/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  return apiHandler({
    request,
    handler: async () => {
      const audit = await prisma.audit.findFirst({
        orderBy: { createdAt: 'desc' },
      });
      if (!audit) {
        return NextResponse.json(
          { error: 'Аудиты не найдены' },
          { status: 404 }
        );
      }
      return NextResponse.json(audit);
    },
  });
}