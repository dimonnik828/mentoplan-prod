import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const pdfParse = require('pdf-parse');
const prisma = new PrismaClient();

// ============================================================
//  СЛОВАРЬ КАТЕГОРИЙ
// ============================================================
const categoryKeywords: Record<string, string[]> = {
  'Завтрак': ['омлет', 'яичница', 'глазунья', 'пашот', 'скрэмбл', 'каша', 'гранола', 'сырники', 'блин', 'оладьи', 'тост', 'бенедикт', 'манка', 'овсянка', 'панкейки', 'вафли', 'шакшука', 'завтрак'],
  'Салаты': ['салат', 'цезарь', 'греческий', 'мимоза', 'оливье', 'винегрет', 'капрезе', 'руккола', 'овощной', 'боул', 'будда-боул'],
  'Вторые блюда': ['стейк', 'котлета', 'гуляш', 'рагу', 'паста', 'ризотто', 'плов', 'бифштекс', 'отбивная', 'жаркое', 'запеканка', 'мясо', 'рыба', 'курица', 'индейка', 'пюре', 'бургер', 'пицца'],
  'Напитки безалкогольные': ['морс', 'компот', 'сок', 'лимонад', 'смузи', 'квас', 'молоко', 'какао', 'фанта', 'спрайт', 'кока-кола', 'вода', 'фреш'],
  'Напитки кофе': ['кофе', 'латте', 'капучино', 'эспрессо', 'американо', 'раф', 'мокко', 'флэт уайт', 'гляссе', 'айс-кофе'],
  'Напитки чай': ['чай', 'матча', 'каркаде', 'улун', 'пуэр', 'зеленый чай', 'черный чай', 'травяной чай', 'имбирный чай'],
  'Первые блюда': ['суп', 'борщ', 'солянка', 'окрошка', 'уха', 'бульон', 'крем-суп', 'щи', 'гаспачо', 'том ям', 'рамен'],
  'Продукты и ингредиенты': ['молоко', 'сливки', 'масло', 'творог', 'сыр', 'яйцо', 'мука', 'сахар', 'соль'],
  'Десерты / Выпечка': ['пирог', 'торт', 'кекс', 'печенье', 'маффин', 'круассан', 'булочка', 'пирожное', 'чизкейк', 'десерт', 'мороженое', 'панна-котта'],
  'Соусы / Заправки': ['соус', 'заправка', 'песто', 'майонез', 'кетчуп', 'горчица', 'соевый', 'бальзамический'],
};

function detectCategory(title: string): string | null {
  const lowerTitle = title.toLowerCase();
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    for (const kw of keywords) {
      if (lowerTitle.includes(kw)) return cat;
    }
  }
  return null;
}

// ============================================================
//  ФИЛЬТР СЛУЖЕБНЫХ СТРОК
// ============================================================
function isServiceLine(line: string): boolean {
  if (!line || line.trim().length < 3) return true;
  const lowerLine = line.toLowerCase();
  const servicePhrases = [
    'ооо', 'бранч', 'ooo', 'технико-технологическая', 'технологическая карта',
    'область применения', 'cake&coffee', 'реализация', 'требование', 'утверждаю',
    'согласно акту', 'технология приготовления', 'вес брутто', 'наименование продукта',
    'наименование сырья', 'показатели качества', 'органолептические',
    'требование к качеству сырья', 'продовольственное сырье', 'пищевые продукты',
    'полуфабрикаты', 'сертификаты соответствия', 'удостоверение качества',
    'акт проработки', 'подпись', 'руководитель предприятия', 'от "___"',
    'пищевая и энергетическая ценность', 'примечание', 'инженер-технолог',
    'ответственный исполнитель', 'система автоматизации', 'название на чеке',
    'хранение', 'срок хранения', 'iikorams', 'реализация и хранение',
    'требования к оформлению', 'подаче', 'брутто', 'нетто', 'выход',
    'приготовления данного блюда', 'соответствуют требованиям', 'нормативных документов',
    'ИТОГО', 'г.', 'кг'
  ];
  if (servicePhrases.some(phrase => lowerLine.includes(phrase))) return true;
  if (/^[\d\s.,\-:]+$/.test(line)) return true;
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(line)) return true;
  if (/^(no|№)\s*\d+/i.test(line)) return true;
  return false;
}

function cleanTitle(rawTitle: string): string {
  return rawTitle
    .replace(/^Наименование.*?:(.*)/i, '$1')
    .replace(/^Название.*?:(.*)/i, '$1')
    .trim();
}

// ============================================================
//  ИЗВЛЕЧЕНИЕ ИНГРЕДИЕНТОВ (по первому числу)
// ============================================================
function extractIngredientsFromBlock(blockText: string): any[] {
  const lines = blockText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const ingredients: any[] = [];
  let tableStarted = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('Наименование продукта') || line.includes('Вес брутто')) {
      tableStarted = true;
      continue;
    }
    if (!tableStarted) continue;
    if (line.includes('ИТОГО') || line.includes('ТРЕБОВАНИЯ К ОФОРМЛЕНИЮ')) break;

    // Если строка — просто номер, пропускаем (он будет обработан вместе со следующей строкой)
    if (/^\d+$/.test(line)) continue;

    // Если строка содержит числа с запятыми — это потенциальный ингредиент
    const numbers = line.match(/\d+[.,]\d+/g);
    if (numbers && numbers.length >= 2) {
      // Первое число — брутто, второе — нетто (на порцию)
      const weightBrutto = parseFloat(numbers[0].replace(',', '.'));
      const weightNetto = parseFloat(numbers[1].replace(',', '.'));
      // Название — всё, что до первого числа
      const firstNumberIndex = line.search(/\d+[.,]\d+/);
      const name = line.substring(0, firstNumberIndex).trim();
      // Проверяем, что это не служебная строка
      if (name.length > 0 && !/выход|итого/i.test(name)) {
        ingredients.push({ name, weightBrutto, weightNetto, unit: 'г' });
      }
    }
  }
  return ingredients;
}

// ============================================================
//  ИЗВЛЕЧЕНИЕ ТЕХНОЛОГИИ ПРИГОТОВЛЕНИЯ (улучшенная)
// ============================================================
function extractTechnology(blockText: string): string {
  const lines = blockText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let techLines: string[] = [];
  let inTech = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Ищем начало технологии (фраза может быть с неразрывными пробелами)
    if (/Технология\s*приготовления/i.test(line)) {
      inTech = true;
      continue;
    }
    if (!inTech) continue;

    // Стоп-слова, после которых технология заканчивается
    if (/ТРЕБОВАНИЯ К ОФОРМЛЕНИЮ|Реализация и хранение|Органолептические|Пищевая|ИТОГО|Инженер-технолог/i.test(line)) {
      break;
    }

    // Пропускаем строки таблицы (содержат цифры и единицы измерения)
    if (/\d+[.,]\d+/.test(line) && /г|кг|мл/i.test(line)) continue;
    if (line.includes('Вес брутто') || line.includes('Наименование продукта') || line.includes('Норма закладки')) continue;

    // Добавляем строку, если она не пустая и не служебная
    if (!isServiceLine(line) && line.length > 0) {
      techLines.push(line);
    }
  }

  return techLines.join(' ').trim();
}

// ============================================================
//  ПАРСИНГ БЛОКА (с использованием технологии)
// ============================================================
function parseTTK(blockText: string, debug: boolean = false): any {
  const lines = blockText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const numberMatch = blockText.match(/(?:No|№)\s*(\d+)/i);
  const number = numberMatch ? numberMatch[1] : '';

  let title = 'Без названия';
  for (const line of lines) {
    if (!isServiceLine(line)) {
      title = cleanTitle(line);
      break;
    }
  }

  const ingredients = extractIngredientsFromBlock(blockText);
  const technology = extractTechnology(blockText); // <-- ВЫЗЫВАЕМ ФУНКЦИЮ

  if (debug) {
    console.log(`🔍 [Блок №${number}] Найдено ингредиентов: ${ingredients.length}`);
    if (ingredients.length > 0) {
      console.log(`   Первый: ${ingredients[0].name} (брутто: ${ingredients[0].weightBrutto}, нетто: ${ingredients[0].weightNetto})`);
    } else {
      console.log('⚠️ Ингредиенты не найдены.');
      console.log('--- Первые 15 строк блока ---');
      lines.slice(0, 15).forEach(l => console.log(`  | ${l}`));
      console.log('--------------------------------------');
    }
    if (technology) {
      console.log(`   Технология: ${technology.slice(0, 100)}...`);
    } else {
      console.log('⚠️ Технология не найдена.');
    }
  }

  // Остальные поля пока пустые
  const presentation = '';
  const storage = '';
  const quality = '';

  const nutritionMatch = blockText.match(/Белки\s*([\d,.]+)\s*Жиры\s*([\d,.]+)\s*Углеводы\s*([\d,.]+)\s*ккал\s*([\d,.]+)/i);
  let proteins = 0, fats = 0, carbs = 0, calories = 0;
  if (nutritionMatch) {
    proteins = parseFloat(nutritionMatch[1].replace(',', '.'));
    fats = parseFloat(nutritionMatch[2].replace(',', '.'));
    carbs = parseFloat(nutritionMatch[3].replace(',', '.'));
    calories = parseFloat(nutritionMatch[4].replace(',', '.'));
  }

  const engineerMatch = blockText.match(/Инженер-технолог:\s*([^\n]+)/i);
  const engineer = engineerMatch ? engineerMatch[1].trim() : '';
  const responsibleMatch = blockText.match(/Ответственный исполнитель:\s*([^\n]+)/i);
  const responsible = responsibleMatch ? responsibleMatch[1].trim() : '';

  return {
    title,
    number,
    ingredients,
    technology,
    presentation,
    storage,
    quality,
    proteins,
    fats,
    carbs,
    calories,
    engineer,
    responsible,
  };
}

// ============================================================
//  ОСНОВНАЯ ЛОГИКА
// ============================================================
async function main() {
  const pdfPath = path.join(__dirname, '../uploads/ttk.pdf');
  console.log(`📄 Читаю файл: ${pdfPath}`);

  const dataBuffer = fs.readFileSync(pdfPath);
  let fullText = '';
  try {
    const data = await pdfParse(dataBuffer);
    fullText = data.text;
  } catch (e) {
    const data = await pdfParse.default(dataBuffer);
    fullText = data.text;
  }

  console.log(`📄 Извлечено ${fullText.length} символов текста`);

  const numberRegex = /(?:No|№)\s*(\d+)/gi;
  let match;
  const numberPositions: { number: string; index: number }[] = [];
  while ((match = numberRegex.exec(fullText)) !== null) {
    numberPositions.push({ number: match[1], index: match.index });
  }
  console.log(`🔍 Найдено номеров: ${numberPositions.length}`);

  if (numberPositions.length === 0) {
    console.log('❌ Номеров не найдено.');
    return;
  }

  // Для каждого номера сохраняем все позиции с их titleStart
  const candidates: { number: string; titleStart: number; numIndex: number; endIndex: number; length: number }[] = [];

  for (let i = 0; i < numberPositions.length; i++) {
    const { number, index: numIndex } = numberPositions[i];
    const endIndex = i < numberPositions.length - 1 ? numberPositions[i+1].index : fullText.length;

    // Находим позицию названия
    let titleStart = numIndex;
    let pos = numIndex;
    while (pos > 0 && fullText[pos-1] !== '\n') pos--;
    let currentPos = pos - 1;
    while (currentPos > 0) {
      let prevLineStart = currentPos;
      while (prevLineStart > 0 && fullText[prevLineStart-1] !== '\n') prevLineStart--;
      const lineText = fullText.substring(prevLineStart, currentPos+1).trim();
      if (lineText.length > 0 && !isServiceLine(lineText) && !/^\d{2}\.\d{2}\.\d{4}$/.test(lineText)) {
        titleStart = prevLineStart;
        break;
      }
      currentPos = prevLineStart - 1;
    }

    const length = endIndex - titleStart;
    candidates.push({ number, titleStart, numIndex, endIndex, length });
  }

  // Группируем по номеру и выбираем кандидата с максимальной длиной
  const grouped = new Map<string, typeof candidates[0]>();
  for (const c of candidates) {
    if (!grouped.has(c.number) || c.length > grouped.get(c.number)!.length) {
      grouped.set(c.number, c);
    }
  }

  const blocks = Array.from(grouped.values()).map(c => ({
    number: c.number,
    start: c.titleStart,
    end: c.endIndex,
  }));

  console.log(`🔍 Сформировано блоков: ${blocks.length}`);

  // Удаляем все старые блюда
  await prisma.tTK.deleteMany({ where: { type: 'блюдо' } });
  console.log(`🗑️ Удалены все старые блюда`);

  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const isDebug = i < 5;
    try {
      const blockText = fullText.substring(block.start, block.end);
      const ttkData = parseTTK(blockText, isDebug);
      if (!ttkData.number) continue;

      const category = detectCategory(ttkData.title);
      await prisma.tTK.create({
        data: {
          title: ttkData.title,
          number: ttkData.number,
          ingredients: ttkData.ingredients,
          technology: ttkData.technology,
          presentation: ttkData.presentation,
          storage: ttkData.storage,
          quality: ttkData.quality,
          type: 'блюдо',
          category: category,
          proteins: ttkData.proteins,
          fats: ttkData.fats,
          carbs: ttkData.carbs,
          calories: ttkData.calories,
          engineer: ttkData.engineer,
          responsible: ttkData.responsible,
        },
      });
      inserted++;
      console.log(`✅ ${ttkData.title} (№${ttkData.number}) → ${category || 'без категории'}`);
    } catch (error) {
      console.error(`❌ Ошибка в блоке ${block.number}:`, error);
      errors++;
    }
  }

  console.log(`\n📊 Готово. Добавлено: ${inserted}, Ошибок: ${errors}`);
  await prisma.$disconnect();
}

main().catch(console.error);