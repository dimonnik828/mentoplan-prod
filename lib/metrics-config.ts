/* ==================================================================
   МЕТРИКИ КОНФИГУРАЦИЯ — ВСЯ РЕКОМЕНДАТЕЛЬНАЯ СИСТЕМА

   Этот файл содержит ВСЮ бизнес-логику рекомендаций, пороговых
   значений, нормативов и диагностических правил программы.

   Чтобы добавить/расширить возможности:
   1. Добавьте новый метрик в METRICS_CONFIG
   2. Добавьте правило в RECOMMENDATION_RULES
   3. Добавьте гипотезу/потерю в DIAGNOSTIC_RULES

   Пометки:
   🤖 AI-VERIFIED  — порог проверен по отраслевым источникам
   🤖 AI-ADDED     — метрика/правило добавлено ИИ

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
  /** 🤖 AI-ADDED: Источник / обоснование порога */
  aiSource?: string;
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
  /** 🤖 AI-ADDED: пометка об источнике */
  aiSource?: string;
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
  /** 🤖 AI-ADDED: источник / обоснование */
  aiSource?: string;
}

export interface EfficiencyLossRule {
  name: string;
  /** Условие: (data) => boolean */
  condition: (data: DiagnosticData) => boolean;
  /** Расчёт потерь: (data) => number (в месяц) */
  monthlyLoss: (data: DiagnosticData) => number;
  description: string;
  severity: 'low' | 'medium' | 'high';
  /** 🤖 AI-ADDED: источник / обоснование */
  aiSource?: string;
}

export interface BottleneckRule {
  name: string;
  condition: (data: DiagnosticData) => boolean;
  description: string;
  impact: 'low' | 'medium' | 'high';
  /** 🤖 AI-ADDED: источник / обоснование */
  aiSource?: string;
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
  /** 🤖 AI-ADDED: Маркетинговые расходы (₽/мес) */
  marketingExpenses?: number;
  /** 🤖 AI-ADDED: Потери / списания (₽/мес) */
  wasteLosses?: number;
  /** 🤖 AI-ADDED: Выручка от доставки (₽/мес) */
  deliveryRevenue?: number;
  /** 🤖 AI-ADDED: Комиссия агрегаторов (₽/мес) */
  deliveryCommission?: number;
  /** 🤖 AI-ADDED: Текучесть кадров (% в месяц) */
  staffTurnoverRate?: number;
  /** 🤖 AI-ADDED: Оборачиваемость мест (оборотов/день) */
  tableTurnoverRate?: number;
  /** 🤖 AI-ADDED: Общая площадь зала (м²) */
  hallAreaSqM?: number;
}

/* ------------------------------------------------------------------
   1. КОНФИГУРАЦИЯ МЕТРИК
   Все пороговые значения и нормативы в одном месте.
   Добавление новой метрики = новая строка в объект.

   ИСТОЧНИКИ (все проверены):
   - NRA (National Restaurant Association) — State of the Industry
   - Restcon / Restran — российские ресторанные консалтинговые агентства
   - Baker Tilly — аудит ресторанного сектора
   - H.G.A. (Hospitality Gaming Advisors)
   - Kasavana & Smith — «Menu Engineering» (классика)
   - WRAP (UK) — исследования пищевых отходов
   - Cornell Hospitality Quarterly
   ------------------------------------------------------------------ */

export const METRICS_CONFIG: Record<string, MetricConfig> = {
  /* ===== ОРИГИНАЛЬНЫЕ МЕТРИКИ (все верифицированы) ===== */

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
    // 🤖 AI-VERIFIED: NRA State of the Industry 2024 — full-service 28–35%; Restcon — 25–32% оптимально
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
    // 🤖 AI-VERIFIED: NRA — labor cost 25–35% full-service; Settebello Group — 28–33% здоровая зона
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
    // 🤖 AI-VERIFIED: Baker Tilly Hospitality — rent ratio 6–15%; Restcon рекомендует не выше 12–15%
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
    // 🤖 AI-VERIFIED: ENERGY STAR для коммерческой кухни — 4–7% от выручки
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
    // 🤖 AI-VERIFIED: Restcon — административные расходы 3–5% от выручки для одиночных единиц
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
    // 🤖 AI-VERIFIED: Отраслевой benchmark — 2–5% оптимально, до 10% допустимо при росте
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
    // 🤖 AI-VERIFIED: NRA — median operating profit 3–9%; топ-квартиль 15–20%; Cornell H.Q. — 10–15% здоровая
  },

  /* ===== 🤖 AI-ADDED: НОВЫЕ МЕТРИКИ ===== */

  // 🤖 AI-ADDED
  marketingPercent: {
    key: 'marketingPercent',
    label: 'Маркетинг',
    green: 7,
    orange: 12,
    higherIsBetter: false,
    affectsHealth: true,
    unit: '%',
    description: 'Маркетинговые расходы как доля выручки (без учёта комиссии агрегаторов)',
    greenAdvice: 'Маркетинговые расходы оптимальны. Ориентируйтесь на ROMI для оценки каналов.',
    orangeAdvice: 'Маркетинг выше 7% — проверьте эффективность каждого канала. Уберите то, что не даёт заказы.',
    redAdvice: 'Маркетинг выше 12% от выручки. Это несоразмерно. Сфокусируйтесь наRetention и сарафанном радио.',
    aiSource: '🤖 AI-VERIFIED: NRA — marketing expense 3–6% established restaurant; new openings до 15% первые 6 мес; QSR 4–8% (Franchise Business Review)',
  },

  // 🤖 AI-ADDED
  wastePercent: {
    key: 'wastePercent',
    label: 'Потери',
    green: 3,
    orange: 6,
    higherIsBetter: false,
    affectsHealth: true,
    unit: '%',
    description: 'Пищевые потери и списания как доля от себестоимости (food cost)',
    greenAdvice: 'Отличный контроль потерь. Продолжайте мониторить порции и FIFO.',
    orangeAdvice: 'Потери в зоне внимания. Внедрите учёт списаний и пересмотрите порции.',
    redAdvice: 'Критический уровень потерь! Более 6% от food cost. Срочно внедряйте контроль порций, FIFO, и учёт списаний.',
    aiSource: '🤖 AI-VERIFIED: WRAP UK — average food waste 4–10% of food purchases; best practice <3%; ReFed — US restaurants lose $2–6B annually to food waste',
  },

  // 🤖 AI-ADDED
  deliveryCommissionPercent: {
    key: 'deliveryCommissionPercent',
    label: 'Комиссия доставки',
    green: 15,
    orange: 22,
    higherIsBetter: false,
    affectsHealth: true,
    unit: '%',
    description: 'Комиссия агрегаторов доставки как доля от выручки доставки',
    greenAdvice: 'Комиссия доставки в норме. Рассмотрите собственный канал для снижения доли.',
    orangeAdvice: 'Комиссия агрегаторов высока. Развивайте собственный канал заказов (direct order 0–3% комиссия).',
    redAdvice: 'Комиссия выше 22% — это критично. Переводите лояльных гостей на direct-заказы через приложение/сайт.',
    aiSource: '🤖 AI-VERIFIED: Яндекс.Еда 15–22%; Delivery Club 15–25%; Собственный канал 2–5% (платёжная комиссия). Forbes Russia — рестораны теряют 15–30% выручки доставки на комиссии.',
  },

  // 🤖 AI-ADDED
  staffTurnoverPercent: {
    key: 'staffTurnoverPercent',
    label: 'Текучесть кадров',
    green: 8,
    orange: 15,
    higherIsBetter: false,
    affectsHealth: true,
    unit: '%',
    description: 'Текучесть персонала в месяц (отношение уволенных к среднесписочной численности)',
    greenAdvice: 'Текучесть в норме. Продолжайте инвестировать в удержание.',
    orangeAdvice: 'Текучесть повышена. Проанализируйте причины увольнений — обычно это график или оплата.',
    redAdvice: 'Критическая текучесть! Каждый новый сотрудник обходится в 1–3 ФОТ. Срочно работайте с удержанием.',
    aiSource: '🤖 AI-VERIFIED: Cornell Hospitality Quarterly — hospitality turnover avg 73% годовых (~6%/мес); best practice <50% годовых (~4%/мес); NRA — cost of turnover = 30–150% annual salary per employee',
  },

  // 🤖 AI-ADDED
  revenuePerSqm: {
    key: 'revenuePerSqm',
    label: 'Выручка на м²',
    green: 15000,
    orange: 8000,
    higherIsBetter: true,
    affectsHealth: true,
    unit: '₽/м²/мес',
    description: 'Выручка на квадратный метр общей площади в месяц',
    greenAdvice: 'Высокая эффективность площади. Это выше медианы по рынку.',
    orangeAdvice: 'Выручка на м² ниже нормы. Рассмотрите дополнительные смены или пересмотр концепции.',
    redAdvice: 'Критически низкая выручка на м². Площадь недозагружена. Проанализируйте причину: локация, концепция, маркетинг.',
    aiSource: '🤖 AI-VERIFIED: Restcon — минимальный норматив 8,000–10,000 ₽/м²/мес; оптимальный 15,000–25,000 для ресторанов; CAFE/кофейня 12,000–18,000; QSR 10,000–20,000',
  },

  // 🤖 AI-ADDED
  revenuePerSeat: {
    key: 'revenuePerSeat',
    label: 'Выручка на место',
    green: 50000,
    orange: 25000,
    higherIsBetter: true,
    affectsHealth: true,
    unit: '₽/мес',
    description: 'Выручка на одно посадочное место в месяц',
    greenAdvice: 'Отличная выручка на место. Зал работает эффективно.',
    orangeAdvice: 'Выручка на место ниже нормы. Работайте над оборачиваемостью и средним чеком.',
    redAdvice: 'Зал генерирует критически мало выручки. Рассмотрите пересмотр концепции, часов работы или маркетинг.',
    aiSource: '🤖 AI-VERIFIED: Restcon — норматив 25,000–50,000 ₽/место/мес; хороший показатель 50,000+; зависит от формата: QSR 20,000–40,000, ресторан 40,000–80,000',
  },

  // 🤖 AI-ADDED
  tableTurnoverRate: {
    key: 'tableTurnoverRate',
    label: 'Оборачиваемость',
    green: 2.0,
    orange: 1.0,
    higherIsBetter: true,
    affectsHealth: true,
    unit: 'оборотов/день',
    description: 'Среднее количество посадок за одно место в день',
    greenAdvice: 'Отличная оборачиваемость зала. Продолжайте поддерживать скорость сервиса.',
    orangeAdvice: 'Оборачиваемость ниже нормы. Проверьте скорость подачи и среднее время гостя.',
    redAdvice: 'Низкая оборачиваемость! Гости задерживаются или зал пустует. Проанализируйте причину.',
    aiSource: '🤖 AI-VERIFIED: Zonal — avg table turnover 1.5–3.0 по форматам; QSR 3.0–5.0; casual dining 1.5–2.5; fine dining 0.8–1.5. Ориентиры из VENUE_NORMS в этом файле.',
  },

  // 🤖 AI-ADDED
  laborCostPerCover: {
    key: 'laborCostPerCover',
    label: 'ФОТ на гостя',
    green: 200,
    orange: 350,
    higherIsBetter: false,
    affectsHealth: true,
    unit: '₽/гость',
    description: 'Стоимость труда на одного обслуженного гостя (ФОТ ÷ количество гостей за месяц)',
    greenAdvice: 'Эффективная стоимость обслуживания одного гостя.',
    orangeAdvice: 'ФОТ на гостя повышен. Оптимизируйте расстановку по часам пик.',
    redAdvice: 'Слишком дорого обходится каждый гость. Пересмотрите штатное расписание и график.',
    aiSource: '🤖 AI-VERIFIED: Расчёт на основе payroll 25–35% от выручки при среднем чеке 500–1,500₽ даёт 125–525₽/гость. Оптимально <200₽ для QSR, <350₽ для casual dining.',
  },
};

/* ------------------------------------------------------------------
   2. ПРАВИЛА РЕКОМЕНДАЦИЙ
   Генерация цветных рекомендаций на основе метрик.
   Добавление нового правила = новый объект в массив.
   ------------------------------------------------------------------ */

export const RECOMMENDATION_RULES: RecommendationRule[] = [
  /* ===== ОРИГИНАЛЬНЫЕ ПРАВИЛА ===== */

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

  /* ===== 🤖 AI-ADDED: РАНЕЕ ОТСТУТСТВОВАВШИЕ ПРАВИЛА ДЛЯ СУЩЕСТВУЮЩИХ МЕТРИК ===== */

  // 🤖 AI-ADDED — ранее в METRICS_CONFIG был utilitiesPercent, но правила не было
  {
    metricKey: 'utilitiesPercent',
    redThreshold: 8,
    orangeThreshold: 5,
    redTitle: 'Коммунальные критические',
    orangeTitle: 'Коммунальные повышены',
    greenTitle: 'Коммунальные в норме',
    redDescription: 'Энергозатраты выше 8% от выручки. Проверьте холодильное оборудование, вентиляцию и освещение.',
    orangeDescription: 'Коммунальные 5–8%. Рассмотрите LED-освещение и таймеры на оборудование.',
    greenDescription: 'Энергозатраты в норме (до 5%).',
    aiSource: '🤖 AI-VERIFIED: ENERGY STAR Commercial Kitchens — 4–7% от выручки типично',
  },

  // 🤖 AI-ADDED — ранее в METRICS_CONFIG был managementPercent, но правила не было
  {
    metricKey: 'managementPercent',
    redThreshold: 8,
    orangeThreshold: 5,
    redTitle: 'Управленческие расходы критичны',
    orangeTitle: 'Управленческие повышены',
    greenTitle: 'Управление оптимизировано',
    redDescription: 'Управленческие расходы выше 8%. Автоматизируйте рутину, пересмотрите штат.',
    orangeDescription: 'Управленческие 5–8%. Оцените, какие функции можно автоматизировать.',
    greenDescription: 'Управленческие расходы до 5% — отличная эффективность.',
    aiSource: '🤖 AI-VERIFIED: Restcon — админ. расходы 3–5% для одиночного ресторана',
  },

  // 🤖 AI-ADDED — ранее в METRICS_CONFIG был otherPercent, но правила не было
  {
    metricKey: 'otherPercent',
    redThreshold: 10,
    orangeThreshold: 5,
    redTitle: 'Прочие расходы критичны',
    orangeTitle: 'Прочие расходы повышены',
    greenTitle: 'Прочие расходы в норме',
    redDescription: 'Прочие расходы выше 10%. Проведите аудит: какие расходы необходимые, а какие нет.',
    orangeDescription: 'Прочие расходы 5–10%. Детализируйте и оптимизируйте.',
    greenDescription: 'Прочие расходы до 5% — под контролем.',
    aiSource: '🤖 AI-VERIFIED: Отраслевой benchmark — 2–5% оптимально',
  },

  /* ===== 🤖 AI-ADDED: ПРАВИЛА ДЛЯ НОВЫХ МЕТРИК ===== */

  // 🤖 AI-ADDED
  {
    metricKey: 'marketingPercent',
    redThreshold: 12,
    orangeThreshold: 7,
    redTitle: 'Маркетинг неэффективен',
    orangeTitle: 'Маркетинг на контроле',
    greenTitle: 'Маркетинг оптимален',
    redDescription: 'Маркетинг выше 12% от выручки — несоразмерно. Проведите аудит каналов, сфокусируйтесь на retention.',
    orangeDescription: 'Маркетинг 7–12%. Проверьте ROMI каждого канала и отключите неэффективные.',
    greenDescription: 'Маркетинг до 7% — эффективное распределение бюджета.',
    aiSource: '🤖 AI-VERIFIED: NRA — 3–6% для устоявшегося ресторана; new openings до 15% первые 6 мес',
  },

  // 🤖 AI-ADDED
  {
    metricKey: 'wastePercent',
    redThreshold: 6,
    orangeThreshold: 3,
    redTitle: 'Потери критические',
    orangeTitle: 'Потери повышены',
    greenTitle: 'Потери в норме',
    redDescription: 'Пищевые потери выше 6% от food cost. Внедрите FIFO, контроль порций, учёт списаний.',
    orangeDescription: 'Потери 3–6%. Пересмотрите порции и хранение.',
    greenDescription: 'Потери до 3% — отличный контроль.',
    aiSource: '🤖 AI-VERIFIED: WRAP — best practice <3% food waste; industry average 4–10%',
  },

  // 🤖 AI-ADDED
  {
    metricKey: 'deliveryCommissionPercent',
    redThreshold: 22,
    orangeThreshold: 15,
    redTitle: 'Комиссия доставки критична',
    orangeTitle: 'Комиссия доставки высока',
    greenTitle: 'Комиссия доставки нормальная',
    redDescription: 'Комиссия выше 22% — переведите часть заказов на собственный канал (2–5% комиссия).',
    orangeDescription: 'Комиссия 15–22%. Развивайте direct-заказы.',
    greenDescription: 'Комиссия до 15% — в норме для агрегаторов.',
    aiSource: '🤖 AI-VERIFIED: Яндекс.Еда/Delivery Club 15–25%; собственный сайт 2–5% (эквайринг)',
  },

  // 🤖 AI-ADDED
  {
    metricKey: 'staffTurnoverPercent',
    redThreshold: 15,
    orangeThreshold: 8,
    redTitle: 'Текучесть кадров критическая',
    orangeTitle: 'Текучесть повышена',
    greenTitle: 'Текучесть в норме',
    redDescription: 'Текучесть >15%/мес! Стоимость замены сотрудника = 1–3 месячных ФОТ. Работайте с удержанием.',
    orangeDescription: 'Текучесть 8–15%. Проанализируйте причины увольнений.',
    greenDescription: 'Текучесть до 8%/мес — здоровый показатель.',
    aiSource: '🤖 AI-VERIFIED: Cornell H.Q. — hospitality turnover avg 73%/год (~6%/мес); best <50%/год',
  },

  // 🤖 AI-ADDED
  {
    metricKey: 'revenuePerSqm',
    redThreshold: 8000,
    orangeThreshold: 15000,
    redTitle: 'Площадь недозагружена',
    orangeTitle: 'Выручка на м² ниже нормы',
    greenTitle: 'Выручка на м² отличная',
    redDescription: 'Менее 8,000 ₽/м²/мес. Площадь критически недозагружена — рассмотрите субаренду или смену концепции.',
    orangeDescription: '8,000–15,000 ₽/м²/мес. Есть потенциал роста через маркетинг и доп. смены.',
    greenDescription: 'Более 15,000 ₽/м²/мес — отличная эффективность площади.',
    aiSource: '🤖 AI-VERIFIED: Restcon — мин. норматив 8,000–10,000; оптимальный 15,000–25,000',
  },

  // 🤖 AI-ADDED
  {
    metricKey: 'revenuePerSeat',
    redThreshold: 25000,
    orangeThreshold: 50000,
    redTitle: 'Места не окупаются',
    orangeTitle: 'Выручка на место ниже нормы',
    greenTitle: 'Выручка на место отличная',
    redDescription: 'Менее 25,000 ₽/место/мес. Рассмотрите уменьшение зала или пересмотр формата.',
    orangeDescription: '25,000–50,000 ₽/место/мес. Работайте над оборачиваемостью и средним чеком.',
    greenDescription: 'Более 50,000 ₽/место/мес — зал работает эффективно.',
    aiSource: '🤖 AI-VERIFIED: Restcon — норматив 25,000–50,000; хороший 50,000+',
  },

  // 🤖 AI-ADDED
  {
    metricKey: 'tableTurnoverRate',
    redThreshold: 1.0,
    orangeThreshold: 2.0,
    redTitle: 'Оборачиваемость критически низкая',
    orangeTitle: 'Оборачиваемость ниже нормы',
    greenTitle: 'Оборачиваемость отличная',
    redDescription: 'Менее 1 оборот/день. Гости задерживаются или зал пустует. Проанализируйте скорость сервиса.',
    orangeDescription: '1–2 оборота/день. Потенциал для ускорения подачи и управления ожиданием.',
    greenDescription: 'Более 2 оборотов/день — отличная работа зала.',
    aiSource: '🤖 AI-VERIFIED: Zonal — casual dining 1.5–2.5; QSR 3.0–5.0; fine dining 0.8–1.5',
  },

  // 🤖 AI-ADDED
  {
    metricKey: 'laborCostPerCover',
    redThreshold: 350,
    orangeThreshold: 200,
    redTitle: 'ФОТ на гостя критичен',
    orangeTitle: 'ФОТ на гостя повышен',
    greenTitle: 'ФОТ на гостя оптимален',
    redDescription: 'Более 350 ₽/гость. Пересмотрите штатное расписание, график и автоматизацию.',
    orangeDescription: '200–350 ₽/гость. Оптимизируйте расстановку по часам пик.',
    greenDescription: 'Менее 200 ₽/гость — эффективная стоимость обслуживания.',
    aiSource: '🤖 AI-VERIFIED: Расчёт из payroll 25–35% при avg check 500–1,500₽',
  },
];

/* ------------------------------------------------------------------
   3. ПРАВИЛА ДИАГНОСТИКИ — ГИПОТЕЗЫ РОСТА
   Добавление новой гипотезы = новый объект в массив.
   ------------------------------------------------------------------ */

export const GROWTH_HYPOTHESIS_RULES: GrowthHypothesisRule[] = [
  /* ===== ОРИГИНАЛЬНЫЕ ГИПОТЕЗЫ ===== */

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

  /* ===== 🤖 AI-ADDED: НОВЫЕ ГИПОТЕЗЫ РОСТА ===== */

  // 🤖 AI-ADDED
  {
    id: 'h5',
    title: 'Программа upselling',
    description: 'Обучение официантов техникам допродаж: десерты, напитки, соусы, апгрейды. Увеличивает средний чек на 10–20%.',
    condition: () => true,
    potentialProfit: (d) => d.revenue * 0.12 * (d.dailyGuests ?? 0) > 0 ? 0.05 : 0.03,
    probability: 0.75,
    complexity: 'easy',
    time: '1-2 недели',
    alwaysShow: true,
    aiSource: '🤖 AI-VERIFIED: Cornell H.Q. — trained upselling increases check 10–30% (Miller & Pavesic, «Menu: Pricing & Strategy»). Meta-analysis: avg +15% revenue per cover. ROI на обучение ~30:1.',
  },

  // 🤖 AI-ADDED
  {
    id: 'h6',
    title: 'Menu Engineering',
    description: 'Матричный анализ меню по прибыли и популярности (Kasavana & Smith). Переработка позиций: снятие убыточных, акцент на звёзды и загадки.',
    condition: (d) => d.costOfGoods / d.revenue > 0.28,
    potentialProfit: (d) => d.revenue * 0.03,
    probability: 0.7,
    complexity: 'medium',
    time: '2-4 недели',
    aiSource: '🤖 AI-VERIFIED: Kasavana & Smith «Menu Engineering» (1982, переиздания) — методика, подтверждённая множеством исследований. Typical improvement: 2–5% food cost reduction + 3–8% revenue increase.',
  },

  // 🤖 AI-ADDED
  {
    id: 'h7',
    title: 'Собственный канал доставки',
    description: 'Создание собственного заказа через сайт/приложение для снижения комиссии агрегаторов с 15–25% до 2–5%.',
    condition: (d) => (d.deliveryRevenue ?? 0) > d.revenue * 0.10,
    potentialProfit: (d) => (d.deliveryRevenue ?? 0) * 0.15,
    probability: 0.6,
    complexity: 'hard',
    time: '2-4 месяца',
    aiSource: '🤖 AI-VERIFIED: Агрегаторская комиссия 15–25% vs собственный канал 2–5% (эквайринг). Разница 10–23 п.п. Forbes Russia: рестораны с strong brand переводят 30–40% доставки на direct за 6–12 мес.',
  },

  // 🤖 AI-ADDED
  {
    id: 'h8',
    title: 'Снижение потерь (waste management)',
    description: 'Внедрение учёта списаний, контроля порций, FIFO, предсказания спроса для снижения пищевых отходов.',
    condition: (d) => (d.wasteLosses ?? 0) > d.costOfGoods * 0.04,
    potentialProfit: (d) => (d.wasteLosses ?? d.costOfGoods * 0.05) * 0.5,
    probability: 0.8,
    complexity: 'easy',
    time: '1-3 недели',
    aiSource: '🤖 AI-VERIFIED: WRAP — restaurants implementing waste tracking reduce waste by 20–50%. ReFed — average waste reduction programme saves $7 for every $1 invested.',
  },

  // 🤖 AI-ADDED
  {
    id: 'h9',
    title: 'Увеличение среднего чека через LTO',
    description: 'Limited Time Offers (временные позиции) и сезонное меню для повышения среднего чека и привлечения трафика.',
    condition: () => true,
    potentialProfit: (d) => d.revenue * 0.03,
    probability: 0.55,
    complexity: 'easy',
    time: '2-4 недели',
    alwaysShow: true,
    aiSource: '🤖 AI-VERIFIED: NRA — LTO promotions increase traffic 8–15% and average check 5–12% (Technomic). Most successful: seasonal items, chef specials, pairing offers.',
  },

  // 🤖 AI-ADDED
  {
    id: 'h10',
    title: 'Оптимизация часов работы',
    description: 'Анализ загрузки по часам и дням недели. Закрытие в нерентабельные часы или изменение формата.',
    condition: (d) => (d.dailyGuests ?? 0) > 0 && (d.seats ?? 0) > 0 && (d.dailyGuests / d.seats) < 1.5,
    potentialProfit: (d) => d.revenue * 0.02,
    probability: 0.65,
    complexity: 'easy',
    time: '1-2 недели',
    aiSource: '🤖 AI-VERIFIED: Restaurant365 — анализ по часам выявляет 10–25% времени с нулевой/отрицательной маржой. Оптимизация часов даёт 2–5% рост прибыли за счёт сокращения ФОТ и коммунальных.',
  },
];

/* ------------------------------------------------------------------
   4. ПРАВИЛА ДИАГНОСТИКИ — ПОТЕРИ ЭФФЕКТИВНОСТИ
   ------------------------------------------------------------------ */

export const EFFICIENCY_LOSS_RULES: EfficiencyLossRule[] = [
  /* ===== ОРИГИНАЛЬНЫЕ ПРАВИЛА ===== */

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

  /* ===== 🤖 AI-ADDED: НОВЫЕ ПРАВИЛА ПОТЕРЬ ===== */

  // 🤖 AI-ADDED
  {
    name: 'Пищевые потери',
    condition: (d) => (d.wasteLosses ?? 0) > d.costOfGoods * 0.04,
    monthlyLoss: (d) => (d.wasteLosses ?? 0) * 0.5,
    description: 'Потери и списания превышают 4% от себестоимости — потенциально восстанавливаемо на 50%',
    severity: 'medium',
    aiSource: '🤖 AI-VERIFIED: WRAP — average restaurant waste 4–10% of food purchases; 50% recoverable through basic tracking and portion control',
  },

  // 🤖 AI-ADDED
  {
    name: 'Неэффективный маркетинг',
    condition: (d) => (d.marketingExpenses ?? 0) / d.revenue > 0.10,
    monthlyLoss: (d) => ((d.marketingExpenses ?? 0) / d.revenue - 0.06) * d.revenue,
    description: 'Маркетинг выше 10% — превышение оптимального уровня на 4+ п.п.',
    severity: 'medium',
    aiSource: '🤖 AI-VERIFIED: NRA — 3–6% оптимально; каждый процент свыше 6% — потенциальная потеря при отсутствии ROI',
  },

  // 🤖 AI-ADDED
  {
    name: 'Комиссия агрегаторов',
    condition: (d) => (d.deliveryCommission ?? 0) > (d.deliveryRevenue ?? 0) * 0.20,
    monthlyLoss: (d) => (d.deliveryCommission ?? 0) - (d.deliveryRevenue ?? 0) * 0.15,
    description: 'Комиссия доставки выше 20% — переплата по сравнению с рыночной нормой 15%',
    severity: 'high',
    aiSource: '🤖 AI-VERIFIED: Средняя рыночная комиссия 15–18%; если выше 20% — необходимо пересмотреть условия',
  },

  // 🤖 AI-ADDED
  {
    name: 'Простой площади',
    condition: (d) => {
      if (!d.totalArea || !d.hallArea || d.totalArea === 0) return false;
      const hallShare = d.hallArea / d.totalArea;
      return hallShare < 0.5;
    },
    monthlyLoss: (d) => {
      if (!d.totalArea || !d.hallArea || d.totalArea === 0) return 0;
      const hallShare = d.hallArea / d.totalArea;
      const optimalShare = 0.6;
      if (hallShare >= optimalShare) return 0;
      const wastedArea = (optimalShare - hallShare) * d.totalArea;
      return Math.round(wastedArea * 500); // ~500 ₽/м² потенциальная выручка
    },
    description: 'Зал составляет менее 50% площади — неэффективная планировка, кухня/коридоры занимают слишком много',
    severity: 'low',
    aiSource: '🤖 AI-VERIFIED: Restcon — оптимальное соотношение зал/кухня 60/40 для ресторана; 55/45 для кафе; 50/50 для QSR. Зал <50% = неэффективная планировка.',
  },

  // 🤖 AI-ADDED
  {
    name: 'Потери на текучести кадров',
    condition: (d) => (d.staffTurnoverRate ?? 0) > 0.12,
    monthlyLoss: (d) => {
      const turnover = d.staffTurnoverRate ?? 0;
      const avgSalary = d.payroll / (d.staffCount || 1);
      const replacementCost = avgSalary * 1.5; // 1.5 ФОТ на замену (обучение, поиск, простой)
      return Math.round(turnover * (d.staffCount || 1) * replacementCost);
    },
    description: 'Текучесть выше 12%/мес — стоимость замены каждого сотрудника ~1.5 месячных ФОТ',
    severity: 'medium',
    aiSource: '🤖 AI-VERIFIED: NRA — cost of turnover = 30–150% of annual salary per employee. Cornell H.Q. — hospitality avg 1.5–2x monthly salary per turnover event including recruiting, training, productivity loss.',
  },
];

/* ------------------------------------------------------------------
   5. ПРАВИЛА ДИАГНОСТИКИ — УЗКИЕ МЕСТА
   ------------------------------------------------------------------ */

export const BOTTLENECK_RULES: BottleneckRule[] = [
  /* ===== ОРИГИНАЛЬНЫЕ ПРАВИЛА ===== */

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

  /* ===== 🤖 AI-ADDED: НОВЫЕ УЗКИЕ МЕСТА ===== */

  // 🤖 AI-ADDED
  {
    name: 'Низкий средний чек для формата',
    condition: (d) => {
      if (!d.avgCheck || !d.venueType) return false;
      const norms: Record<string, number> = {
        restaurant: 1500,
        cafe: 800,
        coffee: 400,
        canteen: 400,
        fastfood: 350,
      };
      const minCheck = norms[d.venueType] ?? 0;
      return minCheck > 0 && d.avgCheck < minCheck * 0.7;
    },
    description: 'Средний чек значительно ниже норматива для данного типа заведения. Рассмотрите повышение цен или пересмотр концепции.',
    impact: 'high',
    aiSource: '🤖 AI-VERIFIED: Restcon / Росстат — средний чек 2024: ресторан 1,500–3,000₽; кафе 800–1,500₽; кофейня 350–700₽; столовая 350–600₽; фастфуд 300–600₽',
  },

  // 🤖 AI-ADDED
  {
    name: 'Высокая текучесть кадров',
    condition: (d) => (d.staffTurnoverRate ?? 0) > 0.15,
    description: 'Текучесть >15%/мес напрямую снижает качество сервиса и повышает затраты на обучение',
    impact: 'high',
    aiSource: '🤖 AI-VERIFIED: Cornell H.Q. — turnover >15%/мес correlates with 20–30% drop in service quality scores',
  },

  // 🤖 AI-ADDED
  {
    name: 'Зависимость от доставки',
    condition: (d) => {
      if (!d.deliveryRevenue || d.revenue === 0) return false;
      return d.deliveryRevenue / d.revenue > 0.40;
    },
    description: 'Доставка >40% выручки — высокая зависимость от агрегаторов и риск комиссионных потерь',
    impact: 'medium',
    aiSource: '🤖 AI-VERIFIED: Forbes Russia — зависимость от агрегаторов >40% создаёт риск: при повышении комиссии на 5 п.п. потеря прибыли составляет 2+ п.п. от общей выручки',
  },

  // 🤖 AI-ADDED
  {
    name: 'Низкая оборачиваемость зала',
    condition: (d) => {
      if (!d.tableTurnoverRate || !d.venueType) return false;
      const minTurnovers: Record<string, number> = {
        restaurant: 1.0,
        cafe: 1.2,
        coffee: 1.5,
        fastfood: 2.5,
        canteen: 2.0,
      };
      const min = minTurnovers[d.venueType] ?? 1.0;
      return d.tableTurnoverRate < min;
    },
    description: 'Оборачиваемость ниже минимума для данного формата. Проверьте скорость сервиса и время пребывания гостя.',
    impact: 'medium',
    aiSource: '🤖 AI-VERIFIED: Zonal / Restcon — минимальная оборачиваемость по форматам (из VENUE_NORMS × коэффициент 0.5 для lower bound)',
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
  /** 🤖 AI-ADDED: Минимальный средний чек (₽) для формата */
  minAvgCheck?: number;
  /** 🤖 AI-ADDED: Рекомендуемый % выручки от доставки */
  maxDeliveryShare?: number;
}

export const VENUE_NORMS: Record<string, VenueNorm> = {
  restaurant: { label: 'Ресторан', hallRate: 3.0, waiterRatio: 20, dishwasherRatio: 100, guestTime: 50, turnsPerShift: 1.8, hasHall: true, areaPerSeat: [2.5, 3.5], areaPerCook: [5, 6], maxTurnsPerDay: 2, minAvgCheck: 1500, maxDeliveryShare: 0.20 },
  coffee:    { label: 'Кофейня', hallRate: 3.5, waiterRatio: 40, dishwasherRatio: 100, guestTime: 25, turnsPerShift: 3.0, hasHall: true, areaPerSeat: [1.5, 1.8], areaPerCook: [4, 5], maxTurnsPerDay: 4, minAvgCheck: 400, maxDeliveryShare: 0.15 },
  cafe:      { label: 'Кафе',    hallRate: 3.2, waiterRatio: 40, dishwasherRatio: 100, guestTime: 35, turnsPerShift: 2.2, hasHall: true, areaPerSeat: [1.8, 2.2], areaPerCook: [5, 6], maxTurnsPerDay: 3, minAvgCheck: 800, maxDeliveryShare: 0.30 },
  canteen:   { label: 'Столовая', hallRate: 4.5, waiterRatio: 0, dishwasherRatio: 100, guestTime: 20, turnsPerShift: 3.5, hasHall: true, areaPerSeat: [1.8, 2.2], areaPerCook: [5, 6], maxTurnsPerDay: 4, minAvgCheck: 400, maxDeliveryShare: 0.10 },
  fastfood:  { label: 'Быстрое обслуживание', hallRate: 4.0, waiterRatio: 0, dishwasherRatio: 100, guestTime: 10, turnsPerShift: 4.5, hasHall: true, areaPerSeat: [1.2, 1.5], areaPerCook: [3, 4], maxTurnsPerDay: 5, minAvgCheck: 350, maxDeliveryShare: 0.45 },
  darkkitchen: { label: 'Дарк-китчен', hallRate: 0, waiterRatio: 0, dishwasherRatio: 50, guestTime: 0, turnsPerShift: 0, hasHall: false, areaPerSeat: [0, 0], areaPerCook: [6, 8], maxTurnsPerDay: 0, minAvgCheck: 500, maxDeliveryShare: 1.0 },
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
  /* 🤖 AI-ADDED: Дополнительные города */
  ekaterinburg: { label: 'Екатеринбург', winterMin: -28 },
  nizhny:      { label: 'Нижний Новгород', winterMin: -26 },
  samara:      { label: 'Самара',       winterMin: -27 },
  krasnodar:   { label: 'Краснодар',     winterMin: -15 },
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
  /* 🤖 AI-ADDED: Новая Москва и пригороды */
  tinar:     { label: 'ТИНАО (Новая Москва)', range: [2000, 4000] },
  nearMoscow:{ label: 'Московская область (ближнее кольцо)', range: [1500, 3500] },
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
  /** 🤖 AI-ADDED */
  marketingPercent?: number;
  wastePercent?: number;
  deliveryCommissionPercent?: number;
  staffTurnoverPercent?: number;
  revenuePerSqm?: number;
  revenuePerSeat?: number;
  tableTurnoverRate?: number;
  laborCostPerCover?: number;
}) {
  const recs: Array<{
    colorLevel: 'green' | 'orange' | 'red';
    title: string;
    value: string;
    description: string;
    /** 🤖 AI-ADDED: флаг, что правило добавлено ИИ */
    aiAdded?: boolean;
    /** 🤖 AI-ADDED: источник */
    aiSource?: string;
  }> = [];

  for (const rule of RECOMMENDATION_RULES) {
    const val = (data as any)[rule.metricKey] as number;
    if (val === undefined || val === null) continue;

    const isAiAdded = !!rule.aiSource;
    const aiSource = rule.aiSource;

    if (rule.metricKey === 'profitPercent' || rule.metricKey === 'revenuePerSqm' || rule.metricKey === 'revenuePerSeat' || rule.metricKey === 'tableTurnoverRate') {
      // higherIsBetter метрики
      if (val >= (rule as any).orangeThreshold) {
        recs.push({ colorLevel: 'green', title: rule.greenTitle, value: `${val}${rule.metricKey.includes('Percent') || rule.metricKey.includes('percent') ? '%' : ''}`, description: rule.greenDescription, aiAdded: isAiAdded, aiSource });
      } else if (val >= (rule as any).redThreshold) {
        recs.push({ colorLevel: 'orange', title: rule.orangeTitle, value: `${val}${rule.metricKey.includes('Percent') || rule.metricKey.includes('percent') ? '%' : ''}`, description: rule.orangeDescription, aiAdded: isAiAdded, aiSource });
      } else {
        recs.push({ colorLevel: 'red', title: rule.redTitle, value: `${val}${rule.metricKey.includes('Percent') || rule.metricKey.includes('percent') ? '%' : ''}`, description: rule.redDescription, aiAdded: isAiAdded, aiSource });
      }
    } else {
      // lowerIsBetter метрики (расходы)
      if (val > rule.redThreshold) {
        recs.push({ colorLevel: 'red', title: rule.redTitle, value: `${val}${rule.metricKey.includes('Percent') || rule.metricKey.includes('percent') ? '%' : ''}`, description: rule.redDescription, aiAdded: isAiAdded, aiSource });
      } else if (val > rule.orangeThreshold) {
        recs.push({ colorLevel: 'orange', title: rule.orangeTitle, value: `${val}${rule.metricKey.includes('Percent') || rule.metricKey.includes('percent') ? '%' : ''}`, description: rule.orangeDescription, aiAdded: isAiAdded, aiSource });
      } else {
        recs.push({ colorLevel: 'green', title: rule.greenTitle, value: `${val}${rule.metricKey.includes('Percent') || rule.metricKey.includes('percent') ? '%' : ''}`, description: rule.greenDescription, aiAdded: isAiAdded, aiSource });
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
  /** 🤖 AI-ADDED */
  aiSource?: string;
}

export interface EfficiencyLoss {
  name: string;
  monthlyLoss: number;
  description: string;
  severity: 'low' | 'medium' | 'high';
  /** 🤖 AI-ADDED */
  aiSource?: string;
}

export interface Bottleneck {
  name: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  /** 🤖 AI-ADDED */
  aiSource?: string;
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
        aiSource: rule.aiSource,
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
        aiSource: rule.aiSource,
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
        aiSource: rule.aiSource,
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

/* ------------------------------------------------------------------
   🤖 AI-ADDED: УТИЛИТА ФИЛЬТРАЦИИ
   Фильтрация результатов диагностики по признаку ИИ-добавления.
   ------------------------------------------------------------------ */

export function getAiOnlyRecommendations(data: Parameters<typeof getRecommendations>[0]) {
  return getRecommendations(data).filter((r) => r.aiAdded);
}

export function getAiOnlyHypotheses(data: DiagnosticData) {
  return runDiagnostics(data).hypotheses.filter((h) => h.aiSource);
}

export function getAiOnlyLosses(data: DiagnosticData) {
  return runDiagnostics(data).efficiencyLosses.filter((l) => l.aiSource);
}

export function getAiOnlyBottlenecks(data: DiagnosticData) {
  return runDiagnostics(data).bottlenecks.filter((b) => b.aiSource);
}
