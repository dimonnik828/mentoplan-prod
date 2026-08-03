/* ==================================================================
   БАЗА ЗНАНИЙ — ПУЗЫРЬКИ (KNOWLEDGE BUBBLES)

   Вся рекомендательная информация программы.
   Чтобы добавить/расширить знания — просто добавьте объект в нужный
   блок или создайте новый блок. Страница сама отрендерит пузырьки.

   Структура:
     KNOWLEDGE_BLOCKS — массив блоков, каждый содержит статические
     и динамические пузырьки.

   Каждый пузырёк:
     id          — уникальный ID
     text        — текст (статический)
     variant     — 'info' | 'formula' | 'norm' | 'ai'
     tooltip     — всплывающая подсказка (опционально)
     getText?    — функция(data) => string — динамический текст (перекрывает text)
     getVariant? — функция(data) => variant — динамический стиль
     show?      — функция(data) => boolean — условие показа (по умолчанию true)

   ================================================================== */

export type BubbleVariant = 'info' | 'formula' | 'norm' | 'ai';

export interface BubbleConfig {
  id: string;
  text?: string;
  variant?: BubbleVariant;
  tooltip?: string;
  /** Dynamic text — overrides static text when provided */
  getText?: (data: BubbleDataContext) => string;
  /** Dynamic variant — overrides static variant when provided */
  getVariant?: (data: BubbleDataContext) => BubbleVariant;
  /** Condition — show only when returns true (default: always show) */
  show?: (data: BubbleDataContext) => boolean;
}

export interface BubbleDataContext {
  // BusinessData fields
  name: string;
  address: string;
  venueType: string;
  totalArea: number;
  hallArea: number;
  seats: number;
  staffCount: number;
  dailyGuests: number;
  avgCheck: number;
  revenue: number;
  rent: number;
  utilities: number;
  payroll: number;
  managementCosts: number;
  costOfGoods: number;
  otherExpenses: number;
  operatingProfit: number;
  foodCostPercent: number;
  payrollPercent: number;
  rentPercent: number;
  utilitiesPercent: number;
  managementPercent: number;
  otherPercent: number;
  profitPercent: number;
  healthIndex: number;
  // Extra computed fields (passed from page)
  shifts?: number;
  bottleneck?: string;
  maxGuestsPerDayFromSeats?: number;
  // Helpers
  fmt: (n: number) => string;
  formatPercent: (v: number) => string;
}

/* ------------------------------------------------------------------
   БЛОКИ ЗНАНИЙ
   ------------------------------------------------------------------ */
export interface KnowledgeBlock {
  blockId: string;
  label: string;
  description: string;
  bubbles: BubbleConfig[];
  subBlocks?: KnowledgeSubBlock[];
}

export interface KnowledgeSubBlock {
  subBlockId: string;
  label: string;
  bubbles: BubbleConfig[];
}

/* ==================================================================
   ВСЕ ЗНАНИЯ ПРОГРАММЫ
   ================================================================== */

export const KNOWLEDGE_BLOCKS: KnowledgeBlock[] = [

  /* ==============================================================
     БЛОК 1: KPI МЕТРИКИ
     ============================================================== */
  {
    blockId: 'kpi',
    label: 'KPI метрики',
    description: 'Ключевые показатели бизнеса и нормативы',
    bubbles: [
      {
        id: 'kpi-daily-formula',
        text: 'Дневная = Месячная / 30',
        variant: 'formula',
        tooltip: 'Дневная выручка рассчитывается делением месячной на 30 дней',
      },
      {
        id: 'kpi-foodcost-norm',
        text: 'Foodcost \u2264 30% \u2014 норма',
        variant: 'norm',
        tooltip: 'Здоровый показатель себестоимости продуктов',
      },
      {
        id: 'kpi-payroll-norm',
        text: '\u0424\u041e\u0422 \u2264 30% \u043e\u0442 \u0432\u044b\u0440\u0443\u0447\u043a\u0438',
        variant: 'norm',
        tooltip: 'Фонд оплаты труда в пределах 30% считается оптимальным',
      },
      {
        id: 'kpi-rent-norm',
        text: '\u0410\u0440\u0435\u043d\u0434\u0430 \u2264 15%',
        variant: 'norm',
        tooltip: 'Арендные расходы не должны превышать 15% от выручки',
      },
      {
        id: 'kpi-profit-norm',
        text: '\u041f\u0440\u0438\u0431\u044b\u043b\u044c \u2192 15%+',
        variant: 'norm',
        tooltip: 'Операционная маржа выше 15% — бизнес в зелёной зоне',
      },
      {
        id: 'kpi-ai-balance',
        text: '\u2726 \u0418\u0418: \u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0431\u0430\u043b\u0430\u043d\u0441 \u0440\u0430\u0441\u0445\u043e\u0434\u043e\u0432 \u2014 \u0435\u0441\u043b\u0438 3+ \u043c\u0435\u0442\u0440\u0438\u043a\u0438 \u0432 \u043a\u0440\u0430\u0441\u043d\u043e\u0439 \u0437\u043e\u043d\u0435, \u0431\u0438\u0437\u043d\u0435\u0441 \u0443\u0431\u044b\u0442\u043e\u0447\u0435\u043d',
        variant: 'ai',
      },
    ],
  },

  /* ==============================================================
     БЛОК 2: ВОЗМОЖНОСТИ (Рекомендации + точки роста)
     ============================================================== */
  {
    blockId: 'possibilities',
    label: '\u0412\u043e\u0437\u043c\u043e\u0436\u043d\u043e\u0441\u0442\u0438',
    description: '\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0430\u0446\u0438\u0438, \u043c\u0435\u0440\u043e\u043f\u0440\u0438\u044f\u0442\u0438\u044f \u0438 \u0442\u043e\u0447\u043a\u0438 \u0440\u043e\u0441\u0442\u0430',
    bubbles: [
      {
        id: 'pos-effect-formula',
        text: '\u042d\u0444\u0444\u0435\u043a\u0442 = \u043f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u044c \u00d7 (\u043c\u0435\u0442\u0440\u0438\u043a\u0430/100) \u00d7 \u0432\u044b\u0440\u0443\u0447\u043a\u0430',
        variant: 'formula',
        tooltip: 'Денежный эффект рекомендации рассчитывается через долю метрики в выручке',
      },
      {
        id: 'pos-easy-first',
        text: '\u041b\u0435\u0433\u043a\u0438\u0435 \u043c\u0435\u0440\u044b \u2014 \u043d\u0430\u0438\u0431\u043e\u043b\u044c\u0448\u0430\u044f \u0432\u0435\u0440\u043e\u044f\u0442\u043d\u043e\u0441\u0442\u044c',
        variant: 'info',
        tooltip: '\u041c\u0435\u0440\u043e\u043f\u0440\u0438\u044f\u0442\u0438\u044f \u0441 \u043f\u043e\u043c\u0435\u0442\u043a\u043e\u0439 "\u041b\u0435\u0433\u043a\u043e" \u0438\u043c\u0435\u044e\u0442 \u0432\u0435\u0440\u043e\u044f\u0442\u043d\u043e\u0441\u0442\u044c \u0440\u0435\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u0438 60-70%',
      },
      {
        id: 'pos-ai-quick-wins',
        text: '\u2726 \u0418\u0418: \u0421\u043d\u0430\u0447\u0430\u043b\u0430 \u0440\u0435\u0430\u043b\u0438\u0437\u0443\u0439\u0442\u0435 \u0431\u044b\u0441\u0442\u0440\u044b\u0435 \u043f\u043e\u0431\u0435\u0434\u044b (\u043b\u0435\u0433\u043a\u0438\u0435 \u043c\u0435\u0440\u044b), \u0437\u0430\u0442\u0435\u043c \u0441\u0440\u0435\u0434\u043d\u0438\u0435',
        variant: 'ai',
      },
      {
        id: 'pos-ai-total-potential',
        text: '\u2726 \u0418\u0418: \u0421\u0443\u043c\u043c\u0430\u0440\u043d\u044b\u0439 \u043f\u043e\u0442\u0435\u043d\u0446\u0438\u0430\u043b \u0440\u043e\u0441\u0442\u0430 = \u03a3(\u043f\u0440\u0438\u0431\u044b\u043b\u044c \u00d7 \u0432\u0435\u0440\u043e\u044f\u0442\u043d\u043e\u0441\u0442\u044c)',
        variant: 'ai',
      },
    ],
  },

  /* ==============================================================
     БЛОК 3: ТИП, ЛОКАЦИЯ И РЫНОК
     ============================================================== */
  {
    blockId: 'type-location-market',
    label: '\u0422\u0438\u043f, \u043b\u043e\u043a\u0430\u0446\u0438\u044f \u0438 \u0440\u044b\u043d\u043e\u043a',
    description: '\u041f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u044b \u0437\u0430\u0432\u0435\u0434\u0435\u043d\u0438\u044f \u0438 \u0440\u044b\u043d\u043a\u0430',
    bubbles: [],
    subBlocks: [
      /* --- Sub-block 3.1: Тип заведения --- */
      {
        subBlockId: 'venue-type',
        label: '\u0422\u0438\u043f \u0437\u0430\u0432\u0435\u0434\u0435\u043d\u0438\u044f',
        bubbles: [
          {
            id: 'vt-restaurant',
            text: '\u0420\u0435\u0441\u0442\u043e\u0440\u0430\u043d: 50 \u043c\u0438\u043d/\u0433\u043e\u0441\u0442\u044c, 1.8 \u043f\u043e\u0441\u0430\u0434\u043a\u0438',
            variant: 'info',
          },
          {
            id: 'vt-cafe',
            text: '\u041a\u0430\u0444\u0435: 35 \u043c\u0438\u043d, 2.2 \u043f\u043e\u0441\u0430\u0434\u043a\u0438',
            variant: 'info',
          },
          {
            id: 'vt-coffee',
            text: '\u041a\u043e\u0444\u0435\u0439\u043d\u044f: 25 \u043c\u0438\u043d, 3.0 \u043f\u043e\u0441\u0430\u0434\u043a\u0438',
            variant: 'info',
          },
          {
            id: 'vt-fastfood',
            text: '\u0424\u0430\u0441\u0442\u0444\u0443\u0434: 10 \u043c\u0438\u043d, 4.5 \u043f\u043e\u0441\u0430\u0434\u043a\u0438',
            variant: 'info',
          },
          {
            id: 'vt-ai-types',
            text: '\u2726 \u0418\u0418: \u0422\u0438\u043f \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u0435\u0442 \u043d\u043e\u0440\u043c\u044b \u043f\u043b\u043e\u0449\u0430\u0434\u0438 \u043d\u0430 \u043c\u0435\u0441\u0442\u043e \u0438 \u043e\u0431\u043e\u0440\u0430\u0447\u0438\u0432\u0430\u0435\u043c\u043e\u0441\u0442\u044c',
            variant: 'ai',
          },
          {
            id: 'vt-each-type',
            text: '\u041a\u0430\u0436\u0434\u044b\u0439 \u0442\u0438\u043f \u0438\u043c\u0435\u0435\u0442 \u0441\u0432\u043e\u0438 \u043d\u043e\u0440\u043c\u0430\u0442\u0438\u0432\u044b',
            variant: 'info',
            tooltip: '\u041d\u043e\u0440\u043c\u044b \u043f\u043b\u043e\u0449\u0430\u0434\u0438, \u0432\u0440\u0435\u043c\u044f \u043e\u0431\u0441\u043b\u0443\u0436\u0438\u0432\u0430\u043d\u0438\u044f, \u043e\u0431\u043e\u0440\u0430\u0447\u0438\u0432\u0430\u0435\u043c\u043e\u0441\u0442\u044c',
          },
        ],
      },

      /* --- Sub-block 3.2: Помещение и аренда --- */
      {
        subBlockId: 'premises-rent',
        label: '\u041f\u043e\u043c\u0435\u0449\u0435\u043d\u0438\u0435 \u0438 \u0430\u0440\u0435\u043d\u0434\u0430',
        bubbles: [
          {
            id: 'pr-hall-formula',
            text: '\u0420\u0435\u043a. S \u0437\u0430\u043b\u0430 = \u043c\u0435\u0441\u0442\u0430 \u00d7 2-3.5 \u043c\u00b2',
            variant: 'formula',
            tooltip: '\u041d\u043e\u0440\u043c\u0430\u0442\u0438\u0432 \u043f\u043b\u043e\u0449\u0430\u0434\u0438 \u043d\u0430 \u043f\u043e\u0441\u0430\u0434\u043e\u0447\u043d\u043e\u0435 \u043c\u0435\u0441\u0442\u043e \u0437\u0430\u0432\u0438\u0441\u0438\u0442 \u043e\u0442 \u0442\u0438\u043f\u0430 \u0437\u0430\u0432\u0435\u0434\u0435\u043d\u0438\u044f',
          },
          {
            id: 'pr-kitchen-formula',
            text: '\u0420\u0435\u043a. S \u043a\u0443\u0445\u043d\u0438 = \u043f\u043e\u0432\u0430\u0440\u0430 \u00d7 5-8 \u043c\u00b2',
            variant: 'formula',
            tooltip: '\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0443\u0435\u043c\u0430\u044f \u043f\u043b\u043e\u0449\u0430\u0434\u044c \u043a\u0443\u0445\u043d\u0438 \u043d\u0430 \u043e\u0434\u043d\u043e\u0433\u043e \u043f\u043e\u0432\u0430\u0440\u0430',
          },
          {
            id: 'pr-rent-norm-cao',
            text: '\u0426\u0410\u041e \u0443\u043b\u0438\u0446\u0430: 8 000\u201312 000 \u20bd/\u043c\u00b2',
            variant: 'norm',
          },
          {
            id: 'pr-rent-norm-pct',
            text: '\u0410\u0440\u0435\u043d\u0434\u0430 \u2264 15% \u043e\u0442 \u0432\u044b\u0440\u0443\u0447\u043a\u0438',
            variant: 'norm',
          },
          {
            id: 'pr-ai-high-rent',
            text: '\u2726 \u0418\u0418: \u0412\u044b\u0441\u043e\u043a\u0430\u044f \u0441\u0442\u0430\u0432\u043a\u0430 \u0430\u0440\u0435\u043d\u0434\u044b \u2192 \u0440\u0430\u0441\u0441\u043c\u043e\u0442\u0440\u0438\u0442\u0435 \u0422\u0426 \u0438\u043b\u0438 \u0411\u0426 \u0434\u043b\u044f \u0441\u043d\u0438\u0436\u0435\u043d\u0438\u044f \u0438\u0437\u0434\u0435\u0440\u0436\u0435\u043a',
            variant: 'ai',
          },
          {
            id: 'pr-dynamic-rent-pct',
            getText: (d) => `\u0410\u0440\u0435\u043d\u0434\u0430 ${d.formatPercent(d.rentPercent)}% \u043e\u0442 \u0432\u044b\u0440\u0443\u0447\u043a\u0438`,
            getVariant: (d) => d.rentPercent <= 15 ? 'norm' : 'info',
            tooltip: '\u041d\u043e\u0440\u043c\u0430 \u2264 15%',
          },
          {
            id: 'pr-dynamic-sqm',
            getText: (d) => d.seats > 0 ? `${(d.hallArea / d.seats).toFixed(1)} \u043c\u00b2/\u043c\u0435\u0441\u0442\u043e` : '\u2014',
            variant: 'info',
            tooltip: '\u041f\u043b\u043e\u0449\u0430\u0434\u044c \u0437\u0430\u043b\u0430 \u043d\u0430 \u043e\u0434\u043d\u043e \u043f\u043e\u0441\u0430\u0434\u043e\u0447\u043d\u043e\u0435 \u043c\u0435\u0441\u0442\u043e',
          },
        ],
      },

      /* --- Sub-block 3.3: Зал и загрузка --- */
      {
        subBlockId: 'hall-load',
        label: '\u0417\u0430\u043b \u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0430',
        bubbles: [
          {
            id: 'hl-guests-per-shift-formula',
            text: '\u0413\u043e\u0441\u0442\u0438/\u0441\u043c = \u0413\u043e\u0441\u0442\u0438 \u0432 \u0434\u0435\u043d\u044c / \u0421\u043c\u0435\u043d\u044b',
            variant: 'formula',
          },
          {
            id: 'hl-check-formula',
            text: '\u0427\u0435\u043a = \u03a3(\u0446\u0435\u043d\u0430 \u00d7 \u043a\u043e\u043b-\u0432\u043e) \u043d\u0430 \u0433\u043e\u0441\u0442\u044f',
            variant: 'formula',
            tooltip: '\u0421\u0440\u0435\u0434\u043d\u0438\u0439 \u0447\u0435\u043a = (\u0441\u0440. \u0446\u0435\u043d\u0430 \u0431\u043b\u044e\u0434\u0430 \u00d7 \u0431\u043b\u044e\u0434/\u0433\u043e\u0441\u0442\u044c) + (\u0446\u0435\u043d\u0430 \u043d\u0430\u043f\u0438\u0442\u043a\u0430 \u00d7 \u043d\u0430\u043f\u0438\u0442\u043a\u043e\u0432/\u0433\u043e\u0441\u0442\u044c)',
          },
          {
            id: 'hl-max-guests-formula',
            text: '\u041c\u0430\u043a\u0441 \u0433\u043e\u0441\u0442\u0435\u0439/\u0434\u0435\u043d\u044c = \u043c\u0435\u0441\u0442\u0430 \u00d7 \u043f\u043e\u0441\u0430\u0434\u043e\u043a',
            variant: 'formula',
          },
          {
            id: 'hl-restaurant-turns',
            text: '\u0420\u0435\u0441\u0442\u043e\u0440\u0430\u043d: 2 \u043f\u043e\u0441/\u0434\u0435\u043d\u044c',
            variant: 'norm',
          },
          {
            id: 'hl-coffee-turns',
            text: '\u041a\u043e\u0444\u0435\u0439\u043d\u044f: 4 \u043f\u043e\u0441/\u0434\u0435\u043d\u044c',
            variant: 'norm',
          },
          {
            id: 'hl-ai-over-capacity',
            text: '\u2726 \u0418\u0418: \u0415\u0441\u043b\u0438 \u0433\u043e\u0441\u0442\u0435\u0439 > max \u043c\u0435\u0441\u0442 \u00d7 \u043f\u043e\u0441\u0430\u0434\u043e\u043a \u2014 \u0434\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u0440\u0435\u0437\u0435\u0440\u0432 \u0438\u043b\u0438 \u0440\u0430\u0441\u0448\u0438\u0440\u044c\u0442\u0435 \u0437\u0430\u043b',
            variant: 'ai',
          },
          {
            id: 'hl-revenue-formula',
            text: '\u0427\u0435\u043a \u00d7 \u0413\u043e\u0441\u0442\u0438 = \u0412\u044b\u0440\u0443\u0447\u043a\u0430/\u0434\u0435\u043d\u044c',
            variant: 'formula',
          },
          {
            id: 'hl-dynamic-daily-rev',
            getText: (d) => `\u0412\u044b\u0440\u0443\u0447\u043a\u0430/\u0434\u0435\u043d\u044c: ${d.fmt(Math.round(d.revenue / 30))} \u20bd`,
            variant: 'info',
          },
        ],
      },

      /* --- Sub-block 3.4: Персонал --- */
      {
        subBlockId: 'staff',
        label: '\u041f\u0435\u0440\u0441\u043e\u043d\u0430\u043b',
        bubbles: [
          {
            id: 'st-waiter-ratio',
            text: '\u041e\u0444\u0438\u0446\u0438\u0430\u043d\u0442\u044b: 1 \u043d\u0430 20-40 \u043c\u0435\u0441\u0442',
            variant: 'norm',
            tooltip: '\u0417\u0430\u0432\u0438\u0441\u0438\u0442 \u043e\u0442 \u0442\u0438\u043f\u0430: \u0440\u0435\u0441\u0442\u043e\u0440\u0430\u043d \u2014 1/20, \u043a\u0430\u0444\u0435 \u2014 1/40',
          },
          {
            id: 'st-dishwasher-ratio',
            text: '\u041c\u043e\u0439\u0449\u0438\u043a\u0438: 1 \u043d\u0430 50-100 \u043c\u00b2',
            variant: 'norm',
          },
          {
            id: 'st-payroll-tax-formula',
            text: '\u0424\u041e\u0422 \u0441 \u043d\u0430\u043b\u043e\u0433\u0430\u043c\u0438 \u00d7 1.45',
            variant: 'formula',
          },
          {
            id: 'st-ai-cross-training',
            text: '\u2726 \u0418\u0418: \u041a\u0440\u043e\u0441\u0441-\u0442\u0440\u0435\u043d\u0438\u043d\u0433 \u043e\u0444\u0438\u0446\u0438\u0430\u043d\u0442\u043e\u0432 \u0441\u043d\u0438\u0436\u0430\u0435\u0442 \u0424\u041e\u0422 \u043d\u0430 15-20%',
            variant: 'ai',
          },
          {
            id: 'st-dynamic-payroll-pct',
            getText: (d) => `\u0424\u041e\u0422 ${d.formatPercent(d.payrollPercent)}% \u043e\u0442 \u0432\u044b\u0440\u0443\u0447\u043a\u0438`,
            getVariant: (d) => d.payrollPercent <= 30 ? 'norm' : 'info',
          },
          {
            id: 'st-dynamic-waiter-ratio',
            getText: (d) => d.seats > 0 ? `1 \u043e\u0444\u0438\u0446 \u043d\u0430 ${Math.round(d.seats / Math.max(1, Math.ceil(d.staffCount * 0.3)))} \u043c\u0435\u0441\u0442` : '\u2014',
            variant: 'info',
          },
        ],
      },

      /* --- Sub-block 3.5: Food cost --- */
      {
        subBlockId: 'food-cost',
        label: 'Food cost',
        bubbles: [
          {
            id: 'fc-formula',
            text: 'Foodcost = \u03a3(cost) / Revenue \u00d7 100',
            variant: 'formula',
          },
          {
            id: 'fc-food-norm',
            text: '\u0411\u043b\u044e\u0434\u0430: \u2264 30% \u2014 \u043d\u043e\u0440\u043c\u0430',
            variant: 'norm',
          },
          {
            id: 'fc-drinks-norm',
            text: '\u041d\u0430\u043f\u0438\u0442\u043a\u0438: 20-25% \u2014 \u043d\u043e\u0440\u043c\u0430',
            variant: 'norm',
          },
          {
            id: 'fc-ai-waste',
            text: '\u2726 \u0418\u0418: \u0421\u043d\u0438\u0436\u0435\u043d\u0438\u0435 foodcost \u043d\u0430 1% = \u0440\u043e\u0441\u0442 \u043f\u0440\u0438\u0431\u044b\u043b\u0438 \u043d\u0430 1%. \u041f\u0435\u0440\u0435\u0441\u043c\u043e\u0442\u0440\u0438\u0442\u0435 waste-\u043c\u0435\u043d\u0435\u0434\u0436\u043c\u0435\u043d\u0442',
            variant: 'ai',
          },
          {
            id: 'fc-dynamic-status',
            getText: (d) => d.foodCostPercent <= 30 ? 'Foodcost \u0432 \u043d\u043e\u0440\u043c\u0435' : 'Foodcost \u0432\u044b\u0448\u0435 \u043d\u043e\u0440\u043c\u044b',
            getVariant: (d) => d.foodCostPercent <= 30 ? 'norm' : 'info',
          },
        ],
      },

      /* --- Sub-block 3.6: Энергия --- */
      {
        subBlockId: 'energy',
        label: '\u042d\u043d\u0435\u0440\u0433\u0438\u044f',
        bubbles: [
          {
            id: 'en-hot-kitchen',
            text: '\u0413\u043e\u0440\u044f\u0447\u0430\u044f \u043a\u0443\u0445\u043d\u044f: 37.5 \u0412\u0442/\u043c\u00b2',
            variant: 'norm',
          },
          {
            id: 'en-cold-kitchen',
            text: '\u0425\u043e\u043b\u043e\u0434\u043d\u0430\u044f: 17.5 \u0412\u0442/\u043c\u00b2',
            variant: 'norm',
          },
          {
            id: 'en-heat-formula',
            text: 'Q = V \u00d7 \u0394T \u00d7 0.335 / 1000',
            variant: 'formula',
            tooltip: '\u0422\u0435\u043f\u043b\u043e\u0432\u0430\u044f \u043c\u043e\u0449\u043d\u043e\u0441\u0442\u044c = \u0432\u043e\u0437\u0434\u0443\u0445\u043e\u043e\u0431\u043c\u0435\u043d \u00d7 \u0440\u0430\u0437\u043d\u0438\u0446\u0443 \u0442\u0435\u043c\u043f\u0435\u0440\u0430\u0442\u0443\u0440 \u00d4 \u043a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442',
          },
          {
            id: 'en-cost-formula',
            text: '\u0417\u0430\u0442\u0440\u0430\u0442\u044b = \u043a\u0412\u0442 \u00d4 720 \u0447 \u00d4 \u0442\u0430\u0440\u0438\u0444',
            variant: 'formula',
          },
          {
            id: 'en-ai-recuperator',
            text: '\u2726 \u0418\u0418: \u0423\u0441\u0442\u0430\u043d\u043e\u0432\u043a\u0430 \u0440\u0435\u043a\u0443\u043f\u0435\u0440\u0430\u0442\u043e\u0440\u0430 \u044d\u043a\u043e\u043d\u043e\u043c\u0438\u0442 30-40% \u043d\u0430 \u043e\u0442\u043e\u043f\u043b\u0435\u043d\u0438\u0438',
            variant: 'ai',
          },
          {
            id: 'en-dynamic-pct',
            getText: (d) => `\u042d\u043d\u0435\u0440\u0433\u0438\u044f ${d.formatPercent(d.utilitiesPercent)}% \u0432\u044b\u0440\u0443\u0447\u043a\u0438`,
            getVariant: (d) => d.utilitiesPercent <= 5 ? 'norm' : 'info',
          },
        ],
      },

      /* --- Sub-block 3.7: Рынок и локация --- */
     /* --- Sub-block 3.7: Рынок и локация --- */
      {
        subBlockId: 'market-location',
        label: 'Рынок и локация',
        bubbles: [
          {
            id: 'ml-potential-formula',
            text: 'Потенциал = Население × ЦА% × Конверсия%',
            variant: 'formula',
          },
          {
            id: 'ml-flow-formula',
            text: 'Поток = Потенциал / (1 + Конкуренты × Влияние)',
            variant: 'formula',
            tooltip: 'Влияние: 0.2-0.4 локальные, 0.5-0.8 сетевые',
          },
          {
            id: 'ml-conversion-norms',
            text: 'Конверсия: жилой 8%, ТЦ 5%, БЦ 10%',
            variant: 'norm',
          },
          {
            id: 'ml-ai-metro',
            text: '✦ ИИ: Рядом с метро поток +30-50%, возле парка — +15%',
            variant: 'ai',
          },
          {
            id: 'ml-location-info',
            text: 'Локация определяет аренду и поток',
            variant: 'info',
          },
          {
            id: 'ml-how-to-estimate',
            text: 'Как оценить аудиторию',
            variant: 'info',
            tooltip: 'Потенциальная аудитория = Общее население/поток × % целевой аудитории × % конверсии в общепит. Доступный поток = Потенциальная аудитория / (1 + Конкуренты × Влияние). Влияние конкурента: 0.2-0.4 для локальных точек, 0.5-0.8 для сетевых проектов. Данные о населении: mosmap.ru/report/infra.html',
          },
        ],
      },
      /* --- Sub-block 3.8: Продуктивность --- */
      {
        subBlockId: 'productivity',
        label: '\u041f\u0440\u043e\u0434\u0443\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u044c',
        bubbles: [
          {
            id: 'pd-time-formula',
            text: '\u0414\u043e\u0441\u0442\u0443\u043f\u043d\u043e\u0435 \u0432\u0440\u0435\u043c\u044f = \u0441\u043c\u0435\u043d\u0430 \u00d4 (100% \u2212 15%)',
            variant: 'formula',
            tooltip: '15% \u0432\u0440\u0435\u043c\u0435\u043d\u0438 \u0443\u0445\u043e\u0434\u0438\u0442 \u043d\u0430 \u0437\u0430\u0433\u043e\u0442\u043e\u0432\u043a\u0438',
          },
          {
            id: 'pd-capacity-formula',
            text: '\u0401\u043c\u043a\u043e\u0441\u0442\u044c \u043a\u0443\u0445\u043d\u0438 = \u0432\u0440\u0435\u043c\u044f \u00d4 \u043f\u043e\u0432\u0430\u0440\u0430 \u00d4 \u0441\u0442\u0430\u043d\u0446\u0438\u0438',
            variant: 'formula',
          },
          {
            id: 'pd-bottleneck-info',
            text: 'Bottleneck \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u0435\u0442 \u043f\u043e\u0442\u043e\u043b\u043e\u043a \u0432\u044b\u0440\u0443\u0447\u043a\u0438',
            variant: 'info',
          },
          {
            id: 'pd-ai-bottleneck',
            text: '\u2726 \u0418\u0418: \u0415\u0441\u043b\u0438 bottleneck = \u043a\u0443\u0445\u043d\u044f \u2014 \u0443\u0432\u0435\u043b\u0438\u0447\u044c\u0442\u0435 \u043f\u0430\u0440\u0430\u043b\u043b\u0435\u043b\u0438\u0437\u043c \u0438\u043b\u0438 \u0441\u043e\u043a\u0440\u0430\u0442\u0438\u0442\u0435 \u043c\u0435\u043d\u044e',
            variant: 'ai',
          },
        ],
      },
    ],
  },

  /* ==============================================================
     БЛОК 4: СТРУКТУРА ВЫРУЧКИ
     ============================================================== */
  {
    blockId: 'revenue-structure',
    label: '\u0421\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430 \u0432\u044b\u0440\u0443\u0447\u043a\u0438',
    description: '\u0420\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0438\u0435 \u0432\u044b\u0440\u0443\u0447\u043a\u0438 \u0438 \u0438\u043d\u0434\u0435\u043a\u0441 \u0437\u0434\u043e\u0440\u043e\u0432\u044c\u044f',
    bubbles: [
      {
        id: 'rs-bar-info',
        text: '\u041a\u0430\u0436\u0434\u0430\u044f \u043f\u043e\u043b\u043e\u0441\u0430 = % \u043e\u0442 \u0432\u044b\u0440\u0443\u0447\u043a\u0438',
        variant: 'info',
      },
      {
        id: 'rs-target-norms',
        text: '\u0426\u0435\u043b\u0435\u0432\u044b\u0435 \u043d\u043e\u0440\u043c\u044b \u2014 \u0437\u0435\u043b\u0451\u043d\u044b\u0435 \u043e\u0442\u043c\u0435\u0442\u043a\u0438',
        variant: 'norm',
      },
      {
        id: 'rs-health-index-formula',
        text: '\u0418\u043d\u0434\u0435\u043a\u0441 = \u043a\u043e\u043b-\u0432\u043e \u0437\u0435\u043b\u0451\u043d\u044b\u0445 / \u0432\u0441\u0435\u0433\u043e \u00d4 100',
        variant: 'formula',
        tooltip: '\u041f\u043e\u0434\u0441\u0447\u0438\u0442\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u043f\u043e 6 \u043a\u043b\u044e\u0447\u0435\u0432\u044b\u043c \u043c\u0435\u0442\u0440\u0438\u043a\u0430\u043c: foodcost, \u0424\u041e\u0422, \u0430\u0440\u0435\u043d\u0434\u0430, \u043a\u043e\u043c\u043c\u0443\u043d\u0430\u043b., \u0443\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435, \u043f\u0440\u043e\u0447\u0438\u0435',
      },
      {
        id: 'rs-ai-health-proxy',
        text: '\u2726 \u0418\u0418: \u0418\u043d\u0434\u0435\u043a\u0441 \u0437\u0434\u043e\u0440\u043e\u0432\u044c\u044f \u2014 \u044d\u0442\u043e proxy \u0434\u043b\u044f \u043e\u0446\u0435\u043d\u043a\u0438 \u0443\u0441\u0442\u043e\u0439\u0447\u0438\u0432\u043e\u0441\u0442\u0438 \u0431\u0438\u0437\u043d\u0435\u0441\u0430. \u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0443\u044e \u043e\u0431\u043d\u043e\u0432\u043b\u044f\u0442\u044c \u0435\u0436\u0435\u043c\u0435\u0441\u044f\u0447\u043d\u043e',
        variant: 'ai',
      },
    ],
  },

  /* ==============================================================
     БЛОК 5: КУХНЯ И БАР (детали — аккордеон, моделирование)
     ============================================================== */
  {
    blockId: 'kitchen-bar',
    label: '\u041a\u0443\u0445\u043d\u044f \u0438 \u0431\u0430\u0440',
    description: '\u0414\u0435\u0442\u0430\u043b\u044c\u043d\u043e\u0435 \u043c\u043e\u0434\u0435\u043b\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435 \u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u0430',
    bubbles: [],
    subBlocks: [
      /* --- Кухонные станции --- */
      {
        subBlockId: 'cuisine-stations',
        label: '\u041a\u0443\u0445\u043e\u043d\u043d\u044b\u0435 \u0441\u0442\u0430\u043d\u0446\u0438\u0438',
        bubbles: [
          {
            id: 'kb-load-formula',
            text: '\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u043a\u0443\u0445\u043d\u0438 = \u0444\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u043e\u0435 / \u0451\u043c\u043a\u043e\u0441\u0442\u044c \u00d4 100',
            variant: 'formula',
          },
          {
            id: 'kb-overload-norm',
            text: '\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430 > 95% \u2014 \u0440\u0438\u0441\u043a \u0441\u0431\u043e\u0435\u0432',
            variant: 'norm',
          },
          {
            id: 'kb-min-dish-formula',
            text: '\u0421\u0440. \u0432\u0440\u0435\u043c\u044f \u0431\u043b\u044e\u0434\u0430 = min(\u0432\u0441\u0435 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438)',
            variant: 'formula',
            tooltip: '\u041c\u0438\u043d\u0438\u043c\u0430\u043b\u044c\u043d\u043e\u0435 \u0432\u0440\u0435\u043c\u044f \u0431\u043b\u044e\u0434\u0430 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u0435\u0442 \u043e\u0431\u0449\u0438\u0439 \u043f\u0440\u0435\u0434\u0435\u043b \u0431\u043b\u044e\u0434',
          },
          {
            id: 'kb-ai-distribute',
            text: '\u2726 \u0418\u0418: \u0420\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0438\u0442\u0435 \u0431\u043b\u044e\u0434\u0430 \u0440\u0430\u0432\u043d\u043e\u043c\u0435\u0440\u043d\u043e \u043f\u043e \u0441\u0442\u0430\u043d\u0446\u0438\u044f\u043c \u0434\u043b\u044f \u0441\u043d\u0438\u0436\u0435\u043d\u0438\u044f bottleneck',
            variant: 'ai',
          },
        ],
      },

      /* --- Кофейная станция / Бар --- */
      {
        subBlockId: 'bar-station',
        label: '\u041a\u043e\u0444\u0435\u0439\u043d\u0430\u044f \u0441\u0442\u0430\u043d\u0446\u0438\u044f',
        bubbles: [
          {
            id: 'kb-drinks-formula',
            text: '\u041d\u0430\u043f\u0438\u0442\u043a\u043e\u0432 = (\u0432\u0440\u0435\u043c\u044f \u00d4 60 / \u0441\u0435\u043a) \u00d4 \u0431\u0430\u0440\u0438\u0441\u0442\u0430',
            variant: 'formula',
          },
          {
            id: 'kb-ai-coffee-auto',
            text: '\u2726 \u0418\u0418: \u0410\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0437\u0430\u0446\u0438\u044f \u043a\u043e\u0444\u0435-\u0441\u0442\u0430\u043d\u0446\u0438\u0438 +100-150% \u043d\u0430\u043f\u0438\u0442\u043a\u043e\u0432/\u0441\u043c\u0435\u043d\u0443',
            variant: 'ai',
          },
        ],
      },

      /* --- Климат и энергия --- */
      {
        subBlockId: 'climate-energy',
        label: '\u041a\u043b\u0438\u043c\u0430\u0442 \u0438 \u044d\u043d\u0435\u0440\u0433\u0438\u044f',
        bubbles: [
          {
            id: 'kb-delta-t-formula',
            text: '\u0394T = t \u0432\u043d\u0443\u0442\u0440\u0438 \u2212 t \u043a\u043b\u0438\u043c\u0430\u0442\u0430',
            variant: 'formula',
          },
          {
            id: 'kb-moscow-norm',
            text: '\u041c\u043e\u0441\u043a\u0432\u0430: \u221225 \u00b0C \u0437\u0438\u043c\u043d\u0438\u0439 \u043c\u0438\u043d\u0438\u043c\u0443\u043c',
            variant: 'norm',
          },
          {
            id: 'kb-spb-norm',
            text: '\u0421\u0430\u043d\u043a\u0442-\u041f\u0435\u0442\u0435\u0440\u0431\u0443\u0440\u0433: \u221224 \u00b0C',
            variant: 'norm',
          },
          {
            id: 'kb-novosibirsk-norm',
            text: '\u041d\u043e\u0432\u043e\u0441\u0438\u0431\u0438\u0440\u0441\u043a: \u221232 \u00b0C',
            variant: 'norm',
          },
          {
            id: 'kb-ai-led',
            text: '\u2726 \u0418\u0418: LED-\u043e\u0441\u0432\u0435\u0449\u0435\u043d\u0438\u0435 + \u043a\u043e\u043d\u0434\u0438\u0446\u0438\u043e\u043d\u0435\u0440\u044b \u043a\u043b\u0430\u0441\u0441\u0430 A \u0441\u043d\u0438\u0436\u0430\u044e\u0442 \u044d\u043d\u0435\u0440\u0433\u043e\u043f\u043e\u0442\u0440\u0435\u0431\u043b\u0435\u043d\u0438\u0435 \u043d\u0430 25%',
            variant: 'ai',
          },
        ],
      },

      /* --- Анализ рынка --- */
      {
        subBlockId: 'market-analysis',
        label: '\u0410\u043d\u0430\u043b\u0438\u0437 \u0440\u044b\u043d\u043a\u0430',
        bubbles: [
          {
            id: 'kb-influence-norm',
            text: '\u0412\u043b\u0438\u044f\u043d\u0438\u0435: \u0441\u0435\u0442\u0435\u0432\u044b\u0435 0.5-0.8, \u043b\u043e\u043a\u0430\u043b\u044c\u043d\u044b\u0435 0.2-0.4',
            variant: 'norm',
          },
          {
            id: 'kb-ai-pedestrian',
            text: '\u2726 \u0418\u0418: \u0410\u043d\u0430\u043b\u0438\u0437\u0438\u0440\u0443\u0439\u0442\u0435 \u043f\u0435\u0448\u0435\u0445\u043e\u0434\u043d\u044b\u0439 \u0442\u0440\u0430\u0444\u0438\u043a \u0447\u0435\u0440\u0435\u0437 \u042f.\u041a\u0430\u0440\u0442\u044b \u0438\u043b\u0438 2GIS',
            variant: 'ai',
          },
        ],
      },

      /* --- График персонала --- */
      {
        subBlockId: 'staff-schedule',
        label: '\u0413\u0440\u0430\u0444\u0438\u043a \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u043b\u0430',
        bubbles: [
          {
            id: 'kb-shifts-formula',
            text: '\u0421\u043c\u0435\u043d\u044b = \u0447\u0430\u0441\u044b / \u0441\u043c\u0435\u043d\u0430 (\u043e\u043a\u0440\u0443\u0433\u043b. \u0432\u0432\u0435\u0440\u0445)',
            variant: 'formula',
          },
          {
            id: 'kb-ai-shifts-optimize',
            text: '\u2726 \u0418\u0418: \u041e\u043f\u0442\u0438\u043c\u0438\u0437\u0430\u0446\u0438\u044f \u0433\u0440\u0430\u0444\u0438\u043a\u0430 \u0441 2\u21923 \u0441\u043c\u0435\u043d\u044b \u0441\u043d\u0438\u0436\u0430\u0435\u0442 \u0424\u041e\u0422/\u0433\u043e\u0441\u0442\u044c \u043d\u0430 10-15%',
            variant: 'ai',
          },
        ],
      },
    ],
  },

  /* ==============================================================
     БЛОК 6: ДИАГНОСТИКА
     ============================================================== */
  {
    blockId: 'diagnostics',
    label: '\u0414\u0438\u0430\u0433\u043d\u043e\u0441\u0442\u0438\u043a\u0430',
    description: '\u0413\u0438\u043f\u043e\u0442\u0435\u0437\u044b \u0440\u043e\u0441\u0442\u0430, \u043f\u043e\u0442\u0435\u0440\u0438 \u0438 \u0443\u0437\u043a\u0438\u0435 \u043c\u0435\u0441\u0442\u0430',
    bubbles: [
      {
        id: 'diag-potential-formula',
        text: '\u041f\u043e\u0442\u0435\u043d\u0446\u0438\u0430\u043b = \u03a3(\u043f\u0440\u043e\u0433\u043d\u043e\u0437 \u00d4 \u0432\u0435\u0440\u043e\u044f\u0442\u043d\u043e\u0441\u0442\u044c)',
        variant: 'formula',
        tooltip: '\u0421\u0443\u043c\u043c\u0430\u0440\u043d\u044b\u0439 \u043f\u043e\u0442\u0435\u043d\u0446\u0438\u0430\u043b \u0440\u043e\u0441\u0442\u0430 \u043f\u043e \u0432\u0441\u0435\u043c \u0433\u0438\u043f\u043e\u0442\u0435\u0437\u0430\u043c',
      },
      {
        id: 'diag-losses-formula',
        text: '\u041f\u043e\u0442\u0435\u0440\u0438 = \u0441\u0443\u043c\u043c\u0430 \u0432\u0441\u0435\u0445 \u043f\u043e\u0442\u0435\u0440\u044c \u043f\u043e \u043d\u0430\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u044f\u043c',
        variant: 'formula',
      },
      {
        id: 'diag-ai-prioritize',
        text: '\u2726 \u0418\u0418: \u041f\u0440\u0438\u043e\u0440\u0438\u0442\u0438\u0437\u0438\u0440\u0443\u0439\u0442\u0435 \u0433\u0438\u043f\u043e\u0442\u0435\u0437\u044b \u043f\u043e \u0441\u043e\u043e\u0442\u043d\u043e\u0448\u0435\u043d\u0438\u044e profit \u00d4 probability / complexity',
        variant: 'ai',
      },
      {
        id: 'diag-ai-revenue-growth',
        text: '\u2726 \u0418\u0418: \u0420\u043e\u0441\u0442 \u043d\u0430 10% \u0432\u044b\u0440\u0443\u0447\u043a\u0438 \u0447\u0430\u0441\u0442\u043e \u043f\u0440\u043e\u0449\u0435 \u0447\u0435\u043c \u0441\u043e\u043a\u0440\u0430\u0449\u0435\u043d\u0438\u0435 10% \u0440\u0430\u0441\u0445\u043e\u0434\u043e\u0432',
        variant: 'ai',
      },
    ],
  },
];

/* ==================================================================
   УТИЛИТЫ ДЛЯ РЕНДЕРА
   ================================================================== */

/**
 * Получить пузырьки блока по blockId
 */
export function getBlockBubbles(blockId: string, subBlockId?: string): BubbleConfig[] {
  const block = KNOWLEDGE_BLOCKS.find((b) => b.blockId === blockId);
  if (!block) return [];
  if (subBlockId && block.subBlocks) {
    const sub = block.subBlocks.find((s) => s.subBlockId === subBlockId);
    return sub ? sub.bubbles : [];
  }
  return block.bubbles;
}

/**
 * Получить ВСЕ пузырьки блока (включая подблоки) — плоский список
 */
export function getAllBubblesForBlock(blockId: string): BubbleConfig[] {
  const block = KNOWLEDGE_BLOCKS.find((b) => b.blockId === blockId);
  if (!block) return [];
  const result = [...block.bubbles];
  if (block.subBlocks) {
    block.subBlocks.forEach((sub) => result.push(...sub.bubbles));
  }
  return result;
}