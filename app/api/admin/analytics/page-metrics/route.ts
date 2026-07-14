// app/api/admin/analytics/page-metrics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  return apiHandler({
    request,
    handler: async () => {
      let timeOnPage: any[] = [];
      let bounceRate = 0;

      try {
        timeOnPage = await prisma.analyticsEvent.groupBy({
          by: ['page'],
          where: {
            type: 'time_on_page',
            data: { path: ['seconds'], not: undefined },
          },
          _avg: { data: { path: ['seconds'] } },
        });
      } catch (err) {
        console.error('Ошибка получения времени на странице:', err);
      }

      try {
        const result = await prisma.$queryRawUnsafe<Array<{ bounce_rate: number }>>(`
          SELECT
            (COUNT(DISTINCT session_id) FILTER (WHERE cnt = 1) * 100.0 / NULLIF(COUNT(DISTINCT session_id), 0)) AS bounce_rate
          FROM (
            SELECT session_id, COUNT(*) AS cnt
            FROM analytics_events
            WHERE type = 'pageview'
            GROUP BY session_id
          ) sub
        `);
        bounceRate = result[0]?.bounce_rate ?? 0;
      } catch (err) {
        console.error('Ошибка расчёта отказов:', err);
      }

      return NextResponse.json({ timeOnPage, bounceRate });
    },
  });
}