import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  return apiHandler({
    request,
    handler: async () => {
      const pages = await prisma.analyticsEvent.groupBy({
        by: ['page'],
        _count: { page: true },
        orderBy: { _count: { page: 'desc' } },
        take: 5,
        where: { type: 'pageview', page: { not: null } },
      });
      return NextResponse.json(
        pages.map((p) => ({ page: p.page, count: p._count.page }))
      );
    },
  });
}
