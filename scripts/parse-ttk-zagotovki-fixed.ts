import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const pdfParse = require('pdf-parse');
const prisma = new PrismaClient();

async function extractTextFromPDF(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  try {
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (e) {
    const data = await pdfParse.default(dataBuffer);
    return data.text;
  }
}

function isServiceLine(line: string): boolean {
  const serviceWords = [
    'Технологическая карта', 'Область применения', 'Хранение', 'Срок Хранения',
    'Органолептические показатели', 'Наименование продукта', 'Ед. изм.',
    'Брутто в ед. изм.', 'Вес брутто', 'Вес нетто или п/ф', 'Вес готового продукта',
    'Технология приготовления', 'ТРЕБОВАНИЯ К ОФОРМЛЕНИЮ', 'ПОДАЧЕ', 'РЕАЛИЗАЦИИ',
    'ИТОГО', 'Система автоматизации', 'Название на чеке'
  ];
  return serviceWords.some(word => line.includes(word));
}

function extractTitleFromBlock(blockText: string, number: string): string {
  const lines = blockText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // 1. Название на той же строке, что и номер (редко, но проверим)
  for (const line of lines) {
    const match = line.match(/Технологическая карта\s*(?:No|№)\s*\d+\s*(.*)/i);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (candidate && !isServiceLine(candidate)) return candidate;
    }
  }

  // 2. Строка "Название на чеке:" — следующая неслужебная
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Название на чеке:')) {
      for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
        if (!isServiceLine(lines[j])) return lines[j];
      }
    }
  }

  // 3. Ищем название между строкой с номером и "Область применения" (или "Название на чеке")
  let numberLineIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (new RegExp(`Технологическая карта\\s*(?:No|№)\\s*${number}`, 'i').test(lines[i])) {
      numberLineIndex = i;
      break;
    }
  }
  if (numberLineIndex !== -1) {
    for (let i = numberLineIndex + 1; i < Math.min(numberLineIndex + 6, lines.length); i++) {
      const line = lines[i];
      // Пропускаем даты (дд.мм.гггг) и служебные
      if (!line.match(/^\d{2}\.\d{2}\.\d{4}$/) && !isServiceLine(line)) {
        return line;
      }
    }
  }

  // 4. Берём первую неслужебную строку блока
  for (const line of lines) {
    if (!line.match(/^\d{2}\.\d{2}\.\d{4}$/) && !isServiceLine(line)) {
      return line;
    }
  }

  return 'Без названия';
}

function parseTTK(blockText: string, number: string): any {
  const title = extractTitleFromBlock(blockText, number);

  const techMatch = blockText.match(/Технология приготовления\s*([\s\S]*?)(?=ТРЕБОВАНИЯ К ОФОРМЛЕНИЮ|$)/i);
  const technology = techMatch ? techMatch[1].trim().replace(/\s+/g, ' ') : '';

  const presentationMatch = blockText.match(/ТРЕБОВАНИЯ К ОФОРМЛЕНИЮ, ПОДАЧЕ И РЕАЛИЗАЦИИ\s*([\s\S]*?)(?=ИТОГО|$)/i);
  const presentation = presentationMatch ? presentationMatch[1].trim().replace(/\s+/g, ' ') : '';

  // Парсинг ингредиентов
  const ingredientLines = blockText.match(/^\s*\d+\s+[^\d]+[\d,.]+\s+[\d,.]+\s+[\d,.]+\s+[\d,.]+\s+[\d,.]+\s+[\d,.]+\s+[\d,.]+/gm);
  let ingredients: any[] = [];
  if (ingredientLines) {
    ingredients = ingredientLines.map(line => {
      const parts = line.trim().split(/\s{2,}/);
      const name = parts[1] || '';
      const weightBrutto = parseFloat(parts[2]?.replace(',', '.') || '0');
      const weightNetto = parseFloat(parts[3]?.replace(',', '.') || '0');
      return { name, weightBrutto, weightNetto, unit: 'г' };
    });
  }

  const nutritionMatch = blockText.match(/Белки\s*([\d,.]+)\s*Жиры\s*([\d,.]+)\s*Углеводы\s*([\d,.]+)\s*ккал\s*([\d,.]+)/i);
  let proteins = 0, fats = 0, carbs = 0, calories = 0;
  if (nutritionMatch) {
    proteins = parseFloat(nutritionMatch[1].replace(',', '.'));
    fats = parseFloat(nutritionMatch[2].replace(',', '.'));
    carbs = parseFloat(nutritionMatch[3].replace(',', '.'));
    calories = parseFloat(nutritionMatch[4].replace(',', '.'));
  }

  return {
    title,
    number,
    ingredients,
    technology,
    presentation,
    storage: '',
    quality: '',
    proteins,
    fats,
    carbs,
    calories,
    engineer: '',
    responsible: '',
    type: 'заготовка',
  };
}

async function main() {
  const pdfPath = path.join(__dirname, '../uploads/ttk-zagotovki.pdf');
  console.log(`📄 Читаю файл: ${pdfPath}`);

  if (!fs.existsSync(pdfPath)) {
    console.error(`❌ Файл не найден: ${pdfPath}`);
    process.exit(1);
  }

  const fullText = await extractTextFromPDF(pdfPath);
  console.log(`📄 Извлечено ${fullText.length} символов текста`);

  // Исправленная регулярка: ищем "Технологическая карта No" или "Технологическая карта №"
  const numberRegex = /Технологическая карта\s*(?:No|№)\s*(\d+)/gi;
  let match;
  const numberPositions: { number: string; index: number }[] = [];
  while ((match = numberRegex.exec(fullText)) !== null) {
    numberPositions.push({ number: match[1], index: match.index });
  }
  console.log(`🔍 Найдено номеров: ${numberPositions.length}`);

  if (numberPositions.length === 0) {
    console.log('❌ Номеров не найдено.');
    process.exit(1);
  }

  const uniqueNumbers = new Map<string, { number: string; index: number }>();
  for (const pos of numberPositions) {
    if (!uniqueNumbers.has(pos.number)) {
      uniqueNumbers.set(pos.number, pos);
    }
  }
  console.log(`🔍 Уникальных номеров: ${uniqueNumbers.size}`);

  await prisma.tTK.deleteMany({ where: { type: 'заготовка' } });
  console.log('🗑️ Удалены все существующие заготовки');

  let inserted = 0;
  let errors = 0;

  for (const [number, pos] of uniqueNumbers) {
    try {
      const startPos = pos.index;
      const nextNumberMatch = fullText.slice(startPos + 1).match(/Технологическая карта\s*(?:No|№)\s*\d+/i);
      let endPos = fullText.length;
      if (nextNumberMatch && nextNumberMatch.index !== undefined) {
        endPos = startPos + 1 + nextNumberMatch.index;
      }
      const blockText = fullText.substring(startPos, endPos);

      const ttkData = parseTTK(blockText, number);
      console.log(`Обработка ТТК №${number}: название="${ttkData.title}"`);

      const existing = await prisma.tTK.findFirst({ where: { number: ttkData.number } });
      if (!existing) {
        await prisma.tTK.create({ data: ttkData });
        inserted++;
        console.log(`✅ Добавлена: ${ttkData.title} (№${ttkData.number})`);
      } else {
        console.log(`⏩ ТТК №${ttkData.number} уже существует (пропускаем)`);
      }
    } catch (error) {
      console.error(`❌ Ошибка при обработке №${number}:`, error);
      errors++;
    }
  }

  console.log(`\n📊 Итог: Добавлено ${inserted}, ошибок ${errors}`);
  await prisma.$disconnect();
}

main().catch(console.error);