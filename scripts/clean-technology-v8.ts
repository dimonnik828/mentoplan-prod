import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const ttks = await prisma.tTK.findMany({
    where: {
      technology: {
        not: {
          equals: '',
        },
      },
    },
    select: {
      id: true,
      title: true,
      technology: true,
    },
  });

  console.log(`🔍 Найдено ${ttks.length} записей с технологией`);

  let updated = 0;
  for (const ttk of ttks) {
    if (!ttk.technology) continue;
    // Удаляем все числа (целые и десятичные), запятые, точки, единицы измерения и пробелы
    let clean = ttk.technology
      .replace(/[\d.,]+\s*[гкмлштпорц]+\s*/gi, ' ') // удаляем числа с единицами
      .replace(/[\d.,]+\s*/g, ' ') // удаляем все числа и запятые/точки
      .replace(/\s{2,}/g, ' ') // убираем лишние пробелы
      .trim();

    // Если после очистки строка изменилась и не пустая
    if (clean !== ttk.technology && clean.length > 0) {
      await prisma.tTK.update({
        where: { id: ttk.id },
        data: { technology: clean },
      });
      updated++;
      console.log(`✅ Обновлено: ${ttk.title} (ID: ${ttk.id})`);
    }
  }

  console.log(`\n📊 Обновлено ${updated} записей`);
  await prisma.$disconnect();
}

main().catch(console.error);