import { NextResponse } from 'next/server';
import { getBehaviorData } from '@/lib/analytics-store';

export async function GET() {
  try {
    const data = await getBehaviorData();
    const clicks = (data.clickHeatmap || []).slice(0, 20).map(item => ({
      id: `${item.path}-${item.element}`,
      page: item.path,
      element: item.element,
      count: item.count,
    }));
    return NextResponse.json(clicks);
  } catch (error) {
    console.error('Recent clicks route error:', error);
    return NextResponse.json({ error: 'Failed to fetch recent clicks' }, { status: 500 });
  }
}