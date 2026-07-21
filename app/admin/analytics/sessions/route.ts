import { NextResponse } from 'next/server';
import { getSessions } from '@/lib/analytics-store';

export async function GET() {
  try {
    const sessions = getSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Sessions route error:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}