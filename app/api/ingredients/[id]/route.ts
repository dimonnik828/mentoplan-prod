import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ingredient = await prisma.ingredient.findUnique({ where: { id } });
    if (!ingredient) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(ingredient);
  } catch (error) {
    console.error('Ingredient GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await prisma.ingredient.update({
      where: { id },
      data: {
        name: body.name,
        unit: body.unit,
        pricePerUnit: body.pricePerUnit,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Ingredient PUT error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.ingredient.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ingredient DELETE error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}