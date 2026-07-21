import { NextResponse } from 'next/server';
import { getRecentErrors } from '@/lib/analytics-store';

export async function GET() {
  try {
    const errors = await getRecentErrors(10);
    return NextResponse.json(errors);
  } catch (error) {
    console.error('Recent errors route error:', error);
    return NextResponse.json({ error: 'Failed to fetch recent errors' }, { status: 500 });
  }
}