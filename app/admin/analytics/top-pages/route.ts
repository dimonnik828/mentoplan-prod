import { NextResponse } from 'next/server';
import { getTopPages } from '@/lib/analytics-store';

export async function GET() {
  try {
    const pages = await getTopPages(10);
    return NextResponse.json(pages);
  } catch (error) {
    console.error('Top pages route error:', error);
    return NextResponse.json({ error: 'Failed to fetch top pages' }, { status: 500 });
  }
}
