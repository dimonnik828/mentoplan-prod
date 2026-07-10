import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const pdfParse = require('pdf-parse');
const prisma = new PrismaClient();

// ============================================================
//  КАТЕГОРИИ ДЛЯ ЗАГОТОВОК
// ============================================================
const categoryKeywords: Record<string, string[]> = {
  'Тесто': ['тесто', 'бисквит', 'песочное', 'заварное', 'блин', 'корж', 'чиабатта', 'пицца', 'макаронс', 'эклер', 'пончик', 'круассан', 'булочка', 'безглютеновое', 'итальянская', 'миндальный', 'пита', 'ржаные булочки', 'смесь на шокоболы'],
  'Кремы и муссы': ['крем', 'мусс', 'суфле', 'помадка', 'глазур', 'айсинг', 'ганаш', 'курд', 'взбитая сметана', 'взбитые сливки', 'сметанный на', 'с вареной сгущенкой', 'карамель на', 'шоколадный', 'маршмеллоу', 'страчателла', 'творожная', 'карамель'],
  'Соусы': ['соус', 'заправк', 'песто', 'бешамель', 'голландез', 'майонез', 'барбекю', 'чимичурри', 'койсин', 'терияки', 'хумус', 'мутти', 'тапенад', 'маринад', 'масло', 'горчично-медовая', 'сливочно-', 'соево-медовый', 'чернично-', 'шоколадно-', 'васаби', 'икорный айоли', 'демигласс'],
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

function cleanTitle(rawTitle: string): string {
  return rawTitle
    .replace(/^Наименование.*?:(.*)/i, '$1')
    .replace(/^Название.*?:(.*)/i, '$1')
    .trim();
}

// ============================================================
//  ИЗВЛЕЧЕНИЕ НАЗВАНИЯ ТТК
// ============================================================
function extractTitle(blockText: string): string {
  const lines = blockText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let titleParts: string[] = [];
  for (const line of lines) {
    if (line.includes('Название на чеке:') || line.includes('Область применения:') || line.includes('Хранение:')) {
      break;
    }
    if (!isServiceLine(line) && !line.match(/^\d+$/)) {
      titleParts.push(line);
    }
  }
  return titleParts.join(' ').trim() || 'Без названия';
}

// ============================================================
//  ИЗВЛЕЧЕНИЕ ИНГРЕДИЕНТОВ (для заготовок)
// ============================================================
function extractIngredientsFromBlock(blockText: string): any[] {
  const lines = blockText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const ingredients: any[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    // Ищем строку, начинающуюся с цифры и единицы измерения (например, "1кг", "2кг", "3шт")
    if (/^\d+[кгштмл]/.test(line)) {
      // Следующая строка должна содержать числа
      const numbersLine = i + 1 < lines.length ? lines[i + 1] : '';
      const numbers = numbersLine.match(/\d+[.,]\d+/g);
      if (numbers && numbers.length >= 2) {
        const weightBrutto = parseFloat(numbers[0].replace(',', '.'));
        const weightNetto = parseFloat(numbers[1].replace(',', '.'));

        // Извлекаем название: может быть в текущей строке после единицы измерения, или в следующей строке после чисел, или через строку
        let name = '';
        // Проверяем, есть ли текст после единицы измерения в строке с номером
        const unitMatch = line.match(/^\d+([кгштмл])/);
        if (unitMatch) {
          const unit = unitMatch[1];
          const afterUnit = line.substring(line.indexOf(unit) + 1).trim();
          if (afterUnit.length > 0 && !afterUnit.match(/^\d+[.,]/)) {
            name = afterUnit;
          }
        }
        // Если не нашли, проверяем строку с числами на наличие текста после последнего числа
        if (!name) {
          const lastNumberIndex = numbersLine.lastIndexOf(numbers[numbers.length-1]) + numbers[numbers.length-1].length;
          if (lastNumberIndex < numbersLine.length) {
            const possibleName = numbersLine.substring(lastNumberIndex).trim();
            if (possibleName.length > 0 && !possibleName.match(/^\d+[.,]/) && !possibleName.includes('ИТОГО')) {
              name = possibleName;
            }
          }
        }
        // Если всё ещё нет, берём следующую строку, если она не служебная и не начинается с номера+единицы
        if (!name && i + 2 < lines.length) {
          const nextLine = lines[i + 2];
          if (!isServiceLine(nextLine) && !nextLine.match(/^\d+[кгштмл]/) && !nextLine.includes('ИТОГО') && !nextLine.includes('ТРЕБОВАНИЯ')) {
            name = nextLine;
          }
        }

        if (name) {
          ingredients.push({
            name: name,
            weightBrutto: weightBrutto,
            weightNetto: weightNetto,
            unit: 'г'
          });
        }
        i += 3; // пропускаем строку с номером, строку с числами и строку с названием (если она была)
        continue;
      }
    }
    i++;
  }
  return ingredients;
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
    console.log(`🔍 [Блок №${number}] Найдено ингредиентов: ${ingredients.length}`);
    if (ingredients.length > 0) {
      console.log(`   Первый: ${ingredients[0].name} (брутто: ${ingredients[0].weightBrutto}, нетто: ${ingredients[0].weightNetto})`);
    } else {
      console.log('⚠️ Ингредиенты не найдены.');
      console.log('--- Первые 15 строк блока ---');
      const lines = blockText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      lines.slice(0, 15).forEach(l => console.log(`  | ${l}`));
      console.log('--------------------------------------');
    }
  }

  return {
    title,
    number,
    ingredients,
    technology: '',
    presentation: '',
    storage: '',
    quality: '',
    proteins: 0,
    fats: 0,
    carbs: 0,
    calories: 0,
    engineer: '',
    responsible: '',
  };
}

// ============================================================
//  ОСНОВНАЯ ЛОГИКА
// ============================================================
async function main() {
  const pdfPath = path.join(__dirname, '../uploads/ttk-zagotovki.pdf');
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

  // Группируем по номеру и выбираем самый длинный блок
  const grouped = new Map<string, { number: string; index: number; length: number }>();
  for (const pos of numberPositions) {
    const next = numberPositions.find(p => p.index > pos.index);
    const end = next ? next.index : fullText.length;
    const length = end - pos.index;
    if (!grouped.has(pos.number) || length > grouped.get(pos.number)!.length) {
      grouped.set(pos.number, { number: pos.number, index: pos.index, length });
    }
  }

  const blocks = Array.from(grouped.values()).map(g => ({
    number: g.number,
    start: g.index,
    end: g.index + g.length,
  }));

  console.log(`🔍 Сформировано блоков: ${blocks.length}`);

  // Удаляем все старые заготовки
  await prisma.tTK.deleteMany({ where: { type: 'заготовка' } });
  console.log(`🗑️ Удалены все старые заготовки`);

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
          type: 'заготовка',
          category: category || 'Прочие заготовки',
          proteins: ttkData.proteins,
          fats: ttkData.fats,
          carbs: ttkData.carbs,
          calories: ttkData.calories,
          engineer: ttkData.engineer,
          responsible: ttkData.responsible,
        },
      });
      inserted++;
      console.log(`✅ ${ttkData.title} (№${ttkData.number}) → ${category || 'Прочие заготовки'}`);
    } catch (error) {
      console.error(`❌ Ошибка в блоке ${block.number}:`, error);
      errors++;
    }
  }

  console.log(`\n📊 Готово. Добавлено: ${inserted}, Ошибок: ${errors}`);
  await prisma.$disconnect();
}

main().catch(console.error);