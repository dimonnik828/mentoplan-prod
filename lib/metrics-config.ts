// lib/metrics-config.ts аналитические данные

export type MetricConfig = {
  key: string;               // Ключ в объекте данных
  label: string;             // Русское название для интерфейса
  sourceKey: string;         // Откуда берется рубль
  higherIsBetter?: boolean;  // Для прибыли true
  green: number;             // Порог зеленой зоны
  orange: number;            // Порог желтой зоны
  red: number;               // Порог красной зоны
  affectsHealth: boolean;    // Влияет ли на "Индекс здоровья"

  // НОВОЕ: Тексты решений/рекомендаций в зависимости от зоны
  messages?: {
    green: string;           // Текст, если всё хорошо
    orange: string;          // Текст с решением, если в желтой зоне
    red: string;             // Текст с решением, если в красной зоне
  };
};

export const METRICS_CONFIG: Record<string, MetricConfig> = {
  foodCostPercent: {
    key: 'foodCostPercent',
    label: 'Удельный вес пищевых продуктов',
    sourceKey: 'costOfGoods',
    green: 32,
    orange: 38,
    red: 38,
    affectsHealth: true,
    messages: {
      green: 'Себестоимость блюд в целевом диапазоне. Продолжайте контролировать закупки.',
      orange: 'Себестоимость выше нормы. Пересмотрите граммовки и закупочные цены топ-5 блюд.',
      red: 'Критический уровень себестоимости! Срочно проведите инвентаризацию и аудит меню.',
    },
  },
  payrollPercent: {
    key: 'payrollPercent',
    label: 'Процент заработной платы',
    sourceKey: 'payroll',
    green: 25,
    orange: 30,
    red: 30,
    affectsHealth: true,
    messages: {
      green: 'ФОТ в пределах нормы.',
      orange: 'ФОТ выше нормы. Оптимизируйте графики смен под почасовой трафик.',
      red: 'ФОТ разрывает экономику. Рассмотрите снижение численности в низкие часы или автоматизацию.',
    },
  },
  rentPercent: {
    key: 'rentPercent',
    label: 'Процент от арендной платы',
    sourceKey: 'rent',
    green: 14,
    orange: 18,
    red: 18,
    affectsHealth: true,
    messages: {
      green: 'Арендная нагрузка комфортная.',
      orange: 'Аренда высока. Инициируйте переговоры с арендодателем или увеличивайте выручку зала.',
      red: 'Аренда нерентабельна для текущей выручки. Срочно ищите способы кратного роста чека или гостей.',
    },
  },
  profitPercent: {
    key: 'profitPercent',
    label: 'Процент прибыли',
    sourceKey: 'operatingProfit',
    green: 15,
    orange: 10,
    red: 10,
    higherIsBetter: true,
    affectsHealth: true,
    messages: {
      green: 'Прибыль в целевой зоне. Есть ресурс для развития.',
      orange: 'Прибыль ниже целевого уровня 15%. Требуется точечная оптимизация расходов.',
      red: 'Бизнес убыточен или на грани. Необходим антикризисный план по выручке и расходам.',
    },
  },
  utilitiesPercent: {
    key: 'utilitiesPercent',
    label: 'Коммунальные услуги',
    sourceKey: 'utilities',
    green: 100, orange: 100, red: 100,
    affectsHealth: false,
  },
  managementPercent: {
    key: 'managementPercent',
    label: 'Управление',
    sourceKey: 'managementCosts',
    green: 100, orange: 100, red: 100,
    affectsHealth: false,
  },
  otherPercent: {
    key: 'otherPercent',
    label: 'Прочее',
    sourceKey: 'otherExpenses',
    green: 100, orange: 100, red: 100,
    affectsHealth: false,
  },
};

export const getHealthMetrics = (): MetricConfig[] => {
  return Object.values(METRICS_CONFIG).filter((m) => m.affectsHealth);
};

// НОВОЕ: Функция, которая возвращает готовый массив для блока "Решения"
export const getRecommendations = (data: Record<string, number>) => {
  const recommendations: {
    colorLevel: 'green' | 'orange' | 'red';
    title: string;
    value: string;
    description: string;
  }[] = [];

  Object.values(METRICS_CONFIG).forEach((metric) => {
    // Берем значение метрики из данных (например, 27)
    const value = data[metric.key] ?? 0;

    // Определяем цвет (используем твою существующую логику getColorLevel, но внутри конфига)
    let color: 'green' | 'orange' | 'red' = 'green';
    if (metric.higherIsBetter) {
      if (value >= metric.green) color = 'green';
      else if (value >= metric.orange) color = 'orange';
      else color = 'red';
    } else {
      if (value <= metric.green) color = 'green';
      else if (value <= metric.orange) color = 'orange';
      else color = 'red';
    }

    // Если для метрики прописаны тексты решений — добавляем её в массив
    if (metric.messages) {
      recommendations.push({
        colorLevel: color,
        title: metric.label,
        value: `${value.toFixed(2)}%`,
        description: metric.messages[color],
      });
    }
  });

  return recommendations;
};