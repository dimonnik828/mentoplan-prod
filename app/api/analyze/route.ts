import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ---------- Типы ----------
type BusinessInput = {
  name: string;
  address: string;
  totalArea: number;
  hallArea: number;
  seats: number;
  staffCount: number;
  avgCheck: number;
  revenue: number;
  rent: number;
  utilities: number;
  payroll: number;
  managementCosts: number;
  costOfGoods: number;
  otherExpenses: number;
};

type Metrics = {
  revenuePerEmployee: number;
  revenuePerSeat: number;
  revenuePerSqM: number;
  foodCostPercent: number;
  payrollPercent: number;
  rentPercent: number;
  utilitiesPercent: number;
  managementPercent: number;
  otherPercent: number;
  profitPercent: number;
  profitAbsolute: number;
  avgCheck: number;
};

// ---------- Вспомогательные функции ----------
function calculateMetrics(data: BusinessInput): Metrics {
  const { revenue, staffCount, seats, totalArea, costOfGoods, payroll, rent, utilities, managementCosts, otherExpenses, avgCheck } = data;

  const revenuePerEmployee = staffCount > 0 ? revenue / staffCount : 0;
  const revenuePerSeat = seats > 0 ? revenue / seats : 0;
  const revenuePerSqM = totalArea > 0 ? revenue / totalArea : 0;

  const foodCostPercent = revenue > 0 ? (costOfGoods / revenue) * 100 : 0;
  const payrollPercent = revenue > 0 ? (payroll / revenue) * 100 : 0;
  const rentPercent = revenue > 0 ? (rent / revenue) * 100 : 0;
  const utilitiesPercent = revenue > 0 ? (utilities / revenue) * 100 : 0;
  const managementPercent = revenue > 0 ? (managementCosts / revenue) * 100 : 0;
  const otherPercent = revenue > 0 ? (otherExpenses / revenue) * 100 : 0;

  const totalCosts = costOfGoods + payroll + rent + utilities + managementCosts + otherExpenses;
  const profitAbsolute = revenue - totalCosts;
  const profitPercent = revenue > 0 ? (profitAbsolute / revenue) * 100 : 0;

  return {
    revenuePerEmployee,
    revenuePerSeat,
    revenuePerSqM,
    foodCostPercent,
    payrollPercent,
    rentPercent,
    utilitiesPercent,
    managementPercent,
    otherPercent,
    profitPercent,
    profitAbsolute,
    avgCheck,
  };
}

function generateRecommendations(data: BusinessInput, metrics: Metrics): { development: string[]; management: string[]; advertising: string[]; finance: string[] } {
  const recs = {
    development: [] as string[],
    management: [] as string[],
    advertising: [] as string[],
    finance: [] as string[],
  };

  // ---- Финансы ----
  if (metrics.profitPercent < 10) {
    recs.finance.push('Операционная прибыль ниже 10%. Срочно сократите постоянные расходы.');
  }
  if (metrics.rentPercent > 14) {
    recs.finance.push(`Аренда составляет ${Math.round(metrics.rentPercent)}% выручки (рекомендуется ≤14%). Рассмотрите переговоры с арендодателем или поиск нового помещения.`);
  }
  if (metrics.payrollPercent > 25) {
    recs.finance.push(`ФОТ ${Math.round(metrics.payrollPercent)}% выручки (целевой уровень 22-25%). Оптимизируйте график и пересмотрите штатное расписание.`);
  }
  if (metrics.foodCostPercent > 32) {
    recs.finance.push(`Себестоимость продуктов ${Math.round(metrics.foodCostPercent)}% (норма до 32%). Пересмотрите закупки и граммовки популярных блюд.`);
  }
  if (metrics.avgCheck < 800) {
    recs.finance.push('Средний чек ниже 800₽. Внедрите допродажи, предложите комплексы и десерты.');
  }

  // ---- Развитие (ассортимент, формат) ----
  if (data.seats < 30 && data.totalArea < 80) {
    recs.development.push('Маленькая площадь и мало посадочных мест. Рассмотрите формат «кофе с собой» и доставку.');
  }
  if (data.hallArea / data.seats < 1.5) {
    recs.development.push('Тесная посадка — гости могут чувствовать дискомфорт. Оптимизируйте расстановку мебели.');
  }
  if (data.staffCount < 4) {
    recs.development.push('Мало сотрудников — в пиковые часы возможно падение качества обслуживания. Нанять дополнительный персонал.');
  }

  // ---- Управление ----
  if (data.staffCount > 10 && metrics.revenuePerEmployee < 250000) {
    recs.management.push('Выручка на сотрудника низкая. Проведите обучение продажам или пересмотрите KPI.');
  }
  recs.management.push('Внедрите ежедневный учёт списаний и контроль остатков для снижения food cost.');

  // ---- Реклама ----
  if (data.revenue < 600000) {
    recs.advertising.push('Запустите таргетинг в соцсетях на жителей района с предложением скидки на первый визит.');
    recs.advertising.push('Разместитесь в 2ГИС и Яндекс.Картах с актуальными фото и меню.');
  } else {
    recs.advertising.push('У вас хорошая выручка — инвестируйте в программу лояльности и реферальную систему.');
  }

  return recs;
}

function generateChecklists(data: BusinessInput): Array<{ title: string; items: string[] }> {
  const lists = [];

  // Документы
  const docItems = ['Свидетельство о регистрации', 'Договор аренды', 'Санитарная книжка', 'Разрешение на торговлю'];
  if (data.address) docItems.push('Договор на вывоз ТБО');
  lists.push({ title: 'Документы для открытия', items: docItems });

  // ТТК и ассортимент
  const menuItems = ['Технологические карты напитков', 'Карта десертов', 'Сезонное меню'];
  if (data.seats > 20) menuItems.push('Барная карта');
  lists.push({ title: 'Ассортимент / ТТК', items: menuItems });

  // Обучение персонала
  const trainingItems = ['Программа стажировки на 5 дней', 'Чек-лист бариста', 'Чек-лист уборщицы'];
  if (data.staffCount > 8) trainingItems.push('Обучение управлению конфликтами');
  lists.push({ title: 'Схема обучения персонала', items: trainingItems });

  return lists;
}

function generateAdResources(data: BusinessInput, metrics: Metrics): Array<{ name: string; description: string; link: string }> {
  const resources = [
    { name: 'Яндекс.Директ', description: 'Контекстная реклама на район', link: 'https://direct.yandex.ru' },
    { name: 'VK Реклама', description: 'Таргетинг на жителей района', link: 'https://vk.com/ads' },
    { name: '2ГИС', description: 'Размещение в картах и рейтингах', link: 'https://2gis.ru' },
  ];
  if (metrics.avgCheck < 1000) {
    resources.push({ name: 'Акция "Приведи друга"', description: 'Скидка 20% для постоянных гостей', link: '#' });
  }
  return resources;
}

// ---------- POST /api/analyze ----------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Ожидаем все поля из BusinessInput
    const {
      name,
      address,
      totalArea,
      hallArea,
      seats,
      staffCount,
      avgCheck,
      revenue,
      rent,
      utilities,
      payroll,
      managementCosts,
      costOfGoods,
      otherExpenses,
    } = body;

    // Валидация обязательных полей
    if (!address || !revenue || !staffCount) {
      return NextResponse.json(
        { error: 'Необходимо указать адрес, выручку и количество сотрудников' },
        { status: 400 }
      );
    }

    const inputData: BusinessInput = {
      name: name || 'Название не указано',
      address,
      totalArea: totalArea || 0,
      hallArea: hallArea || 0,
      seats: seats || 0,
      staffCount,
      avgCheck: avgCheck || 0,
      revenue,
      rent: rent || 0,
      utilities: utilities || 0,
      payroll: payroll || 0,
      managementCosts: managementCosts || 0,
      costOfGoods: costOfGoods || 0,
      otherExpenses: otherExpenses || 0,
    };

    // 1. Расчёт метрик
    const metrics = calculateMetrics(inputData);

    // 2. Генерация рекомендаций
    const recommendations = generateRecommendations(inputData, metrics);

    // 3. Чек-листы
    const checklists = generateChecklists(inputData);

    // 4. Рекламные ресурсы
    const adResources = generateAdResources(inputData, metrics);

    // 5. Аудит-суммари (человеческий вывод)
    const profitStatus = metrics.profitPercent >= 15 ? 'хорошая' : metrics.profitPercent >= 10 ? 'удовлетворительная' : 'низкая';

    const auditSummary = `
    Бизнес «${inputData.name}» по адресу ${inputData.address} показывает выручку ${new Intl.NumberFormat('ru-RU').format(revenue)} ₽ в месяц.
    Прибыль составляет ${Math.round(metrics.profitPercent)}% от выручки — это ${profitStatus} показатель.

    Основные статьи расходов: себестоимость (${Math.round(metrics.foodCostPercent)}%), ФОТ (${Math.round(metrics.payrollPercent)}%), аренда (${Math.round(metrics.rentPercent)}%).

    Рекомендации:\n${recommendations.finance.map(r => `- ${r}`).join('\n') || 'пока нет критичных замечаний.'}
    `.trim();

    // ===== 6. Сохранение в БД =====
    const audit = await prisma.audit.create({
      data: {
        // ---- Входные данные ----
        name: inputData.name,
        address: inputData.address,
        totalArea: inputData.totalArea,
        hallArea: inputData.hallArea,
        seats: inputData.seats,
        staffCount: inputData.staffCount,
        avgCheck: inputData.avgCheck,
        revenue: inputData.revenue,
        rent: inputData.rent,
        utilities: inputData.utilities,
        payroll: inputData.payroll,
        managementCosts: inputData.managementCosts,
        costOfGoods: inputData.costOfGoods,
        otherExpenses: inputData.otherExpenses,

        // ---- Рассчитанные метрики ----
        foodCostPercent: metrics.foodCostPercent,
        payrollPercent: metrics.payrollPercent,
        rentPercent: metrics.rentPercent,
        utilitiesPercent: metrics.utilitiesPercent,
        managementPercent: metrics.managementPercent,
        otherPercent: metrics.otherPercent,
        profitPercent: metrics.profitPercent,
        profitAbsolute: metrics.profitAbsolute,
        revenuePerEmployee: Math.round(metrics.revenuePerEmployee),
        revenuePerSeat: Math.round(metrics.revenuePerSeat),
        revenuePerSqM: Math.round(metrics.revenuePerSqM),
        // healthIndex можно вычислить отдельно, если нужно:
        healthIndex: Math.max(0, Math.min(100, Math.round(metrics.profitPercent * 1.5 + 20))),

        // ---- Рекомендации, чек-листы, реклама (как JSON) ----
        recommendations: recommendations,   // объект с development, management, advertising, finance
        checklists: checklists,             // массив
        adResources: adResources,           // массив

        // ---- Связь с организацией (опционально) ----
        // organizationId: ... // если есть ID организации, можно подставить

        // ---- createdAt заполнится автоматически ----
      },
    });

    // 7. Возврат результата
    return NextResponse.json({
      id: audit.id,
      auditSummary,
      metrics: {
        revenuePerEmployee: Math.round(metrics.revenuePerEmployee),
        revenuePerSeat: Math.round(metrics.revenuePerSeat),
        revenuePerSqM: Math.round(metrics.revenuePerSqM),
        foodCostPercent: Math.round(metrics.foodCostPercent * 10) / 10,
        payrollPercent: Math.round(metrics.payrollPercent * 10) / 10,
        rentPercent: Math.round(metrics.rentPercent * 10) / 10,
        utilitiesPercent: Math.round(metrics.utilitiesPercent * 10) / 10,
        managementPercent: Math.round(metrics.managementPercent * 10) / 10,
        otherPercent: Math.round(metrics.otherPercent * 10) / 10,
        profitPercent: Math.round(metrics.profitPercent * 10) / 10,
        profitAbsolute: Math.round(metrics.profitAbsolute),
        avgCheck: Math.round(metrics.avgCheck),
      },
      recommendations,
      checklists,
      adResources,
    });
  } catch (error) {
    console.error('Ошибка при анализе:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}