import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  return apiHandler({
    request,
    handler: async () => {
      const sessions = await prisma.analyticsSession.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      return NextResponse.json(sessions);
    },
  });
}