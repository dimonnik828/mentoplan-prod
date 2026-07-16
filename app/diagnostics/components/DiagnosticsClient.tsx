'use client';

import { useState, useEffect, useMemo } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ==================================================================
   ТИПЫ (совпадают с DashboardClient)
   ================================================================== */
type BusinessData = {
  name: string; address: string; venueType: string;
  totalArea: number; hallArea: number; seats: number; staffCount: number;
  dailyGuests: number; avgCheck: number; revenue: number;
  rent: number; utilities: number; payroll: number;
  managementCosts: number; costOfGoods: number; otherExpenses: number;
  operatingProfit: number;
  foodCostPercent: number; payrollPercent: number; rentPercent: number;
  utilitiesPercent: number; managementPercent: number; otherPercent: number;
  profitPercent: number; healthIndex: number;
};

/* ==================================================================
   ТЕСТОВЫЙ РЕЗУЛЬТАТ
   ================================================================== */
type TestResult = {
  id: string;
  name: string;
  description: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
};

/* ==================================================================
   ФУНКЦИЯ ЗАГРУЗКИ ДАННЫХ (как в дашборде)
   ================================================================== */
const getStoredData = (): BusinessData | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('momentoBusinessData');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/* ==================================================================
   УТИЛИТЫ
   ================================================================== */
const formatPercent = (value: number): string => value.toFixed(2);
const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU');

/* ==================================================================
   ТЕСТЫ
   ================================================================== */
const runTests = (data: BusinessData): TestResult[] => {
  const results: TestResult[] = [];

  // 1. Полнота данных
  if (!data) {
    results.push({
      id: 'data',
      name: 'Наличие данных',
      description: 'Проверка, что данные загружены из localStorage',
      status: 'fail',
      message: 'Данные не найдены. Заполните данные на дашборде.',
    });
    return results;
  }

  results.push({
    id: 'data',
    name: 'Наличие данных',
    description: 'Данные загружены из localStorage',
    status: 'pass',
    message: `Заведение: ${data.name || 'без названия'}, выручка: ${fmt(data.revenue)} ₽`,
  });

  // 2. Проверка на нулевые/отрицательные значения
  const mustBePositive: { key: keyof BusinessData; label: string }[] = [
    { key: 'totalArea', label: 'Общая площадь' },
    { key: 'revenue', label: 'Выручка' },
    { key: 'avgCheck', label: 'Средний чек' },
  ];

  mustBePositive.forEach(({ key, label }) => {
    const val = data[key] as number;
    if (val <= 0) {
      results.push({
        id: `zero-${key}`,
        name: `${label} > 0`,
        description: `Поле "${label}" должно быть положительным`,
        status: 'fail',
        message: `Текущее значение: ${val}. Введите корректные данные.`,
      });
    } else {
      results.push({
        id: `zero-${key}`,
        name: `${label} > 0`,
        description: `Поле "${label}" положительное`,
        status: 'pass',
        message: `${fmt(val)}`,
      });
    }
  });

  // 3. Проверка процентов (сумма не больше 100%)
  const totalPercent =
    data.foodCostPercent +
    data.payrollPercent +
    data.rentPercent +
    data.utilitiesPercent +
    data.managementPercent +
    data.otherPercent +
    data.profitPercent;

  results.push({
    id: 'total-percent',
    name: 'Сумма долей',
    description: 'Foodcost + ФОТ + Аренда + Коммунальные + Управление + Прочие + Прибыль',
    status: totalPercent >= 95 && totalPercent <= 105 ? 'pass' : 'warn',
    message:
      totalPercent >= 95 && totalPercent <= 105
        ? `Сумма ≈ ${totalPercent}% (норма)`
        : `Сумма ${totalPercent}% – проверьте введённые данные`,
  });

  // 4. Проверка дневной выручки = revenue / 30
  const expectedDaily = Math.round(data.revenue / 30);
  const dailyFromGuests = data.dailyGuests * data.avgCheck;
  results.push({
    id: 'daily-revenue',
    name: 'Дневная выручка',
    description: 'Сравнение: гости × чек ≈ выручка / 30',
    status:
      Math.abs(dailyFromGuests - expectedDaily) <= expectedDaily * 0.2
        ? 'pass'
        : 'warn',
    message: `Гости × чек = ${fmt(dailyFromGuests)} ₽, выручка / 30 = ${fmt(expectedDaily)} ₽`,
  });

  // 5. Проверка healthIndex
  if (data.healthIndex < 0 || data.healthIndex > 100) {
    results.push({
      id: 'health-index',
      name: 'Индекс здоровья',
      description: 'Значение должно быть от 0 до 100',
      status: 'fail',
      message: `${data.healthIndex}`,
    });
  } else {
    results.push({
      id: 'health-index',
      name: 'Индекс здоровья',
      description: 'Значение в допустимом диапазоне',
      status: data.healthIndex >= 50 ? 'pass' : 'warn',
      message: `${data.healthIndex}%`,
    });
  }

  // 6. Проверка операционной прибыли
  const calculatedProfit =
    data.revenue -
    data.rent -
    data.utilities -
    data.payroll -
    data.managementCosts -
    data.costOfGoods -
    data.otherExpenses;

  results.push({
    id: 'profit-calc',
    name: 'Расчёт прибыли',
    description: 'Выручка − расходы = операционная прибыль',
    status:
      Math.abs(calculatedProfit - data.operatingProfit) <= 100
        ? 'pass'
        : 'warn',
    message: `Расчётная: ${fmt(calculatedProfit)} ₽, сохранённая: ${fmt(data.operatingProfit)} ₽`,
  });

  return results;
};

/* ==================================================================
   UI
   ================================================================== */
const statusConfig = {
  pass: {
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    badge: 'secondary' as const,
  },
  warn: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    badge: 'secondary' as const,
  },
  fail: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    badge: 'destructive' as const,
  },
};

export default function DiagnosticsClient() {
  const [data, setData] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<TestResult[]>([]);

  const loadAndTest = () => {
    setLoading(true);
    const stored = getStoredData();
    setData(stored);
    if (stored) {
      setResults(runTests(stored));
    } else {
      setResults([
        {
          id: 'data',
          name: 'Наличие данных',
          description: 'Данные не найдены',
          status: 'fail',
          message: 'Заполните данные на дашборде (Экспресс-аудит)',
        },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAndTest();
  }, []);

  const passedCount = results.filter((r) => r.status === 'pass').length;
  const total = results.length;
  const percentage = total > 0 ? Math.round((passedCount / total) * 100) : 0;

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold text-foreground">Диагностика кода</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Автоматическая проверка расчётов и данных
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadAndTest} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Обновить
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Прогресс-бар */}
          <Card className="mb-6 py-0 gap-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-foreground">Пройдено тестов</span>
                <span className="font-bold tabular-nums">
                  {passedCount}/{total} ({percentage}%)
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </CardContent>
          </Card>

          {/* Список тестов */}
          <div className="space-y-3">
            {results.map((test) => {
              const cfg = statusConfig[test.status];
              const Icon = cfg.icon;
              return (
                <Card key={test.id} className={cn('border-l-4', test.status === 'pass' ? 'border-l-emerald-500' : test.status === 'warn' ? 'border-l-amber-500' : 'border-l-red-500', 'py-0 gap-0')}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', cfg.color)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-medium text-foreground">{test.name}</span>
                          <Badge variant={cfg.badge} className="text-[10px]">
                            {test.status === 'pass' ? 'ОК' : test.status === 'warn' ? 'Предупреждение' : 'Ошибка'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{test.description}</p>
                        <p className="text-xs mt-1 font-mono text-foreground/80">{test.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {data && (
            <div className="mt-6 text-xs text-muted-foreground">
              Данные заведения: {data.name || '—'}, выручка {fmt(data.revenue)} ₽, гостей/день {data.dailyGuests}
            </div>
          )}
        </>
      )}
    </div>
  );
}