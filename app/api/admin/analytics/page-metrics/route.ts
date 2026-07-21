import { NextResponse } from 'next/server';
import { getPerformanceMetrics } from '@/lib/analytics-store';

export async function GET() {
  try {
    const metrics = await getPerformanceMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Page metrics route error:', error);
    return NextResponse.json({ error: 'Failed to fetch page metrics' }, { status: 500 });
  }
}