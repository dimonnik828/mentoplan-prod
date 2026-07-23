'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CheckCircle,
  Edit,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  Wallet,
  PiggyBank,
  UtensilsCrossed,
  Users,
  Building2,
  ChefHat,
  Lightbulb,
  CircleDot,
} from 'lucide-react';
import { toast } from 'sonner';
import { ErrorBoundary } from '@/components/error-boundary';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { FirstVisitOverlay } from '@/components/FirstVisitOverlay'; // добавлено

/* ==================================================================
   ТИПЫ
   ================================================================== */

type BusinessData = {
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
};

/* ==================================================================
   ДАННЫЕ ПО УМОЛЧАНИЮ
   ================================================================== */

const defaultBusiness: BusinessData = {
  name: 'Кафе MOMENTO на Тверской',
  address: 'Москва, ул. Тверская, 10',
  venueType: 'cafe',
  totalArea: 110,
  hallArea: 80,
  seats: 48,
  staffCount: 12,
  dailyGuests: 50,
  avgCheck: 1050,
  revenue: 3200000,
  rent: 576000,
  utilities: 48000,
  payroll: 864000,
  managementCosts: 150000,
  costOfGoods: 1088000,
  otherExpenses: 352000,
  operatingProfit: 320000,
  foodCostPercent: 34,
  payrollPercent: 27,
  rentPercent: 18,
  utilitiesPercent: 1.5,
  managementPercent: 4.7,
  otherPercent: 11,
  profitPercent: 10,
  healthIndex: 62,
};

/* ==================================================================
   УТИЛИТЫ
   ================================================================== */

const formatPercent = (value: number): string => value.toFixed(2);
const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU');

const VENUE_LABELS: Record<string, string> = {
  cafe: 'Кафе',
  restaurant: 'Ресторан',
  coffee: 'Кофейня',
  canteen: 'Столовая',
  fastfood: 'Быстрое обслуживание',
  darkkitchen: 'Дарк-китчен',
};

/* ==================================================================
   НОРМЫ И ЦВЕТА
   ================================================================== */

const NORMS: Record<string, { green: number; orange: number; red: number; higherIsBetter?: boolean }> = {
  foodCostPercent: { green: 32, orange: 38, red: 38 },
  payrollPercent: { green: 25, orange: 30, red: 30 },
  rentPercent: { green: 14, orange: 18, red: 18 },
  profitPercent: { green: 15, orange: 10, red: 10, higherIsBetter: true },
};

type ColorLevel = 'green' | 'orange' | 'red' | 'neutral';

const getColorLevel = (key: string, value: number): { color: ColorLevel; css: string } => {
  const norm = NORMS[key];
  if (!norm) return { color: 'neutral', css: '#6b7280' };
  if (norm.higherIsBetter) {
    if (value >= norm.green) return { color: 'green', css: '#10b981' };
    if (value >= norm.orange) return { color: 'orange', css: '#f59e0b' };
    return { color: 'red', css: '#ef4444' };
  } else {
    if (value <= norm.green) return { color: 'green', css: '#10b981' };
    if (value <= norm.orange) return { color: 'orange', css: '#f59e0b' };
    return { color: 'red', css: '#ef4444' };
  }
};

/* ==================================================================
   ПЕРЕСЧЁТ БИЗНЕС-ДАННЫХ
   ================================================================== */

const recalcBusiness = (data: Partial<BusinessData>): BusinessData => {
  const revenue = data.revenue ?? defaultBusiness.revenue;
  const rent = data.rent ?? defaultBusiness.rent;
  const utilities = data.utilities ?? defaultBusiness.utilities;
  const payroll = data.payroll ?? defaultBusiness.payroll;
  const managementCosts = data.managementCosts ?? defaultBusiness.managementCosts;
  const costOfGoods = data.costOfGoods ?? defaultBusiness.costOfGoods;
  const otherExpenses = data.otherExpenses ?? defaultBusiness.otherExpenses;

  const foodCostPercent = revenue ? Math.round((costOfGoods / revenue) * 100) : 0;
  const payrollPercent = revenue ? Math.round((payroll / revenue) * 100) : 0;
  const rentPercent = revenue ? Math.round((rent / revenue) * 100) : 0;
  const utilitiesPercent = revenue ? Math.round((utilities / revenue) * 100) : 0;
  const managementPercent = revenue ? Math.round((managementCosts / revenue) * 100) : 0;
  const otherPercent = revenue ? Math.round((otherExpenses / revenue) * 100) : 0;
  const operatingProfit = revenue - rent - utilities - payroll - managementCosts - costOfGoods - otherExpenses;
  const profitPercent = revenue ? Math.round((operatingProfit / revenue) * 100) : 0;

  const params: [string, number][] = [
    ['foodCostPercent', foodCostPercent],
    ['payrollPercent', payrollPercent],
    ['rentPercent', rentPercent],
    ['profitPercent', profitPercent],
  ];
  let greenCount = 0;
  params.forEach(([key, val]) => {
    if (getColorLevel(key, val).color === 'green') greenCount++;
  });
  const healthIndex = Math.round((greenCount / params.length) * 100);

  return {
    ...defaultBusiness,
    ...data,
    venueType: data.venueType ?? defaultBusiness.venueType,
    dailyGuests: data.dailyGuests ?? defaultBusiness.dailyGuests,
    revenue,
    rent,
    utilities,
    payroll,
    managementCosts,
    costOfGoods,
    otherExpenses,
    operatingProfit,
    foodCostPercent,
    payrollPercent,
    rentPercent,
    utilitiesPercent,
    managementPercent,
    otherPercent,
    profitPercent,
    healthIndex,
  };
};

/* ==================================================================
   ЦВЕТОВЫЕ МАППИНГИ ДЛЯ UI
   ================================================================== */

const levelBorder: Record<ColorLevel, string> = {
  green: 'border-l-emerald-500',
  orange: 'border-l-amber-500',
  red: 'border-l-red-500',
  neutral: 'border-l-slate-300',
};

const levelText: Record<ColorLevel, string> = {
  green: 'text-emerald-600',
  orange: 'text-amber-600',
  red: 'text-red-600',
  neutral: 'text-slate-900',
};

const levelBg: Record<ColorLevel, string> = {
  green: 'bg-emerald-50',
  orange: 'bg-amber-50',
  red: 'bg-red-50',
  neutral: 'bg-slate-50',
};

const levelBar: Record<ColorLevel, string> = {
  green: 'bg-emerald-500',
  orange: 'bg-amber-500',
  red: 'bg-red-500',
  neutral: 'bg-slate-300',
};

const levelIconBg: Record<ColorLevel, string> = {
  green: 'bg-emerald-100 text-emerald-600',
  orange: 'bg-amber-100 text-amber-600',
  red: 'bg-red-100 text-red-600',
  neutral: 'bg-slate-100 text-slate-500',
};

const levelBadge: Record<ColorLevel, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  green: 'secondary',
  orange: 'secondary',
  red: 'destructive',
  neutral: 'outline',
};

/* ==================================================================
   ПОДКОМПОНЕНТЫ
   ================================================================== */

function ExpenseBar({
  label,
  value,
  target,
  colorLevel,
}: {
  label: string;
  value: number;
  target?: string;
  colorLevel: ColorLevel;
}) {
  const barWidth = Math.min((value / 45) * 100, 100);
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-sm text-muted-foreground w-28 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', levelBar[colorLevel])}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <span className={cn('text-sm font-semibold tabular-nums w-14 text-right', levelText[colorLevel])}>
        {formatPercent(value)}%
      </span>
      {target && (
        <span className="text-[11px] text-muted-foreground w-20 text-right hidden sm:block">
          {target}
        </span>
      )}
    </div>
  );
}

function KPICard({
  icon: Icon,
  label,
  value,
  sub,
  colorLevel,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  colorLevel: ColorLevel;
}) {
  return (
    <Card className={cn('border-l-4 overflow-hidden', levelBorder[colorLevel], 'py-0 gap-0')}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
            <p className={cn('text-xl font-bold tabular-nums leading-tight', levelText[colorLevel])}>
              {value}
            </p>
            <p className="text-xs text-muted-foreground truncate">{sub}</p>
          </div>
          <div className={cn('p-2 rounded-lg shrink-0', levelIconBg[colorLevel])}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function VenueInfoChip({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
        <p className="text-sm font-semibold text-foreground leading-tight tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function Recommendation({
  colorLevel,
  title,
  value,
  description,
}: {
  colorLevel: ColorLevel;
  title: string;
  value: string;
  description: string;
}) {
  const IconComponent =
    colorLevel === 'green' ? CheckCircle
    : colorLevel === 'orange' ? AlertTriangle
    : colorLevel === 'red' ? AlertTriangle
    : Info;

  return (
    <div className={cn('flex gap-3 p-3 rounded-lg', levelBg[colorLevel])}>
      <IconComponent className={cn('h-4 w-4 shrink-0 mt-0.5', levelText[colorLevel])} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-sm font-medium text-foreground">{title}</span>
          <Badge variant={levelBadge[colorLevel]} className="text-[10px] px-1.5 py-0">
            {value}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

/* ==================================================================
   МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ
   ================================================================== */

const FORM_FIELDS = [
  { section: 'Основная информация', fields: ['name', 'address', 'venueType'] },
  { section: 'Площади и ресурсы', fields: ['totalArea', 'hallArea', 'seats', 'staffCount', 'dailyGuests'] },
  { section: 'Финансы (₽/мес)', fields: ['revenue', 'avgCheck', 'rent', 'utilities', 'payroll', 'managementCosts', 'costOfGoods', 'otherExpenses'] },
] as const;

const FIELD_LABELS: Record<string, string> = {
  name: 'Название',
  address: 'Адрес',
  venueType: 'Тип заведения',
  totalArea: 'Площадь общая (м²)',
  hallArea: 'Площадь зала (м²)',
  seats: 'Посадочных мест',
  staffCount: 'Сотрудников',
  dailyGuests: 'Гостей в день (среднее)',
  revenue: 'Выручка в месяц',
  avgCheck: 'Средний чек',
  rent: 'Аренда',
  utilities: 'Коммунальные платежи',
  payroll: 'ФОТ',
  managementCosts: 'Затраты на управление',
  costOfGoods: 'Foodcost',
  otherExpenses: 'Прочие расходы',
};

function DataModal({
  open,
  onOpenChange,
  data,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  data: BusinessData;
  onSave: (newData: Partial<BusinessData>) => void;
}) {
  const [form, setForm] = useState<Record<string, string | number>>({});

  const handleOpenChange = useCallback(
    (v: boolean) => {
      if (v) setForm({ ...data });
      onOpenChange(v);
    },
    [data, onOpenChange]
  );

  const set = (key: string, val: string | number) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form as Partial<BusinessData>);
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>Вводные данные бизнеса</DialogTitle>
          <DialogDescription>Измените параметры для пересчёта показателей</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {FORM_FIELDS.map((section) => (
              <div key={section.section}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  {section.section}
                </h3>

                {section.section === 'Основная информация' ? (
                  <div className="space-y-3">
                    {section.fields.map((f) =>
                      f === 'venueType' ? (
                        <div key={f} className="space-y-1.5">
                          <Label>{FIELD_LABELS[f]}</Label>
                          <Select
                            value={String(form[f] ?? '')}
                            onValueChange={(v) => set(f, v ?? '')}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(VENUE_LABELS).map(([k, v]) => (
                                <SelectItem key={k} value={k}>
                                  {v}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div key={f} className="space-y-1.5">
                          <Label>{FIELD_LABELS[f]}</Label>
                          <Input
                            type="text"
                            value={String(form[f] ?? '')}
                            onChange={(e) => set(f, e.target.value)}
                          />
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {section.fields.map((f) => (
                      <div key={f} className="space-y-1.5">
                        <Label>{FIELD_LABELS[f]}</Label>
                        <Input
                          type="number"
                          value={Number(form[f] ?? 0) || ''}
                          onChange={(e) => set(f, e.target.value === '' ? 0 : Number(e.target.value))}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </form>

        <DialogFooter className="px-6 py-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ==================================================================
   ОСНОВНОЙ КОМПОНЕНТ
   ================================================================== */

export default function DashboardClient() {
  const [businessData, setBusinessData] = useState<BusinessData>(defaultBusiness);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/audits/latest');
        if (res.ok) {
          const data = await res.json();
          const b: BusinessData = {
            ...defaultBusiness,
            name: data.name || defaultBusiness.name,
            address: data.address || '',
            venueType: data.venueType || 'cafe',
            totalArea: data.totalArea || 0,
            hallArea: data.hallArea || 0,
            seats: data.seats || 0,
            staffCount: data.staffCount || 0,
            dailyGuests: data.dailyGuests || defaultBusiness.dailyGuests,
            avgCheck: data.avgCheck || 0,
            revenue: data.revenue || 0,
            rent: data.rent || 0,
            utilities: data.utilities || 0,
            payroll: data.payroll || 0,
            managementCosts: data.managementCosts || 0,
            costOfGoods: data.costOfGoods || 0,
            otherExpenses: data.otherExpenses || 0,
          };
          setBusinessData(b);
          localStorage.setItem('momentoBusinessData', JSON.stringify(b));
        } else {
          const saved = localStorage.getItem('momentoBusinessData');
          if (saved) setBusinessData(recalcBusiness(JSON.parse(saved)));
        }
      } catch {
        const saved = localStorage.getItem('momentoBusinessData');
        if (saved) setBusinessData(recalcBusiness(JSON.parse(saved)));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const saveBusinessData = async (newData: Partial<BusinessData>) => {
    const updated = recalcBusiness(newData);
    setBusinessData(updated);
    localStorage.setItem('momentoBusinessData', JSON.stringify(updated));
    try {
      const payload = {
        name: updated.name,
        address: updated.address,
        venueType: updated.venueType,
        totalArea: updated.totalArea,
        hallArea: updated.hallArea,
        seats: updated.seats,
        staffCount: updated.staffCount,
        dailyGuests: updated.dailyGuests,
        avgCheck: updated.avgCheck,
        revenue: updated.revenue,
        rent: updated.rent,
        utilities: updated.utilities,
        payroll: updated.payroll,
        managementCosts: updated.managementCosts,
        costOfGoods: updated.costOfGoods,
        otherExpenses: updated.otherExpenses,
      };
      await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      toast.success('Данные сохранены');
    } catch {
      toast.error('Ошибка соединения с сервером');
    }
  };

  const kpis = useMemo(
    () => [
      {
        icon: Wallet,
        label: 'Выручка/мес',
        value: `${fmt(businessData.revenue)} ₽`,
        sub: `Чек: ${fmt(businessData.avgCheck)} ₽`,
        colorLevel: 'neutral' as ColorLevel,
      },
      {
        icon: PiggyBank,
        label: 'Операционная прибыль',
        value: `${formatPercent(businessData.profitPercent)}%`,
        sub: `${fmt(businessData.operatingProfit)} ₽`,
        colorLevel: getColorLevel('profitPercent', businessData.profitPercent).color,
      },
      {
        icon: UtensilsCrossed,
        label: 'Food cost',
        value: `${formatPercent(businessData.foodCostPercent)}%`,
        sub: businessData.foodCostPercent > 32 ? 'Выше нормы' : 'В норме',
        colorLevel: getColorLevel('foodCostPercent', businessData.foodCostPercent).color,
      },
      {
        icon: Users,
        label: 'ФОТ',
        value: `${formatPercent(businessData.payrollPercent)}%`,
        sub: businessData.payrollPercent > 25 ? 'Выше нормы' : 'В норме',
        colorLevel: getColorLevel('payrollPercent', businessData.payrollPercent).color,
      },
    ],
    [businessData]
  );

  const recommendations = useMemo(() => {
    const items: {
      colorLevel: ColorLevel;
      title: string;
      value: string;
      description: string;
    }[] = [];

    const profitLevel = getColorLevel('profitPercent', businessData.profitPercent).color;
    items.push({
      colorLevel: profitLevel,
      title: 'Операционная прибыль',
      value: `${formatPercent(businessData.profitPercent)}%`,
      description:
        profitLevel === 'green'
          ? 'Прибыль находится в целевом диапазоне. Продолжайте контролировать расходы.'
          : profitLevel === 'orange'
            ? `Прибыль ниже целевого уровня 15%. Рекомендуется сократить расходы примерно на ${fmt(Math.round(businessData.revenue * 0.05))} ₽/мес.`
            : `Прибыль значительно ниже нормы 15%. Необходимо сократить расходы минимум на ${fmt(Math.round(businessData.revenue * 0.1))} ₽/мес для выхода в зелёную зону.`,
    });

    const fcLevel = getColorLevel('foodCostPercent', businessData.foodCostPercent).color;
    items.push({
      colorLevel: fcLevel,
      title: 'Food cost',
      value: `${formatPercent(businessData.foodCostPercent)}%`,
      description:
        fcLevel === 'green'
          ? 'Себестоимость блюд в норме.'
          : `Себестоимость ${formatPercent(businessData.foodCostPercent)}% при норме 28–32%. Снижение на 2% сэкономит ${fmt(Math.round(businessData.revenue * 0.02))} ₽/мес.`,
    });

    const prLevel = getColorLevel('payrollPercent', businessData.payrollPercent).color;
    items.push({
      colorLevel: prLevel,
      title: 'Фонд оплаты труда',
      value: `${formatPercent(businessData.payrollPercent)}%`,
      description:
        prLevel === 'green'
          ? 'ФОТ в пределах нормы.'
          : `ФОТ ${formatPercent(businessData.payrollPercent)}% при норме 22–25%. Оптимизация графиков на 2% сэкономит ${fmt(Math.round(businessData.revenue * 0.02))} ₽/мес.`,
    });

    const rnLevel = getColorLevel('rentPercent', businessData.rentPercent).color;
    items.push({
      colorLevel: rnLevel,
      title: 'Арендная нагрузка',
      value: `${formatPercent(businessData.rentPercent)}%`,
      description:
        rnLevel === 'green'
          ? 'Аренда в допустимых пределах.'
          : `Аренда ${formatPercent(businessData.rentPercent)}% при норме до 14%. Рассмотрите переговоры с арендодателем или увеличение выручки.`,
    });

    return items;
  }, [businessData]);

  const healthColor =
    businessData.healthIndex >= 70
      ? 'bg-emerald-500'
      : businessData.healthIndex >= 40
        ? 'bg-amber-500'
        : 'bg-red-500';

  if (loading) {
    return (
      <ErrorBoundary>
        <DashboardSkeleton />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      {/* Онбординг для нового пользователя — подсвечиваем кнопку «Изменить данные» */}
      <FirstVisitOverlay targetSelector="#edit-data-btn" />

      <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
        {/* ---- Шапка ---- */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">
              {businessData.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5 truncate">
              {businessData.address}
              <span className="mx-1.5 opacity-40">·</span>
              {VENUE_LABELS[businessData.venueType] ?? businessData.venueType}
            </p>
          </div>
          <Button id="edit-data-btn" onClick={() => setIsModalOpen(true)} size="sm">
            <Edit className="h-4 w-4" />
            Ввести данные
          </Button>
        </div>

        {/* ---- Инфо-плашки заведения ---- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <VenueInfoChip icon={Building2} label="Общая площадь" value={`${businessData.totalArea} м²`} />
          <VenueInfoChip icon={Building2} label="Зал" value={`${businessData.hallArea} м²`} />
          <VenueInfoChip icon={Users} label="Места" value={businessData.seats} />
          <VenueInfoChip icon={ChefHat} label="Персонал" value={businessData.staffCount} />
          <VenueInfoChip icon={TrendingUp} label="Гостей/день" value={businessData.dailyGuests} />
        </div>

        {/* ---- KPI-карточки ---- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.label} {...kpi} />
          ))}
        </div>

        {/* ---- Структура выручки ---- */}
        <Card className="mb-6 py-0 gap-0">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold">Структура выручки</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ExpenseBar
              label="Foodcost"
              value={businessData.foodCostPercent}
              target="→ 28–32%"
              colorLevel={getColorLevel('foodCostPercent', businessData.foodCostPercent).color}
            />
            <ExpenseBar
              label="ФОТ"
              value={businessData.payrollPercent}
              target="→ 22–25%"
              colorLevel={getColorLevel('payrollPercent', businessData.payrollPercent).color}
            />
            <ExpenseBar
              label="Аренда"
              value={businessData.rentPercent}
              target="→ до 14%"
              colorLevel={getColorLevel('rentPercent', businessData.rentPercent).color}
            />
            <ExpenseBar
              label="Коммунальные"
              value={businessData.utilitiesPercent}
              colorLevel="neutral"
            />
            <ExpenseBar
              label="Управление"
              value={businessData.managementPercent}
              colorLevel="neutral"
            />
            <ExpenseBar
              label="Прочие"
              value={businessData.otherPercent}
              colorLevel="neutral"
            />
            <Separator className="my-2" />
            <ExpenseBar
              label="Опер. прибыль"
              value={businessData.profitPercent}
              target="→ 15%+"
              colorLevel={getColorLevel('profitPercent', businessData.profitPercent).color}
            />

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-foreground">Индекс здоровья бизнеса</span>
                <span className="font-bold tabular-nums text-foreground">
                  {businessData.healthIndex}%
                </span>
              </div>
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', healthColor)}
                  style={{ width: `${businessData.healthIndex}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                {businessData.healthIndex >= 70
                  ? 'Бизнес в хорошей форме'
                  : businessData.healthIndex >= 40
                    ? 'Есть точки для улучшения'
                    : 'Требуется внимание к ключевым метрикам'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ---- Рекомендации ---- */}
        <Card className="py-0 gap-0">
          <CardHeader className="pb-0">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-sm font-semibold">Рекомендации по улучшению</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-2.5">
            {recommendations.map((r) => (
              <Recommendation key={r.title} {...r} />
            ))}
          </CardContent>
        </Card>

        <DataModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          data={businessData}
          onSave={saveBusinessData}
        />
      </div>
    </ErrorBoundary>
  );
}