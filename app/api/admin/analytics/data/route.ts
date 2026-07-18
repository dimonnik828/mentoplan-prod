// app/api/admin/analytics/data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  getSessions,
  getTopPages,
  getRecentErrors,
  getAttackAttempts,
  getPerformanceMetrics,
  getBehaviorData,
  getProcessLog,
  getStats,
  getBehaviorTimeline,
} from '@/lib/analytics-store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section') || 'overview';

  try {
    switch (section) {
      case 'overview':
        return NextResponse.json(await getStats());
      case 'sessions':
        return NextResponse.json(getSessions());
      case 'top-pages':
        return NextResponse.json(await getTopPages(20));
      case 'errors':
        return NextResponse.json(await getRecentErrors(50));
      case 'attacks':
        return NextResponse.json(await getAttackAttempts(50));
      case 'performance':
        return NextResponse.json(await getPerformanceMetrics());
      case 'behavior':
        return NextResponse.json(await getBehaviorData());
      case 'behavior-timeline':
        return NextResponse.json(await getBehaviorTimeline());
      case 'processes':
        return NextResponse.json(await getProcessLog(100));
      default:
        return NextResponse.json({ error: 'Unknown section' }, { status: 400 });
    }
  } catch (e) {
    console.error('Analytics data error:', e);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}