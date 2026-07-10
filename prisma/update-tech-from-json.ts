import { PrismaClient } from '@prisma/client';
import techData from '../ttk_ai_technology.json' assert { type: 'json' };

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Обновление технологий из JSON...');
  let updated = 0;
  let notFound = 0;

  for (const [cardNumber, technology] of Object.entries(techData)) {
    const existing = await prisma.tTK.findUnique({
      where: { number: cardNumber },
    });

    if (!existing) {
      console.warn(`⚠️ Карта с номером ${cardNumber} не найдена`);
      notFound++;
      continue;
    }

    // Обновляем technology и добавляем пометку в note, если её нет
    const newNote = existing.note
      ? (existing.note.includes('технология сгенерирована AI') ? existing.note : existing.note + ' (технология сгенерирована AI)')
      : 'технология сгенерирована AI';

    await prisma.tTK.update({
      where: { id: existing.id },
      data: {
        technology: technology,
        note: newNote,
      },
    });

    console.log(`✅ Обновлено: ${existing.title} (№${cardNumber})`);
    updated++;
  }

  console.log(`🎉 Готово! Обновлено ${updated} записей, не найдено ${notFound}`);
}

main()
  .catch(e => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());