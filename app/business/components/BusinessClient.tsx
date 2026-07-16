'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Settings, Armchair, Coffee, Flame, Building, Zap, Gauge,
  Plus, TrendingUp, AlertTriangle, MapPin, BarChart3,
  CheckCircle, Users, Clock, DollarSign, Info, ChefHat,
  ChevronDown, LayoutGrid, Wallet, Timer, PieChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

/* ============================================================
   ТИПЫ
   ============================================================ */
interface Dish { id: string; name: string; time: number; price: number; }

interface CommonSettings {
  shiftHours: number; operatingHours: number;
  dailyGuests: number;
  avgDishesPerGuest: number;
  avgDrinksPerGuest: number;
}

interface HallSettings {
  venueType: string; seats: number; avgCheck: number; hallArea: number;
  kitchenArea: number; totalArea: number; rentPerSqm: number;
  cookSalary: number; baristaSalary: number; waiterSalary: number;
  dishwasherSalary: number; waiterRatio: number; dishwasherRatio: number;
  foodCostPercent: number; drinkCostPercent: number;
}

interface CoffeeSettings { baristas: number; drinkTime: number; drinkPrice: number; }
interface KitchenSettings { cooks: number; parallelism: number; dishes: Dish[]; }

interface EnergySettings {
  kitchenType: string; climateZone: number; indoorTemp: number;
  safetyFactor: number; electricityPrice: number;
  otherPower: number;
}

interface LocationSettings {
  district: string;
  locationType: string;
  competitors: number;
  competitorInfluence: number;
  totalPopulation: number;
  targetAudiencePercent: number;
  conversionRate: number;
  potentialGuests: number;
}

interface DashboardData {
  name?: string; address?: string; venueType?: string;
  totalArea?: number; hallArea?: number; seats?: number; staffCount?: number;
  monthlyRevenue?: number; revenue?: number; avgCheck?: number;
  rent?: number; utilities?: number; fot?: number; payroll?: number;
  managementCost?: number; costOfGoods?: number; otherExpenses?: number;
  foodCostPercent?: number; drinkCostPercent?: number;
}

/* ============================================================
   КОНСТАНТЫ
   ============================================================ */
const PREP_RATIO = 15;
const PEAK_MINUTES = 60;

const VENUE_TYPES: Record<string, {
  label: string; hallRate: number; waiterRatio: number; dishwasherRatio: number;
  guestTime: number; turnsPerShift: number; hasHall: boolean;
  areaPerSeat: [number, number];
  areaPerCook: [number, number];
  maxTurnsPerDay: number;
}> = {
  restaurant: { label: 'Ресторан', hallRate: 3.0, waiterRatio: 20, dishwasherRatio: 100, guestTime: 50, turnsPerShift: 1.8, hasHall: true, areaPerSeat: [2.5, 3.5], areaPerCook: [5, 6], maxTurnsPerDay: 2 },
  coffee: { label: 'Кофейня', hallRate: 3.5, waiterRatio: 40, dishwasherRatio: 100, guestTime: 25, turnsPerShift: 3.0, hasHall: true, areaPerSeat: [1.5, 1.8], areaPerCook: [4, 5], maxTurnsPerDay: 4 },
  cafe: { label: 'Кафе', hallRate: 3.2, waiterRatio: 40, dishwasherRatio: 100, guestTime: 35, turnsPerShift: 2.2, hasHall: true, areaPerSeat: [1.8, 2.2], areaPerCook: [5, 6], maxTurnsPerDay: 3 },
  canteen: { label: 'Столовая', hallRate: 4.5, waiterRatio: 0, dishwasherRatio: 100, guestTime: 20, turnsPerShift: 3.5, hasHall: true, areaPerSeat: [1.8, 2.2], areaPerCook: [5, 6], maxTurnsPerDay: 4 },
  fastfood: { label: 'Быстрое обслуживание', hallRate: 4.0, waiterRatio: 0, dishwasherRatio: 100, guestTime: 10, turnsPerShift: 4.5, hasHall: true, areaPerSeat: [1.2, 1.5], areaPerCook: [3, 4], maxTurnsPerDay: 5 },
  darkkitchen: { label: 'Дарк китчен (доставка)', hallRate: 0, waiterRatio: 0, dishwasherRatio: 50, guestTime: 0, turnsPerShift: 0, hasHall: false, areaPerSeat: [0, 0], areaPerCook: [6, 8], maxTurnsPerDay: 0 },
};

const KITCHEN_TYPE_RATE: Record<string, number> = { hot: 37.5, cold: 17.5, mixed: 27.5 };

const CLIMATE_ZONES = [
  { label: 'Краснодар', temp: -15 },
  { label: 'Ростов-на-Дону', temp: -22 },
  { label: 'Санкт-Петербург', temp: -24 },
  { label: 'Москва', temp: -25 },
  { label: 'Екатеринбург', temp: -28 },
  { label: 'Казань', temp: -27 },
  { label: 'Новосибирск', temp: -32 },
  { label: 'Якутск', temp: -36 },
];

const DISTRICTS = [
  { value: 'central', label: 'ЦАО' },
  { value: 'west', label: 'ЗАО' },
  { value: 'east', label: 'ВАО' },
  { value: 'north', label: 'САО' },
  { value: 'southeast', label: 'ЮВАО' },
  { value: 'southwest', label: 'ЮЗАО' },
  { value: 'northwest', label: 'СЗАО' },
  { value: 'zelenograd', label: 'ЗелАО' },
];

const DISTRICT_RENT_RATES: Record<string, Record<string, [number, number]>> = {
  central: { residential: [1500, 3000], mall: [4000, 8000], business_center: [3000, 6000], street: [8000, 12000] },
  west: { residential: [1500, 3000], mall: [3000, 6000], business_center: [2000, 4000], street: [4000, 6000] },
  east: { residential: [1500, 2500], mall: [3000, 5000], business_center: [2000, 4000], street: [3000, 5000] },
  north: { residential: [1500, 3000], mall: [3000, 5000], business_center: [2000, 4000], street: [3000, 5000] },
  southeast: { residential: [1500, 2500], mall: [3000, 5000], business_center: [2000, 4000], street: [3000, 5000] },
  southwest: { residential: [1500, 2800], mall: [3000, 5500], business_center: [2000, 4000], street: [3500, 5500] },
  northwest: { residential: [1500, 2700], mall: [3000, 5000], business_center: [2200, 4200], street: [3500, 5500] },
  zelenograd: { residential: [1200, 2200], mall: [2500, 4000], business_center: [1800, 3500], street: [3000, 4500] },
};

const TARGET_RENT_SHARE: Record<string, [number, number]> = {
  residential: [6, 9], mall: [10, 15], business_center: [8, 12], street: [10, 18],
};

const LOCATION_DEFAULTS: Record<string, { totalPopulation: number; targetAudiencePercent: number; conversionRate: number }> = {
  residential: { totalPopulation: 30, targetAudiencePercent: 40, conversionRate: 8 },
  mall: { totalPopulation: 15, targetAudiencePercent: 15, conversionRate: 5 },
  business_center: { totalPopulation: 5, targetAudiencePercent: 15, conversionRate: 10 },
  street: { totalPopulation: 10, targetAudiencePercent: 10, conversionRate: 3 },
};

/* ============================================================
   ЗАГРУЗКА ДАННЫХ ИЗ localStorage
   ============================================================ */
function getDashboardData(): DashboardData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('momentoBusinessData');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

/* ============================================================
   ЦВЕТОВЫЕ МАППИНГИ (совместимы с дашбордом)
   ============================================================ */

type ColorLevel = 'green' | 'orange' | 'red' | 'neutral';

const levelBorder: Record<ColorLevel, string> = {
  green: 'border-l-emerald-500',
  orange: 'border-l-amber-500',
  red: 'border-l-red-500',
  neutral: 'border-l-primary',
};

const levelText: Record<ColorLevel, string> = {
  green: 'text-emerald-600',
  orange: 'text-amber-600',
  red: 'text-red-600',
  neutral: 'text-foreground',
};

const levelIconBg: Record<ColorLevel, string> = {
  green: 'bg-emerald-100 text-emerald-600',
  orange: 'bg-amber-100 text-amber-600',
  red: 'bg-red-100 text-red-600',
  neutral: 'bg-primary/10 text-primary',
};

/* ============================================================
   ОБЩИЕ КОМПОНЕНТЫ
   ============================================================ */

/* KPI-карточка — тот же стиль, что на дашборде */
function KPICard({
  icon: Icon, label, value, sub, colorLevel = 'neutral',
}: {
  icon: React.ElementType; label: string; value: string;
  sub?: string; colorLevel?: ColorLevel;
}) {
  return (
    <Card className={cn('border-l-4 overflow-hidden', levelBorder[colorLevel], 'py-0 gap-0')}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
            <p className={cn('text-lg font-bold tabular-nums leading-tight', levelText[colorLevel])}>
              {value}
            </p>
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

/* Слайдер — primary-цвет вместо emerald */
function SliderField({
  label, value, onChange, min = 0, max = 100, step = 1, unit = '', hint, warning, compact = false,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; unit?: string; hint?: string; warning?: string; compact?: boolean;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={cn('last:mb-0', compact ? 'mb-3' : 'mb-4')}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <Label className="!text-xs">{label}</Label>
          <div className="flex items-center gap-1">
            <input
              type="number" min={min} max={max} step={step} value={value}
              onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v))); }}
              className="w-18 text-right text-xs tabular-nums rounded-md border border-border bg-background px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary"
            />
            {unit && <span className="text-[11px] text-muted-foreground w-8">{unit}</span>}
          </div>
        </div>
      )}
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`,
          accentColor: '#4f46e5',
        }}
      />
      {hint && <p className="text-[11px] mt-1 text-muted-foreground">{hint}</p>}
      {warning && <p className="text-[11px] mt-1 text-destructive">{warning}</p>}
    </div>
  );
}

/* Простая обёртка для label — reuse shadcn pattern */
function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <label className={cn('text-xs font-medium text-muted-foreground block', className)}>{children}</label>;
}

/* Select через shadcn Select */
function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div className="mb-3 last:mb-0">
      <Label className="mb-1.5">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full text-xs h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

/* Результат-строка */
function ResultRow({ label, value, sub, bold, color }: {
  label: string; value: string; sub?: string; bold?: boolean; color?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={cn('text-xs', bold ? 'font-semibold text-foreground' : 'text-muted-foreground')}>{label}</span>
      <div className="text-right">
        <span className="text-xs tabular-nums font-medium" style={{ color: color || 'var(--foreground)' }}>{value}</span>
        {sub && <span className="text-[11px] ml-1.5 text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
}

/* HelpModal — shadcn Dialog */
function HelpModal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <Dialog open={isOpen} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed whitespace-pre-line">{children as string}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

/* Collapsible Section — стиль дашборда */
function CollapsibleSection({
  icon: Icon, title, children, helpKey, onHelp, defaultOpen = false, badge,
}: {
  icon: React.ElementType; title: string; children: React.ReactNode;
  helpKey?: string; onHelp?: (k: string) => void; defaultOpen?: boolean;
  badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="overflow-hidden py-0 gap-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {badge && (
            <Badge variant="secondary" className="text-[10px] font-medium">{badge}</Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {helpKey && onHelp && (
            <span
              onClick={(e) => { e.stopPropagation(); onHelp(helpKey); }}
              className="text-muted-foreground/40 hover:text-muted-foreground transition cursor-pointer"
            >
              <Info size={14} />
            </span>
          )}
          <ChevronDown
            size={16}
            className={cn('text-muted-foreground transition-transform duration-200', open && 'rotate-180')}
          />
        </div>
      </button>
      {open && (
        <CardContent className="pt-0 pb-4 px-4">
          <Separator className="mb-3" />
          {children}
        </CardContent>
      )}
    </Card>
  );
}

/* ============================================================
   ОСНОВНОЙ КОМПОНЕНТ
   ============================================================ */
export default function BusinessPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(() => getDashboardData());

  useEffect(() => {
    const handler = () => setDashboard(getDashboardData());
    window.addEventListener('focus', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('focus', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const defaultHall: HallSettings = {
    venueType: 'cafe', seats: 50, avgCheck: 500, hallArea: 75, kitchenArea: 40,
    totalArea: 110, rentPerSqm: 1090, cookSalary: 80000, baristaSalary: 60000,
    waiterSalary: 50000, dishwasherSalary: 40000, waiterRatio: 40, dishwasherRatio: 100,
    foodCostPercent: 30, drinkCostPercent: 25,
  };

  const initFromDashboard = (data: DashboardData | null): HallSettings => {
    if (!data) return defaultHall;
    const venue = VENUE_TYPES[data.venueType || 'cafe'] || VENUE_TYPES.cafe;
    const totalArea = data.totalArea ?? defaultHall.totalArea;
    const hallArea = data.hallArea ?? defaultHall.hallArea;
    const kitchenArea = (data.totalArea && data.hallArea)
      ? Math.max(1, totalArea - hallArea)
      : defaultHall.kitchenArea;
    const rentPerSqm = (data.rent && totalArea > 0)
      ? Math.round(data.rent / totalArea)
      : defaultHall.rentPerSqm;
    return {
      ...defaultHall,
      venueType: data.venueType || defaultHall.venueType,
      seats: data.seats ?? defaultHall.seats,
      avgCheck: data.avgCheck ?? defaultHall.avgCheck,
      hallArea, kitchenArea, totalArea, rentPerSqm,
      foodCostPercent: data.foodCostPercent ?? defaultHall.foodCostPercent,
      drinkCostPercent: data.drinkCostPercent ?? defaultHall.drinkCostPercent,
      waiterRatio: venue.waiterRatio,
      dishwasherRatio: venue.dishwasherRatio,
    };
  };

  const baseMenu: Dish[] = [
    { id: '1', name: 'Салаты', time: 10, price: 350 },
    { id: '2', name: 'Горячее', time: 35, price: 650 },
    { id: '3', name: 'Пицца', time: 15, price: 550 },
    { id: '4', name: 'Десерты', time: 8, price: 300 },
  ];
  const baseDrinkPrice = 250;

  const [hall, setHall] = useState<HallSettings>(initFromDashboard(dashboard));
  const [common, setCommon] = useState<CommonSettings>({
    shiftHours: 8, operatingHours: 14, dailyGuests: 50,
    avgDishesPerGuest: 0.8, avgDrinksPerGuest: 1.2,
  });
  const [coffee, setCoffee] = useState<CoffeeSettings>({ baristas: 2, drinkTime: 55, drinkPrice: baseDrinkPrice });
  const [kitchen, setKitchen] = useState<KitchenSettings>({
    cooks: 2, parallelism: 3, dishes: baseMenu.map(d => ({ ...d })),
  });
  const [energy, setEnergy] = useState<EnergySettings>({
    kitchenType: 'hot', climateZone: -25, indoorTemp: 22, safetyFactor: 1.1, electricityPrice: 5.5, otherPower: 0,
  });
  const [location, setLocation] = useState<LocationSettings>({
    district: 'central',
    locationType: 'street',
    competitors: 10,
    competitorInfluence: 0.3,
    totalPopulation: 10,
    targetAudiencePercent: 10,
    conversionRate: 3,
    potentialGuests: 0,
  });

  const [results, setResults] = useState<any>(null);
  const [helpModal, setHelpModal] = useState<{ block: string; open: boolean }>({ block: '', open: false });
  const [profitOpen, setProfitOpen] = useState(false);
  const isUpdatingRef = useRef(false);

  const computedPotentialGuests = useCallback((loc: LocationSettings) => {
    const { totalPopulation, targetAudiencePercent, conversionRate } = loc;
    const guests = totalPopulation * (targetAudiencePercent / 100) * (conversionRate / 100);
    return Math.round(guests * 10) / 10;
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const calc = computedPotentialGuests(location);
    if (Math.abs(location.potentialGuests - calc) > 0.01) {
      setLocation(prev => ({ ...prev, potentialGuests: calc }));
    }
  }, [location.totalPopulation, location.targetAudiencePercent, location.conversionRate, computedPotentialGuests, location.potentialGuests]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const calculateTheoreticalCheck = useCallback((dishes: Dish[], drinkPrice: number, dishesPerGuest: number, drinksPerGuest: number) => {
    const avgDishPrice = dishes.length > 0 ? dishes.reduce((sum, d) => sum + d.price, 0) / dishes.length : 0;
    return dishesPerGuest * avgDishPrice + drinksPerGuest * drinkPrice;
  }, []);

  const updatePricesFromCheck = useCallback((newCheck: number) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    const currentTheoretical = calculateTheoreticalCheck(kitchen.dishes, coffee.drinkPrice, common.avgDishesPerGuest, common.avgDrinksPerGuest);
    if (currentTheoretical === 0 || Math.abs(newCheck - currentTheoretical) < 1) { isUpdatingRef.current = false; return; }
    const scale = newCheck / currentTheoretical;
    setKitchen(prev => ({ ...prev, dishes: prev.dishes.map(d => ({ ...d, price: Math.round(d.price * scale) })) }));
    setCoffee(prev => ({ ...prev, drinkPrice: Math.round(prev.drinkPrice * scale) }));
    isUpdatingRef.current = false;
  }, [calculateTheoreticalCheck, kitchen.dishes, coffee.drinkPrice, common.avgDishesPerGuest, common.avgDrinksPerGuest]);

  const updateCheckFromPrices = useCallback((dishes: Dish[], drinkPrice: number) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    const theoreticalCheck = calculateTheoreticalCheck(dishes, drinkPrice, common.avgDishesPerGuest, common.avgDrinksPerGuest);
    setHall(prev => ({ ...prev, avgCheck: Math.round(theoreticalCheck) }));
    isUpdatingRef.current = false;
  }, [calculateTheoreticalCheck, common.avgDishesPerGuest, common.avgDrinksPerGuest]);

  const handleAvgCheckChange = useCallback((newValue: number) => {
    setHall(prev => ({ ...prev, avgCheck: newValue }));
    updatePricesFromCheck(newValue);
  }, [updatePricesFromCheck]);

  const updateDish = (id: string, field: keyof Dish, value: any) => {
    setKitchen(prev => {
      const newDishes = prev.dishes.map(d => d.id === id ? { ...d, [field]: value } : d);
      if (field === 'price') updateCheckFromPrices(newDishes, coffee.drinkPrice);
      return { ...prev, dishes: newDishes };
    });
  };

  const updateDrinkPrice = (newPrice: number) => {
    setCoffee(prev => {
      const updated = { ...prev, drinkPrice: newPrice };
      updateCheckFromPrices(kitchen.dishes, newPrice);
      return updated;
    });
  };

  const handleDishesPerGuestChange = (val: number) => {
    setCommon(prev => ({ ...prev, avgDishesPerGuest: val }));
    updateCheckFromPrices(kitchen.dishes, coffee.drinkPrice);
  };
  const handleDrinksPerGuestChange = (val: number) => {
    setCommon(prev => ({ ...prev, avgDrinksPerGuest: val }));
    updateCheckFromPrices(kitchen.dishes, coffee.drinkPrice);
  };

  const [waitersCount, setWaitersCount] = useState(() => {
    if (!dashboard) return 0;
    const venue = VENUE_TYPES[dashboard.venueType || 'cafe'] || VENUE_TYPES.cafe;
    return venue.hasHall && venue.waiterRatio > 0 ? Math.max(1, Math.ceil((dashboard.seats ?? 50) / venue.waiterRatio)) : 0;
  });
  const [dishwashersCount, setDishwashersCount] = useState(() => {
    if (!dashboard) return 0;
    const venue = VENUE_TYPES[dashboard.venueType || 'cafe'] || VENUE_TYPES.cafe;
    return venue.dishwasherRatio > 0 ? Math.max(1, Math.ceil((dashboard.hallArea ?? 75) / venue.dishwasherRatio)) : 0;
  });

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!dashboard) return;
    setHall(initFromDashboard(dashboard));
    const venue = VENUE_TYPES[dashboard.venueType || 'cafe'] || VENUE_TYPES.cafe;
    setWaitersCount(venue.hasHall && venue.waiterRatio > 0 ? Math.max(1, Math.ceil((dashboard.seats ?? 50) / venue.waiterRatio)) : 0);
    setDishwashersCount(venue.dishwasherRatio > 0 ? Math.max(1, Math.ceil((dashboard.hallArea ?? 75) / venue.dishwasherRatio)) : 0);
  }, [dashboard]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const theoreticalCheck = calculateTheoreticalCheck(kitchen.dishes, coffee.drinkPrice, common.avgDishesPerGuest, common.avgDrinksPerGuest);
    if (Math.abs(theoreticalCheck - hall.avgCheck) > 1) handleAvgCheckChange(hall.avgCheck);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const currentVenue = VENUE_TYPES[hall.venueType] ?? VENUE_TYPES.cafe;
  const hasHall = currentVenue.hasHall;
  const totalRent = hall.rentPerSqm * hall.totalArea;

  const districtRates = DISTRICT_RENT_RATES[location.district] || DISTRICT_RENT_RATES.central;
  const locationRates = districtRates[location.locationType] || [1000, 3000];

  const updateLocationAndRent = (district?: string, locType?: string) => {
    const d = district ?? location.district;
    const t = locType ?? location.locationType;
    const rates = DISTRICT_RENT_RATES[d]?.[t];
    if (rates) setHall(prev => ({ ...prev, rentPerSqm: Math.round((rates[0] + rates[1]) / 2) }));

    const locDefaults = LOCATION_DEFAULTS[t];
    if (locDefaults) {
      setLocation(prev => ({
        ...prev,
        district: d,
        locationType: t,
        totalPopulation: locDefaults.totalPopulation,
        targetAudiencePercent: locDefaults.targetAudiencePercent,
        conversionRate: locDefaults.conversionRate,
      }));
    } else {
      setLocation(prev => ({ ...prev, district: d, locationType: t }));
    }
  };

  const applyVenueDefaults = (venueType: string) => {
    const venue = VENUE_TYPES[venueType];
    if (!venue) return;
    setHall((p) => ({ ...p, venueType, waiterRatio: venue.waiterRatio, dishwasherRatio: venue.dishwasherRatio }));
    setWaitersCount(venue.hasHall && venue.waiterRatio > 0 ? Math.max(1, Math.ceil(hall.seats / venue.waiterRatio)) : 0);
    setDishwashersCount(venue.dishwasherRatio > 0 ? Math.max(1, Math.ceil(hall.hallArea / venue.dishwasherRatio)) : 0);
  };

  const areaPerSeatRange = currentVenue.areaPerSeat;
  const areaPerSeatMedian = (areaPerSeatRange[0] + areaPerSeatRange[1]) / 2;
  const recommendedHallAreaNew = Math.round(hall.seats * areaPerSeatMedian);
  const areaPerCookRange = currentVenue.areaPerCook;
  const areaPerCookMedian = (areaPerCookRange[0] + areaPerCookRange[1]) / 2;
  const recommendedKitchenAreaNew = Math.round(kitchen.cooks * areaPerCookMedian);

  const isRentRateHigh = hall.rentPerSqm > locationRates[1];
  const isRentRateLow = hall.rentPerSqm < locationRates[0];

  const addDish = () => setKitchen((p) => ({ ...p, dishes: [...p.dishes, { id: String(Date.now()), name: 'Новое', time: 15, price: 400 }] }));
  const removeDish = (id: string) => { if (kitchen.dishes.length <= 1) return; setKitchen((p) => ({ ...p, dishes: p.dishes.filter((d) => d.id !== id) })); };

  // ============ РАСЧЁТЫ ============
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
    let totalDishes = 0, kitchenRev = 0, totalCookMin = 0;
    const minDishTime = Math.min(...kitchen.dishes.map(d => d.time));
    const kitchenMaxDishes = Math.floor(cap / minDishTime);
    const dishRes = kitchen.dishes.map((d) => {
      const maxD = nCat > 0 ? Math.floor(capPerCat / Math.max(1, d.time)) : 0;
      totalDishes += maxD; kitchenRev += maxD * d.price; totalCookMin += maxD * d.time;
      return { ...d, maxDishes: maxD, revenue: maxD * d.price };
    });
    const kitchenLoad = cap > 0 ? (totalCookMin / cap) * 100 : 0;

    const baristas = Math.max(0, coffee.baristas);
    const drinkTime = Math.max(1, coffee.drinkTime);
    const drinkPrice = Math.max(1, coffee.drinkPrice);
    const coffeeCap = baristas > 0 ? (availMin * 60 / drinkTime) * baristas : 0;
    const coffeeRev = coffeeCap * drinkPrice;
    const coffeeMaxDrinks = Math.floor(availMin * 60 / drinkTime) * baristas;

    const venue = VENUE_TYPES[hall.venueType] ?? VENUE_TYPES.cafe;
    let realisticGuestsPerShift = 0, shiftRevenue = 0;
    let bottleneck = 'Зал', requiredDishes = 0, requiredDrinks = 0;

    if (venue.hasHall && hasHall) {
      realisticGuestsPerShift = guestsPerShift;
      requiredDishes = Math.ceil(realisticGuestsPerShift * common.avgDishesPerGuest);
      requiredDrinks = Math.ceil(realisticGuestsPerShift * common.avgDrinksPerGuest);
      const isKB = requiredDishes > kitchenMaxDishes;
      const isCB = requiredDrinks > coffeeMaxDrinks;
      bottleneck = isKB && isCB ? 'Кухня и бар' : isKB ? 'Кухня' : isCB ? 'Кофейня' : 'Зал';
      shiftRevenue = Math.min(realisticGuestsPerShift * hall.avgCheck, kitchenRev + coffeeRev);
    } else {
      realisticGuestsPerShift = 0;
      shiftRevenue = kitchenRev + coffeeRev;
      bottleneck = 'Производство';
    }

    const dailyRevenue = shiftRevenue * shifts;
    const monthlyRevenue = dailyRevenue * 30;

    const kitRate = KITCHEN_TYPE_RATE[energy.kitchenType] || 27.5;
    const ventHall = Math.round(hall.hallArea * venue.hallRate);
    const ventKit = Math.round(hall.kitchenArea * kitRate);
    const ventTotal = ventHall + ventKit;
    const dT = energy.indoorTemp - energy.climateZone;
    const sf = Math.max(1, energy.safetyFactor);
    const heatTotal = ((ventHall * dT * 0.335) / 1000 + (ventKit * dT * 0.335) / 1000) * sf;
    const monthlyHeatingCost = heatTotal * 720 * energy.electricityPrice;
    const otherEnergyCost = (energy.otherPower || 0) * 720 * energy.electricityPrice;
    const totalEnergyCost = monthlyHeatingCost + otherEnergyCost;

    const totalStaff = kitchen.cooks * shifts + coffee.baristas * shifts + waitersCount * shifts + dishwashersCount * shifts;
    const totalPayroll = kitchen.cooks * shifts * hall.cookSalary + coffee.baristas * shifts * hall.baristaSalary + waitersCount * shifts * hall.waiterSalary + dishwashersCount * shifts * hall.dishwasherSalary;
    const totalPayrollWithTaxes = totalPayroll * 1.45;

    const totalProd = kitchenRev + coffeeRev;
    const kitchenShare = totalProd > 0 ? kitchenRev / totalProd : 0;
    const coffeeShare = totalProd > 0 ? coffeeRev / totalProd : 0;
    const foodCostAbs = dailyRevenue * kitchenShare * (hall.foodCostPercent / 100) * 30;
    const drinkCostAbs = dailyRevenue * coffeeShare * (hall.drinkCostPercent / 100) * 30;
    const totalCOGS = foodCostAbs + drinkCostAbs;

    const monthlyProfit = monthlyRevenue - totalRent - totalPayrollWithTaxes - totalEnergyCost - totalCOGS;

    const daysOpen = 30;
    const monthlyGuestsModel = realisticGuestsPerShift * shifts * daysOpen;
    const potentialGuestsTotal = location.potentialGuests * 1000;
    const availableMarketFlow = potentialGuestsTotal / (1 + location.competitors * location.competitorInfluence);
    const marketShare = availableMarketFlow > 0 ? (monthlyGuestsModel / availableMarketFlow) * 100 : 0;
    const growthPotential = availableMarketFlow - monthlyGuestsModel;

    const revenueCeiling = kitchenRev + coffeeRev;
    const revenueFromGuests = realisticGuestsPerShift * hall.avgCheck;
    const limitingFactor = revenueFromGuests >= revenueCeiling ? 'Кухня/бар' : 'Зал';

    const peakMinutes = PEAK_MINUTES;
    const peakAvailMin = peakMinutes;
    const peakKitchenDishes = cooks > 0 ? Math.floor(peakAvailMin * cooks * par / minDishTime) : 0;
    const peakKitchenGuests = common.avgDishesPerGuest > 0 ? Math.floor(peakKitchenDishes / common.avgDishesPerGuest) : 0;
    const peakCoffeeDrinks = baristas > 0 ? Math.floor(peakAvailMin * 60 / drinkTime) * baristas : 0;
    const peakCoffeeGuests = common.avgDrinksPerGuest > 0 ? Math.floor(peakCoffeeDrinks / common.avgDrinksPerGuest) : 0;
    const peakMaxGuests = Math.min(peakKitchenGuests, peakCoffeeGuests);
    const peakBottleneck = peakKitchenGuests <= peakCoffeeGuests ? 'Кухня' : 'Бар';

    const maxGuestsPerDayFromSeats = venue.hasHall ? hall.seats * venue.maxTurnsPerDay : common.dailyGuests;

    /* eslint-disable react-hooks/set-state-in-effect */
    setResults({
      dishRes, totalDishes, kitchenRev, kitchenLoad, kitchenMaxDishes,
      coffeeRev, coffeeMaxDrinks,
      realisticGuestsPerShift, shiftRevenue, dailyRevenue, monthlyRevenue,
      bottleneck, shifts,
      ventHall, ventKit, ventTotal, heatTotal, monthlyHeatingCost,
      totalStaff, totalPayroll, totalPayrollWithTaxes,
      monthlyProfit, foodCostAbs, drinkCostAbs, totalCOGS,
      requiredDishes, requiredDrinks,
      hasHall: venue.hasHall, seats: hall.seats, avgCheck: hall.avgCheck,
      turnsPerShift: venue.turnsPerShift, guestTime: venue.guestTime,
      recommendedHallArea: recommendedHallAreaNew,
      recommendedKitchenArea: recommendedKitchenAreaNew,
      areaPerCook: areaPerCookMedian,
      kitchenType: energy.kitchenType,
      totalRent, totalEnergyCost,
      otherPower: energy.otherPower, otherEnergyCost,
      monthlyGuestsModel, availableMarketFlow, marketShare, growthPotential,
      revenueCeiling, revenueFromGuests, limitingFactor,
      peakKitchenDishes, peakKitchenGuests,
      peakCoffeeDrinks, peakCoffeeGuests,
      peakMaxGuests, peakBottleneck,
      maxGuestsPerDayFromSeats,
    });
  }, [common, hall, coffee, kitchen, energy, waitersCount, dishwashersCount, location, totalRent, hasHall]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const openHelp = (block: string) => setHelpModal({ block, open: true });
  const closeHelp = () => setHelpModal({ block: '', open: false });
  const f = (n: number) => Math.round(n).toLocaleString('ru-RU');

  const helpTexts: Record<string, { title: string; text: string }> = {
    kpi: { title: 'Ключевые показатели', text: 'Дневная выручка — расчётная по модели. Месячная — введённая или расчётная.' },
    hall: { title: 'Пропускная способность зала', text: 'Гости за смену = общее число гостей в день / количество смен.' },
    kitchen: { title: 'Производительность кухни', text: 'Доступное время = смена × (100% − заготовки).' },
    coffee: { title: 'Кофейня', text: 'Напитков = (доступное время × 60 / время напитка) × бариста.' },
    energy: { title: 'Энергопотребление', text: 'Воздухообмен = площадь × норматив. Тепловая мощность = воздухообмен × ΔT × 0.335 / 1000 × запас. Затраты = мощность × 720 ч × цена кВт·ч.' },
    location: {
      title: 'Как оценить аудиторию и конкурентов',
      text: `Потенциальная аудитория = Общее население/поток × % целевой аудитории × % конверсии в общепит.\n\nДоступный поток = Потенциальная аудитория / (1 + Конкуренты × Влияние).\n\nВлияние конкурента: 0.2-0.4 для локальных точек, 0.5-0.8 для сетевых проектов. Чем выше коэффициент, тем сильнее каждый конкурент сокращает ваш доступный рынок.`,
    },
    checkFormula: { title: 'Как формируется средний чек', text: 'Средний чек = (Средняя цена блюда × Блюд на гостя) + (Цена напитка × Напитков на гостя).\n\nИзменение этих параметров автоматически пересчитывает средний чек и наоборот.' },
  };

  const inputMonthlyRevenue = dashboard?.monthlyRevenue ?? dashboard?.revenue;
  const inputRent = dashboard?.rent;
  const inputUtilities = dashboard?.utilities;
  const inputFOT = dashboard?.fot ?? dashboard?.payroll;
  const inputManagement = dashboard?.managementCost ?? dashboard?.management;
  const inputCOGS = dashboard?.costOfGoods ?? dashboard?.foodCost ?? dashboard?.cogs;
  const inputOther = dashboard?.otherExpenses ?? dashboard?.other;

  const inputDailyRevenue = inputMonthlyRevenue != null ? Math.round(inputMonthlyRevenue / 30) : null;

  const inputProfit =
    inputMonthlyRevenue != null && inputRent != null && inputFOT != null && inputCOGS != null
      ? inputMonthlyRevenue - inputRent - (inputUtilities ?? 0) - inputFOT - (inputManagement ?? 0) - inputCOGS - (inputOther ?? 0)
      : null;

  // ---- LOADING STATE ----
  if (!results) {
    return (
      <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 space-y-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          <div className="lg:col-span-7 space-y-4">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const isProfit = results.monthlyProfit > 0;
  const rentShare = results.monthlyRevenue ? (totalRent / results.monthlyRevenue) * 100 : 0;
  const targetRentShareRange = TARGET_RENT_SHARE[location.locationType] || [6, 15];
  const isRentShareOk = rentShare >= targetRentShareRange[0] && rentShare <= targetRentShareRange[1];
  const isRentOk = results.totalRent / results.monthlyRevenue <= 0.14;
  const districtLabel = DISTRICTS.find(d => d.value === location.district)?.label || '';

  const staffPerShift = Math.round(results.totalStaff / results.shifts);
  const staffBadge = `${staffPerShift} чел/см · ${f(results.totalPayrollWithTaxes)} ₽/мес`;

  const maxGuestsFromSeats = results.maxGuestsPerDayFromSeats;
  const dailyGuestsWarning = common.dailyGuests > maxGuestsFromSeats
    ? `Превышен теоретический максимум (${maxGuestsFromSeats} гостей/день для ${currentVenue.label.toLowerCase()})`
    : undefined;

  const profitValue = inputProfit != null ? f(inputProfit) : f(results.monthlyProfit);
  const profitColorLevel: ColorLevel = (inputProfit ?? results.monthlyProfit) > 0 ? 'green' : 'red';

  const venueAddress = dashboard?.name && dashboard?.address ? `${dashboard.name} · ${dashboard.address}` : '';

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">

      {/* Шапка */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Бизнес-аналитика</h1>
        {venueAddress && (
          <p className="text-sm text-muted-foreground mt-0.5 truncate">{venueAddress}</p>
        )}
      </div>

      {/* ===== KPI КАРТОЧКИ — стиль дашборда ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <KPICard
          icon={TrendingUp}
          label="Дневная выручка"
          value={`${inputDailyRevenue != null ? f(inputDailyRevenue) : f(results.dailyRevenue)} ₽`}
          sub={inputDailyRevenue != null ? `модель: ${f(results.dailyRevenue)} ₽` : 'расчёт модели'}
          colorLevel="neutral"
        />
        <KPICard
          icon={BarChart3}
          label="Месячная выручка"
          value={`${inputMonthlyRevenue != null ? f(inputMonthlyRevenue) : f(results.monthlyRevenue)} ₽`}
          sub={inputMonthlyRevenue != null ? `модель: ${f(results.monthlyRevenue)} ₽` : '\u00A0'}
          colorLevel="neutral"
        />
        <KPICard
          icon={Building}
          label="Аренда"
          value={`${inputRent != null ? f(inputRent) : f(results.totalRent)} ₽`}
          sub={results.totalRent > 0 && results.monthlyRevenue > 0 ? `${rentShare.toFixed(1)}% выручки` : '\u00A0'}
          colorLevel={isRentOk ? 'green' : 'orange'}
        />
        <KPICard
          icon={AlertTriangle}
          label="Узкое место"
          value={results.bottleneck}
          colorLevel="orange"
        />
        <KPICard
          icon={isProfit ? CheckCircle : AlertTriangle}
          label="Прибыль/мес"
          value={`${profitValue} ₽`}
          sub={`модель: ${f(results.monthlyProfit)} ₽`}
          colorLevel={profitColorLevel}
        />
      </div>

      {/* Раскладка прибыли (если раскрыт) */}
      {profitOpen && (
        <Card className="mb-6 py-0 gap-0 border-l-4 border-l-primary">
          <CardContent className="p-4 space-y-1">
            <ResultRow label="Выручка"
              value={`${inputMonthlyRevenue != null ? f(inputMonthlyRevenue) : f(results.monthlyRevenue)} ₽`}
              sub={inputMonthlyRevenue != null ? `модель: ${f(results.monthlyRevenue)} ₽` : ''} />
            <ResultRow label="− Аренда"
              value={`−${inputRent != null ? f(inputRent) : f(results.totalRent)} ₽`}
              sub={inputRent != null ? `модель: −${f(results.totalRent)} ₽` : ''} />
            <ResultRow label="− Коммунальные"
              value={`−${inputUtilities != null ? f(inputUtilities) : f(results.totalEnergyCost)} ₽`}
              sub={inputUtilities != null ? `модель: −${f(results.totalEnergyCost)} ₽` : ''} />
            <ResultRow label="− ФОТ (с налогами)"
              value={`−${inputFOT != null ? f(inputFOT) : f(results.totalPayrollWithTaxes)} ₽`}
              sub={inputFOT != null ? `модель: −${f(results.totalPayrollWithTaxes)} ₽` : ''} />
            {inputManagement != null && <ResultRow label="− Управление" value={`−${f(inputManagement)} ₽`} />}
            <ResultRow label="− Foodcost"
              value={`−${inputCOGS != null ? f(inputCOGS) : f(results.totalCOGS)} ₽`}
              sub={inputCOGS != null ? `модель: −${f(results.totalCOGS)} ₽` : ''} />
            {inputOther != null && <ResultRow label="− Прочие" value={`−${f(inputOther)} ₽`} />}
            <Separator className="my-1.5" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">Прибыль</span>
              <span className={cn('text-base font-bold tabular-nums', levelText[profitColorLevel])}>
                {profitValue} ₽
              </span>
            </div>
            {inputProfit == null && (
              <p className="text-right text-[11px] text-amber-600">
                Не все вводные — показана модель
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Кнопка раскрытия прибыли */}
      <div className="mb-6">
        <button
          onClick={() => setProfitOpen(!profitOpen)}
          className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
        >
          <PieChart className="h-3.5 w-3.5" />
          {profitOpen ? 'Свернуть раскладку прибыли' : 'Показать раскладку прибыли'}
        </button>
      </div>

      {/* ОСНОВНОЙ LAYOUT */}
      <div className="space-y-3">

        {/* ========== НАСТРОЙКИ ========== */}
        <div className="space-y-3">

          {/* 1. Тип и локация */}
          <CollapsibleSection
            icon={Building}
            title="Тип и локация"
            defaultOpen={false}
            badge={venueAddress}
          >
            <SelectField label="Формат" value={hall.venueType} onChange={applyVenueDefaults}
              options={Object.entries(VENUE_TYPES).map(([k, v]) => ({ value: k, label: v.label }))} />
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Округ"
                value={location.district}
                onChange={(v) => updateLocationAndRent(v, undefined)}
                options={DISTRICTS}
              />
              <SelectField
                label="Локация"
                value={location.locationType}
                onChange={(v) => updateLocationAndRent(undefined, v)}
                options={[
                  { value: 'residential', label: 'Жилой район' },
                  { value: 'mall', label: 'ТЦ' },
                  { value: 'business_center', label: 'БЦ' },
                  { value: 'street', label: 'Улица' },
                ]}
              />
            </div>
          </CollapsibleSection>

          {/* 2. Рынок и конкуренция */}
          <CollapsibleSection
            icon={MapPin}
            title="Рынок и конкуренция"
            helpKey="location"
            onHelp={openHelp}
            defaultOpen={false}
            badge={`${location.potentialGuests.toFixed(1)} тыс.`}
          >
            <div className="space-y-3">
              <SliderField label="Общее население / поток (тыс. чел)" value={location.totalPopulation} onChange={(v) => setLocation({ ...location, totalPopulation: v })} min={0} max={100} step={0.1}
                hint="Рекомендованное значение" />
              <SliderField label="Целевая аудитория (%)" value={location.targetAudiencePercent} onChange={(v) => setLocation({ ...location, targetAudiencePercent: v })} min={0} max={100} />
              <SliderField label="Конверсия в посетители (%)" value={location.conversionRate} onChange={(v) => setLocation({ ...location, conversionRate: v })} min={0} max={100} step={0.1} />
              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                Потенциальная аудитория: <span className="font-semibold text-foreground">{location.potentialGuests.toFixed(1)} тыс. чел/мес</span>
              </div>
              <Separator />
              <SliderField label="Конкуренты" value={location.competitors} onChange={(v) => setLocation({ ...location, competitors: v })} min={0} max={50} compact />
              <SliderField label="Влияние конкур." value={location.competitorInfluence} onChange={(v) => setLocation({ ...location, competitorInfluence: v })} min={0.1} max={1.0} step={0.1} compact
                hint="Сетевые: 0.5-0.8, локальные: 0.2-0.4" />
            </div>
          </CollapsibleSection>

          {/* 3. Помещение и аренда */}
          <CollapsibleSection
            icon={Gauge}
            title="Помещение и аренда"
            defaultOpen={false}
            badge={`${f(totalRent)} ₽/мес`}
          >
            <SliderField label="Общая площадь" value={hall.totalArea} onChange={(v) => setHall({ ...hall, totalArea: v })} min={10} max={2000} unit="м²" compact />
            {hasHall && (
              <SliderField label="Площадь зала" value={hall.hallArea} onChange={(v) => setHall({ ...hall, hallArea: v })} min={1} max={hall.totalArea} unit="м²" compact
                hint={`Рек: ${results.recommendedHallArea} м²`}
                warning={hall.hallArea < results.recommendedHallArea ? `Плотность рассадки выше нормы для ${currentVenue.label.toLowerCase()}` : undefined} />
            )}
            <SliderField label="Площадь кухни" value={hall.kitchenArea} onChange={(v) => setHall({ ...hall, kitchenArea: v })} min={1} max={hall.totalArea} unit="м²" compact
              hint={`Рек: ${results.recommendedKitchenArea} м²`}
              warning={hall.kitchenArea < results.recommendedKitchenArea ? 'Меньше рекомендованной' : undefined} />
            <SliderField label="Аренда (ставка)" value={hall.rentPerSqm} onChange={(v) => setHall({ ...hall, rentPerSqm: v })} min={0} max={20000} step={50} unit="₽/м²" compact
              hint={`${districtLabel}: ${locationRates[0].toLocaleString()}–${locationRates[1].toLocaleString()} ₽`}
              warning={isRentRateHigh ? 'Выше рынка' : (isRentRateLow ? 'Ниже рынка' : undefined)} />
          </CollapsibleSection>

          {/* 4. Зал и загрузка */}
          {hasHall && (
            <CollapsibleSection icon={Armchair} title="Зал и загрузка" helpKey="hall" onHelp={openHelp} defaultOpen={false}
              badge={`${results.realisticGuestsPerShift} чел/см`}>
              <SliderField label="Мест" value={hall.seats} onChange={(v) => setHall({ ...hall, seats: v })} min={1} max={500} compact />
              <SliderField label="Средний чек" value={hall.avgCheck} onChange={handleAvgCheckChange} min={50} max={5000} step={50} unit="₽" compact />
              <Separator className="my-1" />
              <SliderField label="Часов в день" value={common.operatingHours} onChange={(v) => setCommon({ ...common, operatingHours: v })} min={1} max={24} step={0.5} unit="ч" compact
                hint={`${results.shifts} смен(ы)`} />
              <SliderField label="Смена" value={common.shiftHours} onChange={(v) => setCommon({ ...common, shiftHours: v })} min={1} max={12} step={0.5} unit="ч" compact />
              <SliderField
                label="Гостей в день"
                value={common.dailyGuests}
                onChange={(v) => setCommon({ ...common, dailyGuests: v })}
                min={1}
                max={maxGuestsFromSeats > 0 ? maxGuestsFromSeats * 2 : 1000}
                compact
                hint={currentVenue.hasHall ? `Теор. максимум: до ${maxGuestsFromSeats} гостей/день (${currentVenue.maxTurnsPerDay} посадки)` : undefined}
                warning={dailyGuestsWarning}
              />
              <div className="grid grid-cols-2 gap-3">
                <SliderField label="Блюд/гость" value={common.avgDishesPerGuest} onChange={handleDishesPerGuestChange} min={0.1} max={3} step={0.1} compact />
                <SliderField label="Напитков/гость" value={common.avgDrinksPerGuest} onChange={handleDrinksPerGuestChange} min={0.1} max={3} step={0.1} compact />
              </div>
            </CollapsibleSection>
          )}

          {/* 5. Персонал */}
          <CollapsibleSection
            icon={Users}
            title="Персонал"
            defaultOpen={false}
            badge={staffBadge}
          >
            <div className="grid grid-cols-2 gap-x-3">
              <SliderField label="Поваров" value={kitchen.cooks} onChange={(v) => setKitchen({ ...kitchen, cooks: v })} min={0} max={20} compact />
              <SliderField label="ЗП повара" value={hall.cookSalary} onChange={(v) => setHall({ ...hall, cookSalary: v })} min={0} max={200000} step={1000} unit="₽" compact />
              <SliderField label="Бариста" value={coffee.baristas} onChange={(v) => setCoffee({ ...coffee, baristas: v })} min={0} max={10} compact />
              <SliderField label="ЗП бариста" value={hall.baristaSalary} onChange={(v) => setHall({ ...hall, baristaSalary: v })} min={0} max={150000} step={1000} unit="₽" compact />
              {hasHall && (
                <>
                  <SliderField label="Официанты" value={waitersCount} onChange={(v) => setWaitersCount(v)} min={0} max={20} compact
                    hint={waitersCount > 0 ? `${Math.ceil(hall.seats / waitersCount)} гост/оф.` : ''} />
                  <SliderField label="ЗП официанта" value={hall.waiterSalary} onChange={(v) => setHall({ ...hall, waiterSalary: v })} min={0} max={100000} step={1000} unit="₽" compact />
                </>
              )}
              <SliderField label="Мойщицы" value={dishwashersCount} onChange={(v) => setDishwashersCount(v)} min={0} max={10} compact
                hint={dishwashersCount > 0 ? `${Math.ceil(hall.hallArea / dishwashersCount)} м²/чел.` : ''} />
              <SliderField label="ЗП мойщицы" value={hall.dishwasherSalary} onChange={(v) => setHall({ ...hall, dishwasherSalary: v })} min={0} max={100000} step={1000} unit="₽" compact />
            </div>
            <Separator className="my-1" />
            <SliderField label="Параллельность кухни" value={kitchen.parallelism} onChange={(v) => setKitchen({ ...kitchen, parallelism: v })} min={1} max={10} compact />
            <SliderField label="Время напитка" value={coffee.drinkTime} onChange={(v) => setCoffee({ ...coffee, drinkTime: v })} min={10} max={300} unit="сек" compact />
          </CollapsibleSection>

          {/* 6. Foodcost */}
          <CollapsibleSection
            icon={DollarSign}
            title="Foodcost"
            defaultOpen={false}
            badge={`${f(results.totalCOGS)} ₽`}
          >
            <SliderField label="Foodcost блюд %" value={hall.foodCostPercent} onChange={(v) => setHall({ ...hall, foodCostPercent: v })} min={0} max={100} unit="%" compact
              hint={`Сумма: ${f(results.foodCostAbs)} ₽`} />
            <SliderField label="Foodcost напитков %" value={hall.drinkCostPercent} onChange={(v) => setHall({ ...hall, drinkCostPercent: v })} min={0} max={100} unit="%" compact
              hint={`Сумма: ${f(results.drinkCostAbs)} ₽`} />

            <Separator className="my-1" />
            <Label className="mb-2">Меню</Label>
            <div className="space-y-2">
              {kitchen.dishes.map((d) => (
                <div key={d.id} className="flex items-center gap-2">
                  <input type="text" value={d.name} onChange={(e) => updateDish(d.id, 'name', e.target.value)}
                    className="flex-1 min-w-0 text-xs rounded-md border border-border bg-background px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary" />
                  <input type="number" value={d.time} onChange={(e) => updateDish(d.id, 'time', Number(e.target.value))}
                    className="w-14 text-xs rounded-md border border-border bg-background px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary tabular-nums" placeholder="мин" />
                  <input type="number" value={d.price} onChange={(e) => updateDish(d.id, 'price', Number(e.target.value))}
                    className="w-16 text-xs rounded-md border border-border bg-background px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary tabular-nums" placeholder="₽" />
                  <button onClick={() => removeDish(d.id)} className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center hover:bg-destructive/10 transition text-muted-foreground hover:text-destructive text-sm">×</button>
                </div>
              ))}
              <button onClick={addDish} className="flex items-center gap-1 text-xs font-medium mt-1 text-primary hover:text-primary/80 transition">
                <Plus size={12} /> Добавить блюдо
              </button>
            </div>
            <Separator className="my-1" />
            <SliderField label="Цена напитка" value={coffee.drinkPrice} onChange={updateDrinkPrice} min={50} max={2000} step={10} unit="₽" compact />
          </CollapsibleSection>

          {/* 7. Энергопотребление */}
          <CollapsibleSection icon={Zap} title="Энергопотребление" helpKey="energy" onHelp={openHelp} defaultOpen={false}
            badge={`${f(results.totalEnergyCost)} ₽/мес`}>
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Тип кухни" value={energy.kitchenType} onChange={(v) => setEnergy({ ...energy, kitchenType: v })}
                options={[{ value: 'hot', label: 'Горячая' }, { value: 'cold', label: 'Холодная' }, { value: 'mixed', label: 'Смешанная' }]} />
              <SelectField label="Климат" value={String(energy.climateZone)} onChange={(v) => setEnergy({ ...energy, climateZone: Number(v) })}
                options={CLIMATE_ZONES.map((z) => ({ value: String(z.temp), label: z.label }))} />
            </div>
            <SliderField label="t внутри" value={energy.indoorTemp} onChange={(v) => setEnergy({ ...energy, indoorTemp: v })} min={15} max={30} step={0.5} unit="°C" compact />
            <SliderField label="Запас" value={energy.safetyFactor} onChange={(v) => setEnergy({ ...energy, safetyFactor: v })} min={1} max={2} step={0.05} compact />
            <SliderField label="кВт·ч" value={energy.electricityPrice} onChange={(v) => setEnergy({ ...energy, electricityPrice: v })} min={0.5} max={15} step={0.1} unit="₽" compact />
            <Separator className="my-1" />
            <SliderField label="Прочая мощность" value={energy.otherPower} onChange={(v) => setEnergy({ ...energy, otherPower: v })} min={0} max={100} step={0.5} unit="кВт" compact
              hint="Освещение, холодильники и т.д." />
          </CollapsibleSection>

        </div>

        {/* ========== РЕЗУЛЬТАТЫ ========== */}
        <div className="space-y-3 mt-4">

          {/* Максимальные значения по производительности */}
          <CollapsibleSection icon={TrendingUp} title="Максимальные значения по производительности" helpKey="kpi" onHelp={openHelp} defaultOpen={false}>
            {results.hasHall && (
              <>
                <ResultRow label="Гости (загрузка)" value={`${results.realisticGuestsPerShift} чел.`} sub={`в день: ${common.dailyGuests}`} />
                <Separator className="my-1" />
              </>
            )}
            <ResultRow label="Кухня" value={`${results.totalDishes} блюд`} sub={`макс: ${results.kitchenMaxDishes}`}
              color={results.requiredDishes > results.kitchenMaxDishes ? 'var(--destructive)' : undefined} />
            <ResultRow label="Кофейня" value={`${results.coffeeMaxDrinks} напитков`}
              sub={results.requiredDrinks > results.coffeeMaxDrinks ? 'не хватает' : undefined}
              color={results.requiredDrinks > results.coffeeMaxDrinks ? 'var(--destructive)' : undefined} />
            <Separator className="my-1" />
            <ResultRow label="Выручка/день" value={`${f(results.dailyRevenue)} ₽`} bold />
            <ResultRow label="Выручка/мес" value={`${f(results.monthlyRevenue)} ₽`} bold />
            <ResultRow label="Потолок выручки" value={`${f(results.revenueCeiling)} ₽`} sub={`лимит: ${results.limitingFactor}`} color="#d97706" />
          </CollapsibleSection>

          {/* Детализация кухни и бара */}
          <CollapsibleSection icon={ChefHat} title="Детализация кухни и бара" defaultOpen={false}>
            <ResultRow label="Итого кухня" value={`${f(results.kitchenRev)} ₽`} bold color="#059669" />
            <ResultRow label="Загрузка кухни" value={`${results.kitchenLoad.toFixed(0)}%`}
              color={results.kitchenLoad > 95 ? 'var(--destructive)' : results.kitchenLoad > 80 ? '#d97706' : '#059669'} />
            {results.kitchenLoad > 95 && (
              <div className="mt-1.5 p-2.5 rounded-lg bg-destructive/5 text-destructive text-xs">
                Критическая загрузка кухни — риск сбоев
              </div>
            )}
            <Separator className="my-1.5" />
            <ResultRow label="Макс. напитков бар" value={`${results.coffeeMaxDrinks}`} />
            <ResultRow label="Выручка бара" value={`${f(results.coffeeRev)} ₽`} bold color="#059669" />
            <Separator className="my-1.5" />
            <Label className="mb-2">Пиковая мощность (за {PEAK_MINUTES} мин)</Label>
            <ResultRow label="Макс. блюд" value={`${results.peakKitchenDishes}`} />
            <ResultRow label="Макс. гостей по кухне" value={`${results.peakKitchenGuests}`} sub={`(${common.avgDishesPerGuest} бл./гость)`} />
            <ResultRow label="Макс. напитков бар" value={`${results.peakCoffeeDrinks}`} />
            <ResultRow label="Макс. гостей по бару" value={`${results.peakCoffeeGuests}`} sub={`(${common.avgDrinksPerGuest} нап./гость)`} />
            <Separator className="my-1.5" />
            <ResultRow label="Максимум гостей за пик" value={`${results.peakMaxGuests}`} bold color="#059669" />
            <ResultRow label="Ограничивает" value={results.peakBottleneck} />
            <p className="text-[11px] mt-2 text-muted-foreground">
              При текущем меню и персонале за {PEAK_MINUTES} минут можно обслужить не более {results.peakMaxGuests} гостей.
            </p>
          </CollapsibleSection>

        </div>
      </div>

      <HelpModal isOpen={helpModal.open} onClose={closeHelp} title={helpTexts[helpModal.block]?.title || ''}>
        {helpTexts[helpModal.block]?.text || ''}
      </HelpModal>
    </div>
  );
}