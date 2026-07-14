import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const eventSchema = z.object({
  sessionId: z.string().uuid(),
  type: z.enum(['pageview', 'click', 'error', 'time_on_page', 'attack']),
  page: z.string().optional(),
  data: z.any().optional(),
});

export async function POST(request: NextRequest) {
  return apiHandler({
    request,
    schema: eventSchema,
    handler: async (parsed) => {
      // Проверим, существует ли сессия
      const session = await prisma.analyticsSession.findUnique({
        where: { id: parsed.sessionId },
      });
      if (!session) {
        return NextResponse.json({ error: 'Сессия не найдена' }, { status: 404 });
      }

      const event = await prisma.analyticsEvent.create({
        data: {
          sessionId: parsed.sessionId,
          type: parsed.type,
          page: parsed.page,
          data: parsed.data || {},
        },
      });

      return NextResponse.json({ success: true, event });
    },
  });
}

// Создание новой сессии (GET, чтобы не усложнять CORS)
export async function GET(request: NextRequest) {
  return apiHandler({
    request,
    handler: async () => {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || '';

      const session = await prisma.analyticsSession.create({
        data: { ip, userAgent },
      });

      return NextResponse.json({ sessionId: session.id });
    },
  });
}
