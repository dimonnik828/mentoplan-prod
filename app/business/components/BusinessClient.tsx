'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Settings, Armchair, Coffee, Flame, Building, Zap, Gauge,
  Plus, TrendingUp, AlertTriangle, MapPin, BarChart3,
  CheckCircle, Users, Clock, DollarSign, Info, ChefHat,
  ChevronDown, LayoutGrid,
} from 'lucide-react';
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

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
  potentialGuests: number;
  competitorInfluence: number;
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

const VENUE_TYPES: Record<string, {
  label: string; hallRate: number; waiterRatio: number; dishwasherRatio: number;
  guestTime: number; turnsPerShift: number; hasHall: boolean;
  areaPerSeat: [number, number];
  areaPerCook: [number, number];
}> = {
  restaurant: { label: 'Ресторан', hallRate: 3.0, waiterRatio: 20, dishwasherRatio: 100, guestTime: 50, turnsPerShift: 1.8, hasHall: true, areaPerSeat: [2.5, 3.5], areaPerCook: [5, 6] },
  coffee: { label: 'Кофейня', hallRate: 3.5, waiterRatio: 40, dishwasherRatio: 100, guestTime: 25, turnsPerShift: 3.0, hasHall: true, areaPerSeat: [1.5, 1.8], areaPerCook: [4, 5] },
  cafe: { label: 'Кафе', hallRate: 3.2, waiterRatio: 40, dishwasherRatio: 100, guestTime: 35, turnsPerShift: 2.2, hasHall: true, areaPerSeat: [1.8, 2.2], areaPerCook: [5, 6] },
  canteen: { label: 'Столовая', hallRate: 4.5, waiterRatio: 0, dishwasherRatio: 100, guestTime: 20, turnsPerShift: 3.5, hasHall: true, areaPerSeat: [1.8, 2.2], areaPerCook: [5, 6] },
  fastfood: { label: 'Быстрое обслуживание', hallRate: 4.0, waiterRatio: 0, dishwasherRatio: 100, guestTime: 10, turnsPerShift: 4.5, hasHall: true, areaPerSeat: [1.2, 1.5], areaPerCook: [3, 4] },
  darkkitchen: { label: 'Дарк китчен (доставка)', hallRate: 0, waiterRatio: 0, dishwasherRatio: 50, guestTime: 0, turnsPerShift: 0, hasHall: false, areaPerSeat: [0, 0], areaPerCook: [6, 8] },
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
   ОБЩИЕ КОМПОНЕНТЫ
   ============================================================ */
function SliderField({
  label, value, onChange, min = 0, max = 100, step = 1, unit = '', hint, warning, compact = false,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; unit?: string; hint?: string; warning?: string; compact?: boolean;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={cn('last:mb-0', compact ? 'mb-2' : 'mb-3')}>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-500">{label}</span>
          <div className="flex items-center gap-1">
            <input
              type="number" min={min} max={max} step={step} value={value}
              onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v))); }}
              className="w-16 text-right text-xs tabular-nums rounded-md border border-gray-200 bg-white px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
            {unit && <span className="text-[10px] text-gray-400 w-6">{unit}</span>}
          </div>
        </div>
      )}
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #10b981 0%, #10b981 ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)`,
          accentColor: '#10b981',
        }}
      />
      {hint && <p className="text-[10px] mt-0.5 text-gray-400">{hint}</p>}
      {warning && <p className="text-[10px] mt-0.5 text-red-500">{warning}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div className="mb-3 last:mb-0">
      <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full text-xs rounded-md border border-gray-200 bg-white px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
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
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs" style={{ color: '#6b7280', fontWeight: bold ? 600 : 400 }}>{label}</span>
      <div className="text-right">
        <span className="text-xs tabular-nums" style={{ color: color || '#111827', fontWeight: bold ? 700 : 600 }}>{value}</span>
        {sub && <span className="text-[10px] ml-1.5 text-gray-400">{sub}</span>}
      </div>
    </div>
  );
}

function HelpModal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition text-gray-400">✕</button>
        </div>
        <div className="px-4 py-3 text-sm overflow-y-auto text-gray-600">{children}</div>
      </div>
    </div>
  );
}

/* Collapsible Section */
function CollapsibleSection({
  icon: Icon, title, children, helpKey, onHelp, defaultOpen = true, badge,
}: {
  icon: React.ElementType; title: string; children: React.ReactNode;
  helpKey?: string; onHelp?: (k: string) => void; defaultOpen?: boolean;
  badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-gray-50/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center bg-emerald-50">
            <Icon size={13} className="text-emerald-600" />
          </div>
          <span className="text-xs font-semibold text-gray-800">{title}</span>
          {badge && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">{badge}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {helpKey && onHelp && (
            <span
              onClick={(e) => { e.stopPropagation(); onHelp(helpKey); }}
              className="text-gray-300 hover:text-gray-500 transition cursor-pointer"
            >
              <Info size={13} />
            </span>
          )}
          <ChevronDown
            size={15}
            className={cn('text-gray-400 transition-transform duration-200', open && 'rotate-180')}
          />
        </div>
      </button>
      {open && (
        <div className="px-3.5 pb-3.5 pt-0">
          <div className="border-t border-gray-50 pt-3">
            {children}
          </div>
        </div>
      )}
    </div>
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

  const baseMenuRef = useRef<Dish[]>([
    { id: '1', name: 'Салаты', time: 10, price: 350 },
    { id: '2', name: 'Горячее', time: 35, price: 650 },
    { id: '3', name: 'Пицца', time: 15, price: 550 },
    { id: '4', name: 'Десерты', time: 8, price: 300 },
  ]);
  const baseDrinkPriceRef = useRef(250);

  const [hall, setHall] = useState<HallSettings>(initFromDashboard(dashboard));
  const [common, setCommon] = useState<CommonSettings>({
    shiftHours: 8, operatingHours: 14, dailyGuests: 50,
    avgDishesPerGuest: 0.8, avgDrinksPerGuest: 1.2,
  });
  const [coffee, setCoffee] = useState<CoffeeSettings>({ baristas: 2, drinkTime: 55, drinkPrice: baseDrinkPriceRef.current });
  const [kitchen, setKitchen] = useState<KitchenSettings>({
    cooks: 2, parallelism: 3, dishes: baseMenuRef.current.map(d => ({ ...d })),
  });
  const [energy, setEnergy] = useState<EnergySettings>({
    kitchenType: 'hot', climateZone: -25, indoorTemp: 22, safetyFactor: 1.1, electricityPrice: 5.5, otherPower: 0,
  });
  const [location, setLocation] = useState<LocationSettings>({
    district: 'central', locationType: 'street', competitors: 10, potentialGuests: 20, competitorInfluence: 0.3,
  });

  const [results, setResults] = useState<any>(null);
  const [helpModal, setHelpModal] = useState<{ block: string; open: boolean }>({ block: '', open: false });
  const isUpdatingRef = useRef(false);

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

  useEffect(() => {
    if (!dashboard) return;
    setHall(initFromDashboard(dashboard));
    const venue = VENUE_TYPES[dashboard.venueType || 'cafe'] || VENUE_TYPES.cafe;
    setWaitersCount(venue.hasHall && venue.waiterRatio > 0 ? Math.max(1, Math.ceil((dashboard.seats ?? 50) / venue.waiterRatio)) : 0);
    setDishwashersCount(venue.dishwasherRatio > 0 ? Math.max(1, Math.ceil((dashboard.hallArea ?? 75) / venue.dishwasherRatio)) : 0);
  }, [dashboard]);

  useEffect(() => {
    const theoreticalCheck = calculateTheoreticalCheck(kitchen.dishes, coffee.drinkPrice, common.avgDishesPerGuest, common.avgDrinksPerGuest);
    if (Math.abs(theoreticalCheck - hall.avgCheck) > 1) handleAvgCheckChange(hall.avgCheck);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setLocation(prev => ({ ...prev, district: d, locationType: t }));
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
    const marketShare = potentialGuestsTotal > 0 ? (monthlyGuestsModel / potentialGuestsTotal) * 100 : 0;
    const growthPotential = availableMarketFlow - monthlyGuestsModel;

    const revenueCeiling = kitchenRev + coffeeRev;
    const revenueFromGuests = realisticGuestsPerShift * hall.avgCheck;
    const limitingFactor = revenueFromGuests >= revenueCeiling ? 'Кухня/бар' : 'Зал';

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
    });
  }, [common, hall, coffee, kitchen, energy, waitersCount, dishwashersCount, location, totalRent, hasHall]);

  const openHelp = (block: string) => setHelpModal({ block, open: true });
  const closeHelp = () => setHelpModal({ block: '', open: false });
  const f = (n: number) => Math.round(n).toLocaleString('ru-RU');

  const helpTexts: Record<string, { title: string; text: string }> = {
    kpi: { title: 'Ключевые показатели', text: 'Дневная выручка — расчётная по модели. Месячная — введённая или расчётная.' },
    hall: { title: 'Пропускная способность зала', text: 'Гости за смену = общее число гостей в день / количество смен.' },
    kitchen: { title: 'Производительность кухни', text: 'Доступное время = смена × (100% − заготовки).' },
    coffee: { title: 'Кофейня', text: 'Напитков = (доступное время × 60 / время напитка) × бариста.' },
    energy: { title: 'Энергопотребление', text: 'Воздухообмен = площадь × норматив. Тепловая мощность = воздухообмен × ΔT × 0.335 / 1000 × запас. Затраты = мощность × 720 ч × цена кВт·ч.' },
    location: { title: 'Локация и конкуренция', text: 'Анализ рыночного потенциала и доли аренды.' },
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
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 sm:h-20 rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-5 space-y-3">
              <div className="h-40 rounded-xl bg-gray-200 animate-pulse" />
              <div className="h-32 rounded-xl bg-gray-200 animate-pulse" />
            </div>
            <div className="lg:col-span-7 space-y-3">
              <div className="h-28 rounded-xl bg-gray-200 animate-pulse" />
              <div className="h-24 rounded-xl bg-gray-200 animate-pulse" />
            </div>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto p-3 sm:p-4 lg:p-6">

        {/* Шапка */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 flex-shrink-0">
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">Бизнес-аналитика</h1>
            <p className="text-[10px] sm:text-xs text-gray-400 truncate">
              {dashboard?.name || 'Заведение'}
              {dashboard?.name && dashboard?.address ? ' · ' : ''}
              {dashboard?.address || ''}
            </p>
          </div>
        </div>

        {/* KPI — горизонтальный скролл на мобильном */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 sm:overflow-visible sm:grid sm:grid-cols-5">
          {[
            { label: 'Дневная выручка', value: inputDailyRevenue != null ? f(inputDailyRevenue) : f(results.dailyRevenue), sub: inputDailyRevenue != null ? `расчёт: ${f(results.dailyRevenue)} ₽` : 'расчёт модели', color: '' },
            { label: 'Месячная выручка', value: inputMonthlyRevenue != null ? f(inputMonthlyRevenue) : f(results.monthlyRevenue), sub: inputMonthlyRevenue != null ? `расчёт: ${f(results.monthlyRevenue)} ₽` : undefined, color: '' },
            { label: 'Прибыль/мес', value: (inputProfit != null ? f(inputProfit) : f(results.monthlyProfit)) + ' ₽', sub: inputProfit == null ? 'не все вводные' : `расчёт: ${f(results.monthlyProfit)} ₽`, color: (inputProfit ?? results.monthlyProfit) > 0 ? 'emerald' : 'rose' },
            { label: 'Аренда', value: (inputRent != null ? f(inputRent) : f(results.totalRent)) + ' ₽', sub: results.totalRent > 0 && results.monthlyRevenue > 0 ? `${((results.totalRent / results.monthlyRevenue) * 100).toFixed(1)}%` : undefined, color: isRentOk ? 'emerald' : 'amber' },
            { label: 'Узкое место', value: results.bottleneck, sub: undefined, color: 'amber' },
          ].map((kpi, i) => (
            <div
              key={i}
              className={cn(
                'flex-shrink-0 w-[140px] sm:w-auto sm:flex-shrink rounded-xl border p-2.5 sm:p-3',
                kpi.color === 'emerald' && 'border-emerald-200 bg-emerald-50/50',
                kpi.color === 'rose' && 'border-red-200 bg-red-50/50',
                kpi.color === 'amber' && 'border-amber-200 bg-amber-50/50',
                !kpi.color && 'border-gray-100 bg-white',
              )}
            >
              <div className="text-[10px] font-medium text-gray-400 mb-1">{kpi.label}</div>
              <div className={cn(
                'text-sm font-bold tabular-nums',
                kpi.color === 'emerald' && 'text-emerald-700',
                kpi.color === 'rose' && 'text-red-600',
                kpi.color === 'amber' && 'text-amber-700',
                !kpi.color && 'text-gray-900',
              )}>{kpi.value}</div>
              {kpi.sub && <div className="text-[10px] mt-0.5 text-gray-400 truncate">{kpi.sub}</div>}
            </div>
          ))}
        </div>

        {/* ОСНОВНОЙ LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">

          {/* ========== ЛЕВАЯ КОЛОНКА: НАСТРОЙКИ ========== */}
          <div className="lg:col-span-5 space-y-2 lg:space-y-2.5 lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto lg:pr-1">

            {/* 1. Тип и локация */}
            <CollapsibleSection icon={Building} title="Тип и локация" defaultOpen={false}>
              <SelectField label="Формат" value={hall.venueType} onChange={applyVenueDefaults}
                options={Object.entries(VENUE_TYPES).map(([k, v]) => ({ value: k, label: v.label }))} />
              <div className="grid grid-cols-2 gap-2">
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
            {/* 9. Рынок и конкуренция */}
            <CollapsibleSection icon={MapPin} title="Рынок и конкуренция" helpKey="location" onHelp={openHelp} defaultOpen={false}>
              <SliderField label="Конкуренты" value={location.competitors} onChange={(v) => setLocation({ ...location, competitors: v })} min={0} max={50} compact />
              <SliderField label="Потенц. гости" value={location.potentialGuests} onChange={(v) => setLocation({ ...location, potentialGuests: v })} min={1} max={500} step={1} unit="тыс/мес" compact />
              <SliderField label="Влияние конкур." value={location.competitorInfluence} onChange={(v) => setLocation({ ...location, competitorInfluence: v })} min={0.1} max={1.0} step={0.1} compact
                hint="Чем выше — тем сильнее конкуренты урезают поток" />
            </CollapsibleSection>

            {/* 2. Помещение и аренда */}
            <CollapsibleSection icon={Gauge} title="Помещение и аренда" defaultOpen={false}>
              <SliderField label="Общая площадь" value={hall.totalArea} onChange={(v) => setHall({ ...hall, totalArea: v })} min={10} max={2000} unit="м²" compact />
              {hasHall && (
                <SliderField label="Площадь зала" value={hall.hallArea} onChange={(v) => setHall({ ...hall, hallArea: v })} min={1} max={hall.totalArea} unit="м²" compact
                  hint={`Рек: ${results.recommendedHallArea} м²`}
                  warning={hall.hallArea < results.recommendedHallArea ? 'Меньше нормы' : undefined} />
              )}
              <SliderField label="Площадь кухни" value={hall.kitchenArea} onChange={(v) => setHall({ ...hall, kitchenArea: v })} min={1} max={hall.totalArea} unit="м²" compact
                hint={`Рек: ${results.recommendedKitchenArea} м²`}
                warning={hall.kitchenArea < results.recommendedKitchenArea ? 'Меньше нормы' : undefined} />
              <SliderField label="Аренда (ставка)" value={hall.rentPerSqm} onChange={(v) => setHall({ ...hall, rentPerSqm: v })} min={0} max={20000} step={50} unit="₽/м²" compact
                hint={`${districtLabel}: ${locationRates[0].toLocaleString()}–${locationRates[1].toLocaleString()} ₽`}
                warning={isRentRateHigh ? 'Выше рынка' : (isRentRateLow ? 'Ниже рынка' : undefined)} />
            </CollapsibleSection>

            {/* 3. Зал и загрузка (объединено) */}
            {hasHall && (
              <CollapsibleSection icon={Armchair} title="Зал и загрузка" helpKey="hall" onHelp={openHelp} defaultOpen={false}
                badge={`${results.realisticGuestsPerShift} чел/см`}>
                <SliderField label="Мест" value={hall.seats} onChange={(v) => setHall({ ...hall, seats: v })} min={1} max={500} compact />
                <SliderField label="Средний чек" value={hall.avgCheck} onChange={handleAvgCheckChange} min={50} max={5000} step={50} unit="₽" compact />
                <div className="border-t border-gray-50 my-2" />
                <SliderField label="Часов в день" value={common.operatingHours} onChange={(v) => setCommon({ ...common, operatingHours: v })} min={1} max={24} step={0.5} unit="ч" compact
                  hint={`${results.shifts} смен(ы)`} />
                <SliderField label="Смена" value={common.shiftHours} onChange={(v) => setCommon({ ...common, shiftHours: v })} min={1} max={12} step={0.5} unit="ч" compact />
                <SliderField label="Гостей в день" value={common.dailyGuests} onChange={(v) => setCommon({ ...common, dailyGuests: v })} min={1} max={1000} compact />
                <div className="grid grid-cols-2 gap-2">
                  <SliderField label="Блюд/гость" value={common.avgDishesPerGuest} onChange={handleDishesPerGuestChange} min={0.1} max={3} step={0.1} compact />
                  <SliderField label="Напитков/гость" value={common.avgDrinksPerGuest} onChange={handleDrinksPerGuestChange} min={0.1} max={3} step={0.1} compact />
                </div>
              </CollapsibleSection>
            )}

            {/* 4. Персонал (без дублирования поваров/бариста — они в своих секциях) */}
            <CollapsibleSection icon={Users} title="Персонал" defaultOpen={false}
              badge={`${results.totalStaff} чел.`}>
              <div className="grid grid-cols-2 gap-x-2">
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
            </CollapsibleSection>

            {/* 5. Кухня (меню + повара + зарплаты) */}
            <CollapsibleSection icon={Flame} title="Кухня" helpKey="kitchen" onHelp={openHelp} defaultOpen={false}
              badge={`${kitchen.cooks} повара`}>
              <div className="grid grid-cols-2 gap-x-2">
                <SliderField label="Поваров" value={kitchen.cooks} onChange={(v) => setKitchen({ ...kitchen, cooks: v })} min={0} max={20} compact />
                <SliderField label="ЗП повара" value={hall.cookSalary} onChange={(v) => setHall({ ...hall, cookSalary: v })} min={0} max={200000} step={1000} unit="₽" compact />
              </div>
              <SliderField label="Параллельность" value={kitchen.parallelism} onChange={(v) => setKitchen({ ...kitchen, parallelism: v })} min={1} max={10} compact />
              <div className="border-t border-gray-50 my-2" />
              <div className="text-[10px] font-medium text-gray-400 mb-1.5">Меню</div>
              <div className="space-y-1.5">
                {kitchen.dishes.map((d) => (
                  <div key={d.id} className="flex items-center gap-1.5">
                    <input type="text" value={d.name} onChange={(e) => updateDish(d.id, 'name', e.target.value)}
                      className="flex-1 min-w-0 text-xs rounded-md border border-gray-200 bg-white px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                    <input type="number" value={d.time} onChange={(e) => updateDish(d.id, 'time', Number(e.target.value))}
                      className="w-12 text-xs rounded-md border border-gray-200 bg-white px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 tabular-nums" placeholder="мин" />
                    <input type="number" value={d.price} onChange={(e) => updateDish(d.id, 'price', Number(e.target.value))}
                      className="w-16 text-xs rounded-md border border-gray-200 bg-white px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 tabular-nums" placeholder="₽" />
                    <button onClick={() => removeDish(d.id)} className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center hover:bg-red-50 transition text-red-400 text-sm">×</button>
                  </div>
                ))}
                <button onClick={addDish} className="flex items-center gap-1 text-[11px] font-medium mt-1 text-emerald-600 hover:text-emerald-700 transition">
                  <Plus size={12} /> Добавить
                </button>
              </div>
            </CollapsibleSection>

            {/* 6. Кофейня (бариста + параметры) */}
            <CollapsibleSection icon={Coffee} title="Бар" helpKey="coffee" onHelp={openHelp} defaultOpen={false}
              badge={`${coffee.baristas} бариста`}>
              <div className="grid grid-cols-2 gap-x-2">
                <SliderField label="Бариста" value={coffee.baristas} onChange={(v) => setCoffee({ ...coffee, baristas: v })} min={0} max={10} compact />
                <SliderField label="ЗП бариста" value={hall.baristaSalary} onChange={(v) => setHall({ ...hall, baristaSalary: v })} min={0} max={150000} step={1000} unit="₽" compact />
              </div>
              <SliderField label="Время напитка" value={coffee.drinkTime} onChange={(v) => setCoffee({ ...coffee, drinkTime: v })} min={10} max={300} unit="сек" compact />
              <SliderField label="Цена напитка" value={coffee.drinkPrice} onChange={updateDrinkPrice} min={50} max={2000} step={10} unit="₽" compact />
            </CollapsibleSection>

            {/* 7. Себестоимость */}
            <CollapsibleSection icon={DollarSign} title="Себестоимость" defaultOpen={false}
              badge={`${f(results.totalCOGS)} ₽`}>
              <SliderField label="Foodcost блюд" value={hall.foodCostPercent} onChange={(v) => setHall({ ...hall, foodCostPercent: v })} min={0} max={100} unit="%" compact
                hint={`${f(results.foodCostAbs)} ₽`} />
              <SliderField label="Foodcost напитков" value={hall.drinkCostPercent} onChange={(v) => setHall({ ...hall, drinkCostPercent: v })} min={0} max={100} unit="%" compact
                hint={`${f(results.drinkCostAbs)} ₽`} />
            </CollapsibleSection>

            {/* 8. Энергопотребление */}
            <CollapsibleSection icon={Zap} title="Энергопотребление" helpKey="energy" onHelp={openHelp} defaultOpen={false}
              badge={`${f(results.totalEnergyCost)} ₽/мес`}>
              <div className="grid grid-cols-2 gap-2">
                <SelectField label="Тип кухни" value={energy.kitchenType} onChange={(v) => setEnergy({ ...energy, kitchenType: v })}
                  options={[{ value: 'hot', label: 'Горячая' }, { value: 'cold', label: 'Холодная' }, { value: 'mixed', label: 'Смешанная' }]} />
                <SelectField label="Климат" value={String(energy.climateZone)} onChange={(v) => setEnergy({ ...energy, climateZone: Number(v) })}
                  options={CLIMATE_ZONES.map((z) => ({ value: String(z.temp), label: z.label }))} />
              </div>
              <SliderField label="t внутри" value={energy.indoorTemp} onChange={(v) => setEnergy({ ...energy, indoorTemp: v })} min={15} max={30} step={0.5} unit="°C" compact />
              <SliderField label="Запас" value={energy.safetyFactor} onChange={(v) => setEnergy({ ...energy, safetyFactor: v })} min={1} max={2} step={0.05} compact />
              <SliderField label="кВт·ч" value={energy.electricityPrice} onChange={(v) => setEnergy({ ...energy, electricityPrice: v })} min={0.5} max={15} step={0.1} unit="₽" compact />
              <div className="border-t border-gray-50 my-2" />
              <SliderField label="Прочая мощность" value={energy.otherPower} onChange={(v) => setEnergy({ ...energy, otherPower: v })} min={0} max={100} step={0.5} unit="кВт" compact
                hint="Освещение, холодильники и т.д." />
            </CollapsibleSection>


            <div className="h-4" />
          </div>

          {/* ========== ПРАВАЯ КОЛОНКА: РЕЗУЛЬТАТЫ ========== */}
          <div className="lg:col-span-7 space-y-2.5 lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto lg:pl-1">

            {/* ИТОГОВАЯ ПРИБЫЛЬ */}
            <div className="rounded-xl border-2 p-3.5 sm:p-4" style={{
              borderColor: (inputProfit ?? results.monthlyProfit) > 0 ? '#a7f3d0' : '#fecaca',
              background: (inputProfit ?? results.monthlyProfit) > 0 ? '#f0fdf4' : '#fef2f2',
            }}>
              <div className="flex items-center gap-2 mb-2.5">
                {(inputProfit ?? results.monthlyProfit) > 0
                  ? <CheckCircle size={16} className="text-emerald-600" />
                  : <AlertTriangle size={16} className="text-red-500" />
                }
                <span className="text-xs font-bold text-gray-900">Итоговая прибыль</span>
              </div>
              <div className="space-y-1 text-xs">
                <ResultRow label="Выручка"
                  value={inputMonthlyRevenue != null ? f(inputMonthlyRevenue) : f(results.monthlyRevenue)}
                  sub={inputMonthlyRevenue != null ? `расчёт: ${f(results.monthlyRevenue)} ₽` : ''} />
                <ResultRow label="− Аренда"
                  value={inputRent != null ? `−${f(inputRent)} ₽` : `−${f(results.totalRent)} ₽`}
                  sub={inputRent != null ? `расчёт: −${f(results.totalRent)} ₽` : ''} />
                <ResultRow label="− Коммунальные"
                  value={inputUtilities != null ? `−${f(inputUtilities)} ₽` : `−${f(results.totalEnergyCost)} ₽`}
                  sub={inputUtilities != null ? `расчёт: −${f(results.totalEnergyCost)} ₽` : ''} />
                <ResultRow label="− ФОТ (с налогами)"
                  value={inputFOT != null ? `−${f(inputFOT)} ₽` : `−${f(results.totalPayrollWithTaxes)} ₽`}
                  sub={inputFOT != null ? `расчёт: −${f(results.totalPayrollWithTaxes)} ₽` : ''} />
                {inputManagement != null && <ResultRow label="− Управление" value={`−${f(inputManagement)} ₽`} />}
                <ResultRow label="− Foodcost"
                  value={inputCOGS != null ? `−${f(inputCOGS)} ₽` : `−${f(results.totalCOGS)} ₽`}
                  sub={inputCOGS != null ? `расчёт: −${f(results.totalCOGS)} ₽` : ''} />
                {inputOther != null && <ResultRow label="− Прочие" value={`−${f(inputOther)} ₽`} />}
                <div className="border-t border-gray-200/50 my-1.5" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">Прибыль</span>
                  <span className="text-base sm:text-lg font-bold tabular-nums" style={{ color: (inputProfit ?? results.monthlyProfit) > 0 ? '#059669' : '#dc2626' }}>
                    {inputProfit != null ? f(inputProfit) : f(results.monthlyProfit)} ₽
                  </span>
                </div>
                {inputProfit == null && (
                  <div className="text-right text-[10px] text-amber-500">
                    Не все вводные — показана модель
                  </div>
                )}
              </div>
            </div>

            {/* Сводка за смену */}
            <CollapsibleSection icon={TrendingUp} title="Сводка за смену" helpKey="kpi" onHelp={openHelp} defaultOpen={false}>
              {results.hasHall && (
                <>
                  <ResultRow label="Гости (загрузка)" value={`${results.realisticGuestsPerShift} чел.`} sub={`в день: ${common.dailyGuests}`} />
                  <div className="border-t border-gray-50 my-1" />
                </>
              )}
              <ResultRow label="Кухня" value={`${results.totalDishes} блюд`} sub={`макс: ${results.kitchenMaxDishes}`}
                color={results.requiredDishes > results.kitchenMaxDishes ? '#dc2626' : undefined} />
              <ResultRow label="Кофейня" value={`${results.coffeeMaxDrinks} напитков`}
                sub={results.requiredDrinks > results.coffeeMaxDrinks ? 'не хватает' : undefined}
                color={results.requiredDrinks > results.coffeeMaxDrinks ? '#dc2626' : undefined} />
              <div className="border-t border-gray-50 my-1" />
              <ResultRow label="Выручка/смена" value={`${f(results.shiftRevenue)} ₽`} bold color="#059669" />
              <ResultRow label="Выручка/день" value={`${f(results.dailyRevenue)} ₽`} bold />
              <ResultRow label="Выручка/мес" value={`${f(results.monthlyRevenue)} ₽`} bold />
              <ResultRow label="Потолок выручки" value={`${f(results.revenueCeiling)} ₽`} sub={`лимит: ${results.limitingFactor}`} color="#d97706" />
            </CollapsibleSection>

            {/* ФОТ и штат */}
            <CollapsibleSection icon={DollarSign} title="ФОТ и штат" defaultOpen={false} badge={`${results.totalStaff} чел.`}>
              <ResultRow label="Смен" value={`${results.shifts}`} />
              <ResultRow label="Всего персонала" value={`${results.totalStaff} чел.`} />
              <div className="border-t border-gray-50 my-1" />
              <ResultRow label="ФОТ (чистый)" value={`${f(results.totalPayroll)} ₽`} />
              <ResultRow label="ФОТ + налоги (×1.45)" value={`${f(results.totalPayrollWithTaxes)} ₽`} bold />
              {inputFOT != null && <ResultRow label="Вводный ФОТ" value={`${f(inputFOT)} ₽`} bold color="#059669" />}
            </CollapsibleSection>

            {/* Аренда */}
            <CollapsibleSection icon={Building} title="Аренда" defaultOpen={false}>
              <ResultRow label="Ставка" value={`${f(hall.rentPerSqm)} ₽/м²`} />
              <ResultRow label="Площадь" value={`${hall.totalArea} м²`} />
              <ResultRow label="Аренда/мес" value={`${f(results.totalRent)} ₽`} bold />
              <div className="border-t border-gray-50 my-1" />
              {inputRent != null ? (
                <ResultRow label="Вводная аренда" value={`${f(inputRent)} ₽`} bold color="#059669" />
              ) : (
                <>
                  <ResultRow label="Доля от выручки" value={`${rentShare.toFixed(1)}%`}
                    sub={`${targetRentShareRange[0]}–${targetRentShareRange[1]}%`}
                    color={isRentShareOk ? '#059669' : '#dc2626'} />
                  <p className="text-[10px] mt-1 text-gray-400">
                    {isRentShareOk ? 'Доля аренды в норме' : 'Доля аренды вне диапазона'}
                  </p>
                </>
              )}
            </CollapsibleSection>

            {/* Энергопотребление */}
            <CollapsibleSection icon={Zap} title="Энергопотребление" defaultOpen={false}>
              <ResultRow label="Воздухообмен зал" value={`${f(results.ventHall)} м³/ч`} />
              <ResultRow label="Воздухообмен кухня" value={`${f(results.ventKit)} м³/ч`} />
              <ResultRow label="Итого воздухообмен" value={`${f(results.ventTotal)} м³/ч`} bold />
              <div className="border-t border-gray-50 my-1" />
              <ResultRow label="Тепловая мощность" value={`${results.heatTotal.toFixed(1)} кВт`} />
              <ResultRow label="Отопление/мес" value={`${f(results.monthlyHeatingCost)} ₽`} bold />
              <ResultRow label="Прочие" value={`${f(results.otherEnergyCost)} ₽`} />
              <div className="border-t border-gray-50 my-1" />
              <ResultRow label="Итого энергозатраты" value={`${f(results.totalEnergyCost)} ₽`} bold color="#059669" />
              {inputUtilities != null && <ResultRow label="Вводные коммунальные" value={`${f(inputUtilities)} ₽`} bold color="#059669" />}
            </CollapsibleSection>

            {/* Анализ локации */}
            <CollapsibleSection icon={BarChart3} title="Анализ локации" defaultOpen={false}>
              <ResultRow label="Доступный поток" value={`${f(results.availableMarketFlow)} гост/мес`} />
              <ResultRow label="Текущий поток" value={`${f(results.monthlyGuestsModel)} гост/мес`} />
              <ResultRow label="Потенциал роста" value={`${f(results.growthPotential)} гост/мес`}
                color={results.growthPotential > 0 ? '#059669' : '#dc2626'} />
              <div className="border-t border-gray-50 my-1" />
              <ResultRow label="Доля рынка" value={`${results.marketShare.toFixed(1)}%`} />
            </CollapsibleSection>

            {/* Детализация кухни */}
            <CollapsibleSection icon={ChefHat} title="Детализация кухни" defaultOpen={false}
              badge={`Загрузка ${results.kitchenLoad.toFixed(0)}%`}>
              <div className="space-y-1.5">
                {results.dishRes?.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between text-xs py-1 border-b border-gray-50">
                    <span className="text-gray-500">{d.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-400 tabular-nums">{d.time} мин</span>
                      <span className="font-medium text-gray-800 tabular-nums">{d.maxDishes} шт</span>
                      <span className="font-semibold text-emerald-600 tabular-nums">{f(d.revenue)} ₽</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 my-1.5" />
              <ResultRow label="Итого кухня" value={`${f(results.kitchenRev)} ₽`} bold color="#059669" />
              <ResultRow label="Загрузка" value={`${results.kitchenLoad.toFixed(0)}%`}
                color={results.kitchenLoad > 95 ? '#dc2626' : results.kitchenLoad > 80 ? '#d97706' : '#059669'} />
              {results.kitchenLoad > 95 && (
                <p className="text-[10px] mt-1.5 p-2 rounded-lg bg-red-50 text-red-600">
                  Критическая загрузка — риск сбоев
                </p>
              )}
            </CollapsibleSection>

            {/* Детализация кофейни */}
            <CollapsibleSection icon={Coffee} title="Детализация кофейни" defaultOpen={false}>
              <ResultRow label="Макс. напитков" value={`${results.coffeeMaxDrinks}`} />
              <ResultRow label="Выручка кофейни" value={`${f(results.coffeeRev)} ₽`} bold color="#059669" />
            </CollapsibleSection>

            {/* Foodcost расчёт */}
            <CollapsibleSection icon={DollarSign} title="Foodcost (расчёт)" defaultOpen={false}>
              <ResultRow label="Блюда" value={`${f(results.foodCostAbs)} ₽`} sub={`${hall.foodCostPercent}%`} />
              <ResultRow label="Напитки" value={`${f(results.drinkCostAbs)} ₽`} sub={`${hall.drinkCostPercent}%`} />
              <div className="border-t border-gray-50 my-1" />
              <ResultRow label="Итого foodcost" value={`${f(results.totalCOGS)} ₽`} bold />
              {inputCOGS != null && <ResultRow label="Вводный foodcost" value={`${f(inputCOGS)} ₽`} bold color="#059669" />}
            </CollapsibleSection>

            <div className="h-4" />
          </div>
        </div>

        <HelpModal isOpen={helpModal.open} onClose={closeHelp} title={helpTexts[helpModal.block]?.title || ''}>
          {helpTexts[helpModal.block]?.text || ''}
        </HelpModal>
      </div>
    </div>
  );
}