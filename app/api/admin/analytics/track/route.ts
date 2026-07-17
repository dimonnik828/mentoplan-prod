// app/api/admin/analytics/track/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  trackEvent,
  startSession,
  endSession,
  getSessions,
} from '@/lib/analytics-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events } = body as { events: Record<string, unknown>[] };

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: 'No events provided' }, { status: 400 });
    }

    for (const event of events) {
      const type = event.type as string;
      const sessionId = (event.sessionId as string) || 'anonymous';
      const path = (event.path as string) || '/';

      if (type === 'session_start') {
        startSession(sessionId, (event.data as Record<string, unknown>)?.userAgent as string || '');
      } else if (type === 'session_end') {
        endSession(sessionId);
      } else {
        const sessions = getSessions();
        if (!sessions.find(s => s.id === sessionId) && type !== 'session_start') {
          startSession(sessionId, '');
        }

        trackEvent({
          type: type as any,
          path,
          sessionId,
          data: (event.data as Record<string, unknown>) || {},
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}