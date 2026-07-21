import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Analytics API is deprecated. Use /api/admin/analytics instead.' });
}

export async function POST() {
  return NextResponse.json({ message: 'Analytics API is deprecated. Use /api/admin/analytics instead.' });
}