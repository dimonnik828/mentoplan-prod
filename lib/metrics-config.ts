/* ==================================================================
   МЕТРИКИ КОНФИГУРАЦИЯ — ВСЯ РЕКОМЕНДАТЕЛЬНАЯ СИСТЕМА

   Этот файл содержит ВСЮ бизнес-логику рекомендаций, пороговых
   значений, нормативов и диагностических правил программы.

   Чтобы добавить/расширить возможности:
   1. Добавьте новый метрик в METRICS_CONFIG
   2. Добавьте правило в RECOMMENDATION_RULES
   3. Добавьте гипотезу/потерю в DIAGNOSTIC_RULES

   ================================================================== */

/* ------------------------------------------------------------------
   ОПРЕДЕЛЕНИЯ ТИПОВ
   ------------------------------------------------------------------ */

export interface MetricConfig {
  key: string;
  label: string;
  /** Зелёная граница (норма) */
  green: number;
  /** Оранжевая граница (внимание) */
  orange: number;
  /** true = чем выше, тем лучше (прибыль). false = чем ниже, тем лучше (расходы) */
  higherIsBetter: boolean;
  /** Включать в индекс здоровья */
  affectsHealth: boolean;
  /** Единицы отображения */
  unit: string;
  /** Краткое описание */
  description: string;
  /** Рекомендация при зелёном значении */
  greenAdvice: string;
  /** Рекомендация при оранжевом значении */
  orangeAdvice: string;
  /** Рекомендация при красном значении */
  redAdvice: string;
}

export interface RecommendationRule {
  metricKey: string;
  /** Порог для проверки (в % от выручки) */
  redThreshold: number;
  orangeThreshold: number;
  redTitle: string;
  orangeTitle: string;
  greenTitle: string;
  redDescription: string;
  orangeDescription: string;
  greenDescription: string;
}

export interface GrowthHypothesisRule {
  id: string;
  title: string;
  description: string;
  /** Условие активации: (data) => boolean */
  condition: (data: DiagnosticData) => boolean;
  /** Расчёт потенциала прибыли: (data) => number */
  potentialProfit: (data: DiagnosticData) => number;
  probability: number;
  complexity: 'easy' | 'medium' | 'hard';
  time: string;
  /** Всегда показывать (даже без условия) */
  alwaysShow?: boolean;
}

export interface EfficiencyLossRule {
  name: string;
  /** Условие: (data) => boolean */
  condition: (data: DiagnosticData) => boolean;
  /** Расчёт потерь: (data) => number (в месяц) */
  monthlyLoss: (data: DiagnosticData) => number;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface BottleneckRule {
  name: string;
  condition: (data: DiagnosticData) => boolean;
  description: string;
  impact: 'low' | 'medium' | 'high';
}

export interface DiagnosticData {
  revenue: number;
  rent: number;
  utilities: number;
  payroll: number;
  managementCosts: number;
  costOfGoods: number;
  otherExpenses: number;
  healthIndex: number;
  totalArea?: number;
  hallArea?: number;
  seats?: number;
  dailyGuests?: number;
  avgCheck?: number;
  venueType?: string;
  staffCount?: number;
  maxGuestsPerDayFromSeats?: number;
  bottleneck?: string;
  foodCostPercent?: number;
  payrollPercent?: number;
  rentPercent?: number;
  utilitiesPercent?: number;
}

/* ------------------------------------------------------------------
   1. КОНФИГУРАЦИЯ МЕТРИК
   Все пороговые значения и нормативы в одном месте.
   Добавление новой метрики = новая строка в объект.
   ------------------------------------------------------------------ */

export const METRICS_CONFIG: Record<string, MetricConfig> = {
  foodCostPercent: {
    key: 'foodCostPercent',
    label: 'Себестоимость',
    green: 30,
    orange: 35,
    higherIsBetter: false,
    affectsHealth: true,
    unit: '%',
    description: 'Доля себестоимости ингредиентов в выручке',
    greenAdvice: 'Отличный контроль себестоимости. Продолжайте мониторить.',
    orangeAdvice: 'Стоимость ингредиентов в пределах нормы, но есть запас для оптимизации.',
    redAdvice: 'Себестоимость выше 35%. Пересмотрите поставщиков, оптимизируйте меню, сократите waste.',
  },
  payrollPercent: {
    key: 'payrollPercent',
    label: 'ФОТ',
    green: 30,
    orange: 38,
    higherIsBetter: false,
    affectsHealth: true,
    unit: '%',
    description: 'Фонд оплаты труда как доля выручки',
    greenAdvice: 'Эффективное управление персоналом.',
    orangeAdvice: 'Фонд оплаты труда приемлем, но внимательно следите за ростом.',
    redAdvice: 'Зарплатные расходы слишком высоки. Рассмотрите оптимизацию графика.',
  },
  rentPercent: {
    key: 'rentPercent',
    label: 'Аренда',
    green: 15,
    orange: 20,
    higherIsBetter: false,
    affectsHealth: true,
    unit: '%',
    description: 'Арендные расходы как доля выручки',
    greenAdvice: 'Хорошее соотношение аренды к выручке.',
    orangeAdvice: 'Аренда в допустимых пределах, но мониторьте.',
    redAdvice: 'Арендные расходы критичны. Рассмотрите переезд или переговоры об аренде.',
  },
  utilitiesPercent: {
    key: 'utilitiesPercent',
    label: 'Коммунальные',
    green: 5,
    orange: 8,
    higherIsBetter: false,
    affectsHealth: true,
    unit: '%',
    description: 'Коммунальные и энергетические расходы',
    greenAdvice: 'Энергозатраты в норме.',
    orangeAdvice: 'Коммунальные повышены — проверьте изоляцию и оборудование.',
    redAdvice: 'Энергозатраты критичны. Рассмотрите рекуперацию и LED.',
  },
  managementPercent: {
    key: 'managementPercent',
    label: 'Управление',
    green: 5,
    orange: 8,
    higherIsBetter: false,
    affectsHealth: true,
    unit: '%',
    description: 'Расходы на управление и администрацию',
    greenAdvice: 'Управленческие расходы оптимизированы.',
    orangeAdvice: 'Управленческие расходы выше нормы, оптимизируйте процессы.',
    redAdvice: 'Слишком высокие расходы на управление. Автоматизируйте рутину.',
  },
  otherPercent: {
    key: 'otherPercent',
    label: 'Прочие расходы',
    green: 5,
    orange: 10,
    higherIsBetter: false,
    affectsHealth: true,
    unit: '%',
    description: 'Прочие операционные расходы',
    greenAdvice: 'Прочие расходы под контролем.',
    orangeAdvice: 'Прочие расходы в зоне внимания.',
    redAdvice: 'Прочие расходы слишком высоки — аудит необходимых и лишних трат.',
  },
  profitPercent: {
    key: 'profitPercent',
    label: 'Опер. прибыль',
    green: 15,
    orange: 8,
    higherIsBetter: true,
    affectsHealth: true,
    unit: '%',
    description: 'Операционная прибыль как доля выручки',
    greenAdvice: 'Операционная прибыль в отличной зоне. Бизнес устойчив.',
    orangeAdvice: 'Маржа требует внимания. Ищите точки роста.',
    redAdvice: 'Бизнес близок к убытку. Необходимы срочные меры по оптимизации расходов.',
  },
};

/* ------------------------------------------------------------------
   2. ПРАВИЛА РЕКОМЕНДАЦИЙ
   Генерация цветных рекомендаций на основе метрик.
   Добавление нового правила = новый объект в массив.
   ------------------------------------------------------------------ */

export const RECOMMENDATION_RULES: RecommendationRule[] = [
  {
    metricKey: 'foodCostPercent',
    redThreshold: 35,
    orangeThreshold: 30,
    redTitle: 'Food cost критичный',
    orangeTitle: 'Food cost повышен',
    greenTitle: 'Food cost в норме',
    redDescription: 'Себестоимость выше 35%. Пересмотрите поставщиков, оптимизируйте меню, сократите waste.',
    orangeDescription: 'Стоимость ингредиентов в пределах нормы, но есть запас для оптимизации.',
    greenDescription: 'Отличный контроль себестоимости. Продолжайте мониторить.',
  },
  {
    metricKey: 'payrollPercent',
    redThreshold: 38,
    orangeThreshold: 30,
    redTitle: 'ФОТ перегружен',
    orangeTitle: 'ФОТ на контроле',
    greenTitle: 'ФОТ в норме',
    redDescription: 'Зарплатные расходы слишком высоки. Рассмотрите оптимизацию графика.',
    orangeDescription: 'Фонд оплаты труда приемлем, но внимательно следите за ростом.',
    greenDescription: 'Эффективное управление персоналом.',
  },
  {
    metricKey: 'rentPercent',
    redThreshold: 20,
    orangeThreshold: 15,
    redTitle: 'Аренда слишком высокая',
    orangeTitle: 'Аренда на контроле',
    greenTitle: 'Аренда оптимальна',
    redDescription: 'Арендные расходы критичны. Рассмотрите переезд или переговоры об аренде.',
    orangeDescription: 'Аренда в допустимых пределах, но мониторьте.',
    greenDescription: 'Хорошее соотношение аренды к выручке.',
  },
  {
    metricKey: 'profitPercent',
    redThreshold: 5,
    orangeThreshold: 15,
    redTitle: 'Прибыль критически низкая',
    orangeTitle: 'Прибыль ниже нормы',
    greenTitle: 'Прибыль здоровая',
    redDescription: 'Бизнес близок к убытку. Необходимы срочные меры по оптимизации расходов.',
    orangeDescription: 'Маржа требует внимания. Ищите точки роста.',
    greenDescription: 'Операционная прибыль в отличной зоне. Бизнес устойчив.',
  },
];

/* ------------------------------------------------------------------
   3. ПРАВИЛА ДИАГНОСТИКИ — ГИПОТЕЗЫ РОСТА
   Добавление новой гипотезы = новый объект в массив.
   ------------------------------------------------------------------ */

export const GROWTH_HYPOTHESIS_RULES: GrowthHypothesisRule[] = [
  {
    id: 'h1',
    title: 'Оптимизация food cost',
    description: 'Снижение себестоимости блюд через пересмотр поставщиков и оптимизацию меню.',
    condition: (d) => d.costOfGoods / d.revenue > 0.30,
    potentialProfit: (d) => (d.costOfGoods / d.revenue - 0.28) * d.revenue * 0.5,
    probability: 0.7,
    complexity: 'medium',
    time: '2-4 недели',
  },
  {
    id: 'h2',
    title: 'Оптимизация графика персонала',
    description: 'Внедрение гибкого графика и кросс-тренинга для снижения ФОТ.',
    condition: (d) => d.payroll / d.revenue > 0.30,
    potentialProfit: (d) => (d.payroll / d.revenue - 0.28) * d.revenue * 0.3,
    probability: 0.65,
    complexity: 'easy',
    time: '1-2 недели',
  },
  {
    id: 'h3',
    title: 'Увеличение потока гостей',
    description: 'Маркетинговые акции и привлечение трафика для увеличения загрузки.',
    condition: (d) => (d.dailyGuests ?? 0) > 0 && (d.maxGuestsPerDayFromSeats ?? 0) > 0 && d.dailyGuests! < d.maxGuestsPerDayFromSeats! * 0.7,
    potentialProfit: (d) => Math.round((d.maxGuestsPerDayFromSeats ?? 0) * 0.3) * (d.avgCheck ?? 500) * 30 * 0.15,
    probability: 0.6,
    complexity: 'medium',
    time: '1-3 месяца',
  },
  {
    id: 'h4',
    title: 'Внедрение системы лояльности',
    description: 'Программа лояльности для увеличения возврата гостей и среднего чека.',
    condition: () => true,
    potentialProfit: (d) => d.revenue * 0.05,
    probability: 0.5,
    complexity: 'medium',
    time: '1-2 месяца',
    alwaysShow: true,
  },
];

/* ------------------------------------------------------------------
   4. ПРАВИЛА ДИАГНОСТИКИ — ПОТЕРИ ЭФФЕКТИВНОСТИ
   ------------------------------------------------------------------ */

export const EFFICIENCY_LOSS_RULES: EfficiencyLossRule[] = [
  {
    name: 'Перерасход food cost',
    condition: (d) => d.costOfGoods / d.revenue > 0.32,
    monthlyLoss: (d) => (d.costOfGoods / d.revenue - 0.28) * d.revenue,
    description: 'Излишние расходы на ингредиенты',
    severity: 'high',
  },
  {
    name: 'Высокая аренда',
    condition: (d) => d.rent / d.revenue > 0.18,
    monthlyLoss: (d) => (d.rent / d.revenue - 0.15) * d.revenue * 0.3,
    description: 'Аренда отъедает значительную часть выручки',
    severity: 'medium',
  },
  {
    name: 'Энергозатраты',
    condition: (d) => d.utilities / d.revenue > 0.07,
    monthlyLoss: (d) => (d.utilities / d.revenue - 0.05) * d.revenue,
    description: 'Коммунальные выше нормы',
    severity: 'low',
  },
];

/* ------------------------------------------------------------------
   5. ПРАВИЛА ДИАГНОСТИКИ — УЗКИЕ МЕСТА
   ------------------------------------------------------------------ */

export const BOTTLENECK_RULES: BottleneckRule[] = [
  {
    name: 'Производственный bottleneck',
    condition: (d) => !!d.bottleneck && d.bottleneck !== 'Зал',
    description: 'Производственный bottleneck ограничивает выручку',
    impact: 'high',
  },
  {
    name: 'Нехватка посадочных мест',
    condition: (d) => (d.seats ?? 0) > 0 && (d.dailyGuests ?? 0) > d.seats! * 2,
    description: 'Спрос превышает вместимость зала',
    impact: 'medium',
  },
  {
    name: 'Низкий индекс здоровья',
    condition: (d) => d.healthIndex < 40,
    description: 'Критические показатели требуют срочного вмешательства',
    impact: 'high',
  },
];

/* ------------------------------------------------------------------
   6. ОТРАСЛЕВЫЕ НОРМАТИВЫ (по типу заведения)
   ------------------------------------------------------------------ */

export interface VenueNorm {
  label: string;
  hallRate: number;           // Воздухообмен зала
  waiterRatio: number;       // 1 официант на N мест
  dishwasherRatio: number;   // 1 мойщик на N м²
  guestTime: number;         // Минут на гостя
  turnsPerShift: number;     // Оборачиваемость за смену
  hasHall: boolean;
  areaPerSeat: [number, number]; // Диапазон м²/место
  areaPerCook: [number, number]; // Диапазон м²/повар
  maxTurnsPerDay: number;
}

export const VENUE_NORMS: Record<string, VenueNorm> = {
  restaurant: { label: 'Ресторан', hallRate: 3.0, waiterRatio: 20, dishwasherRatio: 100, guestTime: 50, turnsPerShift: 1.8, hasHall: true, areaPerSeat: [2.5, 3.5], areaPerCook: [5, 6], maxTurnsPerDay: 2 },
  coffee:    { label: 'Кофейня', hallRate: 3.5, waiterRatio: 40, dishwasherRatio: 100, guestTime: 25, turnsPerShift: 3.0, hasHall: true, areaPerSeat: [1.5, 1.8], areaPerCook: [4, 5], maxTurnsPerDay: 4 },
  cafe:      { label: 'Кафе',    hallRate: 3.2, waiterRatio: 40, dishwasherRatio: 100, guestTime: 35, turnsPerShift: 2.2, hasHall: true, areaPerSeat: [1.8, 2.2], areaPerCook: [5, 6], maxTurnsPerDay: 3 },
  canteen:   { label: 'Столовая', hallRate: 4.5, waiterRatio: 0, dishwasherRatio: 100, guestTime: 20, turnsPerShift: 3.5, hasHall: true, areaPerSeat: [1.8, 2.2], areaPerCook: [5, 6], maxTurnsPerDay: 4 },
  fastfood:  { label: 'Быстрое обслуживание', hallRate: 4.0, waiterRatio: 0, dishwasherRatio: 100, guestTime: 10, turnsPerShift: 4.5, hasHall: true, areaPerSeat: [1.2, 1.5], areaPerCook: [3, 4], maxTurnsPerDay: 5 },
  darkkitchen: { label: 'Дарк-китчен', hallRate: 0, waiterRatio: 0, dishwasherRatio: 50, guestTime: 0, turnsPerShift: 0, hasHall: false, areaPerSeat: [0, 0], areaPerCook: [6, 8], maxTurnsPerDay: 0 },
};

/* ------------------------------------------------------------------
   7. НОРМАТИВЫ КЛИМАТА
   ------------------------------------------------------------------ */

export const CLIMATE_NORMS: Record<string, { label: string; winterMin: number }> = {
  moscow:     { label: 'Москва',         winterMin: -25 },
  spb:        { label: 'Санкт-Петербург', winterMin: -24 },
  novosibirsk:{ label: 'Новосибирск',   winterMin: -32 },
  kazan:      { label: 'Казань',          winterMin: -30 },
  rostov:     { label: 'Ростов-на-Дону', winterMin: -18 },
  sochi:      { label: 'Сочи',           winterMin: 2 },
};

/* ------------------------------------------------------------------
   8. НОРМАТИВЫ АРЕНДЫ (по округу Москвы)
   ------------------------------------------------------------------ */

export const RENT_NORMS: Record<string, { label: string; range: [number, number] }> = {
  central:   { label: 'ЦАО',  range: [8000, 15000] },
  west:      { label: 'ЗАО',  range: [5000, 10000] },
  east:      { label: 'ВАО',  range: [4000, 8000] },
  north:     { label: 'САО',  range: [4000, 8000] },
  southeast: { label: 'ЮВАО', range: [3500, 7000] },
  southwest: { label: 'ЮЗАО', range: [4000, 9000] },
  northwest: { label: 'СЗАО', range: [4000, 8000] },
  zelenograd:{ label: 'ЗелАО', range: [3000, 5000] },
};

/* ------------------------------------------------------------------
   ФУНКЦИИ — ГЕНЕРАТОРЫ
   ------------------------------------------------------------------ */

export function getHealthMetrics() {
  return Object.values(METRICS_CONFIG).filter((m) => m.affectsHealth);
}

/**
 * Генерация рекомендаций на основе правил RECOMMENDATION_RULES.
 * Проходит по каждому правилу и генерирует 0 или 1 рекомендацию.
 */
export function getRecommendations(data: {
  foodCostPercent: number;
  payrollPercent: number;
  rentPercent: number;
  utilitiesPercent: number;
  managementPercent: number;
  otherPercent: number;
  profitPercent: number;
  revenue: number;
  operatingProfit: number;
}) {
  const recs: Array<{
    colorLevel: 'green' | 'orange' | 'red';
    title: string;
    value: string;
    description: string;
  }> = [];

  for (const rule of RECOMMENDATION_RULES) {
    const val = (data as any)[rule.metricKey] as number;
    if (val === undefined || val === null) continue;

    if (rule.metricKey === 'profitPercent') {
      // Для прибыли: higherIsBetter
      if (val >= rule.redThreshold && val < rule.orangeThreshold) {
        recs.push({ colorLevel: 'orange', title: rule.orangeTitle, value: `${val}%`, description: rule.orangeDescription });
      } else if (val < rule.redThreshold) {
        recs.push({ colorLevel: 'red', title: rule.redTitle, value: `${val}%`, description: rule.redDescription });
      } else if (data.revenue > 0) {
        recs.push({ colorLevel: 'green', title: rule.greenTitle, value: `${val}%`, description: rule.greenDescription });
      }
    } else {
      // Для расходов: lowerIsBetter
      if (val > rule.redThreshold) {
        recs.push({ colorLevel: 'red', title: rule.redTitle, value: `${val}%`, description: rule.redDescription });
      } else if (val > rule.orangeThreshold) {
        recs.push({ colorLevel: 'orange', title: rule.orangeTitle, value: `${val}%`, description: rule.orangeDescription });
      } else if (data.revenue > 0) {
        recs.push({ colorLevel: 'green', title: rule.greenTitle, value: `${val}%`, description: rule.greenDescription });
      }
    }
  }

  return recs;
}

/* ------------------------------------------------------------------
   ФУНКЦИИ — ДИАГНОСТИКА (на основе правил)
   ------------------------------------------------------------------ */

export interface GrowthHypothesis {
  id: string;
  title: string;
  description: string;
  expectedEffect: { profit: number; probability: number };
  implementation: { complexity: 'easy' | 'medium' | 'hard'; time: string };
}

export interface EfficiencyLoss {
  name: string;
  monthlyLoss: number;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Bottleneck {
  name: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
}

export interface DiagnosticResult {
  growthPotential: { totalPotential: number; totalPotentialPercent: number };
  hypotheses: GrowthHypothesis[];
  efficiencyLosses: EfficiencyLoss[];
  bottlenecks: Bottleneck[];
}

/**
 * Полная диагностика на основе правил из конфига.
 * Все гипотезы, потери и узкие места — управляемые через массивы выше.
 */
export function runDiagnostics(data: DiagnosticData): DiagnosticResult {
  const rev = data.revenue || 1;
  const hypotheses: GrowthHypothesis[] = [];
  const losses: EfficiencyLoss[] = [];
  const bottlenecks: Bottleneck[] = [];

  // Гипотезы роста
  for (const rule of GROWTH_HYPOTHESIS_RULES) {
    if (rule.condition(data) || rule.alwaysShow) {
      hypotheses.push({
        id: rule.id,
        title: rule.title,
        description: rule.description,
        expectedEffect: { profit: Math.round(rule.potentialProfit(data)), probability: rule.probability },
        implementation: { complexity: rule.complexity, time: rule.time },
      });
    }
  }

  // Потери эффективности
  for (const rule of EFFICIENCY_LOSS_RULES) {
    if (rule.condition(data)) {
      losses.push({
        name: rule.name,
        monthlyLoss: Math.round(rule.monthlyLoss(data)),
        description: rule.description,
        severity: rule.severity,
      });
    }
  }

  // Узкие места
  for (const rule of BOTTLENECK_RULES) {
    if (rule.condition(data)) {
      bottlenecks.push({
        name: rule.name,
        description: rule.description,
        impact: rule.impact,
      });
    }
  }

  const totalPotential = hypotheses.reduce(
    (s, h) => s + h.expectedEffect.profit * h.expectedEffect.probability,
    0,
  );
  const totalPotentialPercent = rev > 0 ? (totalPotential / rev) * 100 : 0;

  return {
    growthPotential: { totalPotential: Math.round(totalPotential), totalPotentialPercent },
    hypotheses,
    efficiencyLosses: losses,
    bottlenecks,
  };
}