import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  return apiHandler({
    request,
    handler: async () => {
      const attacks = await prisma.analyticsEvent.findMany({
        where: { type: 'attack' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          page: true,
          data: true,
          createdAt: true,
        },
      });
      return NextResponse.json(attacks);
    },
  });
}