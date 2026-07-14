// app/components/BusinessClient.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Settings, Armchair, Coffee, Flame, Building, Wind, Gauge,
  Lightbulb, Plus, X, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle, Users, Utensils, Clock, DollarSign, Info, ChefHat,
  Zap,
} from 'lucide-react';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { Skeleton, SkeletonCard } from '../../components/Skeleton';

/* ============================================================
   ТИПЫ
   ============================================================ */
interface Dish { id: string; name: string; time: number; price: number; }

interface CommonSettings {
  shiftHours: number; loadFactor: number; prepRatio: number;
  operatingHours: number; avgDishesPerGuest: number; avgDrinksPerGuest: number;
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

interface VentilationSettings {
  kitchenType: string; climateZone: number; indoorTemp: number;
  safetyFactor: number; electricityPrice: number;
}

/* ============================================================
   КОНСТАНТЫ
   ============================================================ */
const VENUE_TYPES: Record<string, {
  label: string; hallRate: number; waiterRatio: number; dishwasherRatio: number;
  guestTime: number; turnsPerShift: number; hasHall: boolean;
}> = {
  restaurant: { label: 'Ресторан', hallRate: 3.0, waiterRatio: 20, dishwasherRatio: 100, guestTime: 50, turnsPerShift: 1.8, hasHall: true },
  coffee: { label: 'Кофейня', hallRate: 3.5, waiterRatio: 40, dishwasherRatio: 100, guestTime: 25, turnsPerShift: 3.0, hasHall: true },
  cafe: { label: 'Кафе', hallRate: 3.2, waiterRatio: 40, dishwasherRatio: 100, guestTime: 35, turnsPerShift: 2.2, hasHall: true },
  canteen: { label: 'Столовая', hallRate: 4.5, waiterRatio: 0, dishwasherRatio: 100, guestTime: 20, turnsPerShift: 3.5, hasHall: true },
  fastfood: { label: 'Быстрое обслуживание', hallRate: 4.0, waiterRatio: 0, dishwasherRatio: 100, guestTime: 10, turnsPerShift: 4.5, hasHall: true },
  darkkitchen: { label: 'Дарк китчен (доставка)', hallRate: 0, waiterRatio: 0, dishwasherRatio: 50, guestTime: 0, turnsPerShift: 0, hasHall: false },
};

const VENUE_MIN_AREA_PER_SEAT: Record<string, number> = {
  restaurant: 1.8, coffee: 1.6, cafe: 1.6, canteen: 1.8, fastfood: 1.4, darkkitchen: 0,
};

const KITCHEN_TYPE_RATE: Record<string, number> = { hot: 37.5, cold: 17.5, mixed: 27.5 };
const KITCHEN_AREA_PER_COOK: Record<string, { min: number; typical: number }> = {
  hot: { min: 7, typical: 8.5 }, cold: { min: 5, typical: 6 }, mixed: { min: 6, typical: 7.5 },
};

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

/* ============================================================
   ОБЩИЕ КОМПОНЕНТЫ
   ============================================================ */
function FieldGroup({ label, children, help, onHelp }: { label: string; children: React.ReactNode; help?: string; onHelp?: () => void }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
        {help && onHelp && (
          <button onClick={onHelp} className="opacity-40 hover:opacity-100 transition" style={{ color: 'var(--text-muted)' }}>
            <Info size={14} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function SliderField({
  label, value, onChange, min = 0, max = 100, step = 1, unit = '', hint, warning,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; unit?: string; hint?: string; warning?: string;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <div className="flex items-center gap-1.5">
          <input
            type="number" min={min} max={max} step={step} value={value}
            onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v))); }}
            className="input-field text-right tabular-nums"
            style={{ width: 80, padding: '5px 8px', fontSize: 13 }}
          />
          {unit && <span className="text-xs" style={{ color: 'var(--text-muted)', width: 28 }}>{unit}</span>}
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${(value - min) / (max - min) * 100}%, #e5e7eb ${(value - min) / (max - min) * 100}%, #e5e7eb 100%)`,
          accentColor: 'var(--primary)',
        }}
      />
      {hint && <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
      {warning && <p className="text-[11px] mt-1" style={{ color: 'var(--danger)' }}>{warning}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div className="mb-4 last:mb-0">
      <label className="text-[13px] font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="input-field text-sm"
        style={{ appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: 32 }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function ResultRow({ label, value, sub, bold, color }: {
  label: string; value: string; sub?: string; bold?: boolean; color?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[13px]" style={{ color: 'var(--text-secondary)', fontWeight: bold ? 600 : 400 }}>{label}</span>
      <div className="text-right">
        <span className="text-sm tabular-nums" style={{ color: color || 'var(--text)', fontWeight: bold ? 700 : 600 }}>{value}</span>
        {sub && <span className="text-[11px] ml-2" style={{ color: 'var(--text-muted)' }}>{sub}</span>}
      </div>
    </div>
  );
}

function HelpModal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col" style={{ boxShadow: 'var(--shadow-modal)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{title}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition" style={{ color: 'var(--text-muted)' }}>✕</button>
        </div>
        <div className="px-5 py-4 text-sm overflow-y-auto" style={{ color: 'var(--text-secondary)' }}>{children}</div>
      </div>
    </div>
  );
}

function SectionCard({ icon: Icon, title, children, helpKey, onHelp }: {
  icon: React.ElementType; title: string; children: React.ReactNode; helpKey?: string; onHelp?: (k: string) => void;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-light)' }}>
            <Icon size={14} style={{ color: 'var(--primary)' }} />
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{title}</span>
        </div>
        {helpKey && onHelp && (
          <button onClick={() => onHelp(helpKey)} className="opacity-40 hover:opacity-100 transition" style={{ color: 'var(--text-muted)' }}>
            <Info size={15} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

/* ============================================================
   ОСНОВНАЯ СТРАНИЦА
   ============================================================ */
export default function BusinessPage() {
  const [common, setCommon] = useState<CommonSettings>({
    shiftHours: 8, loadFactor: 75, prepRatio: 20, operatingHours: 14,
    avgDishesPerGuest: 0.8, avgDrinksPerGuest: 1.2,
  });
  const [hall, setHall] = useState<HallSettings>({
    venueType: 'cafe', seats: 50, avgCheck: 500, hallArea: 75, kitchenArea: 40,
    totalArea: 110, rentPerSqm: 1090, cookSalary: 80000, baristaSalary: 60000,
    waiterSalary: 50000, dishwasherSalary: 40000, waiterRatio: 40, dishwasherRatio: 100,
    foodCostPercent: 30, drinkCostPercent: 25,
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
  const [ventilation, setVentilation] = useState<VentilationSettings>({
    kitchenType: 'hot', climateZone: -25, indoorTemp: 22, safetyFactor: 1.1, electricityPrice: 5.5,
  });
  const [results, setResults] = useState<any>(null);
  const [helpModal, setHelpModal] = useState<{ block: string; open: boolean }>({ block: '', open: false });

  const currentVenue = VENUE_TYPES[hall.venueType] ?? VENUE_TYPES.cafe;
  const hasHall = currentVenue.hasHall;

  const [waitersCount, setWaitersCount] = useState(
    hasHall && hall.waiterRatio > 0 ? Math.max(1, Math.ceil(hall.seats / hall.waiterRatio)) : 0
  );
  const [dishwashersCount, setDishwashersCount] = useState(
    hall.dishwasherRatio > 0 ? Math.max(1, Math.ceil(hall.hallArea / hall.dishwasherRatio)) : 0
  );

  const applyVenueDefaults = (venueType: string) => {
    const venue = VENUE_TYPES[venueType];
    if (!venue) return;
    setHall((p) => ({ ...p, venueType, waiterRatio: venue.waiterRatio, dishwasherRatio: venue.dishwasherRatio }));
    setWaitersCount(venue.hasHall && venue.waiterRatio > 0 ? Math.max(1, Math.ceil(hall.seats / venue.waiterRatio)) : 0);
    setDishwashersCount(venue.dishwasherRatio > 0 ? Math.max(1, Math.ceil(hall.hallArea / venue.dishwasherRatio)) : 0);
  };

  // Синхронизация с профилем из дашборда (улучшенная версия)
  useEffect(() => {
    const saved = localStorage.getItem('momentoBusinessData');
    if (!saved) return;
    try {
      const b = JSON.parse(saved);
      const venue = VENUE_TYPES[b.venueType] || VENUE_TYPES.cafe;
      const seats = b.seats || hall.seats;
      const hallArea = b.hallArea || hall.hallArea;

      // Рассчитываем персонал на основе свежих данных
      const newWaiters = venue.hasHall && venue.waiterRatio > 0
        ? Math.max(1, Math.ceil(seats / venue.waiterRatio))
        : 0;
      const newDishwashers = venue.dishwasherRatio > 0
        ? Math.max(1, Math.ceil(hallArea / venue.dishwasherRatio))
        : 0;

      setHall(prev => ({
        ...prev,
        venueType: b.venueType || prev.venueType,
        seats,
        avgCheck: b.avgCheck || prev.avgCheck,
        hallArea,
        kitchenArea: b.totalArea && b.hallArea
          ? Math.max(1, b.totalArea - b.hallArea)
          : prev.kitchenArea,
        totalArea: b.totalArea || prev.totalArea,
        rentPerSqm: b.totalArea > 0
          ? Math.round(b.rent / b.totalArea)
          : prev.rentPerSqm,
        foodCostPercent: b.foodCostPercent || prev.foodCostPercent,
        waiterRatio: venue.waiterRatio,
        dishwasherRatio: venue.dishwasherRatio,
      }));

      setWaitersCount(newWaiters);
      setDishwashersCount(newDishwashers);
    } catch (e) {
      console.error('Ошибка загрузки профиля:', e);
    }
  }, []);

  const areaPerCook = KITCHEN_AREA_PER_COOK[ventilation.kitchenType]?.typical ?? 7;
  const recommendedKitchenArea = Math.round(kitchen.cooks * areaPerCook);
  const kitchenAreaWarning = hall.kitchenArea < recommendedKitchenArea
    ? `Рекомендуется ${recommendedKitchenArea} м² для ${kitchen.cooks} поваров` : undefined;

  const recommendedHallArea = hasHall ? Math.round(hall.seats * (VENUE_MIN_AREA_PER_SEAT[hall.venueType] || 1.6)) : 0;
  const hallAreaWarning = hasHall && hall.hallArea < recommendedHallArea
    ? `Рекомендуется ${recommendedHallArea} м² для ${hall.seats} мест` : undefined;

  const totalUsedArea = hall.hallArea + hall.kitchenArea;
  const areaOverflowWarning = totalUsedArea > hall.totalArea
    ? `Сумма (${totalUsedArea} м²) превышает общую (${hall.totalArea} м²)` : undefined;

  const totalRent = hall.rentPerSqm * hall.totalArea;

  const addDish = () => setKitchen((p) => ({ ...p, dishes: [...p.dishes, { id: String(Date.now()), name: 'Новое', time: 15, price: 400 }] }));
  const removeDish = (id: string) => { if (kitchen.dishes.length <= 1) return; setKitchen((p) => ({ ...p, dishes: p.dishes.filter((d) => d.id !== id) })); };
  const updateDish = (id: string, field: keyof Dish, value: any) => { setKitchen((p) => ({ ...p, dishes: p.dishes.map((d) => (d.id === id ? { ...d, [field]: value } : d)) })); };

  useEffect(() => {
    const shiftMin = common.shiftHours * 60;
    const load = common.loadFactor / 100;
    const prepR = common.prepRatio / 100;
    const prepMin = shiftMin * prepR;
    const availMin = shiftMin * load - prepMin;

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

    let maxGuestsPerShift = 0, realisticGuestsPerShift = 0, shiftRevenue = 0;
    let bottleneck = 'Зал', requiredDishes = 0, requiredDrinks = 0;

    if (venue.hasHall) {
      const seats = Math.max(1, hall.seats);
      const avgCheck = Math.max(1, hall.avgCheck);
      const turns = venue.turnsPerShift || 2;
      maxGuestsPerShift = Math.floor(seats * turns * load);
      realisticGuestsPerShift = maxGuestsPerShift;
      requiredDishes = Math.ceil(realisticGuestsPerShift * common.avgDishesPerGuest);
      requiredDrinks = Math.ceil(realisticGuestsPerShift * common.avgDrinksPerGuest);
      const isKB = requiredDishes > kitchenMaxDishes;
      const isCB = requiredDrinks > coffeeMaxDrinks;
      bottleneck = isKB && isCB ? 'Кухня и кофейня' : isKB ? 'Кухня' : isCB ? 'Кофейня' : 'Зал';
      shiftRevenue = Math.min(realisticGuestsPerShift * avgCheck, kitchenRev + coffeeRev);
    } else {
      shiftRevenue = kitchenRev + coffeeRev;
      bottleneck = 'Производство';
    }

    const shifts = Math.max(1, Math.ceil(common.operatingHours / common.shiftHours));
    const dailyRevenue = shiftRevenue;
    const monthlyRevenue = dailyRevenue * 30;

    const rentVal = totalRent;
    const normalRent = monthlyRevenue * 0.14;
    const rentShare = monthlyRevenue > 0 ? (rentVal / monthlyRevenue) * 100 : 0;

    const kitRate = KITCHEN_TYPE_RATE[ventilation.kitchenType] || 27.5;
    const ventHall = Math.round(hall.hallArea * venue.hallRate);
    const ventKit = Math.round(hall.kitchenArea * kitRate);
    const ventTotal = ventHall + ventKit;
    const dT = ventilation.indoorTemp - ventilation.climateZone;
    const sf = Math.max(1, ventilation.safetyFactor);
    const heatTotal = ((ventHall * dT * 0.335) / 1000 + (ventKit * dT * 0.335) / 1000) * sf;
    const monthlyHeatingCost = heatTotal * 720 * ventilation.electricityPrice;

    const totalStaff = kitchen.cooks * shifts + coffee.baristas * shifts + waitersCount * shifts + dishwashersCount * shifts;
    const totalPayroll = kitchen.cooks * shifts * hall.cookSalary + coffee.baristas * shifts * hall.baristaSalary + waitersCount * shifts * hall.waiterSalary + dishwashersCount * shifts * hall.dishwasherSalary;
    const totalPayrollWithTaxes = totalPayroll * 1.45;

    const totalProd = kitchenRev + coffeeRev;
    const kitchenShare = totalProd > 0 ? kitchenRev / totalProd : 0;
    const coffeeShare = totalProd > 0 ? coffeeRev / totalProd : 0;
    const foodCostAbs = dailyRevenue * kitchenShare * (hall.foodCostPercent / 100) * 30;
    const drinkCostAbs = dailyRevenue * coffeeShare * (hall.drinkCostPercent / 100) * 30;
    const totalCOGS = foodCostAbs + drinkCostAbs;

    const monthlyProfit = monthlyRevenue - rentVal - totalPayrollWithTaxes - monthlyHeatingCost - totalCOGS;

    setResults({
      dishRes, totalDishes, kitchenRev, kitchenLoad, kitchenMaxDishes,
      coffeeRev, coffeeMaxDrinks,
      maxGuestsPerShift, realisticGuestsPerShift, shiftRevenue, dailyRevenue, monthlyRevenue,
      bottleneck, shifts, rent: rentVal, normalRent, rentShare,
      ventHall, ventKit, ventTotal, heatTotal, monthlyHeatingCost,
      totalStaff, totalPayroll, totalPayrollWithTaxes,
      monthlyProfit, foodCostAbs, drinkCostAbs, totalCOGS,
      requiredDishes, requiredDrinks,
      hasHall: venue.hasHall, seats: hall.seats, avgCheck: hall.avgCheck,
      turnsPerShift: venue.turnsPerShift, guestTime: venue.guestTime,
      recommendedHallArea, recommendedKitchenArea, areaPerCook,
      kitchenType: ventilation.kitchenType,
    });
  }, [common, hall, coffee, kitchen, ventilation, waitersCount, dishwashersCount, totalRent]);

  const openHelp = (block: string) => setHelpModal({ block, open: true });
  const closeHelp = () => setHelpModal({ block: '', open: false });
  const f = (n: number) => Math.round(n).toLocaleString('ru-RU');

  const helpTexts: Record<string, { title: string; text: string }> = {
    kpi: { title: 'Ключевые показатели', text: 'Дневная выручка — за одну смену. Месячная — дневная × 30. Узкое место — где заканчивается пропускная способность. Прибыль = выручка − аренда − ФОТ(с налогами) − отопление − себестоимость.' },
    hall: { title: 'Пропускная способность зала', text: 'Гости за смену = места × оборачиваемость × загрузка. Оборачиваемость зависит от формата.' },
    kitchen: { title: 'Производительность кухни', text: 'Доступное время = смена × загрузка − заготовки. Блюд = время × повара × параллельность / время блюда.' },
    coffee: { title: 'Кофейня', text: 'Напитков = (доступное время × 60 / время напитка) × бариста.' },
    ventilation: { title: 'Вентиляция', text: 'Воздухообмен = площадь × норматив. Тепловая мощность = воздухообмен × ΔT × 0.335 / 1000 × запас. Затраты = мощность × 720 ч × цена кВт·ч.' },
  };

  if (!results) {
    return (
      <ErrorBoundary>
        <div className="p-6 lg:p-8" style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* Скелетоны KPI */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            {[...Array(5)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          {/* Скелетоны двух колонок */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
            <div className="lg:col-span-7 space-y-4">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  const isProfit = results.monthlyProfit > 0;
  const isRentOk = results.rentShare <= 14;

  return (
    <ErrorBoundary>
      <div className="p-6 lg:p-8" style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Шапка */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-light)' }}>
            <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Бизнес-аналитика</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Расчёт пропускной способности, ФОТ, аренды, вентиляции</p>
          </div>
        </div>

        {/* KPI сверху */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <div className="kpi-card kpi-indigo">
            <div className="text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Дневная выручка</div>
            <div className="text-lg font-bold" style={{ color: 'var(--text)' }}>{f(results.dailyRevenue)} ₽</div>
          </div>
          <div className="kpi-card kpi-indigo">
            <div className="text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Месячная выручка</div>
            <div className="text-lg font-bold" style={{ color: 'var(--text)' }}>{f(results.monthlyRevenue)} ₽</div>
          </div>
          <div className={`kpi-card ${isProfit ? 'kpi-emerald' : 'kpi-rose'}`}>
            <div className="text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Прибыль/мес</div>
            <div className="text-lg font-bold" style={{ color: 'var(--text)' }}>{f(results.monthlyProfit)} ₽</div>
          </div>
          <div className={`kpi-card ${isRentOk ? 'kpi-emerald' : 'kpi-amber'}`}>
            <div className="text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Аренда</div>
            <div className="text-lg font-bold" style={{ color: 'var(--text)' }}>{results.rentShare.toFixed(1)}%</div>
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{f(results.rent)} ₽</div>
          </div>
          <div className="kpi-card kpi-amber">
            <div className="text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Узкое место</div>
            <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>{results.bottleneck}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ===== ЛЕВАЯ КОЛОНКА: НАСТРОЙКИ ===== */}
          <div className="lg:col-span-5 space-y-4" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: 4 }}>

            <SectionCard icon={Building} title="Тип заведения">
              <SelectField label="Формат" value={hall.venueType} onChange={applyVenueDefaults}
                options={Object.entries(VENUE_TYPES).map(([k, v]) => ({ value: k, label: v.label }))} />
            </SectionCard>

            <SectionCard icon={Gauge} title="Площади и аренда">
              <SliderField label="Общая площадь" value={hall.totalArea} onChange={(v) => setHall({ ...hall, totalArea: v })} min={10} max={2000} unit="м²" />
              {hasHall && (
                <SliderField label="Площадь зала" value={hall.hallArea} onChange={(v) => setHall({ ...hall, hallArea: v })} min={1} max={hall.totalArea} unit="м²"
                  hint={results.recommendedHallArea ? `Рекомендуется: ${results.recommendedHallArea} м²` : undefined}
                  warning={hallAreaWarning || areaOverflowWarning} />
              )}
              <SliderField label="Площадь кухни" value={hall.kitchenArea} onChange={(v) => setHall({ ...hall, kitchenArea: v })} min={1} max={hall.totalArea} unit="м²"
                hint={`${results.areaPerCook} м²/повара → ${results.recommendedKitchenArea} м²`}
                warning={kitchenAreaWarning} />
              <SliderField label="Аренда" value={hall.rentPerSqm} onChange={(v) => setHall({ ...hall, rentPerSqm: v })} min={0} max={20000} step={50} unit="₽/м²"
                hint={`Итого: ${f(totalRent)} ₽/мес`} />
            </SectionCard>

            {hasHall && (
              <SectionCard icon={Armchair} title="Зал" helpKey="hall" onHelp={openHelp}>
                <SliderField label="Мест" value={hall.seats} onChange={(v) => setHall({ ...hall, seats: v })} min={1} max={500} />
                <SliderField label="Средний чек" value={hall.avgCheck} onChange={(v) => setHall({ ...hall, avgCheck: v })} min={50} max={5000} step={50} unit="₽" />
              </SectionCard>
            )}

            <SectionCard icon={Clock} title="Режим работы">
              <SliderField label="Часов в день" value={common.operatingHours} onChange={(v) => setCommon({ ...common, operatingHours: v })} min={1} max={24} step={0.5} unit="ч" />
              <SliderField label="Смена" value={common.shiftHours} onChange={(v) => setCommon({ ...common, shiftHours: v })} min={1} max={12} step={0.5} unit="ч"
                hint={`${results.shifts} смен(ы)`} />
            </SectionCard>

            <SectionCard icon={Settings} title="Загрузка и спрос">
              <SliderField label="Загрузка" value={common.loadFactor} onChange={(v) => setCommon({ ...common, loadFactor: v })} min={10} max={100} unit="%" />
              <SliderField label="Заготовки" value={common.prepRatio} onChange={(v) => setCommon({ ...common, prepRatio: v })} min={0} max={40} unit="%" />
              <SliderField label="Блюд на гостя" value={common.avgDishesPerGuest} onChange={(v) => setCommon({ ...common, avgDishesPerGuest: v })} min={0.1} max={3} step={0.1} />
              <SliderField label="Напитков на гостя" value={common.avgDrinksPerGuest} onChange={(v) => setCommon({ ...common, avgDrinksPerGuest: v })} min={0.1} max={3} step={0.1} />
            </SectionCard>

            <SectionCard icon={Users} title="Персонал">
              <div className="grid grid-cols-2 gap-x-4">
                <SliderField label="Поваров" value={kitchen.cooks} onChange={(v) => setKitchen({ ...kitchen, cooks: v })} min={0} max={20} />
                <SliderField label="ЗП повара" value={hall.cookSalary} onChange={(v) => setHall({ ...hall, cookSalary: v })} min={0} max={200000} step={1000} unit="₽" />
                <SliderField label="Бариста" value={coffee.baristas} onChange={(v) => setCoffee({ ...coffee, baristas: v })} min={0} max={10} />
                <SliderField label="ЗП бариста" value={hall.baristaSalary} onChange={(v) => setHall({ ...hall, baristaSalary: v })} min={0} max={150000} step={1000} unit="₽" />
                {hasHall && (
                  <>
                    <SliderField label="Официанты" value={waitersCount} onChange={(v) => setWaitersCount(v)} min={0} max={20}
                      hint={waitersCount > 0 ? `${Math.ceil(hall.seats / waitersCount)} гост/оф.` : ''} />
                    <SliderField label="ЗП официанта" value={hall.waiterSalary} onChange={(v) => setHall({ ...hall, waiterSalary: v })} min={0} max={100000} step={1000} unit="₽" />
                  </>
                )}
                <SliderField label="Мойщицы" value={dishwashersCount} onChange={(v) => setDishwashersCount(v)} min={0} max={10}
                  hint={dishwashersCount > 0 ? `${Math.ceil(hall.hallArea / dishwashersCount)} м²/чел.` : ''} />
                <SliderField label="ЗП мойщицы" value={hall.dishwasherSalary} onChange={(v) => setHall({ ...hall, dishwasherSalary: v })} min={0} max={100000} step={1000} unit="₽" />
              </div>
            </SectionCard>

            <SectionCard icon={DollarSign} title="Себестоимость">
              <SliderField label="Блюд" value={hall.foodCostPercent} onChange={(v) => setHall({ ...hall, foodCostPercent: v })} min={0} max={100} unit="%"
                hint={`${f(results.foodCostAbs)} ₽`} />
              <SliderField label="Напитков" value={hall.drinkCostPercent} onChange={(v) => setHall({ ...hall, drinkCostPercent: v })} min={0} max={100} unit="%"
                hint={`${f(results.drinkCostAbs)} ₽`} />
              <ResultRow label="Итого себестоимость" value={`${f(results.totalCOGS)} ₽`} bold />
            </SectionCard>

            <SectionCard icon={Flame} title="Кухня (меню)" helpKey="kitchen" onHelp={openHelp}>
              <SliderField label="Поваров" value={kitchen.cooks} onChange={(v) => setKitchen({ ...kitchen, cooks: v })} min={0} max={20} />
              <SliderField label="Параллельность" value={kitchen.parallelism} onChange={(v) => setKitchen({ ...kitchen, parallelism: v })} min={1} max={10} />
              <div className="mt-3 space-y-2">
                {kitchen.dishes.map((d) => (
                  <div key={d.id} className="flex items-center gap-2">
                    <input type="text" value={d.name} onChange={(e) => updateDish(d.id, 'name', e.target.value)}
                      className="input-field flex-1" style={{ padding: '5px 8px', fontSize: 12 }} />
                    <input type="number" value={d.time} onChange={(e) => updateDish(d.id, 'time', Number(e.target.value))}
                      className="input-field" style={{ width: 56, padding: '5px 6px', fontSize: 12 }} placeholder="мин" />
                    <input type="number" value={d.price} onChange={(e) => updateDish(d.id, 'price', Number(e.target.value))}
                      className="input-field" style={{ width: 72, padding: '5px 6px', fontSize: 12 }} placeholder="₽" />
                    <button onClick={() => removeDish(d.id)} className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center hover:bg-red-50 transition"
                      style={{ color: 'var(--danger)', fontSize: 14 }}>×</button>
                  </div>
                ))}
                <button onClick={addDish} className="flex items-center gap-1.5 text-xs font-medium mt-2 transition" style={{ color: 'var(--primary)' }}>
                  <Plus size={14} /> Добавить категорию
                </button>
              </div>
            </SectionCard>

            <SectionCard icon={Coffee} title="Кофейня" helpKey="coffee" onHelp={openHelp}>
              <SliderField label="Бариста" value={coffee.baristas} onChange={(v) => setCoffee({ ...coffee, baristas: v })} min={0} max={10} />
              <SliderField label="Время напитка" value={coffee.drinkTime} onChange={(v) => setCoffee({ ...coffee, drinkTime: v })} min={10} max={300} unit="сек" />
              <SliderField label="Цена напитка" value={coffee.drinkPrice} onChange={(v) => setCoffee({ ...coffee, drinkPrice: v })} min={50} max={2000} step={10} unit="₽" />
            </SectionCard>

            <SectionCard icon={Wind} title="Вентиляция" helpKey="ventilation" onHelp={openHelp}>
              <SelectField label="Тип кухни" value={ventilation.kitchenType} onChange={(v) => setVentilation({ ...ventilation, kitchenType: v })}
                options={[{ value: 'hot', label: 'Горячая' }, { value: 'cold', label: 'Холодная' }, { value: 'mixed', label: 'Смешанная' }]} />
              <SelectField label="Климат" value={String(ventilation.climateZone)} onChange={(v) => setVentilation({ ...ventilation, climateZone: Number(v) })}
                options={CLIMATE_ZONES.map((z) => ({ value: String(z.temp), label: `${z.label} (${z.temp}°C)` }))} />
              <SliderField label="t внутри" value={ventilation.indoorTemp} onChange={(v) => setVentilation({ ...ventilation, indoorTemp: v })} min={15} max={30} step={0.5} unit="°C" />
              <SliderField label="Запас" value={ventilation.safetyFactor} onChange={(v) => setVentilation({ ...ventilation, safetyFactor: v })} min={1} max={2} step={0.05} />
              <SliderField label="кВт·ч" value={ventilation.electricityPrice} onChange={(v) => setVentilation({ ...ventilation, electricityPrice: v })} min={0.5} max={15} step={0.1} unit="₽" />
            </SectionCard>

            <div style={{ height: 40 }} />
          </div>

          {/* ===== ПРАВАЯ КОЛОНКА: РЕЗУЛЬТАТЫ ===== */}
          <div className="lg:col-span-7 space-y-4" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingLeft: 4 }}>
            {/* ИТОГО ПРИБЫЛЬ */}
            <div className="card p-5" style={{ border: `2px solid ${isProfit ? 'var(--success)' : 'var(--danger)'}`, background: isProfit ? 'var(--success-light)' : 'var(--danger-light)' }}>
              <div className="flex items-center gap-2 mb-3">
                {isProfit ? <CheckCircle size={18} style={{ color: 'var(--success)' }} /> : <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />}
                <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>Итоговая операционная прибыль</span>
              </div>
              <div className="space-y-1.5 text-sm">
                <ResultRow label="Выручка" value={`${f(results.monthlyRevenue)} ₽`} />
                <ResultRow label="− Аренда" value={`−${f(results.rent)} ₽`} />
                <ResultRow label="− ФОТ + налоги" value={`−${f(results.totalPayrollWithTaxes)} ₽`} />
                <ResultRow label="− Отопление" value={`−${f(results.monthlyHeatingCost)} ₽`} />
                <ResultRow label="− Себестоимость" value={`−${f(results.totalCOGS)} ₽`} />
                <div className="divider" style={{ margin: '8px 0' }} />
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold" style={{ color: 'var(--text)' }}>Прибыль</span>
                  <span className="text-xl font-bold tabular-nums" style={{ color: isProfit ? 'var(--success)' : 'var(--danger)' }}>
                    {f(results.monthlyProfit)} ₽
                  </span>
                </div>
                {results.monthlyRevenue > 0 && (
                  <div className="text-right">
                    <span className="text-sm font-semibold" style={{ color: isProfit ? 'var(--success)' : 'var(--danger)' }}>
                      {((results.monthlyProfit / results.monthlyRevenue) * 100).toFixed(1)}%
                    </span>
                    <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>→ 15%+</span>
                  </div>
                )}
              </div>
            </div>
            {/* Сводка за смену */}
            <SectionCard icon={TrendingUp} title="Сводка за смену" helpKey="kpi" onHelp={openHelp}>
              {results.hasHall && (
                <>
                  <ResultRow label="Гости (загрузка)" value={`${results.realisticGuestsPerShift} чел.`}
                    sub={`макс: ${Math.round(hall.seats * (results.turnsPerShift || 0))}`} />
                  <div className="divider" style={{ margin: '8px 0' }} />
                </>
              )}
              <ResultRow label="Кухня" value={`${results.totalDishes} блюд`}
                sub={`макс: ${results.kitchenMaxDishes}`}
                color={results.requiredDishes > results.kitchenMaxDishes ? 'var(--danger)' : undefined} />
              <ResultRow label="Кофейня" value={`${results.coffeeMaxDrinks} напитков`}
                sub={results.requiredDrinks > results.coffeeMaxDrinks ? '⚠️ не хватает' : undefined}
                color={results.requiredDrinks > results.coffeeMaxDrinks ? 'var(--danger)' : undefined} />
              <div className="divider" style={{ margin: '8px 0' }} />
              <ResultRow label="Выручка за смену" value={`${f(results.dailyRevenue)} ₽`} bold color="var(--primary)" />
              <ResultRow label="Выручка за месяц" value={`${f(results.monthlyRevenue)} ₽`} bold />
            </SectionCard>

            {/* ФОТ */}
            <SectionCard icon={DollarSign} title="ФОТ и штат">
              <ResultRow label="Смен" value={`${results.shifts}`} />
              <ResultRow label="Всего персонала" value={`${results.totalStaff} чел.`} />
              <div className="divider" style={{ margin: '8px 0' }} />
              <ResultRow label="ФОТ (чистый)" value={`${f(results.totalPayroll)} ₽`} />
              <ResultRow label="ФОТ + налоги (×1.45)" value={`${f(results.totalPayrollWithTaxes)} ₽`} bold />
              {results.monthlyRevenue > 0 && (
                <ResultRow label="ФОТ от выручки"
                  value={`${((results.totalPayrollWithTaxes / results.monthlyRevenue) * 100).toFixed(1)}%`}
                  sub="→ 22–25%"
                  color={results.totalPayrollWithTaxes / results.monthlyRevenue > 0.25 ? 'var(--warning)' : 'var(--success)'} />
              )}
            </SectionCard>

            {/* Аренда */}
            <SectionCard icon={Building} title="Аренда">
              <ResultRow label="Ставка" value={`${f(hall.rentPerSqm)} ₽/м²`} />
              <ResultRow label="Площадь" value={`${hall.totalArea} м²`} />
              <ResultRow label="Аренда/мес" value={`${f(results.rent)} ₽`} bold />
              <div className="divider" style={{ margin: '8px 0' }} />
              <ResultRow label="Доля от выручки"
                value={`${results.rentShare.toFixed(1)}%`}
                sub="→ до 14%"
                color={isRentOk ? 'var(--success)' : 'var(--danger)'} />
              {!isRentOk && (
                <p className="text-xs mt-2 p-2.5 rounded-lg" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                  ⚠️ Аренда выше комфортного уровня. Нормальная: {f(results.normalRent)} ₽
                </p>
              )}
            </SectionCard>

            {/* Вентиляция */}
            <SectionCard icon={Wind} title="Вентиляция и отопление">
              <ResultRow label="Воздухообмен зал" value={`${f(results.ventHall)} м³/ч`} />
              <ResultRow label="Воздухообмен кухня" value={`${f(results.ventKit)} м³/ч`} />
              <ResultRow label="Итого" value={`${f(results.ventTotal)} м³/ч`} bold />
              <div className="divider" style={{ margin: '8px 0' }} />
              <ResultRow label="Тепловая мощность" value={`${results.heatTotal.toFixed(1)} кВт`} />
              <ResultRow label="Отопление/мес" value={`${f(results.monthlyHeatingCost)} ₽`} bold />
            </SectionCard>

            {/* Кухня детали */}
            <SectionCard icon={ChefHat} title="Детализация кухни">
              <div className="space-y-2">
                {results.dishRes?.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between text-sm py-1.5 border-b" style={{ borderColor: 'var(--border-light)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>{d.time} мин</span>
                      <span className="font-medium tabular-nums" style={{ color: 'var(--text)' }}>{d.maxDishes} шт</span>
                      <span className="font-semibold tabular-nums" style={{ color: 'var(--primary)' }}>{f(d.revenue)} ₽</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="divider" style={{ margin: '8px 0' }} />
              <ResultRow label="Итого выручка кухни" value={`${f(results.kitchenRev)} ₽`} bold color="var(--primary)" />
              <ResultRow label="Загрузка кухни"
                value={`${results.kitchenLoad.toFixed(0)}%`}
                color={results.kitchenLoad > 95 ? 'var(--danger)' : results.kitchenLoad > 80 ? 'var(--warning)' : 'var(--success)'} />
              {results.kitchenLoad > 95 && (
                <p className="text-xs mt-2 p-2.5 rounded-lg" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                  ⚠️ Критическая загрузка — риск сбоев в обслуживании
                </p>
              )}
            </SectionCard>

            {/* Кофейня детали */}
            <SectionCard icon={Coffee} title="Детализация кофейни">
              <ResultRow label="Макс. напитков" value={`${results.coffeeMaxDrinks}`} />
              <ResultRow label="Выручка кофейни" value={`${f(results.coffeeRev)} ₽`} bold color="var(--primary)" />
            </SectionCard>

            {/* Себестоимость */}
            <SectionCard icon={DollarSign} title="Себестоимость">
              <ResultRow label="Блюда" value={`${f(results.foodCostAbs)} ₽`} sub={`${hall.foodCostPercent}%`} />
              <ResultRow label="Напитки" value={`${f(results.drinkCostAbs)} ₽`} sub={`${hall.drinkCostPercent}%`} />
              <div className="divider" style={{ margin: '8px 0' }} />
              <ResultRow label="Итого себестоимость" value={`${f(results.totalCOGS)} ₽`} bold />
              {results.monthlyRevenue > 0 && (
                <ResultRow label="Общий food cost"
                  value={`${((results.totalCOGS / results.monthlyRevenue) * 100).toFixed(1)}%`}
                  sub="→ 28–32%"
                  color={results.totalCOGS / results.monthlyRevenue > 0.32 ? 'var(--warning)' : 'var(--success)'} />
              )}
            </SectionCard>

            <div style={{ height: 40 }} />
          </div>
        </div>

        {/* Help Modal */}
        <HelpModal isOpen={helpModal.open} onClose={closeHelp} title={helpTexts[helpModal.block]?.title || ''}>
          {helpTexts[helpModal.block]?.text || ''}
        </HelpModal>
      </div>
    </ErrorBoundary>
  );
}