import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Скопировать тот же categoryKeywords, что и в parse-all-ttk.ts

async function main() {
  const ttks = await prisma.tTK.findMany({
    where: { type: 'блюдо', category: 'Другое' },
  });
  console.log(`Найдено ${ttks.length} блюд в "Другое"`);
  let updated = 0;
  for (const ttk of ttks) {
    const category = detectCategory(ttk.title, 'блюдо');
    if (category && category !== 'Другое') {
      await prisma.tTK.update({
        where: { id: ttk.id },
        data: { category },
      });
      updated++;
      console.log(`✅ ${ttk.title} → ${category}`);
    }
  }
  console.log(`Обновлено ${updated}`);
}

main().catch(console.error);