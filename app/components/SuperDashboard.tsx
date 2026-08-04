'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  CheckCircle, Edit, TrendingUp, AlertTriangle, Wallet, PiggyBank,
  UtensilsCrossed, Users, Building2, ChefHat, Lightbulb, Database,
  SlidersHorizontal, Armchair, Coffee, Flame, Gauge, Zap,
  Clock, DollarSign, Target, ShieldAlert, ArrowUp, MapPin, Store,
  ShoppingBag, UserCog, Thermometer, Receipt, PieChart, BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import { ErrorBoundary } from '@/components/error-boundary';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  METRICS_CONFIG, getHealthMetrics, getRecommendations, runDiagnostics, VENUE_NORMS,
} from '@/lib/metrics-config';
import {
  getBlockBubbles, type BubbleDataContext,
} from '@/lib/knowledge-bubbles';

/* ==================================================================
   ТИПЫ
   ================================================================== */
type BusinessData = {
  name: string; address: string; venueType: string; totalArea: number; hallArea: number;
  seats: number; staffCount: number; dailyGuests: number; avgCheck: number; revenue: number;
  rent: number; utilities: number; payroll: number; managementCosts: number; costOfGoods: number;
  otherExpenses: number; operatingProfit: number; foodCostPercent: number; payrollPercent: number;
  rentPercent: number; utilitiesPercent: number; managementPercent: number; otherPercent: number;
  profitPercent: number; healthIndex: number;
  marketingExpenses: number; wasteLosses: number; deliveryCommission: number; staffTurnoverRate: number;
};

interface Dish { id: string; name: string; time: number; price: number; }
interface CommonSettings { shiftHours: number; operatingHours: number; dailyGuests: number; avgDishesPerGuest: number; avgDrinksPerGuest: number; }
interface HallSettings { venueType: string; seats: number; avgCheck: number; hallArea: number; kitchenArea: number; totalArea: number; rentPerSqm: number; cookSalary: number; baristaSalary: number; waiterSalary: number; dishwasherSalary: number; waiterRatio: number; dishwasherRatio: number; foodCostPercent: number; drinkCostPercent: number; }
interface CoffeeSettings { baristas: number; drinkTime: number; drinkPrice: number; }
interface KitchenSettings { cooks: number; parallelism: number; dishes: Dish[]; }
interface EnergySettings { kitchenType: string; climateZone: number; indoorTemp: number; safetyFactor: number; electricityPrice: number; otherPower: number; }
interface LocationSettings { district: string; locationType: string; competitors: number; competitorInfluence: number; totalPopulation: number; targetAudiencePercent: number; conversionRate: number; potentialGuests: number; }

/* ==================================================================
   КОНСТАНТЫ И ДЕФОЛТЫ
   ================================================================== */
const defaultBusiness: BusinessData = {
  name: '', address: '', venueType: 'cafe', totalArea: 0, hallArea: 0,
  seats: 0, staffCount: 0, dailyGuests: 0, avgCheck: 0, revenue: 0,
  rent: 0, utilities: 0, payroll: 0, managementCosts: 0, costOfGoods: 0,
  otherExpenses: 0, operatingProfit: 0, foodCostPercent: 0, payrollPercent: 0,
  rentPercent: 0, utilitiesPercent: 0, managementPercent: 0, otherPercent: 0,
  profitPercent: 0, healthIndex: 0,
  marketingExpenses: 0, wasteLosses: 0, deliveryCommission: 0, staffTurnoverRate: 0,
};

const VENUE_LABELS: Record<string, string> = {
  cafe: 'Кафе', restaurant: 'Ресторан', coffee: 'Кофейня',
  canteen: 'Столовая', fastfood: 'Быстрое обслуживание', darkkitchen: 'Дарк-китчен',
};

const PREP_RATIO = 15;
const VENUE_TYPES = VENUE_NORMS;
const KITCHEN_TYPE_RATE: Record<string, number> = { hot: 37.5, cold: 17.5, mixed: 27.5 };

const DISTRICTS = [
  { value: 'central', label: 'ЦАО' }, { value: 'west', label: 'ЗАО' },
  { value: 'east', label: 'ВАО' }, { value: 'north', label: 'САО' },
  { value: 'southeast', label: 'ЮВАО' }, { value: 'southwest', label: 'ЮЗАО' },
  { value: 'northwest', label: 'СЗАО' }, { value: 'zelenograd', label: 'ЗелАО' },
];

const LOCATION_TYPES = [
  { value: 'residential', label: 'Жилой район' },
  { value: 'mall', label: 'ТРЦ' },
  { value: 'business_center', label: 'Бизнес-центр' },
  { value: 'street', label: 'Уличная локация' },
];

const FIELD_LABELS: Record<string, string> = {
  name: 'Название', address: 'Адрес', venueType: 'Тип заведения',
  totalArea: 'Площадь общая (м²)', hallArea: 'Площадь зала (м²)',
  seats: 'Посадочных мест', staffCount: 'Сотрудников',
  dailyGuests: 'Гостей в день', revenue: 'Выручка в месяц',
  avgCheck: 'Средний чек', rent: 'Аренда', utilities: 'Коммунальные',
  payroll: 'ФОТ', managementCosts: 'Управление',
  costOfGoods: 'Foodcost', otherExpenses: 'Прочие расходы',
  marketingExpenses: 'Маркетинг (₽/мес)',
  wasteLosses: 'Потери / списания (₽/мес)',
  deliveryCommission: 'Комиссия доставки (₽/мес)',
  staffTurnoverRate: 'Текучесть кадров (% в мес)',
};

/* ==================================================================
   УТИЛИТЫ И ЛОГИКА
   ================================================================== */
const formatPercent = (value: number): string => value === 0 ? '—' : value.toFixed(1);
const fmt = (n: number) => n === 0 ? '—' : Math.round(n).toLocaleString('ru-RU');

type ColorLevel = 'green' | 'orange' | 'red' | 'neutral';

const getColorLevel = (key: string, value: number): { color: ColorLevel; css: string } => {
  const config = METRICS_CONFIG[key];
  if (!config || !config.affectsHealth) return { color: 'neutral', css: '#6b7280' };
  if (config.higherIsBetter) {
    if (value >= config.green) return { color: 'green', css: '#10b981' };
    if (value >= config.orange) return { color: 'orange', css: '#f59e0b' };
    return { color: 'red', css: '#ef4444' };
  } else {
    if (value <= config.green) return { color: 'green', css: '#10b981' };
    if (value <= config.orange) return { color: 'orange', css: '#f59e0b' };
    return { color: 'red', css: '#ef4444' };
  }
};

const recalcBusiness = (data: Partial<BusinessData>): BusinessData => {
  const revenue = data.revenue ?? 0;
  const rent = data.rent ?? 0;
  const utilities = data.utilities ?? 0;
  const payroll = data.payroll ?? 0;
  const managementCosts = data.managementCosts ?? 0;
  const costOfGoods = data.costOfGoods ?? 0;
  const otherExpenses = data.otherExpenses ?? 0;
  const marketingExpenses = data.marketingExpenses ?? 0;
  const wasteLosses = data.wasteLosses ?? 0;
  const deliveryCommission = data.deliveryCommission ?? 0;
  const staffTurnoverRate = data.staffTurnoverRate ?? 0;
  const foodCostPercent = revenue ? Math.round((costOfGoods / revenue) * 100) : 0;
  const payrollPercent = revenue ? Math.round((payroll / revenue) * 100) : 0;
  const rentPercent = revenue ? Math.round((rent / revenue) * 100) : 0;
  const utilitiesPercent = revenue ? Math.round((utilities / revenue) * 100) : 0;
  const managementPercent = revenue ? Math.round((managementCosts / revenue) * 100) : 0;
  const otherPercent = revenue ? Math.round((otherExpenses / revenue) * 100) : 0;
  const operatingProfit = revenue - rent - utilities - payroll - managementCosts - costOfGoods - otherExpenses;
  const profitPercent = revenue ? Math.round((operatingProfit / revenue) * 100) : 0;
  const calculatedPercents = { foodCostPercent, payrollPercent, rentPercent, profitPercent };
  const healthMetrics = getHealthMetrics();
  let greenCount = 0;
  healthMetrics.forEach((metric) => {
    const val = calculatedPercents[metric.key as keyof typeof calculatedPercents] ?? 0;
    if (getColorLevel(metric.key, val).color === 'green') greenCount++;
  });
  const healthIndex = healthMetrics.length > 0 ? Math.round((greenCount / healthMetrics.length) * 100) : 0;
  return {
    ...defaultBusiness, ...data, revenue, rent, utilities, payroll, managementCosts,
    costOfGoods, otherExpenses, marketingExpenses, wasteLosses, deliveryCommission, staffTurnoverRate,
    operatingProfit, foodCostPercent, payrollPercent, rentPercent,
    utilitiesPercent, managementPercent, otherPercent, profitPercent, healthIndex,
  };
};

/* ==================================================================
   UI КОМПОНЕНТЫ
   ================================================================== */
const levelBorder: Record<ColorLevel, string> = { green: 'border-l-emerald-500', orange: 'border-l-amber-500', red: 'border-l-red-500', neutral: 'border-l-slate-300' };
const levelText: Record<ColorLevel, string> = { green: 'text-emerald-600', orange: 'text-amber-600', red: 'text-red-600', neutral: 'text-slate-900' };
const levelBg: Record<ColorLevel, string> = { green: 'bg-emerald-50', orange: 'bg-amber-50', red: 'bg-red-50', neutral: 'bg-slate-50' };
const levelBar: Record<ColorLevel, string> = { green: 'bg-emerald-500', orange: 'bg-amber-500', red: 'bg-red-500', neutral: 'bg-slate-300' };
const levelIconBg: Record<ColorLevel, string> = { green: 'bg-emerald-100 text-emerald-600', orange: 'bg-amber-100 text-amber-600', red: 'bg-red-100 text-red-600', neutral: 'bg-slate-100 text-slate-500' };
const levelBadge: Record<ColorLevel, 'default' | 'secondary' | 'destructive' | 'outline'> = { green: 'secondary', orange: 'secondary', red: 'destructive', neutral: 'outline' };

type BubbleVariant = 'info' | 'formula' | 'norm' | 'ai';

function KnowledgeBubble({ text, variant = 'info', tooltip }: {
  text: string; variant?: BubbleVariant; tooltip?: string;
}) {
  const styles: Record<BubbleVariant, string> = {
    info: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    formula: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100',
    norm: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    ai: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  };
  const icons: Record<BubbleVariant, string> = { info: 'i', formula: 'f', norm: '★', ai: '✦' };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium leading-tight cursor-default transition-colors whitespace-nowrap',
        styles[variant],
      )}
      title={tooltip || text}
    >
      <span className="text-[9px] font-bold opacity-60">{icons[variant]}</span>
      {text}
    </span>
  );
}

function BubbleRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex flex-wrap gap-1.5 mt-2', className)}>{children}</div>;
}

function BubbleRowFromConfig({ blockId, subBlockId, data, className }: {
  blockId: string; subBlockId?: string; data: BubbleDataContext; className?: string;
}) {
  const bubbles = getBlockBubbles(blockId, subBlockId);
  const visible = bubbles.filter((b) => !b.show || b.show(data));
  if (visible.length === 0) return null;
  return (
    <BubbleRow className={className}>
      {visible.map((b) => (
        <KnowledgeBubble
          key={b.id}
          text={b.getText ? b.getText(data) : (b.text ?? '')}
          variant={b.getVariant ? b.getVariant(data) : (b.variant ?? 'info')}
          tooltip={b.tooltip}
        />
      ))}
    </BubbleRow>
  );
}

function InfoPopover({ children }: { children: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-[10px] font-bold leading-none">i</span>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3 text-xs" side="top" align="start">
        {children}
      </PopoverContent>
    </Popover>
  );
}

function KPICard({ icon: Icon, label, value, sub, colorLevel = 'neutral' }: {
  icon: React.ElementType; label: string; value: string; sub?: string; colorLevel?: ColorLevel;
}) {
  return (
    <Card className={cn('border-l-4 overflow-hidden', levelBorder[colorLevel], 'py-0 gap-0')}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
            <p className={cn('text-lg font-bold tabular-nums leading-tight', levelText[colorLevel])}>{value}</p>
            {sub && <p className="text-[11px] text-muted-foreground truncate">{sub}</p>}
          </div>
          <div className={cn('p-2 rounded-lg shrink-0', levelIconBg[colorLevel])}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ExpenseBar({ label, value, target, colorLevel }: {
  label: string; value: number; target?: string; colorLevel: ColorLevel;
}) {
  const barWidth = Math.min((Math.abs(value) / 45) * 100, 100);
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-sm text-muted-foreground w-32 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500', levelBar[colorLevel])}
          style={{ width: `${barWidth}%` }} />
      </div>
      <span className={cn('text-sm font-semibold tabular-nums w-14 text-right', levelText[colorLevel])}>
        {formatPercent(value)}%
      </span>
      {target && <span className="text-[11px] text-muted-foreground w-20 text-right hidden sm:block">{target}</span>}
    </div>
  );
}

function ModelSlider({ label, value, onChange, min = 0, max = 100, step = 1, unit = '', badge }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; unit?: string; badge?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="!text-xs !font-normal">{label}</Label>
        <div className="flex items-center gap-2">
          {badge && <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">{badge}</span>}
          <div className="flex items-center gap-1 bg-background border rounded-md px-2 py-1 shadow-sm">
            <input type="number" min={min} max={max} step={step} value={value}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              className="w-16 text-right text-xs tabular-nums bg-transparent focus:outline-none"
            />
            {unit && <span className="text-[10px] text-muted-foreground w-6">{unit}</span>}
          </div>
        </div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${pct}%, hsl(var(--muted)) ${pct}%, hsl(var(--muted)) 100%)`,
          accentColor: 'hsl(var(--primary))',
        }}
      />
    </div>
  );
}

function InlineSlider({ label, value, onChange, min = 0, max = 100, step = 1, unit = '' }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; unit?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs text-muted-foreground w-36 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-muted">
        <div className="h-full rounded-full bg-primary transition-all duration-200"
          style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center gap-0.5 border rounded-md px-1.5 py-0.5 bg-background shadow-sm">
        <input type="number" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-14 text-right text-xs tabular-nums bg-transparent focus:outline-none"
        />
        {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-20 h-1.5 rounded-full appearance-none cursor-pointer shrink-0"
        style={{
          background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${pct}%, hsl(var(--muted)) ${pct}%, hsl(var(--muted)) 100%)`,
          accentColor: 'hsl(var(--primary))',
        }}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={(val) => onChange(val ?? '')}>
        <SelectTrigger className="w-full text-xs h-8"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function Recommendation({ colorLevel, title, value, description }: {
  colorLevel: ColorLevel; title: string; value: string; description: string;
}) {
  const Icon = colorLevel === 'green' ? CheckCircle : AlertTriangle;
  return (
    <div className={cn('flex gap-3 p-3 rounded-lg', levelBg[colorLevel])}>
      <Icon className={cn('h-4 w-4 shrink-0 mt-0.5', levelText[colorLevel])} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-sm font-medium text-foreground">{title}</span>
          <Badge variant={levelBadge[colorLevel]} className="text-[10px] px-1.5 py-0">{value}</Badge>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function DataModal({ open, onOpenChange, data, onSave }: {
  open: boolean; onOpenChange: (v: boolean) => void; data: BusinessData;
  onSave: (newData: Partial<BusinessData>) => void;
}) {
  const [form, setForm] = useState<Record<string, string | number>>({});
  const handleOpenChange = useCallback((v: boolean) => {
    if (v) setForm({ ...data });
    onOpenChange(v);
  }, [data, onOpenChange]);
  const set = (key: string, val: string | number) => setForm((prev) => ({ ...prev, [key]: val }));
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
          <DialogDescription>Введите фактические показатели за месяц</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-2 gap-3">
            {['name', 'address'].map((f) => (
              <div key={f} className="col-span-2 space-y-1.5">
                <Label>{FIELD_LABELS[f]}</Label>
                <Input type="text" value={String(form[f] ?? '')} onChange={(e) => set(f, e.target.value)} />
              </div>
            ))}
            {['revenue', 'rent', 'utilities', 'payroll', 'managementCosts', 'costOfGoods', 'otherExpenses', 'marketingExpenses', 'wasteLosses', 'deliveryCommission', 'staffTurnoverRate'].map((f) => (
              <div key={f} className="space-y-1.5">
                <Label>{FIELD_LABELS[f] || f}</Label>
                <Input type="number" value={Number(form[f] ?? 0) || ''} onChange={(e) => set(f, e.target.value === '' ? 0 : Number(e.target.value))} />
              </div>
            ))}
          </div>
        </form>
        <DialogFooter className="px-6 py-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button type="submit" onClick={handleSubmit}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">
      {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
    </div>
  );
}

/* ==================================================================
   ГЛАВНЫЙ КОМПОНЕНТ
   ================================================================== */
export default function SuperDashboard() {
  const [baselineData, setBaselineData] = useState<BusinessData>(defaultBusiness);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'real' | 'model'>('real');

  const [staffMultiplier, setStaffMultiplier] = useState(1);
  const [audienceOpen, setAudienceOpen] = useState(false);
  const [hall, setHall] = useState<HallSettings>({
    venueType: 'cafe', seats: 50, avgCheck: 500, hallArea: 75, kitchenArea: 40,
    totalArea: 110, rentPerSqm: 1090, cookSalary: 80000, baristaSalary: 60000,
    waiterSalary: 50000, dishwasherSalary: 40000, waiterRatio: 40, dishwasherRatio: 100,
    foodCostPercent: 30, drinkCostPercent: 25,
  });
  const [common, setCommon] = useState<CommonSettings>({
    shiftHours: 8, operatingHours: 14, dailyGuests: 50, avgDishesPerGuest: 0.8, avgDrinksPerGuest: 1.2,
  });
  const [coffee, setCoffee] = useState<CoffeeSettings>({ baristas: 2, drinkTime: 55, drinkPrice: 250 });
  const [kitchen, setKitchen] = useState<KitchenSettings>({
    cooks: 2, parallelism: 3,
    dishes: [
      { id: '1', name: 'Салаты', time: 10, price: 350 },
      { id: '2', name: 'Горячее', time: 35, price: 650 },
      { id: '3', name: 'Пицца', time: 15, price: 550 },
      { id: '4', name: 'Десерты', time: 8, price: 300 },
    ],
  });
  const [energy, setEnergy] = useState<EnergySettings>({
    kitchenType: 'hot', climateZone: -25, indoorTemp: 22, safetyFactor: 1.1, electricityPrice: 5.5, otherPower: 0,
  });
  const [location, setLocation] = useState<LocationSettings>({
    district: 'central', locationType: 'street', competitors: 10, competitorInfluence: 0.3,
    totalPopulation: 10, targetAudiencePercent: 10, conversionRate: 3, potentialGuests: 0,
  });
  const [waitersCount, setWaitersCount] = useState(2);
  const [dishwashersCount, setDishwashersCount] = useState(1);
  const [results, setResults] = useState<any>(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/audits/latest');
        if (res.ok) {
          const data = await res.json();
          const b: BusinessData = { ...defaultBusiness, ...data };
          setBaselineData(b);
          localStorage.setItem('momentoBusinessData', JSON.stringify(b));
        } else {
          const saved = localStorage.getItem('momentoBusinessData');
          if (saved) setBaselineData(recalcBusiness(JSON.parse(saved)));
        }
      } catch {
        const saved = localStorage.getItem('momentoBusinessData');
        if (saved) setBaselineData(recalcBusiness(JSON.parse(saved)));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (baselineData.revenue > 0) {
      setHall((p) => ({
        ...p,
        totalArea: baselineData.totalArea || p.totalArea,
        hallArea: baselineData.hallArea || p.hallArea,
        seats: baselineData.seats || p.seats,
        rentPerSqm: baselineData.rent && baselineData.totalArea > 0
          ? Math.round(baselineData.rent / baselineData.totalArea) : p.rentPerSqm,
      }));
      setCommon((p) => ({
        ...p,
        dailyGuests: baselineData.dailyGuests || p.dailyGuests,
      }));
    }
  }, [baselineData.revenue]);

  const calculateTheoreticalCheck = useCallback(
    (dishes: Dish[], drinkPrice: number, dishesPerGuest: number, drinksPerGuest: number) => {
      const avgDishPrice = dishes.length > 0 ? dishes.reduce((sum, d) => sum + d.price, 0) / dishes.length : 0;
      return dishesPerGuest * avgDishPrice + drinksPerGuest * drinkPrice;
    }, [],
  );

  const updatePricesFromCheck = useCallback(
    (newCheck: number) => {
      if (isUpdatingRef.current) return;
      isUpdatingRef.current = true;
      const cur = calculateTheoreticalCheck(kitchen.dishes, coffee.drinkPrice, common.avgDishesPerGuest, common.avgDrinksPerGuest);
      if (cur === 0 || Math.abs(newCheck - cur) < 1) { isUpdatingRef.current = false; return; }
      const scale = newCheck / cur;
      setKitchen((prev) => ({ ...prev, dishes: prev.dishes.map((d) => ({ ...d, price: Math.round(d.price * scale) })) }));
      setCoffee((prev) => ({ ...prev, drinkPrice: Math.round(prev.drinkPrice * scale) }));
      isUpdatingRef.current = false;
    },
    [calculateTheoreticalCheck, kitchen.dishes, coffee.drinkPrice, common.avgDishesPerGuest, common.avgDrinksPerGuest],
  );

  const handleAvgCheckChange = useCallback(
    (newValue: number) => {
      setHall((prev) => ({ ...prev, avgCheck: newValue }));
      updatePricesFromCheck(newValue);
    },
    [updatePricesFromCheck],
  );

  useEffect(() => {
    const shifts = Math.max(1, Math.ceil(common.operatingHours / common.shiftHours));
    const guestsPerShift = common.dailyGuests / shifts;
    const shiftMin = common.shiftHours * 60;
    const prepMin = shiftMin * (PREP_RATIO / 100);
    const availMin = shiftMin - prepMin;
    const cooks = Math.max(0, kitchen.cooks);
    const par = Math.max(1, kitchen.parallelism);
    const cap = availMin * cooks * par;
    const nCat = kitchen.dishes.length;
    const capPerCat = nCat > 0 ? cap / nCat : 0;

    let totalDishes = 0;
    let kitchenRev = 0;
    const minDishTime = Math.min(...kitchen.dishes.map((d) => d.time));
    const kitchenMaxDishes = Math.floor(cap / minDishTime);
    kitchen.dishes.forEach((d) => {
      const maxD = nCat > 0 ? Math.floor(capPerCat / Math.max(1, d.time)) : 0;
      totalDishes += maxD;
      kitchenRev += maxD * d.price;
    });

    const baristas = Math.max(0, coffee.baristas);
    const drinkTime = Math.max(1, coffee.drinkTime);
    const drinkPrice = Math.max(1, coffee.drinkPrice);
    const coffeeCap = baristas > 0 ? (availMin * 60 / drinkTime) * baristas : 0;
    const coffeeRev = coffeeCap * drinkPrice;
    const coffeeMaxDrinks = Math.floor(availMin * 60 / drinkTime) * baristas;

    const venue = VENUE_TYPES[hall.venueType] ?? VENUE_TYPES.cafe;
    let realisticGuestsPerShift = 0;
    let shiftRevenue = 0;
    let bottleneck = 'Зал';
    if (venue.hasHall) {
      realisticGuestsPerShift = guestsPerShift;
      const reqD = Math.ceil(realisticGuestsPerShift * common.avgDishesPerGuest);
      const reqDr = Math.ceil(realisticGuestsPerShift * common.avgDrinksPerGuest);
      const isKB = reqD > kitchenMaxDishes;
      const isCB = reqDr > coffeeMaxDrinks;
      bottleneck = isKB && isCB ? 'Кухня и бар' : isKB ? 'Кухня' : isCB ? 'Кофейня' : 'Зал';
      shiftRevenue = Math.min(realisticGuestsPerShift * hall.avgCheck, kitchenRev + coffeeRev);
    } else {
      shiftRevenue = kitchenRev + coffeeRev;
      bottleneck = 'Производство';
    }

    const dailyRevenue = shiftRevenue * shifts;
    const monthlyRevenue = dailyRevenue * 30;
    const kitRate = KITCHEN_TYPE_RATE[energy.kitchenType] || 27.5;
    const ventHall = Math.round(hall.hallArea * venue.hallRate);
    const ventKit = Math.round(hall.kitchenArea * kitRate);
    const dT = energy.indoorTemp - energy.climateZone;
    const sf = Math.max(1, energy.safetyFactor);
    const heatTotal = ((ventHall * dT * 0.335) / 1000 + (ventKit * dT * 0.335) / 1000) * sf;
    const totalEnergyCost = heatTotal * 720 * energy.electricityPrice + (energy.otherPower || 0) * 720 * energy.electricityPrice;
    const totalPayrollWithTaxes = (kitchen.cooks * shifts * hall.cookSalary + coffee.baristas * shifts * hall.baristaSalary + waitersCount * shifts * hall.waiterSalary + dishwashersCount * shifts * hall.dishwasherSalary) * 1.45 * staffMultiplier;
    const totalProd = kitchenRev + coffeeRev;
    const kitchenShare = totalProd > 0 ? kitchenRev / totalProd : 0;
    const coffeeShare = totalProd > 0 ? coffeeRev / totalProd : 0;
    const totalCOGS = dailyRevenue * kitchenShare * (hall.foodCostPercent / 100) * 30 + dailyRevenue * coffeeShare * (hall.drinkCostPercent / 100) * 30;
    const totalRent = hall.rentPerSqm * hall.totalArea;
    const monthlyProfit = monthlyRevenue - totalRent - totalPayrollWithTaxes - totalEnergyCost - totalCOGS;
    const maxGuestsPerDayFromSeats = venue.hasHall ? hall.seats * venue.maxTurnsPerDay : common.dailyGuests;

    setResults({
      monthlyRevenue, totalRent, totalEnergyCost, totalPayrollWithTaxes, totalCOGS,
      monthlyProfit, bottleneck, maxGuestsPerDayFromSeats, dailyRevenue,
      kitchenMaxDishes, coffeeMaxDrinks, realisticGuestsPerShift, shifts,
    });
  }, [common, hall, coffee, kitchen, energy, waitersCount, dishwashersCount, staffMultiplier]);

  const getActiveData = (): BusinessData => {
    if (viewMode === 'real' || !results) return baselineData;
    return recalcBusiness({
      ...baselineData,
      revenue: results.monthlyRevenue,
      rent: results.totalRent,
      utilities: results.totalEnergyCost,
      payroll: results.totalPayrollWithTaxes,
      costOfGoods: results.totalCOGS,
    });
  };
  const activeData = getActiveData();

  const bubbleData: BubbleDataContext = useMemo(() => ({
    ...activeData,
    shifts: results?.shifts,
    bottleneck: results?.bottleneck,
    maxGuestsPerDayFromSeats: results?.maxGuestsPerDayFromSeats,
    fmt,
    formatPercent,
  }), [activeData, results]);

  const diagnostics = useMemo(() => {
    if (activeData.revenue <= 0) return null;
    return runDiagnostics({
      revenue: activeData.revenue, rent: activeData.rent, utilities: activeData.utilities,
      payroll: activeData.payroll, managementCosts: activeData.managementCosts,
      costOfGoods: activeData.costOfGoods, otherExpenses: activeData.otherExpenses,
      healthIndex: activeData.healthIndex, totalArea: activeData.totalArea,
      hallArea: activeData.hallArea, seats: activeData.seats,
      dailyGuests: activeData.dailyGuests, avgCheck: activeData.avgCheck,
      venueType: activeData.venueType, staffCount: activeData.staffCount,
      maxGuestsPerDayFromSeats: results?.maxGuestsPerDayFromSeats,
      bottleneck: results?.bottleneck,
      marketingExpenses: activeData.marketingExpenses,
      wasteLosses: activeData.wasteLosses,
      deliveryCommission: activeData.deliveryCommission,
      staffTurnoverRate: activeData.staffTurnoverRate,
    });
  }, [activeData, results]);

  const saveBusinessData = async (newData: Partial<BusinessData>) => {
    const updated = recalcBusiness(newData);
    setBaselineData(updated);
    localStorage.setItem('momentoBusinessData', JSON.stringify(updated));
    try {
      await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      toast.success('Данные сохранены');
    } catch {
      toast.error('Ошибка сохранения');
    }
  };

  const recommendations = getRecommendations(activeData);
  const healthColor = activeData.healthIndex >= 70 ? 'bg-emerald-500' : activeData.healthIndex >= 40 ? 'bg-amber-500' : 'bg-red-500';

  if (loading) return <ErrorBoundary><DashboardSkeleton /></ErrorBoundary>;

  return (
    <ErrorBoundary>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">

        {/* Пустое состояние */}
        {baselineData.revenue === 0 && (
          <Card className="mb-8 border-dashed border-2 border-primary/50 bg-primary/5">
            <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary"><Database className="h-8 w-8" /></div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Начните с вводных данных</h2>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">Чтобы увидеть аналитику и получить рекомендации, введите базовые финансовые показатели.</p>
                </div>
              </div>
              <Button size="lg" onClick={() => setIsModalOpen(true)}><Edit className="h-5 w-5 mr-2" />Ввести данные</Button>
            </CardContent>
          </Card>
        )}

        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">

          {/* Заголовок + переключатель режима */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-foreground truncate">{activeData.name || 'Аналитика'}</h1>
              <p className="text-sm text-muted-foreground mt-0.5 truncate">{activeData.address} · {VENUE_LABELS[activeData.venueType] ?? activeData.venueType}</p>
            </div>
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
              <button onClick={() => setViewMode('real')} className={cn('px-4 py-2 rounded-md text-sm font-medium transition-all', viewMode === 'real' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>Реальные данные</button>
              <button onClick={() => setViewMode('model')} className={cn('px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5', viewMode === 'model' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground')}><SlidersHorizontal className="h-4 w-4" />Моделирование</button>
            </div>
          </div>

          {/* KPI */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold text-foreground">Ключевые показатели</span>
              <InfoPopover>
                <BubbleRowFromConfig blockId="kpi" data={bubbleData} />
              </InfoPopover>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <KPICard icon={Wallet} label={viewMode === 'model' ? 'Выручка / мес' : 'Дневная выручка'} value={viewMode === 'model' ? `${fmt(activeData.revenue)} ₽` : `${fmt(Math.round(activeData.revenue / 30))} ₽`} sub={viewMode === 'model' ? undefined : `${fmt(activeData.revenue)} ₽/мес`} colorLevel="neutral" />
              <KPICard icon={UtensilsCrossed} label="Стоимость продуктов" value={`${formatPercent(activeData.foodCostPercent)}%`} sub={`${fmt(activeData.costOfGoods)} ₽`} colorLevel={getColorLevel('foodCostPercent', activeData.foodCostPercent).color} />
              <KPICard icon={Building2} label="Аренда + Коммунал." value={`${formatPercent(activeData.rentPercent + activeData.utilitiesPercent)}%`} sub={`${fmt(activeData.rent + activeData.utilities)} ₽`} colorLevel={getColorLevel('rentPercent', activeData.rentPercent).color} />
              <KPICard icon={Users} label="Сотрудников / ФОТ" value={`${activeData.staffCount} чел`} sub={`${formatPercent(activeData.payrollPercent)}%`} colorLevel={getColorLevel('payrollPercent', activeData.payrollPercent).color} />
              <KPICard icon={Receipt} label="Прочие расходы" value={`${formatPercent(activeData.otherPercent + activeData.managementPercent)}%`} sub={`${fmt(activeData.otherExpenses + activeData.managementCosts)} ₽`} colorLevel={activeData.otherPercent > 10 ? 'orange' : 'neutral'} />
              <KPICard icon={PiggyBank} label="Прибыль" value={`${formatPercent(activeData.profitPercent)}%`} sub={`${fmt(activeData.operatingProfit)} ₽`} colorLevel={getColorLevel('profitPercent', activeData.profitPercent).color} />
            </div>
          </div>

        </div>
        {/* Конец Sticky Header */}

        {/* ============================================================
            БЛОК 0: ДИАГНОСТИКА И ТОЧКИ РОСТА (САМЫЙ ВЕРХ)
            ============================================================ */}
        {diagnostics && (
          <Card className="mb-6 py-0 gap-0">
            <CardHeader className="pb-0">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-red-500" />
                <CardTitle className="text-lg font-bold">Диагностика и точки роста</CardTitle>
                <InfoPopover>
                  <BubbleRowFromConfig blockId="diagnostics" data={bubbleData} />
                </InfoPopover>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-emerald-500">
                  <CardHeader className="pb-0"><CardTitle className="text-sm">Потенциал роста</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-emerald-600">+{fmt(diagnostics.growthPotential.totalPotential)} ₽</p>
                    <p className="text-xs text-muted-foreground">{diagnostics.growthPotential.totalPotentialPercent.toFixed(1)}% от текущей выручки</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500">
                  <CardHeader className="pb-0"><CardTitle className="text-sm">Потери / мес</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-red-600">{fmt(diagnostics.efficiencyLosses.reduce((s, l) => s + l.monthlyLoss, 0))} ₽</p>
                    <p className="text-xs text-muted-foreground">{diagnostics.efficiencyLosses.length} направлений</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                  <CardHeader className="pb-0"><CardTitle className="text-sm">Узких мест</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-amber-600">{diagnostics.bottlenecks.length}</p>
                    <p className="text-xs text-muted-foreground">{diagnostics.bottlenecks.map((b) => b.name).join(', ') || 'Нет'}</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ============================================================
            БЛОК 1: ВОЗМОЖНОСТИ (СВОРАЧИВАЕМЫЙ)
            ============================================================ */}
        {(recommendations.length > 0 || diagnostics) && (
          <Accordion className="mb-6">
            <AccordionItem value="possibilities" className="border rounded-lg bg-card">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-semibold">Возможности</span>
                  <Badge variant="secondary" className="text-[10px]">{recommendations.length + (diagnostics?.hypotheses.length || 0)}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground">Справка:</span>
                    <InfoPopover>
                      <BubbleRowFromConfig blockId="possibilities" data={bubbleData} />
                    </InfoPopover>
                  </div>

                  {recommendations.map((r) => (
                    <div key={r.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
                      <div className={cn('p-1.5 rounded-md shrink-0 mt-0.5',
                        r.colorLevel === 'green' ? 'bg-emerald-100 text-emerald-600' :
                        r.colorLevel === 'orange' ? 'bg-amber-100 text-amber-600' :
                        'bg-red-100 text-red-600'
                      )}>
                        {r.colorLevel === 'green' ? <CheckCircle className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-sm font-medium text-foreground">{r.title}</span>
                          <Badge variant={levelBadge[r.colorLevel]} className="text-[10px] px-1.5 py-0">{r.value}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{r.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-foreground tabular-nums">
                          {r.colorLevel === 'green' ? '+' : r.colorLevel === 'orange' ? '~' : '-'}
                          {fmt(activeData.revenue * (parseFloat(r.value) / 100))} ₽
                        </p>
                        <p className="text-[10px] text-muted-foreground">эффект/мес</p>
                      </div>
                    </div>
                  ))}

                  {diagnostics && diagnostics.hypotheses.length > 0 && (
                    <>
                      <Separator className="my-2" />
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Мероприятия</p>
                      {diagnostics.hypotheses.map((h) => (
                        <div key={h.id} className="p-3 rounded-lg border bg-background">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <ArrowUp className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span className="text-sm font-semibold">{h.title}</span>
                              <Badge variant="outline" className="text-[10px]">
                                {h.implementation.complexity === 'easy' ? 'Легко' : 'Средне'}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{h.description}</p>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-muted-foreground">Профит: <strong className="text-emerald-600">+{fmt(h.expectedEffect.profit)} ₽</strong></span>
                            <span className="text-muted-foreground">Вероятность: <strong>{Math.round(h.expectedEffect.probability * 100)}%</strong></span>
                            <span className="text-muted-foreground">Срок: <strong>{h.implementation.time}</strong></span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* ============================================================
            БЛОК 2: СТРУКТУРА ВЫРУЧКИ (СВОРАЧИВАЕМЫЙ)
            ============================================================ */}
        <Accordion className="mb-6">
          <AccordionItem value="revenue-structure" className="border rounded-lg bg-card">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Структура выручки {viewMode === 'model' ? '(прогноз)' : ''}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="pt-2 space-y-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-muted-foreground">Справка:</span>
                  <InfoPopover>
                    <BubbleRowFromConfig blockId="revenue-structure" data={bubbleData} />
                  </InfoPopover>
                </div>

                {Object.values(METRICS_CONFIG).map((metric) => {
                  if (metric.key === 'profitPercent') return null;
                  const value = activeData[metric.key as keyof BusinessData] ?? 0;
                  const colorLevel = metric.affectsHealth ? getColorLevel(metric.key, Number(value)).color : 'neutral';
                  const target = metric.affectsHealth ? `${metric.higherIsBetter ? '→' : '≤'} ${metric.green}%` : undefined;
                  return <ExpenseBar key={metric.key} label={metric.label} value={Number(value)} target={target} colorLevel={colorLevel} />;
                })}
                <Separator className="my-2" />
                <ExpenseBar label="Опер. прибыль" value={activeData.profitPercent} target="→ 15%+" colorLevel={getColorLevel('profitPercent', activeData.profitPercent).color} />
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-foreground">Индекс здоровья</span>
                    <span className="font-bold tabular-nums text-foreground">{activeData.healthIndex}%</span>
                  </div>
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className={cn('h-full rounded-full transition-all duration-500', healthColor)} style={{ width: `${activeData.healthIndex}%` }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    {activeData.healthIndex >= 70 ? 'Бизнес в хорошей форме' : activeData.healthIndex >= 40 ? 'Есть точки для улучшения' : 'Требуется внимание'}
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* ============================================================
            БЛОК 3: ТИП, ЛОКАЦИЯ И РЫНОК
            ============================================================ */}
        <Card className="mb-6 py-0 gap-0">
          <CardHeader className="pb-0">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Тип, локация и рынок</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Тип заведения */}
              <div className="space-y-3 p-3 rounded-lg border bg-muted/20">
                <div className="flex items-center gap-2">
                  <Store className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Тип заведения</span>
                  <InfoPopover>
                    <BubbleRowFromConfig blockId="type-location-market" subBlockId="venue-type" data={bubbleData} />
                  </InfoPopover>
                </div>
                {viewMode === 'model' ? (
                  <SelectField label="" value={hall.venueType} onChange={(v) => setHall((p) => ({ ...p, venueType: v }))} options={Object.entries(VENUE_TYPES).map(([k, v]) => ({ value: k, label: v.label }))} />
                ) : (
                  <div><p className="text-sm font-semibold">{VENUE_LABELS[activeData.venueType] || '—'}</p><p className="text-[11px] text-muted-foreground">{activeData.totalArea > 0 ? `${activeData.totalArea} м² общая` : '—'}</p></div>
                )}
              </div>

              {/* Помещение и аренда */}
              <div className="space-y-3 p-3 rounded-lg border bg-muted/20">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Помещение и аренда</span>
                  <InfoPopover>
                    <BubbleRowFromConfig blockId="type-location-market" subBlockId="premises-rent" data={bubbleData} />
                  </InfoPopover>
                </div>
                {viewMode === 'model' ? (
                  <div className="space-y-2">
                    <InlineSlider label="Общая S" value={hall.totalArea} onChange={(v) => setHall((p) => ({ ...p, totalArea: v }))} max={2000} unit=" м²" />
                    <InlineSlider label="S зала" value={hall.hallArea} onChange={(v) => setHall((p) => ({ ...p, hallArea: v }))} max={1000} unit=" м²" />
                    <InlineSlider label="S кухни" value={hall.kitchenArea} onChange={(v) => setHall((p) => ({ ...p, kitchenArea: v }))} max={500} unit=" м²" />
                    <InlineSlider label="Аренда / м²" value={hall.rentPerSqm} onChange={(v) => setHall((p) => ({ ...p, rentPerSqm: v }))} max={20000} step={50} unit=" ₽" />
                  </div>
                ) : (
                  <div><p className="text-sm font-semibold">{fmt(activeData.rent)} ₽/мес</p><p className="text-[11px] text-muted-foreground">{activeData.totalArea} м² · {activeData.hallArea} м² зал · {activeData.seats} мест</p></div>
                )}
              </div>

              {/* Зал и загрузка */}
              <div className="space-y-3 p-3 rounded-lg border bg-muted/20">
                <div className="flex items-center gap-2">
                  <Armchair className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Зал и загрузка</span>
                  <InfoPopover>
                    <BubbleRowFromConfig blockId="type-location-market" subBlockId="hall-load" data={bubbleData} />
                  </InfoPopover>
                </div>
                {viewMode === 'model' ? (
                  <div className="space-y-2">
                    <InlineSlider label="Места" value={hall.seats} onChange={(v) => setHall((p) => ({ ...p, seats: v }))} max={300} unit=" чел" />
                    <InlineSlider label="Гостей / день" value={common.dailyGuests} onChange={(v) => setCommon((p) => ({ ...p, dailyGuests: v }))} max={500} unit=" чел" />
                    <InlineSlider label="Средний чек" value={hall.avgCheck} onChange={(v) => handleAvgCheckChange(v)} max={10000} step={50} unit=" ₽" />
                  </div>
                ) : (
                  <div><p className="text-sm font-semibold">{activeData.dailyGuests} чел/см</p><p className="text-[11px] text-muted-foreground">{activeData.seats} мест · Чек: {fmt(activeData.avgCheck)} ₽</p></div>
                )}
              </div>

              {/* Персонал */}
              <div className="space-y-3 p-3 rounded-lg border bg-muted/20">
                <div className="flex items-center gap-2">
                  <UserCog className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Персонал</span>
                  <InfoPopover>
                    <BubbleRowFromConfig blockId="type-location-market" subBlockId="staff" data={bubbleData} />
                  </InfoPopover>
                </div>
                {viewMode === 'model' ? (
                  <div className="space-y-2">
                    <InlineSlider label="Повара" value={kitchen.cooks} onChange={(v) => setKitchen((p) => ({ ...p, cooks: v }))} min={1} max={20} unit=" чел" />
                    <InlineSlider label="Бариста" value={coffee.baristas} onChange={(v) => setCoffee((p) => ({ ...p, baristas: v }))} min={0} max={10} unit=" чел" />
                    <InlineSlider label="Официанты" value={waitersCount} onChange={setWaitersCount} min={0} max={15} unit=" чел" />
                    <InlineSlider label="Мойщики" value={dishwashersCount} onChange={setDishwashersCount} min={0} max={8} unit=" чел" />
                  </div>
                ) : (
                  <div><p className="text-sm font-semibold">{activeData.staffCount} чел/см</p><p className="text-[11px] text-muted-foreground">ФОТ: {fmt(activeData.payroll)} ₽/мес ({formatPercent(activeData.payrollPercent)}%)</p></div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {/* Foodcost */}
              <div className="space-y-3 p-3 rounded-lg border bg-muted/20">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Foodcost</span>
                  <InfoPopover>
                    <BubbleRowFromConfig blockId="type-location-market" subBlockId="food-cost" data={bubbleData} />
                  </InfoPopover>
                </div>
                {viewMode === 'model' ? (
                  <div className="space-y-2">
                    <InlineSlider label="Себестоимость блюд" value={hall.foodCostPercent} onChange={(v) => setHall((p) => ({ ...p, foodCostPercent: v }))} max={60} unit=" %" />
                    <InlineSlider label="Себестоимость напитков" value={hall.drinkCostPercent} onChange={(v) => setHall((p) => ({ ...p, drinkCostPercent: v }))} max={60} unit=" %" />
                  </div>
                ) : (
                  <div><p className="text-sm font-semibold">{fmt(activeData.costOfGoods)} ₽</p><p className="text-[11px] text-muted-foreground">{formatPercent(activeData.foodCostPercent)}% от выручки</p></div>
                )}
              </div>

              {/* Энергопотребление */}
              <div className="space-y-3 p-3 rounded-lg border bg-muted/20">
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Энергопотребление</span>
                  <InfoPopover>
                    <BubbleRowFromConfig blockId="type-location-market" subBlockId="energy" data={bubbleData} />
                  </InfoPopover>
                </div>
                {viewMode === 'model' ? (
                  <div className="space-y-2">
                    <SelectField label="" value={energy.kitchenType} onChange={(v) => setEnergy((p) => ({ ...p, kitchenType: v }))} options={[{ value: 'hot', label: 'Горячая' }, { value: 'cold', label: 'Холодная' }, { value: 'mixed', label: 'Смешанная' }]} />
                    <InlineSlider label="Тариф э/э" value={energy.electricityPrice} onChange={(v) => setEnergy((p) => ({ ...p, electricityPrice: v }))} max={20} step={0.5} unit=" ₽/кВт" />
                    <InlineSlider label="Прочие мощности" value={energy.otherPower} onChange={(v) => setEnergy((p) => ({ ...p, otherPower: v }))} max={100} unit=" кВт" />
                  </div>
                ) : (
                  <div><p className="text-sm font-semibold">{fmt(activeData.utilities)} ₽</p><p className="text-[11px] text-muted-foreground">{formatPercent(activeData.utilitiesPercent)}% от выручки</p></div>
                )}
              </div>

              {/* Локация */}
              <div className="space-y-3 p-3 rounded-lg border bg-muted/20">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Локация</span>
                  <InfoPopover>
                    <BubbleRowFromConfig blockId="type-location-market" subBlockId="market-location" data={bubbleData} />
                  </InfoPopover>
                </div>
                {viewMode === 'model' ? (
                  <div className="space-y-2">
                    <SelectField label="Район" value={location.district} onChange={(v) => setLocation((p) => ({ ...p, district: v }))} options={DISTRICTS} />
                    <SelectField label="Тип локации" value={location.locationType} onChange={(v) => setLocation((p) => ({ ...p, locationType: v }))} options={LOCATION_TYPES} />
                    <InlineSlider label="Конкуренты" value={location.competitors} onChange={(v) => setLocation((p) => ({ ...p, competitors: v }))} max={50} unit=" шт" />
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold">{activeData.address || '—'}</p>
                    <p className="text-[11px] text-muted-foreground">Район · Тип локации</p>
                  </div>
                )}
                {/* Кликабельная подсказка через <details> */}
                <details className="mt-2">
                  <summary className="py-1 text-xs font-medium text-primary hover:underline cursor-pointer list-none">
                    Как оценить аудиторию ▼
                  </summary>
                  <div className="text-xs text-muted-foreground leading-relaxed mt-1 pl-2 border-l-2 border-primary/30">
                    Потенциальная аудитория = Общее население/поток × % целевой аудитории × % конверсии в общепит. Доступный поток = Потенциал / (1 + Конкуренты × Влияние). Влияние: 0.2-0.4 локальные, 0.5-0.8 сетевые. Данные: mosmap.ru/report/infra.html
                  </div>
                </details>
              </div>

              {/* Макс. производительность */}
              <div className="space-y-3 p-3 rounded-lg border bg-muted/20">
                <div className="flex items-center gap-2">
                  <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Макс. производительность</span>
                  <InfoPopover>
                    <BubbleRowFromConfig blockId="type-location-market" subBlockId="productivity" data={bubbleData} />
                  </InfoPopover>
                </div>
                <div>
                  {results && viewMode === 'model' ? (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Блюд/смену: <strong className="text-foreground">{results.kitchenMaxDishes}</strong></p>
                      <p className="text-xs text-muted-foreground">Напитков/смену: <strong className="text-foreground">{results.coffeeMaxDrinks}</strong></p>
                      <p className="text-xs text-muted-foreground">Гостей max/день: <strong className="text-foreground">{results.maxGuestsPerDayFromSeats}</strong></p>
                      <Badge variant="outline" className="text-[10px] mt-1">Bottleneck: {results.bottleneck}</Badge>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Доступно в режиме моделирования</p>
                  )}
                </div>
              </div>
            </div>

            {viewMode === 'model' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                {/* Кухня (детали) */}
                <div className="space-y-3 p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-3.5 w-3.5 text-orange-500" />
                    <span className="text-xs font-medium text-muted-foreground">Кухня</span>
                    <Badge variant="outline" className="text-[10px]">{kitchen.cooks} повар · {results?.kitchenMaxDishes ?? '—'} блюд/см</Badge>
                    <InfoPopover>
                      <BubbleRowFromConfig blockId="kitchen-bar" subBlockId="cuisine-stations" data={bubbleData} />
                    </InfoPopover>
                  </div>
                  <div className="space-y-2">
                    <InlineSlider label="Количество поваров" value={kitchen.cooks} onChange={(v) => setKitchen((p) => ({ ...p, cooks: v }))} min={1} max={15} unit=" чел" />
                    <InlineSlider label="Параллелизм (станций)" value={kitchen.parallelism} onChange={(v) => setKitchen((p) => ({ ...p, parallelism: v }))} min={1} max={10} unit=" ст." />
                    <InlineSlider label="Зарплата повара" value={hall.cookSalary} onChange={(v) => setHall((p) => ({ ...p, cookSalary: v }))} max={200000} step={5000} unit=" ₽" />
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mt-2">Меню (категории блюд)</p>
                    {kitchen.dishes.map((dish) => (
                      <div key={dish.id} className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground"><span>{dish.name}</span><span>{fmt(dish.price)} ₽</span></div>
                        <InlineSlider label="" value={dish.time} onChange={(v) => setKitchen((p) => ({ ...p, dishes: p.dishes.map((d) => d.id === dish.id ? { ...d, time: v } : d) }))} min={1} max={120} unit=" мин" />
                      </div>
                    ))}
                    <InlineSlider label="Блюд на гостя" value={common.avgDishesPerGuest} onChange={(v) => setCommon((p) => ({ ...p, avgDishesPerGuest: v }))} max={5} step={0.1} unit=" шт" />
                  </div>
                </div>

                {/* Бар / Кофейная станция (детали) */}
                <div className="space-y-3 p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Coffee className="h-3.5 w-3.5 text-amber-600" />
                    <span className="text-xs font-medium text-muted-foreground">Бар / Кофейная станция</span>
                    <Badge variant="outline" className="text-[10px]">{coffee.baristas} бариста · {results?.coffeeMaxDrinks ?? '—'} нап/см</Badge>
                    <InfoPopover>
                      <BubbleRowFromConfig blockId="kitchen-bar" subBlockId="bar-station" data={bubbleData} />
                    </InfoPopover>
                  </div>
                  <div className="space-y-2">
                    <InlineSlider label="Количество бариста" value={coffee.baristas} onChange={(v) => setCoffee((p) => ({ ...p, baristas: v }))} min={0} max={10} unit=" чел" />
                    <InlineSlider label="Зарплата бариста" value={hall.baristaSalary} onChange={(v) => setHall((p) => ({ ...p, baristaSalary: v }))} max={150000} step={5000} unit=" ₽" />
                    <InlineSlider label="Время напитка" value={coffee.drinkTime} onChange={(v) => setCoffee((p) => ({ ...p, drinkTime: v }))} min={10} max={300} unit=" сек" />
                    <InlineSlider label="Средняя цена напитка" value={coffee.drinkPrice} onChange={(v) => setCoffee((p) => ({ ...p, drinkPrice: v }))} max={2000} step={25} unit=" ₽" />
                    <InlineSlider label="Напитков на гостя" value={common.avgDrinksPerGuest} onChange={(v) => setCommon((p) => ({ ...p, avgDrinksPerGuest: v }))} max={5} step={0.1} unit=" шт" />
                  </div>
                </div>

                {/* Энергетика и климат (детали) */}
                <div className="space-y-3 p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-xs font-medium text-muted-foreground">Энергетика и климат</span>
                    <Badge variant="outline" className="text-[10px]">{fmt(Math.round(results?.totalEnergyCost ?? 0))} ₽/мес</Badge>
                    <InfoPopover>
                      <BubbleRowFromConfig blockId="kitchen-bar" subBlockId="climate-energy" data={bubbleData} />
                    </InfoPopover>
                  </div>
                  <div className="space-y-2">
                    <SelectField label="Тип кухни" value={energy.kitchenType} onChange={(v) => setEnergy((p) => ({ ...p, kitchenType: v }))} options={[{ value: 'hot', label: 'Горячая (37.5 Вт/м²)' }, { value: 'cold', label: 'Холодная (17.5 Вт/м²)' }, { value: 'mixed', label: 'Смешанная (27.5 Вт/м²)' }]} />
                    <InlineSlider label="Мин. температура (зимний)" value={energy.climateZone} onChange={(v) => setEnergy((p) => ({ ...p, climateZone: v }))} min={-50} max={10} unit=" °C" />
                    <InlineSlider label="Температура внутри" value={energy.indoorTemp} onChange={(v) => setEnergy((p) => ({ ...p, indoorTemp: v }))} min={16} max={30} unit=" °C" />
                    <InlineSlider label="Коэфф. запаса" value={energy.safetyFactor} onChange={(v) => setEnergy((p) => ({ ...p, safetyFactor: v }))} min={1} max={2} step={0.1} unit="x" />
                    <InlineSlider label="Тариф электроэнергии" value={energy.electricityPrice} onChange={(v) => setEnergy((p) => ({ ...p, electricityPrice: v }))} max={20} step={0.5} unit=" ₽/кВт" />
                    <InlineSlider label="Прочее оборудование" value={energy.otherPower} onChange={(v) => setEnergy((p) => ({ ...p, otherPower: v }))} max={200} unit=" кВт" />
                  </div>
                </div>

                {/* График работы (детали) */}
                <div className="space-y-3 p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-violet-500" />
                    <span className="text-xs font-medium text-muted-foreground">График работы</span>
                    <Badge variant="outline" className="text-[10px]">{results?.shifts ?? '—'} смен · {common.operatingHours} ч</Badge>
                    <InfoPopover>
                      <BubbleRowFromConfig blockId="kitchen-bar" subBlockId="staff-schedule" data={bubbleData} />
                    </InfoPopover>
                  </div>
                  <div className="space-y-2">
                    <InlineSlider label="Часов работы / день" value={common.operatingHours} onChange={(v) => setCommon((p) => ({ ...p, operatingHours: v }))} min={4} max={24} unit=" ч" />
                    <InlineSlider label="Часов в смене" value={common.shiftHours} onChange={(v) => setCommon((p) => ({ ...p, shiftHours: v }))} min={4} max={16} unit=" ч" />
                    <p className="text-xs text-muted-foreground">Расчётных смен: <strong>{results?.shifts ?? '—'}</strong></p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Кнопка редактирования */}
        {baselineData.revenue > 0 && (
          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={() => setIsModalOpen(true)}><Edit className="h-4 w-4 mr-2" />Редактировать данные</Button>
          </div>
        )}

        <DataModal open={isModalOpen} onOpenChange={setIsModalOpen} data={baselineData} onSave={saveBusinessData} />
      </div>
    </ErrorBoundary>
  );
}