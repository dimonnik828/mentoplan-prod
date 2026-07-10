import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Скопируйте сюда полный словарь categoryKeywords из parse-all-ttk.ts

function detectCategory(title: string, type: string): string | null {
  const lowerTitle = title.toLowerCase();
  if (type === 'заготовка') { ... } // можно пропустить, мы только для блюд
  else {
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (cat === 'Завтрак' || cat === 'Салаты' || cat === 'Вторые блюда' || cat === 'Напитки безалкогольные' || cat === 'Напитки кофе' || cat === 'Напитки чай' || cat === 'Первые блюда' || cat === 'Продукты и ингредиенты' || cat === 'Десерты / Выпечка' || cat === 'Соусы / Заправки') {
        for (const kw of keywords) {
          if (lowerTitle.includes(kw)) return cat;
        }
      }
    }
    return null;
  }
}

async function main() {
  const ttks = await prisma.tTK.findMany({
    where: { type: 'блюдо', category: 'Другое' },
  });
  console.log(`📊 Найдено ${ttks.length} блюд в "Другое"`);
  let updated = 0;
  for (const ttk of ttks) {
    const category = detectCategory(ttk.title, 'блюдо');
    if (category) {
      await prisma.tTK.update({
        where: { id: ttk.id },
        data: { category },
      });
      updated++;
      console.log(`✅ ${ttk.title} → ${category}`);
    } else {
      console.log(`⏩ ${ttk.title} → не распознано`);
    }
  }
  console.log(`📊 Обновлено ${updated}`);
  await prisma.$disconnect();
}

main().catch(console.error);