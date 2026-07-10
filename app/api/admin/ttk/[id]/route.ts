import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function isAdmin(request: NextRequest): boolean {
  const key = request.headers.get('x-admin-key');
  return key === process.env.ADMIN_API_KEY;
}

// GET /api/admin/ttk/:id
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  const ttk = await prisma.tTK.findUnique({ where: { id } });
  if (!ttk) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(ttk);
}

// PUT /api/admin/ttk/:id
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  const body = await request.json();
  const { title, number, ingredients, technology, presentation, storage, quality, type, category, proteins, fats, carbs, calories, engineer, responsible } = body;
  if (!title || !ingredients || !technology) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const updated = await prisma.tTK.update({
    where: { id },
    data: {
      title,
      number: number || null,
      ingredients,
      technology,
      presentation: presentation || null,
      storage: storage || null,
      quality: quality || null,
      type: type || 'блюдо',
      category: category || null,
      proteins: proteins || null,
      fats: fats || null,
      carbs: carbs || null,
      calories: calories || null,
      engineer: engineer || null,
      responsible: responsible || null,
    },
  });
  return NextResponse.json(updated);
}

// DELETE /api/admin/ttk/:id
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  await prisma.tTK.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
