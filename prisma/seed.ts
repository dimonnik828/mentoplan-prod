import { PrismaClient } from '@prisma/client';
import mainData from '../ttk_data.json' assert { type: 'json' };
import zagotovkiData from '../ttk_zagotovki_data.json' assert { type: 'json' };

const prisma = new PrismaClient();

// ========== Функция определения категории ==========
function getCategory(title: string, type: string): string {
  // Если это заготовка – сразу возвращаем "Заготовки"
  if (type === 'заготовка') return 'Заготовки';

  const lowerTitle = title.toLowerCase();

  const categoryMap: { category: string; keywords: string[] }[] = [
    {
      category: 'Завтрак',
      keywords: [
        'омлет', 'яичница', 'глазунья', 'пашот', 'скрэмбл', 'каша', 'сырник',
        'блин', 'оладьи', 'тост', 'бенедикт', 'манка', 'овсянка', 'панкейк',
        'вафля', 'шакшука', 'завтрак', 'гранола'
      ]
    },
    {
      category: 'Салаты',
      keywords: [
        'салат', 'цезарь', 'греческий', 'мимоза', 'оливье', 'винегрет',
        'капрезе', 'руккола', 'овощной', 'боул', 'будда-боул'
      ]
    },
    {
      category: 'Горячее',
      keywords: [
        'стейк', 'котлета', 'гуляш', 'рагу', 'паста', 'ризотто', 'плов',
        'бифштекс', 'отбивная', 'жаркое', 'запеканка', 'мясо', 'рыба',
        'курица', 'индейка', 'пюре', 'бургер', 'пицца', 'телячьи щеки',
        'ростбиф', 'су-вид', 'эскалоп', 'шницель', 'печень', 'утка', 'лосось',
        'семга', 'креветки', 'мидии', 'кальмары', 'осьминог', 'окрошка',
        'форшмак', 'сало', 'колбаски', 'фарш'
      ]
    },
    {
      category: 'Супы',
      keywords: [
        'суп', 'борщ', 'солянка', 'окрошка', 'уха', 'бульон', 'крем-суп',
        'щи', 'гаспачо', 'том ям', 'рамен'
      ]
    },
    {
      category: 'Напитки кофе',
      keywords: [
        'кофе', 'латте', 'капучино', 'эспрессо', 'американо', 'раф',
        'мокко', 'флэт уайт', 'гляссе', 'айс-кофе'
      ]
    },
    {
      category: 'Напитки другие',
      keywords: [
        'морс', 'компот', 'сок', 'лимонад', 'смузи', 'квас', 'молоко',
        'какао', 'фанта', 'спрайт', 'кока-кола', 'вода', 'фреш',
        'чай', 'матча', 'каркаде', 'улун', 'пуэр', 'зеленый чай', 'черный чай',
        'травяной чай', 'имбирный чай'
      ]
    },
    {
      category: 'Десерты',
      keywords: [
        'пирог', 'торт', 'кекс', 'печенье', 'маффин', 'круассан', 'булочка',
        'пирожное', 'чизкейк', 'десерт', 'мороженое', 'панна-котта',
        'безе', 'меренга', 'брауни', 'трайфл', 'зефир', 'шокоболы',
        'пралине', 'тирамису', 'наполеон', 'медовик', 'рафаэлло',
        'профитроль', 'эклер', 'шу', 'вафля', 'штрудель', 'фондан',
        'кокосовые конфеты', 'капкейк', 'рулет', 'коврижка', 'пряник', 'макаронс'
      ]
    }
  ];

  for (const entry of categoryMap) {
    if (entry.keywords.some(kw => lowerTitle.includes(kw))) {
      return entry.category;
    }
  }

  return 'Прочее';
}

// ========== Вспомогательные функции ==========

// Утилита для преобразования даты из "DD.MM.YYYY" в Date
function parseDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split('.');
  if (parts.length !== 3) return null;
  return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
}

// Преобразование ингредиентов из основного JSON (с полями gross_weight_g и т.д.)
function transformMainIngredients(ingredients: any[]): any[] {
  return ingredients.map(ing => ({
    product_name: ing.product_name,
    line_number: ing.line_number,
    gross_weight_g: ing.gross_weight_g,
    net_weight_g: ing.net_weight_g,
    output_g: ing.output_g,
    gross_weight_kg: ing.gross_weight_kg,
    net_weight_kg: ing.net_weight_kg,
    output_kg: ing.output_kg,
  }));
}

// Преобразование ингредиентов из заготовок (с gross_per_unit, unit и весами в кг)
function transformZagotovkiIngredients(ingredients: any[]): any[] {
  return ingredients.map(ing => ({
    product_name: ing.product_name,
    unit: ing.unit,
    gross_per_unit: ing.gross_per_unit,
    gross_weight_kg: ing.gross_weight_kg,
    net_weight_kg: ing.net_weight_kg,
    output_kg: ing.output_kg,
  }));
}

// ========== Основной процесс ==========

async function main() {
  console.log('🌱 Загрузка данных...');

  // === 1. Основные карты (блюда) ===
  for (const card of mainData) {
    const ingredientsJson = transformMainIngredients(card.ingredients || []);
    const category = getCategory(card.dish_name, 'блюдо');

    await prisma.tTK.upsert({
      where: { number: card.card_number },
      update: {}, // если уже существует – ничего не меняем
      create: {
        title: card.dish_name,
        number: card.card_number,
        organization: card.organization || 'Бранч',
        approvalDate: parseDate(card.approval_date),
        applicationArea: card.application_area,
        portionNorm: parseFloat(card.portion_norm) || null,
        totalOutputKg: card.total_output_kg,
        note: card.note,
        sourcePage: card.page_number,
        ingredients: ingredientsJson,
        technology: card.technology || '',
        presentation: card.serving_requirements || null,
        type: 'блюдо',
        category: category, // ← добавляем категорию
        proteins: card.proteins || null,
        fats: card.fats || null,
        carbs: card.carbs || null,
        calories: card.calories || null,
      },
    });
  }
  console.log(`✅ Загружено ${mainData.length} основных карт`);

  // === 2. Заготовки ===
  for (const card of zagotovkiData) {
    const ingredientsJson = transformZagotovkiIngredients(card.ingredients || []);
    // Для заготовок тип уже 'заготовка', категория будет автоматически 'Заготовки'
    const category = getCategory(card.dish_name, 'заготовка');

    await prisma.tTK.upsert({
      where: { number: card.card_number },
      update: {},
      create: {
        title: card.dish_name,
        number: card.card_number,
        receiptName: card.receipt_name,
        normUnit: card.norm_unit,
        organization: 'Бранч',
        approvalDate: parseDate(card.approval_date),
        applicationArea: card.application_area,
        portionNorm: parseFloat(card.portion_norm) || null,
        totalOutputKg: card.total_output_kg,
        note: null,
        sourcePage: card.page_number,
        ingredients: ingredientsJson,
        technology: card.technology || '',
        presentation: card.serving_requirements || null,
        type: 'заготовка',
        category: category, // ← будет "Заготовки"
        proteins: null,
        fats: null,
        carbs: null,
        calories: null,
      },
    });
  }
  console.log(`✅ Загружено ${zagotovkiData.length} заготовок`);

  console.log('🌱 Seed завершён успешно');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());