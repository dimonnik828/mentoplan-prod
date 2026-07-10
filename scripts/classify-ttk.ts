import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const pdfParse = require('pdf-parse');
const prisma = new PrismaClient();

// ====== РАСШИРЕННЫЙ СЛОВАРЬ КАТЕГОРИЙ ======
const categoryKeywords: Record<string, string[]> = {
  // Блюда
  'Завтрак': ['омлет', 'яичница', 'глазунья', 'пашот', 'скрэмбл', 'каша', 'гранола', 'сырники', 'блин', 'оладьи', 'тост', 'бенедикт', 'манка', 'овсянка', 'рисовая каша', 'гречка', 'смузи', 'панкейки', 'вафли', 'шакшука', 'завтрак', 'фриттата', 'крок-мадам', 'крок-месье', 'яйцо-пашот'],
  'Салаты': ['салат', 'цезарь', 'греческий', 'мимоза', 'оливье', 'винегрет', 'капрезе', 'руккола', 'микс', 'овощной', 'теплый салат', 'боул', 'будда-боул', 'салат с тунцом', 'салат с курицей', 'салат с лососем', 'салат с моцареллой', 'салат с бурратой', 'салат с киноа', 'салат с креветками', 'салат с индейкой', 'салат с уткой', 'салат с фетой', 'салат с авокадо', 'салат с сыром'],
  'Вторые блюда': ['стейк', 'котлета', 'гуляш', 'рагу', 'паста', 'ризотто', 'плов', 'бифштекс', 'отбивная', 'жаркое', 'запеканка', 'мясо', 'рыба', 'курица', 'индейка', 'телятина', 'свинина', 'баранина', 'утка', 'кролик', 'форель', 'лосось', 'семга', 'креветка', 'кальмар', 'мидии', 'осьминог', 'паштет', 'колбаски', 'бургер', 'сэндвич', 'тортелли', 'равиоли', 'ньокки', 'лазанья', 'фарш', 'пюре', 'ростбиф', 'су-вид', 'гриль', 'запеченый', 'тушеный', 'жареный', 'филе', 'грудка', 'окорочок', 'бедро', 'крыло', 'ребра', 'антрекот', 'медальон', 'эскалоп', 'шницель', 'кнель', 'фрикадельки', 'тефтели', 'зразы', 'рулет мясной', 'заливное', 'холодец', 'студень', 'паштет', 'террин', 'конфи', 'карпаччо', 'татаки', 'сашими', 'суши', 'роллы', 'темпура', 'брускетта', 'кесадилья', 'драники', 'томленая говядина', 'пицца', 'фокачча', 'бургер'],
  'Напитки безалкогольные': ['морс', 'компот', 'сок', 'лимонад', 'смузи', 'квас', 'молоко', 'какао', 'горячий шоколад', 'ванильный', 'коктейль безалкогольный', 'айс-ти', 'фанта', 'спрайт', 'кока-кола', 'швепс', 'бон аква', 'пепси', 'миринда', 'газировка', 'минеральная', 'вода', 'фильтр-вода', 'чай холодный', 'кисель', 'напиток', 'фреш', 'сок свежевыжатый', 'грейпфрутовый', 'яблочный', 'молочный коктейль', 'мол.кок.'],
  'Напитки кофе': ['кофе', 'латте', 'капучино', 'эспрессо', 'американо', 'раф', 'мокко', 'флэт уайт', 'гляссе', 'доппио', 'макиато', 'айс-кофе', 'айс-латте', 'кофейный', 'халва', 'флэт', 'латте-макиато', 'эспрессо-тоник', 'кофе с молоком', 'кофе со сливками', 'фраппе', 'фрапуччино'],
  'Напитки чай': ['чай', 'матча', 'каркаде', 'улун', 'пуэр', 'зеленый чай', 'черный чай', 'травяной чай', 'имбирный чай', 'молочный улун', 'жасмин', 'сен-ча', 'бергамот', 'алтайский', 'лунный замок', 'доброе утро', 'эрл грей', 'дарджилинг', 'ассам', 'кимун', 'пу-эр', 'белый чай', 'желтый чай', 'вот фрукт'],
  'Первые блюда': ['суп', 'борщ', 'солянка', 'окрошка', 'уха', 'бульон', 'крем-суп', 'свекольник', 'щи', 'похлебка', 'гаспачо', 'том ям', 'том-ям', 'рамен', 'лапша'],
  'Продукты и ингредиенты': ['молоко', 'сливки', 'масло', 'творог', 'сыр', 'моцарелла', 'пармезан', 'яйцо', 'мука', 'сахар', 'соль', 'перец', 'овощи', 'фрукты', 'ягоды', 'зелень', 'грибы', 'мясо', 'рыба', 'морепродукты', 'курица', 'индейка', 'говядина', 'свинина', 'телятина', 'утка', 'кролик', 'форель', 'лосось', 'семга', 'креветка', 'кальмар', 'мидии', 'осьминог', 'краб', 'икра', 'паста томатная', 'томатная паста', 'сметана', 'йогурт', 'кефир', 'ряженка', 'сыр сливочный', 'хумус', 'авокадо', 'банан', 'яблоко', 'апельсин', 'лимон', 'лайм', 'груша', 'персик', 'вишня', 'черешня', 'клубника', 'малина', 'ежевика', 'голубика', 'смородина', 'облепиха', 'клюква', 'тыква', 'морковь', 'картофель', 'свекла', 'лук', 'чеснок', 'перец болгарский', 'перец чили', 'капуста', 'цукини', 'баклажан', 'шампиньоны', 'масло оливковое', 'масло подсолнечное', 'уксус', 'горчица', 'васаби', 'имбирь', 'специи', 'пряности', 'крупа', 'рис', 'гречка', 'овсянка', 'пшено', 'манка', 'бобовые', 'горох', 'чечевица', 'фасоль', 'нут', 'тофу', 'соевый', 'сейтан', 'темпе', 'орехи', 'арахис', 'миндаль', 'грецкий', 'фундук', 'кешью', 'кокос', 'сухофрукты', 'изюм', 'курага', 'чернослив', 'финики', 'инжир', 'добавка', 'нутелла', 'шоколад колотый', 'бородинском хлебе', 'крутоны', 'топинги', 'ягода', 'м.кок.'],
  'Десерты / Выпечка': ['пирог', 'торт', 'кекс', 'печенье', 'маффин', 'круассан', 'булочка', 'чиабатта', 'эклер', 'пирожное', 'безе', 'мусс', 'чизкейк', 'наполеон', 'брауни', 'десерт', 'шоколадный', 'имбирный пряник', 'вафли', 'пончик', 'штрудель', 'пай', 'рулет', 'запеканка сладкая', 'капкейк', 'мильфей', 'профитроль', 'макаронс', 'трайфл', 'меренговый', 'фисташковый', 'рафаэлло', 'медовик', 'кулич', 'зефир', 'конфеты', 'шокоболы', 'шоколадная бомбочка', 'сорбет', 'шербет', 'мороженое', 'парфе', 'крем-карамель', 'панна-котта', 'крем-брюле', 'флан', 'желе', 'муссовый', 'эскимо', 'пломбир', 'кукисы', 'бриошь', 'корекс', 'карамельная глазурь', 'белые кукисы', 'бисквит маковый', 'бисквит ореховый', 'бисквит цитрусовый', 'крем маскарпоне', 'крем сметанный', 'блинчик', 'крем йогуртовый'],
  'Соусы / Заправки': ['соус', 'заправка', 'песто', 'бешамель', 'голландез', 'майонез', 'кетчуп', 'барбекю', 'демигласс', 'тартар', 'чимичурри', 'айоли', 'гранатовый', 'томатный', 'сливочный', 'чесночный', 'горчичный', 'койсин', 'соевый', 'медовый', 'бальзамический', 'винегрет', 'рататуй', 'конфитюр', 'терияки', 'устричный', 'имбирный', 'кокосовый', 'апельсиновый', 'глазурь', 'шоколадная глазурь', 'добавка'],
  // Заготовки
  'Тесто': ['тесто', 'бисквит', 'песочное', 'заварное', 'блин', 'корж', 'чиабатта', 'пицца', 'макаронс', 'эклер', 'пончик', 'круассан', 'булочка', 'безглютеновое', 'итальянская', 'миндальный', 'пита', 'на ржаные булочки', 'смесь на шокоболы'],
  'Кремы и муссы': ['крем', 'мусс', 'суфле', 'помадка', 'глазур', 'айсинг', 'ганаш', 'курд', 'взбитая сметана', 'взбитые сливки', 'сметанный на', 'с вареной сгущенкой', 'карамель на', 'шоколадный', 'маршмеллоу', 'страчателла', 'творожная', 'карамель'],
  'Соусы': ['соус', 'заправк', 'песто', 'бешамель', 'голландез', 'майонез', 'барбекю', 'чимичурри', 'койсин', 'терияки', 'хумус', 'мутти', 'тапенад', 'маринад', 'масло', 'горчично-медовая', 'сливочно-', 'соево-медовый', 'чернично-', 'шоколадно-', 'васаби', 'икорный айоли', 'демигласс'],
  'Мясо и рыба': ['фарш', 'паштет', 'колбас', 'ростбиф', 'филе', 'грудка', 'су-вид', 'окорок', 'буженина', 'эскалоп', 'шницель', 'котлет', 'птитим', 'утка', 'лосось', 'семга', 'креветк', 'мидии', 'кальмар', 'осьминог', 'окрошка', 'форшмак', 'сало', 'телячьи щечки', 'тушка утенка', 'форель', 'слабосольные', 'начинка д/куриной', 'мясо утки', 'солянка п/ф', 'борщ п/ф', 'гаспачо п/ф', 'вареники п/ф', 'панини п/ф'],
  'Продукты': ['айсберг', 'базилик', 'вяленые помидоры', 'помидоры конкасе', 'руккола', 'фасоль', 'шпинат', 'свекольный', 'крутоны', 'лед', 'микс салата', 'рис', 'тофу', 'варень', 'гранола', 'драники', 'кукурузный суп', 'ваернье', 'чеснок', 'лук', 'морков', 'картофель', 'свекла', 'ароматное масло', 'тофу сметана', 'свекольный тапанед'],
  'Сиропы и напитки': ['сироп', 'морс', 'сок', 'компот', 'лимонад', 'горячий шоколад', 'доппио', 'эспрессо']
};

// Функция определения категории
function detectCategory(title: string, type: string): string | null {
  const lowerTitle = title.toLowerCase();
  if (type === 'заготовка') {
    // Сначала проверим по категориям заготовок
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (cat === 'Тесто' || cat === 'Кремы и муссы' || cat === 'Соусы' || cat === 'Мясо и рыба' || cat === 'Продукты' || cat === 'Сиропы и напитки') {
        for (const kw of keywords) {
          if (lowerTitle.includes(kw)) return cat;
        }
      }
    }
    return 'Прочие заготовки';
  } else {
    // Блюда
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (cat === 'Завтрак' || cat === 'Салаты' || cat === 'Вторые блюда' || cat === 'Напитки безалкогольные' || cat === 'Напитки кофе' || cat === 'Напитки чай' || cat === 'Первые блюда' || cat === 'Продукты и ингредиенты' || cat === 'Десерты / Выпечка' || cat === 'Соусы / Заправки') {
        for (const kw of keywords) {
          if (lowerTitle.includes(kw)) return cat;
        }
      }
    }
    return 'Другое';
  }
}

// ====== ПАРСИНГ PDF ======
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

function parseTTK(blockText: string, number: string, type: string): any {
  const lines = blockText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let title = 'Без названия';

  // Ищем строку с номером (для блюд и заготовок)
  let numberLineIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (new RegExp(`(?:No|№)\\s*${number}`).test(lines[i])) {
      numberLineIndex = i;
      break;
    }
  }

  // Извлекаем название
  if (numberLineIndex !== -1) {
    // Ищем до номера (для блюд)
    for (let i = numberLineIndex - 1; i >= Math.max(0, numberLineIndex - 5); i--) {
      const line = lines[i];
      if (!line.includes('OOO') && !line.includes('Технико-технологическая') && !line.includes('Технологическая карта') &&
          !line.includes('Область применения') && !line.includes('Реализация') && !line.includes('Требование') &&
          !line.includes('Утверждаю') && !line.includes('Согласно акту') && !line.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
        title = line;
        break;
      }
    }
    if (title === 'Без названия') {
      // Если не нашли, ищем после номера
      for (let i = numberLineIndex + 1; i < Math.min(numberLineIndex + 5, lines.length); i++) {
        const line = lines[i];
        if (!line.includes('OOO') && !line.includes('Технико-технологическая') && !line.includes('Технологическая карта') &&
            !line.includes('Область применения') && !line.includes('Реализация') && !line.includes('Требование') &&
            !line.includes('Утверждаю') && !line.includes('Согласно акту') && !line.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
          title = line;
          break;
        }
      }
    }
  }

  // Технология
  const techMatch = blockText.match(/Технология приготовления\s*([\s\S]*?)(?=ТРЕБОВАНИЯ К ОФОРМЛЕНИЮ|$)/i);
  const technology = techMatch ? techMatch[1].trim().replace(/\s+/g, ' ') : '';

  // Презентация
  const presentationMatch = blockText.match(/ТРЕБОВАНИЯ К ОФОРМЛЕНИЮ, ПОДАЧЕ И РЕАЛИЗАЦИИ\s*([\s\S]*?)(?=Пищевая|Органолептические|ИТОГО|$)/i);
  const presentation = presentationMatch ? presentationMatch[1].trim().replace(/\s+/g, ' ') : '';

  // Хранение
  const storageMatch = blockText.match(/Реализация и хранение\s*([\s\S]*?)(?=Органолептические|$)/i);
  const storage = storageMatch ? storageMatch[1].trim().replace(/\s+/g, ' ') : '';

  // Качество
  const qualityMatch = blockText.match(/Органолептические показатели\s*([\s\S]*?)(?=Требование|Пищевая|$)/i);
  const quality = qualityMatch ? qualityMatch[1].trim().replace(/\s+/g, ' ') : '';

  // Ингредиенты (таблица)
  const ingredientLines = blockText.match(/^\s*\d+\s+[^\d]+[\d,.]+\s+[\d,.]+\s+[\d,.]+\s+[\d,.]+\s+[\d,.]+\s+[\d,.]+/gm);
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

  // Пищевая ценность
  const nutritionMatch = blockText.match(/Пищевая и энергетическая ценность\s*\(на 100г\.\)\s*Белки\s*([\d,.]+)\s*Жиры\s*([\d,.]+)\s*Углеводы\s*([\d,.]+)\s*ккал\s*([\d,.]+)/i);
  let proteins = 0, fats = 0, carbs = 0, calories = 0;
  if (nutritionMatch) {
    proteins = parseFloat(nutritionMatch[1].replace(',', '.'));
    fats = parseFloat(nutritionMatch[2].replace(',', '.'));
    carbs = parseFloat(nutritionMatch[3].replace(',', '.'));
    calories = parseFloat(nutritionMatch[4].replace(',', '.'));
  }

  // Ответственные
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
    responsible
  };
}

async function parsePDF(pdfPath: string, type: string) {
  console.log(`📄 Читаю файл: ${pdfPath}`);
  const fullText = await extractTextFromPDF(pdfPath);
  console.log(`📄 Извлечено ${fullText.length} символов текста`);

  // Поиск номеров (учитываем разные форматы)
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

  // Группируем уникальные номера
  const uniqueNumbers = new Map<string, { number: string; index: number }>();
  for (const pos of numberPositions) {
    if (!uniqueNumbers.has(pos.number)) {
      uniqueNumbers.set(pos.number, pos);
    }
  }
  console.log(`🔍 Уникальных номеров: ${uniqueNumbers.size}`);

  let inserted = 0;
  let errors = 0;

  for (const [number, pos] of uniqueNumbers) {
    try {
      const startPos = pos.index;
      const nextNumberMatch = fullText.slice(startPos + 1).match(/(?:No|№)\s*\d+/i);
      let endPos = fullText.length;
      if (nextNumberMatch && nextNumberMatch.index !== undefined) {
        endPos = startPos + 1 + nextNumberMatch.index;
      }
      const blockText = fullText.substring(startPos, endPos);
      const ttkData = parseTTK(blockText, number, type);
      const category = detectCategory(ttkData.title, type);

      // Проверяем, существует ли уже такая ТТК с этим номером
      const existing = await prisma.tTK.findFirst({ where: { number } });
      if (!existing) {
        await prisma.tTK.create({
          data: {
            title: ttkData.title,
            number: ttkData.number,
            ingredients: ttkData.ingredients,
            technology: ttkData.technology,
            presentation: ttkData.presentation || null,
            storage: ttkData.storage || null,
            quality: ttkData.quality || null,
            type: type,
            category: category,
            proteins: ttkData.proteins || null,
            fats: ttkData.fats || null,
            carbs: ttkData.carbs || null,
            calories: ttkData.calories || null,
            engineer: ttkData.engineer || null,
            responsible: ttkData.responsible || null,
          },
        });
        inserted++;
        console.log(`✅ Добавлена: ${ttkData.title} (№${ttkData.number}) → категория: ${category}`);
      } else {
        console.log(`⏩ ТТК №${number} уже существует, пропускаем`);
      }
    } catch (error) {
      console.error(`❌ Ошибка при обработке №${number}:`, error);
      errors++;
    }
  }

  console.log(`📊 Для ${type} добавлено ${inserted}, ошибок ${errors}`);
}

async function main() {
  // Очистка таблицы
  console.log('🗑️ Очищаем таблицу TTK...');
  await prisma.tTK.deleteMany({});

  // Парсим блюда
  await parsePDF(path.join(__dirname, '../uploads/ttk.pdf'), 'блюдо');

  // Парсим заготовки
  await parsePDF(path.join(__dirname, '../uploads/ttk-zagotovki.pdf'), 'заготовка');

  // Удаляем служебные записи
  console.log('🗑️ Удаляем служебные записи...');
  await prisma.tTK.deleteMany({
    where: {
      OR: [
        { title: { contains: 'ПЕРСОНАЛ', mode: 'insensitive' } },
        { title: { in: ['Набор приборов', 'дэнтэ', 'пробить блендером. Залить в кремер и заправить двумя', 'ПЕРСОНАЛУ'] } },
      ],
    },
  });

  console.log('✅ Завершено!');
  await prisma.$disconnect();
}

main().catch(console.error);