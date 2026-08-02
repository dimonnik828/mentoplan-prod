/* ==================================================================
   ДИАГНОСТИКА
   ================================================================== */

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

export function runDiagnostics(data: {
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
}): DiagnosticResult {
  const rev = data.revenue || 1;
  const hypotheses: GrowthHypothesis[] = [];
  const losses: EfficiencyLoss[] = [];
  const bottlenecks: Bottleneck[] = [];

  // Growth hypotheses
  if (data.costOfGoods / rev > 0.30) {
    const potential = (data.costOfGoods / rev - 0.28) * rev * 0.5;
    hypotheses.push({
      id: 'h1',
      title: 'Оптимизация food cost',
      description: 'Снижение себестоимости блюд через пересмотр поставщиков и оптимизацию меню.',
      expectedEffect: { profit: Math.round(potential), probability: 0.7 },
      implementation: { complexity: 'medium', time: '2-4 недели' },
    });
  }

  if (data.payroll / rev > 0.30) {
    const potential = (data.payroll / rev - 0.28) * rev * 0.3;
    hypotheses.push({
      id: 'h2',
      title: 'Оптимизация графика персонала',
      description: 'Внедрение гибкого графика и кросс-тренинга для снижения ФОТ.',
      expectedEffect: { profit: Math.round(potential), probability: 0.65 },
      implementation: { complexity: 'easy', time: '1-2 недели' },
    });
  }

  if (data.dailyGuests && data.maxGuestsPerDayFromSeats && data.dailyGuests < data.maxGuestsPerDayFromSeats * 0.7) {
    const extraGuests = Math.round(data.maxGuestsPerDayFromSeats * 0.3);
    hypotheses.push({
      id: 'h3',
      title: 'Увеличение потока гостей',
      description: 'Маркетинговые акции и привлечение трафика для увеличения загрузки.',
      expectedEffect: { profit: Math.round(extraGuests * (data.avgCheck || 500) * 30 * 0.15), probability: 0.6 },
      implementation: { complexity: 'medium', time: '1-3 месяца' },
    });
  }

  hypotheses.push({
    id: 'h4',
    title: 'Внедрение системы лояльности',
    description: 'Программа лояльности для увеличения возврата гостей и среднего чека.',
    expectedEffect: { profit: Math.round(rev * 0.05), probability: 0.5 },
    implementation: { complexity: 'medium', time: '1-2 месяца' },
  });

  // Efficiency losses
  if (data.costOfGoods / rev > 0.32) {
    losses.push({ name: 'Перерасход food cost', monthlyLoss: Math.round((data.costOfGoods / rev - 0.28) * rev), description: 'Излишние расходы на ингредиенты', severity: 'high' });
  }
  if (data.rent / rev > 0.18) {
    losses.push({ name: 'Высокая аренда', monthlyLoss: Math.round((data.rent / rev - 0.15) * rev * 0.3), description: 'Аренда отъедает значительную часть выручки', severity: 'medium' });
  }
  if (data.utilities / rev > 0.07) {
    losses.push({ name: 'Энергозатраты', monthlyLoss: Math.round((data.utilities / rev - 0.05) * rev), description: 'Коммунальные выше нормы', severity: 'low' });
  }

  // Bottlenecks
  if (data.bottleneck && data.bottleneck !== 'Зал') {
    bottlenecks.push({ name: data.bottleneck, description: 'Производственный bottleneck ограничивает выручку', impact: 'high' });
  }
  if (data.seats && data.dailyGuests && data.dailyGuests > data.seats * 2) {
    bottlenecks.push({ name: 'Нехватка посадочных мест', description: 'Спрос превышает вместимость зала', impact: 'medium' });
  }
  if (data.healthIndex < 40) {
    bottlenecks.push({ name: 'Низкий индекс здоровья', description: 'Критические показатели требуют срочного вмешательства', impact: 'high' });
  }

  const totalPotential = hypotheses.reduce((s, h) => s + h.expectedEffect.profit * h.expectedEffect.probability, 0);
  const totalPotentialPercent = rev > 0 ? (totalPotential / rev) * 100 : 0;

  return {
    growthPotential: { totalPotential: Math.round(totalPotential), totalPotentialPercent },
    hypotheses,
    efficiencyLosses: losses,
    bottlenecks,
  };
}