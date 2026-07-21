import { NextResponse } from 'next/server';
import { getAttackAttempts } from '@/lib/analytics-store';

export async function GET() {
  try {
    const attacks = await getAttackAttempts(10);
    return NextResponse.json(attacks);
  } catch (error) {
    console.error('Attacks route error:', error);
    return NextResponse.json({ error: 'Failed to fetch attacks' }, { status: 500 });
  }
}