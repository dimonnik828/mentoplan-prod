import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  return apiHandler({
    request,
    handler: async () => {
      // Получаем все события pageview, группируем по странице и считаем количество
      const pages = await prisma.analyticsEvent.groupBy({
        by: ['page'],
        where: {
          type: 'pageview',
          page: { not: null },
        },
        _count: { page: true },
        orderBy: { _count: { page: 'desc' } },
        take: 10,
      });

      const result = pages.map((p) => ({
        page: p.page,
        count: p._count.page,
      }));

      return NextResponse.json(result);
    },
  });
}