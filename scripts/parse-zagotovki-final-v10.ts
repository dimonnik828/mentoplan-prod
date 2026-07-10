import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const pdfParse = require('pdf-parse');
const prisma = new PrismaClient();

// КАТЕГОРИИ (добавил 'вупи')
const categoryKeywords: Record<string, string[]> = {
  'Тесто': ['тесто', 'бисквит', 'песочное', 'заварное', 'блин', 'корж', 'чиабатта', 'пицца', 'макаронс', 'эклер', 'пончик', 'круассан', 'булочка', 'безглютеновое', 'итальянская', 'миндальный', 'пита', 'ржаные булочки', 'смесь на шокоболы', 'вупи'],
  'Кремы и муссы': ['крем', 'мусс', 'суфле', 'помадка', 'глазур', 'айсинг', 'ганаш', 'курд', 'взбитая сметана', 'взбитые сливки', 'сметанный на', 'с вареной сгущенкой', 'карамель на', 'шоколадный', 'маршмеллоу', 'страчателла', 'творожная', 'карамель'],
  'Соусы': ['соус', 'заправк', 'песто', 'бешамель', 'голландез', 'майонез', 'барбекю', 'чимичурри', 'койсин', 'терияки', 'хумус', 'мутти', 'тапенад', 'маринад', 'масло', 'горчично-медовая', 'сливочно-', 'соево-медовый', 'чернично-', 'шоколадно-', 'васа비', 'икорный айоли', 'демигласс'],
  'Мясо и рыба': ['фарш', 'паштет', 'колбас', 'ростбиф', 'филе', 'грудка', 'су-вид', 'окорок', 'буженина', 'эскалоп', 'шницель', 'котлет', 'птитим', 'утка', 'лосось', 'семга', 'креветк', 'мидии', 'кальмар', 'осьминог', 'окрошка', 'форшмак', 'сало', 'телячьи щечки', 'тушка утенка', 'форель', 'слабосольные', 'начинка д/куриной', 'мясо утки', 'солянка п/ф', 'борщ п/ф', 'гаспачо п/ф', 'вареники п/ф', 'панини п/ф'],
  'Продукты': ['айсберг', 'базилик', 'вяленые помидоры', 'помидоры конкасе', 'руккола', 'фасоль', 'шпинат', 'свекольный', 'крутоны', 'лед', 'микс салата', 'рис', 'тофу', 'варень', 'гранола', 'драники', 'кукурузный суп', 'ваернье', 'чеснок', 'лук', 'морков', 'картофель', 'свекла', 'ароматное масло', 'тофу сметана', 'свекольный тапанед'],
  'Сиропы и напитки': ['сироп', 'морс', 'сок', 'компот', 'лимонад', 'горячий шоколад', 'доппио', 'эспрессо'],
  'Прочие заготовки': []
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
    'ИТОГО', 'г.', 'кг', 'шт'
  ];
  if (servicePhrases.some(phrase => lowerLine.includes(phrase))) return true;
  if (/^[\d\s.,\-:]+$/.test(line)) return true;
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(line)) return true;
  if (/^(no|№)\s*\d+/i.test(line)) return true;
  return false;
}

function extractTitle(blockText: string): string {
  const lines = blockText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let titleParts: string[] = [];
  for (const line of lines) {
    if (line.includes('Название на чеке:') || line.includes('Область применения:') || line.includes('Хранение:')) break;
    if (!isServiceLine(line) && !line.match(/^\d+$/)) {
      titleParts.push(line);
    }
  }
  let title = titleParts.join(' ').trim() || 'Без названия';
  title = title.replace(/^No\s*\d+/, '').trim();
  return title;
}

// ============================================================
//  МАСТЕР-ФУНКЦИЯ ИЗВЛЕЧЕНИЯ ИНГРЕДИЕНТОВ (ДВОЙНАЯ СТРАТЕГИЯ)
// ============================================================
function extractIngredientsFromBlock(blockText: string): any[] {
  const ingredients: any[] = [];

  // ====================================================================
  // СТРАТЕГИЯ 1: Для "съехавших" таблиц (исправленная)
  // ====================================================================
  const garbledRegex = /([А-Яа-яЁёA-Za-z\s\-]+?)\s*—\s*([\d.,]+)\s*(г|кг|шт|мл)/gi;
  let match;
  let foundGarbled = false;

  while ((match = garbledRegex.exec(blockText)) !== null) {
    foundGarbled = true;
    let name = match[1].trim();
    let weight = parseFloat(match[2].replace(',', '.'));
    let unit = match[3].toLowerCase();

    // Очищаем название
    name = name.replace(/^[,;\s]+/, '').trim();
    name = name.replace(/ТРЕБОВАНИЯ К ОФОРМЛЕНИЮ.*$/i, '')
               .replace(/Система автоматизации.*$/i, '')
               .replace(/iikoRMS.*$/i, '')
               .trim();

    if (name.length > 2) {
      ingredients.push({
        name: name,
        weightBrutto: weight,
        weightNetto: weight,
        unit: unit === 'кг' ? 'кг' : 'г'
      });
    }
  }

  if (foundGarbled) return ingredients;

  // ====================================================================
  // СТРАТЕГИЯ 2: Стандартный парсинг (для нормальных PDF)
  // ====================================================================
  const lines = blockText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let inTable = false;
  let tableLines: string[] = [];

  for (const line of lines) {
    if (line.includes('Наименование продукта') || line.includes('Ед. изм.') || line.includes('NoНаименование')) {
      inTable = true;
      continue;
    }
    if (inTable && (line.toUpperCase().startsWith('ИТОГО') || line.includes('Пищевая и энергетическая'))) break;
    if (inTable) tableLines.push(line);
  }

  let currentRowText = '';
  for (const line of tableLines) {
    if (/^\d{1,2}[\.\)\s]/.test(line) && currentRowText.trim().length > 0) {
      processStandardRow(currentRowText, ingredients);
      currentRowText = line;
    } else {
      currentRowText += ' ' + line;
    }
  }
  if (currentRowText.trim().length > 0) processStandardRow(currentRowText, ingredients);

  return ingredients;
}

// Хелпер для Стратегии 2
function processStandardRow(rowText: string, ingredients: any[]) {
  rowText = rowText.replace(/\s+/g, ' ').trim();
  const rowMatch = rowText.match(/^(\d{1,2})[\.\)\s]+(.+)/);
  if (!rowMatch) return;

  let content = rowMatch[2].trim().replace(/^[гкгштмл]+\s*/i, '');
  const splitMatch = content.match(/^(.*?)\s+(г|кг|шт|мл)\s+(.*)$/i);

  let name = '', weightStr = '', unit = 'г';
  if (splitMatch) {
    name = splitMatch[1].trim(); unit = splitMatch[2].toLowerCase(); weightStr = splitMatch[3].trim();
  } else { name = content; }

  const numbers = weightStr.match(/\d+[.,]\d+/g);
  let wB = 0, wN = 0;
  if (numbers && numbers.length >= 2) { wB = parseFloat(numbers[0].replace(',', '.')); wN = parseFloat(numbers[1].replace(',', '.')); }
  else if (numbers && numbers.length === 1) { wB = parseFloat(numbers[0].replace(',', '.')); wN = wB; }
  else if (!splitMatch) {
    const allNums = name.match(/\d+[.,]\d+/g);
    if (allNums && allNums.length >= 2) { wB = parseFloat(allNums[allNums.length - 2].replace(',', '.')); wN = parseFloat(allNums[allNums.length - 1].replace(',', '.')); name = name.replace(allNums[allNums.length - 1], '').replace(allNums[allNums.length - 2], ''); }
  }

  name = name.replace(/\s+/g, ' ').replace(/^\d{1,2}[\.\)\s]+/, '').trim();
  if (name.length > 0) {
    name = name.charAt(0).toUpperCase() + name.slice(1);
    ingredients.push({ name, weightBrutto: wB, weightNetto: wN, unit: unit === 'кг' ? 'кг' : 'г' });
  }
}

// ============================================================
//  ПАРСИНГ БЛОКА
// ============================================================
function parseTTK(blockText: string, debug: boolean = false): any {
  const numberMatch = blockText.match(/(?:No|№)\s*(\d+)/i);
  const number = numberMatch ? numberMatch[1] : '';
  const title = extractTitle(blockText);
  const ingredients = extractIngredientsFromBlock(blockText);

  if (debug) {
    console.log(`\n🔍 [Блок №${number}] "${title}"`);
    console.log(`   Найдено ингредиентов: ${ingredients.length}`);
    ingredients.forEach(ing => console.log(`   - ${ing.name} | Брутто: ${ing.weightBrutto} | Нетто: ${ing.weightNetto} ${ing.unit}`));
    console.log('--------------------------------------------------');
  }

  return { title, number, ingredients, technology: '', presentation: '', storage: '', quality: '', proteins: 0, fats: 0, carbs: 0, calories: 0, engineer: '', responsible: '' };
}

// ============================================================
//  ОСНОВНАЯ ЛОГИКА
// ============================================================
async function main() {
  const pdfPath = path.join(__dirname, '../uploads/ttk-zagotovki.pdf');
  console.log(`📄 Читаю файл: ${pdfPath}`);
  const dataBuffer = fs.readFileSync(pdfPath);
  let fullText = '';
  try { const data = await pdfParse(dataBuffer); fullText = data.text; } catch (e) { const data = await pdfParse.default(dataBuffer); fullText = data.text; }

  const numberRegex = /(?:No|№)\s*(\d+)/gi;
  let match;
  const numberPositions: { number: string; index: number }[] = [];
  while ((match = numberRegex.exec(fullText)) !== null) numberPositions.push({ number: match[1], index: match.index });

  const grouped = new Map<string, { number: string; index: number; length: number }>();
  for (const pos of numberPositions) {
    const next = numberPositions.find(p => p.index > pos.index);
    const end = next ? next.index : fullText.length;
    if (!grouped.has(pos.number) || (end - pos.index) > grouped.get(pos.number)!.length) {
      grouped.set(pos.number, { number: pos.number, index: pos.index, length: end - pos.index });
    }
  }

  const blocks = Array.from(grouped.values()).map(g => ({ number: g.number, start: g.index, end: g.index + g.length }));

  await prisma.tTK.deleteMany({ where: { type: 'заготовка' } });
  console.log(`🗑️ Удалены старые заготовки. Начинаю парсинг ${blocks.length} блоков...\n`);

  let inserted = 0;
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    try {
      const ttkData = parseTTK(fullText.substring(block.start, block.end), i < 5);
      if (!ttkData.number) continue;

      const category = detectCategory(ttkData.title);
      await prisma.tTK.create({
        data: {
          title: ttkData.title, number: ttkData.number, ingredients: ttkData.ingredients,
          technology: ttkData.technology, presentation: ttkData.presentation, storage: ttkData.storage,
          quality: ttkData.quality, type: 'заготовка', category: category || 'Прочие заготовки',
          proteins: ttkData.proteins, fats: ttkData.fats, carbs: ttkData.carbs, calories: ttkData.calories,
          engineer: ttkData.engineer, responsible: ttkData.responsible,
        },
      });
      inserted++;
      console.log(`✅ [${inserted}] ${ttkData.title} (${ttkData.ingredients.length} ингр.) → ${category || 'Прочие заготовки'}`);
    } catch (error) {
      console.error(`❌ Ошибка в блоке ${block.number}:`, error);
    }
  }

  console.log(`\n📊 Готово! Успешно добавлено: ${inserted}`);
  await prisma.$disconnect();
}

main().catch(console.error);