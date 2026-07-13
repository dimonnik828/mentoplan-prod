// app/business/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Armchair,
  Coffee,
  Flame,
  Building,
  Wind,
  Gauge,
  Lightbulb,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Users,
  Utensils,
  Clock,
  RefreshCw,
  DollarSign,
  Info,
} from 'lucide-react';

// ============================================================
// ТИПЫ
// ============================================================
interface Dish {
  id: string;
  name: string;
  time: number;
  price: number;
}

interface CommonSettings {
  shiftHours: number;
  loadFactor: number;
  prepRatio: number;
  operatingHours: number;
}

interface HallSettings {
  venueType: string;
  seats: number;
  avgCheck: number;
  hallArea: number;
  kitchenArea: number;
  totalArea: number;
  rentPerSqm: number;
  cookSalary: number;
  baristaSalary: number;
  waiterSalary: number;
  dishwasherSalary: number;
  waiterRatio: number;
  dishwasherRatio: number;
  foodCostPercent: number;
  drinkCostPercent: number;
}

interface CoffeeSettings {
  baristas: number;
  drinkTime: number;
  drinkPrice: number;
}

interface KitchenSettings {
  cooks: number;
  parallelism: number;
  dishes: Dish[];
}

interface VentilationSettings {
  kitchenType: string;
  climateZone: number;
  indoorTemp: number;
  safetyFactor: number;
  electricityPrice: number;
}

// ============================================================
// КОНСТАНТЫ
// ============================================================
const VENUE_TYPES = {
  restaurant: {
    label: 'Ресторан',
    benchmark: 150,
    hallRate: 3.0,
    waiterRatio: 20,
    dishwasherRatio: 100,
    guestTime: 50,
    turnsPerShift: 1.8,
    hasHall: true,
  },
  coffee: {
    label: 'Кофейня',
    benchmark: 300,
    hallRate: 3.5,
    waiterRatio: 40,
    dishwasherRatio: 100,
    guestTime: 25,
    turnsPerShift: 3.0,
    hasHall: true,
  },
  cafe: {
    label: 'Кафе',
    benchmark: 200,
    hallRate: 3.2,
    waiterRatio: 40,
    dishwasherRatio: 100,
    guestTime: 35,
    turnsPerShift: 2.2,
    hasHall: true,
  },
  canteen: {
    label: 'Столовая',
    benchmark: 350,
    hallRate: 4.5,
    waiterRatio: 0,
    dishwasherRatio: 100,
    guestTime: 20,
    turnsPerShift: 3.5,
    hasHall: true,
  },
  fastfood: {
    label: 'Быстрое обслуживание',
    benchmark: 400,
    hallRate: 4.0,
    waiterRatio: 0,
    dishwasherRatio: 100,
    guestTime: 10,
    turnsPerShift: 4.5,
    hasHall: true,
  },
  darkkitchen: {
    label: 'Дарк китчен (доставка)',
    benchmark: 0,
    hallRate: 0,
    waiterRatio: 0,
    dishwasherRatio: 50,
    guestTime: 0,
    turnsPerShift: 0,
    hasHall: false,
  },
};

const VENUE_MIN_AREA_PER_SEAT = {
  restaurant: 1.8,
  coffee: 1.6,
  cafe: 1.6,
  canteen: 1.8,
  fastfood: 1.4,
  darkkitchen: 0,
};

const KITCHEN_TYPE_RATE = { hot: 37.5, cold: 17.5, mixed: 27.5 };
const CLIMATE_ZONES = [
  { label: 'Краснодар', temp: -15 },
  { label: 'Ростов-на-Дону', temp: -22 },
  { label: 'Санкт-Петербург', temp: -24 },
  { label: 'Москва', temp: -25 },
  { label: 'Екатеринбург', temp: -28 },
  { label: 'Казань', temp: -28 },
  { label: 'Новосибирск', temp: -32 },
  { label: 'Якутск', temp: -36 },
];

// ============================================================
// ОБЩИЕ КОМПОНЕНТЫ
// ============================================================
function SliderWithInput({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  description,
  warning,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  description?: string;
  warning?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) onChange(Math.min(max, Math.max(min, val)));
            }}
            className="w-20 bg-white border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition"
          />
          {unit && <span className="text-sm text-gray-500 w-6">{unit}</span>}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-blue-600 bg-gray-200 rounded-lg h-1.5"
      />
      {description && <p className="text-[11px] text-gray-400">{description}</p>}
      {warning && <p className="text-xs text-red-500">{warning}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options, description }: any) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition appearance-none"
      >
        {options.map((opt: any) => (
          <option key={opt.key || opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {description && <p className="text-[11px] text-gray-400 mt-1">{description}</p>}
    </div>
  );
}

function HelpModal({ isOpen, onClose, title, children }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-5 text-sm text-gray-700 space-y-2">{children}</div>
      </div>
    </div>
  );
}

// ============================================================
// БЛОК ФОТ И ШТАТ
// ============================================================
function PayrollBlock({
  cooksCount,
  cookSalary,
  baristasCount,
  baristaSalary,
  waitersCount,
  waiterSalary,
  dishwashersCount,
  dishwasherSalary,
  operatingHours,
  shiftHours,
}: any) {
  const shifts = Math.max(1, Math.ceil(operatingHours / shiftHours));
  const cooksTotal = cooksCount * shifts;
  const baristasTotal = baristasCount * shifts;
  const waitersTotal = waitersCount * shifts;
  const dishwashersTotal = dishwashersCount * shifts;
  const totalStaff = cooksTotal + baristasTotal + waitersTotal + dishwashersTotal;
  const cooksPayroll = cooksTotal * cookSalary;
  const baristasPayroll = baristasTotal * baristaSalary;
  const waitersPayroll = waitersTotal * waiterSalary;
  const dishwashersPayroll = dishwashersTotal * dishwasherSalary;
  const totalPayroll = cooksPayroll + baristasPayroll + waitersPayroll + dishwashersPayroll;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-blue-600" /> ФОТ и штат
      </h4>
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div className="text-gray-500">Режим работы</div>
        <div className="text-right font-medium">{operatingHours} ч/день, {shiftHours} ч/смена → {shifts} смен{shifts > 1 ? 'ы' : ''}</div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-gray-600">Повара</span><span className="font-medium">{cooksTotal} чел. ({cooksCount} в смену) — {Math.round(cooksPayroll).toLocaleString('ru-RU')} ₽</span></div>
        <div className="flex justify-between"><span className="text-gray-600">Бариста</span><span className="font-medium">{baristasTotal} чел. ({baristasCount} в смену) — {Math.round(baristasPayroll).toLocaleString('ru-RU')} ₽</span></div>
        {waitersTotal > 0 && (
          <div className="flex justify-between"><span className="text-gray-600">Официанты</span><span className="font-medium">{waitersTotal} чел. ({waitersCount} в смену) — {Math.round(waitersPayroll).toLocaleString('ru-RU')} ₽</span></div>
        )}
        <div className="flex justify-between"><span className="text-gray-600">Мойщицы</span><span className="font-medium">{dishwashersTotal} чел. ({dishwashersCount} в смену) — {Math.round(dishwashersPayroll).toLocaleString('ru-RU')} ₽</span></div>
        <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold text-gray-800">
          <span>Итого штат / ФОТ в месяц</span>
          <span className="text-blue-600">{totalStaff} чел. · {Math.round(totalPayroll).toLocaleString('ru-RU')} ₽</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// КОМПОНЕНТ СВОДКИ ПО ПРОИЗВОДСТВУ
// ============================================================
function ProductionSummary({
  realisticGuests,
  maxGuests,
  hallRevenue,
  totalDishes,
  kitchenRevenue,
  coffeeDrinks,
  coffeeRevenue,
  dailyRevenue,
}: {
  realisticGuests: number;
  maxGuests: number;
  hallRevenue: number;
  totalDishes: number;
  kitchenRevenue: number;
  coffeeDrinks: number;
  coffeeRevenue: number;
  dailyRevenue: number;
}) {
  const fmt = (num: number) => Math.round(num).toLocaleString('ru-RU');

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-blue-600" /> Сводка по производству
      </h4>
      <div className="space-y-3">
        {/* Зал */}
        <div className="flex justify-between text-sm border-b border-gray-100 pb-2">
          <span className="text-gray-600">Зал</span>
          <span className="font-medium">
            посадок: {realisticGuests} / {maxGuests} &nbsp;|&nbsp; выручка: {fmt(hallRevenue)} ₽
          </span>
        </div>
        {/* Кухня */}
        <div className="flex justify-between text-sm border-b border-gray-100 pb-2">
          <span className="text-gray-600">Кухня</span>
          <span className="font-medium">
            блюд: {totalDishes} / {totalDishes} &nbsp;|&nbsp; выручка: {fmt(kitchenRevenue)} ₽
          </span>
        </div>
        {/* Кофейня */}
        <div className="flex justify-between text-sm border-b border-gray-100 pb-2">
          <span className="text-gray-600">Кофейня</span>
          <span className="font-medium">
            напитков: {coffeeDrinks} / {coffeeDrinks} &nbsp;|&nbsp; выручка: {fmt(coffeeRevenue)} ₽
          </span>
        </div>
        {/* Итого */}
        <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-200">
          <span className="text-gray-800">ИТОГО</span>
          <span className="text-blue-600">дневная выручка: {fmt(dailyRevenue)} ₽</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ОСНОВНАЯ СТРАНИЦА
// ============================================================
export default function BusinessPage() {
  const [common, setCommon] = useState<CommonSettings>({ shiftHours: 8, loadFactor: 75, prepRatio: 20, operatingHours: 14 });
  const [hall, setHall] = useState<HallSettings>({
    venueType: 'cafe',
    seats: 50,
    avgCheck: 500,
    hallArea: 75,
    kitchenArea: 40,
    totalArea: 110,
    rentPerSqm: 1090,
    cookSalary: 80000,
    baristaSalary: 60000,
    waiterSalary: 50000,
    dishwasherSalary: 40000,
    waiterRatio: 40,
    dishwasherRatio: 100,
    foodCostPercent: 30,
    drinkCostPercent: 25,
  });
  const [coffee, setCoffee] = useState<CoffeeSettings>({ baristas: 2, drinkTime: 55, drinkPrice: 250 });
  const [kitchen, setKitchen] = useState<KitchenSettings>({
    cooks: 2,
    parallelism: 3,
    dishes: [
      { id: '1', name: 'Салаты', time: 10, price: 350 },
      { id: '2', name: 'Горячее', time: 35, price: 650 },
      { id: '3', name: 'Пицца', time: 15, price: 550 },
      { id: '4', name: 'Десерты', time: 8, price: 300 },
    ],
  });
  const [ventilation, setVentilation] = useState<VentilationSettings>({
    kitchenType: 'hot',
    climateZone: -25,
    indoorTemp: 22,
    safetyFactor: 1.1,
    electricityPrice: 5.5,
  });
  const [results, setResults] = useState<any>(null);
  const [helpModal, setHelpModal] = useState<{ block: string; open: boolean }>({ block: '', open: false });

  // Определяем, есть ли зал
  const currentVenue = VENUE_TYPES[hall.venueType as keyof typeof VENUE_TYPES];
  const hasHall = currentVenue?.hasHall ?? true;

  // Количество официантов и мойщиц (управляется напрямую)
  const [waitersCount, setWaitersCount] = useState(
    hasHall && hall.waiterRatio > 0 ? Math.max(1, Math.ceil(hall.seats / hall.waiterRatio)) : 0
  );
  const [dishwashersCount, setDishwashersCount] = useState(
    hall.dishwasherRatio > 0 ? Math.max(1, Math.ceil(hall.hallArea / hall.dishwasherRatio)) : 0
  );

  // Применение нормативов при смене типа заведения
  const applyVenueDefaults = (venueType: string) => {
    const venue = VENUE_TYPES[venueType as keyof typeof VENUE_TYPES];
    if (venue) {
      setHall((prev) => ({
        ...prev,
        venueType,
        waiterRatio: venue.waiterRatio,
        dishwasherRatio: venue.dishwasherRatio,
      }));
      // Сброс количества официантов и мойщиц на основе новых нормативов
      if (venue.hasHall) {
        const newWaiters = venue.waiterRatio > 0 ? Math.max(1, Math.ceil(hall.seats / venue.waiterRatio)) : 0;
        setWaitersCount(newWaiters);
      } else {
        setWaitersCount(0);
      }
      const newDishwashers = venue.dishwasherRatio > 0 ? Math.max(1, Math.ceil(hall.hallArea / venue.dishwasherRatio)) : 0;
      setDishwashersCount(newDishwashers);
    }
  };

  const recommendedHallArea = hasHall ? Math.round(hall.seats * (VENUE_MIN_AREA_PER_SEAT[hall.venueType as keyof typeof VENUE_MIN_AREA_PER_SEAT] || 1.6)) : 0;
  const hallAreaWarning = hasHall && hall.hallArea < recommendedHallArea
    ? `Площадь зала (${hall.hallArea} м²) меньше рекомендуемой (${recommendedHallArea} м²) для вашего формата.`
    : undefined;

  const recommendedKitchenArea = kitchen.cooks * 5;
  const kitchenAreaWarning = hall.kitchenArea < recommendedKitchenArea
    ? `Площадь кухни (${hall.kitchenArea} м²) меньше рекомендуемой (${recommendedKitchenArea} м²) для ${kitchen.cooks} поваров.`
    : undefined;

  const totalUsedArea = hall.hallArea + hall.kitchenArea;
  const areaOverflowWarning = totalUsedArea > hall.totalArea
    ? `Сумма площадей зала и кухни (${totalUsedArea} м²) превышает общую площадь (${hall.totalArea} м²)`
    : undefined;

  const totalRent = hall.rentPerSqm * hall.totalArea;

  const addDish = () => setKitchen((prev) => ({ ...prev, dishes: [...prev.dishes, { id: String(Date.now()), name: 'Новое', time: 15, price: 400 }] }));
  const removeDish = (id: string) => { if (kitchen.dishes.length <= 1) return; setKitchen((prev) => ({ ...prev, dishes: prev.dishes.filter((d) => d.id !== id) })); };
  const updateDish = (id: string, field: keyof Dish, value: any) => { setKitchen((prev) => ({ ...prev, dishes: prev.dishes.map((d) => (d.id === id ? { ...d, [field]: value } : d)) })); };

  useEffect(() => {
    const shiftMin = common.shiftHours * 60;
    const load = common.loadFactor / 100;
    const prepR = common.prepRatio / 100;
    const prepMin = shiftMin * prepR;
    const availMin = shiftMin * load - prepMin;

    // Кухня
    const cooks = Math.max(0, kitchen.cooks);
    const par = Math.max(1, kitchen.parallelism);
    const cap = availMin * cooks * par;
    const nCat = kitchen.dishes.length;
    const capPerCat = nCat > 0 ? cap / nCat : 0;
    let totalDishes = 0,
      kitchenRev = 0,
      totalCookMin = 0;
    const dishRes = kitchen.dishes.map((d) => {
      const maxD = nCat > 0 ? Math.floor(capPerCat / Math.max(1, d.time)) : 0;
      const rev = maxD * d.price;
      totalDishes += maxD;
      kitchenRev += rev;
      totalCookMin += maxD * d.time;
      return { ...d, maxDishes: maxD, revenue: rev };
    });
    const kitchenLoad = cap > 0 ? (totalCookMin / cap) * 100 : 0;

    // Кофейня
    const baristas = Math.max(0, coffee.baristas);
    const drinkTime = Math.max(1, coffee.drinkTime);
    const drinkPrice = Math.max(1, coffee.drinkPrice);
    const coffeeCap = baristas > 0 ? (availMin * 60 / drinkTime) * baristas : 0;
    const coffeeRev = coffeeCap * drinkPrice;

    // Зал (только если есть зал)
    const venueKey = hall.venueType as keyof typeof VENUE_TYPES;
    const venue = VENUE_TYPES[venueKey];
    const hasHall = venue?.hasHall ?? true;

    let maxGuestsWithoutLoad = 0;
    let maxGuestsPerShift = 0;
    let realisticGuestsPerShift = 0;
    let realisticShiftRevenue = 0;
    let hallRevPerShift = 0;
    let bottleneck = 'Производство';
    let shiftRevenue = kitchenRev + coffeeRev;

    if (hasHall) {
      const seats = Math.max(1, hall.seats);
      const avgCheck = Math.max(1, hall.avgCheck);
      const turnsPerShift = venue.turnsPerShift || 2.0;
      const guestTime = venue.guestTime || 30;

      maxGuestsWithoutLoad = Math.floor(seats * turnsPerShift);
      maxGuestsPerShift = Math.floor(seats * turnsPerShift * load);
      realisticGuestsPerShift = maxGuestsPerShift;
      realisticShiftRevenue = realisticGuestsPerShift * avgCheck;
      hallRevPerShift = maxGuestsWithoutLoad * avgCheck;

      const productionCapPerShift = kitchenRev + coffeeRev;
      shiftRevenue = Math.min(realisticShiftRevenue, productionCapPerShift);
      bottleneck = realisticShiftRevenue <= productionCapPerShift ? 'Зал' : 'Производство';
    } else {
      // Дарк китчен: только производство
      shiftRevenue = kitchenRev + coffeeRev;
      bottleneck = 'Производство';
      // обнуляем показатели зала
      maxGuestsWithoutLoad = 0;
      maxGuestsPerShift = 0;
      realisticGuestsPerShift = 0;
      realisticShiftRevenue = 0;
      hallRevPerShift = 0;
    }

    // Смены
    const shifts = Math.max(1, Math.ceil(common.operatingHours / common.shiftHours));
    const dailyRevenue = shiftRevenue; // одна смена
    const monthlyRevenue = dailyRevenue * 30;

    // Аренда
    const rentVal = totalRent;
    const normalRent = monthlyRevenue * 0.14;
    const rentShare = monthlyRevenue > 0 ? (rentVal / monthlyRevenue) * 100 : 0;

    // Вентиляция
    const hallRate = venue.hallRate || 0;
    const kitRate = KITCHEN_TYPE_RATE[ventilation.kitchenType as keyof typeof KITCHEN_TYPE_RATE] || 27.5;
    const ventHall = Math.round(hall.hallArea * hallRate);
    const ventKit = Math.round(hall.kitchenArea * kitRate);
    const ventTotal = ventHall + ventKit;
    const outTemp = ventilation.climateZone;
    const inTemp = ventilation.indoorTemp;
    const dT = inTemp - outTemp;
    const sf = Math.max(1, ventilation.safetyFactor);
    const heatH = (ventHall * dT * 0.335) / 1000;
    const heatK = (ventKit * dT * 0.335) / 1000;
    const heatTotal = (heatH + heatK) * sf;
    const monthlyHeatingCost = heatTotal * 720 * ventilation.electricityPrice;

    // ФОТ (используем waitersCount и dishwashersCount)
    const cooksTotal = kitchen.cooks * shifts;
    const baristasTotal = coffee.baristas * shifts;
    const waitersTotal = waitersCount * shifts;
    const dishwashersTotal = dishwashersCount * shifts;
    const totalStaff = cooksTotal + baristasTotal + waitersTotal + dishwashersTotal;
    const cooksPayroll = cooksTotal * hall.cookSalary;
    const baristasPayroll = baristasTotal * hall.baristaSalary;
    const waitersPayroll = waitersTotal * hall.waiterSalary;
    const dishwashersPayroll = dishwashersTotal * hall.dishwasherSalary;
    const totalPayroll = cooksPayroll + baristasPayroll + waitersPayroll + dishwashersPayroll;
    const totalPayrollWithTaxes = totalPayroll * 1.45;

    // Себестоимость
    const totalProd = kitchenRev + coffeeRev;
    const kitchenShare = totalProd > 0 ? kitchenRev / totalProd : 0;
    const coffeeShare = totalProd > 0 ? coffeeRev / totalProd : 0;
    const dailyKitchenRev = dailyRevenue * kitchenShare;
    const dailyCoffeeRev = dailyRevenue * coffeeShare;
    const foodCostAbsolute = dailyKitchenRev * (hall.foodCostPercent / 100) * 30;
    const drinkCostAbsolute = dailyCoffeeRev * (hall.drinkCostPercent / 100) * 30;
    const totalCostOfGoods = foodCostAbsolute + drinkCostAbsolute;

    // Прибыль
    const monthlyProfit = monthlyRevenue - rentVal - totalPayrollWithTaxes - monthlyHeatingCost - totalCostOfGoods;

    setResults({
      shiftMin,
      load,
      prepR,
      prepMin,
      availMin,
      dishRes,
      totalDishes,
      kitchenRev,
      kitchenLoad,
      cap,
      coffeeCap,
      coffeeRev,
      drinkTime,
      baristas,
      maxGuestsWithoutLoad,
      maxGuestsPerShift,
      realisticGuestsPerShift,
      realisticShiftRevenue,
      hallRevPerShift,
      avgCheck: hasHall ? hall.avgCheck : 0,
      seats: hasHall ? hall.seats : 0,
      guestTime: hasHall ? venue.guestTime : 0,
      turnsPerShift: hasHall ? venue.turnsPerShift : 0,
      shiftRevenue,
      dailyRevenue,
      monthlyRevenue,
      bottleneck,
      shifts,
      rent: rentVal,
      rentPerSqm: hall.rentPerSqm,
      totalArea: hall.totalArea,
      normalRent,
      rentShare,
      ventHall,
      ventKit,
      ventTotal,
      heatH,
      heatK,
      heatTotal,
      dT,
      outTemp,
      inTemp,
      sf,
      benchmark: venue.benchmark || 0,
      venueKey,
      venueLabel: venue.label,
      cooks: kitchen.cooks,
      par: kitchen.parallelism,
      recommendedHallArea,
      recommendedKitchenArea,
      monthlyHeatingCost,
      electricityPrice: ventilation.electricityPrice,
      waiterRatio: hall.waiterRatio,
      dishwasherRatio: hall.dishwasherRatio,
      operatingHours: common.operatingHours,
      shiftHours: common.shiftHours,
      totalPayroll,
      totalPayrollWithTaxes,
      totalStaff,
      monthlyProfit,
      foodCostAbsolute,
      drinkCostAbsolute,
      totalCostOfGoods,
      foodCostPercent: hall.foodCostPercent,
      drinkCostPercent: hall.drinkCostPercent,
      hasHall,
      waitersCount,
      dishwashersCount,
    });
  }, [common, hall, coffee, kitchen, ventilation, recommendedHallArea, recommendedKitchenArea, totalRent, waitersCount, dishwashersCount]);

  if (!results) return <div className="p-8 text-center text-gray-400">Загрузка...</div>;

  const openHelp = (block: string) => setHelpModal({ block, open: true });
  const closeHelp = () => setHelpModal({ block: '', open: false });

  const fmt = (num: number) => Math.round(num).toLocaleString('ru-RU');

  const helpTexts: Record<string, { title: string; text: string }> = {
    kpi: {
      title: 'Ключевые показатели',
      text: 'Дневная выручка – выручка за одну смену. Месячная – дневная × 30. Узкое место – где заканчивается пропускная способность (зал или производство). Доля аренды – аренда / месячная выручка. Прибыль – выручка минус все расходы (аренда, ФОТ+налоги, отопление, себестоимость).',
    },
    hall: {
      title: 'Пропускная способность зала',
      text: 'Гости за смену = места × оборачиваемость × загрузка. Оборачиваемость зависит от формата (ресторан 1.8, кафе 2.2 и т.д.). Загрузка – общий коэффициент из настроек. Максимальная пропускная способность – при 100% загрузке. Ориентир – средний рынок для данного формата.',
    },
    kitchen: {
      title: 'Производительность кухни',
      text: 'Доступное время = смена × загрузка − время на заготовки. Количество блюд = доступное время × повара × параллельность / время на блюдо. Загрузка кухни – фактическое использование мощности. Критическая загрузка (>95%) – риск сбоев.',
    },
    coffee: {
      title: 'Производительность кофейни',
      text: 'Напитков за смену = (доступное время × 60 / время на напиток) × бариста. Выручка = напитки × средняя цена. Это максимальная мощность при текущей загрузке.',
    },
    ventilation: {
      title: 'Вентиляция',
      text: 'Воздухообмен рассчитывается по площади и нормативу для формата (зал) и типа кухни. Тепловая мощность = воздухообмен × ΔT × 0.335 / 1000 × коэф. запаса. Затраты на отопление – мощность × 720 ч/мес × цена кВт·ч.',
    },
    capacity: {
      title: 'Вместимость по направлениям',
      text: 'Сравнивается максимальная выручка каждого направления (кухня, кофейня, зал). Узкое место – то, что ограничивает общую выручку. Структура выручки – доля еды и напитков в дневной выручке.',
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Бизнес-аналитика</h1>
          </div>
          <p className="text-gray-500 text-sm ml-12">Ресторан / Кафе / Кофейня — расчёт пропускной способности и узких мест</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ЛЕВАЯ КОЛОНКА: НАСТРОЙКИ */}
          <div className="lg:col-span-1 space-y-6">
            {/* 1. Тип заведения */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" /> Тип заведения
              </h3>
              <SelectField
                label="Тип заведения"
                value={hall.venueType}
                onChange={(e) => applyVenueDefaults(e)}
                options={Object.entries(VENUE_TYPES).map(([key, val]) => ({ value: key, label: val.label }))}
              />
            </div>

            {/* 2. Общая площадь */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-blue-600" /> Общая площадь
              </h3>
              <SliderWithInput
                label="Общая площадь (м²)"
                value={hall.totalArea}
                onChange={(v) => setHall({ ...hall, totalArea: v })}
                min={1}
                max={2000}
                step={1}
                unit="м²"
              />
            </div>

            {/* 3. Аренда */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-600" /> Аренда
              </h3>
              <SliderWithInput
                label="Ставка аренды (₽/м²)"
                value={hall.rentPerSqm}
                onChange={(v) => setHall({ ...hall, rentPerSqm: v })}
                min={0}
                max={20000}
                step={50}
                unit="₽/м²"
                description={`Общая аренда: ${fmt(totalRent)} ₽`}
              />
              <div className="mt-2 text-sm text-gray-700">
                <span className="font-medium">Общая аренда:</span> {fmt(totalRent)} ₽
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Нормальная аренда (14%): {fmt(results.normalRent)} ₽
              </div>
            </div>

            {/* 4. Площадь зала (только если есть зал) */}
            {hasHall && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Armchair className="w-4 h-4 text-blue-600" /> Площадь зала
                </h3>
                <SliderWithInput
                  label="Площадь зала (м²)"
                  value={hall.hallArea}
                  onChange={(v) => setHall({ ...hall, hallArea: v })}
                  min={1}
                  max={hall.totalArea}
                  step={1}
                  unit="м²"
                  warning={hallAreaWarning || areaOverflowWarning}
                />
                {!hallAreaWarning && !areaOverflowWarning && (
                  <p className="text-[11px] text-gray-400">Рекомендуемая площадь: <span className="font-medium">{recommendedHallArea} м²</span> (по СП 118.13330)</p>
                )}
                {areaOverflowWarning && <p className="text-xs text-red-500">{areaOverflowWarning}</p>}
              </div>
            )}

            {/* 5. Площадь кухни */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Flame className="w-4 h-4 text-blue-600" /> Площадь кухни
              </h3>
              <SliderWithInput
                label="Площадь кухни (м²)"
                value={hall.kitchenArea}
                onChange={(v) => setHall({ ...hall, kitchenArea: v })}
                min={1}
                max={hall.totalArea}
                step={1}
                unit="м²"
                warning={kitchenAreaWarning || areaOverflowWarning}
              />
              {!kitchenAreaWarning && !areaOverflowWarning && (
                <p className="text-[11px] text-gray-400">Рекомендуемая площадь: <span className="font-medium">{recommendedKitchenArea} м²</span> (из расчёта 5 м²/повара)</p>
              )}
              {areaOverflowWarning && <p className="text-xs text-red-500">{areaOverflowWarning}</p>}
            </div>

            {/* 6. Зал (посадка) — только если есть зал */}
            {hasHall && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Armchair className="w-4 h-4 text-blue-600" /> Зал (посадка)
                  </h3>
                  <button onClick={() => openHelp('hall')} className="text-gray-400 hover:text-blue-600 transition">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <SliderWithInput
                    label="Количество мест"
                    value={hall.seats}
                    onChange={(v) => setHall({ ...hall, seats: v })}
                    min={1}
                    max={500}
                    step={1}
                  />
                  <SliderWithInput
                    label="Средний чек (₽)"
                    value={hall.avgCheck}
                    onChange={(v) => setHall({ ...hall, avgCheck: v })}
                    min={50}
                    max={5000}
                    step={50}
                    unit="₽"
                  />
                  <p className="text-[11px] text-gray-400">Загрузка зала определяется общим коэффициентом в настройках</p>
                </div>
              </div>
            )}

            {/* 7. Часы работы заведения */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" /> Часы работы
              </h3>
              <SliderWithInput
                label="Часы работы заведения в день"
                value={common.operatingHours}
                onChange={(v) => setCommon({ ...common, operatingHours: v })}
                min={1}
                max={24}
                step={0.5}
                unit="ч"
                description="Для расчёта количества смен и штата"
              />
            </div>

            {/* 8. Себестоимость */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-600" /> Себестоимость
              </h4>
              <div className="space-y-4">
                <SliderWithInput
                  label="Себестоимость блюд (%)"
                  value={hall.foodCostPercent}
                  onChange={(v) => setHall({ ...hall, foodCostPercent: v })}
                  min={0}
                  max={100}
                  step={1}
                  unit="%"
                  description={`Абс.: ${fmt(results.foodCostAbsolute)} ₽`}
                />
                <SliderWithInput
                  label="Себестоимость напитков (%)"
                  value={hall.drinkCostPercent}
                  onChange={(v) => setHall({ ...hall, drinkCostPercent: v })}
                  min={0}
                  max={100}
                  step={1}
                  unit="%"
                  description={`Абс.: ${fmt(results.drinkCostAbsolute)} ₽`}
                />
                <div className="text-sm text-gray-700">Общая себестоимость: <span className="font-bold">{fmt(results.totalCostOfGoods)} ₽</span></div>
              </div>
            </div>

            {/* 9. Персонал */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" /> Персонал
              </h4>
              <div className="space-y-4">
                {/* Повара */}
                <div className="grid grid-cols-2 gap-3">
                  <SliderWithInput
                    label="Поваров в смену"
                    value={kitchen.cooks}
                    onChange={(v) => setKitchen({ ...kitchen, cooks: v })}
                    min={0}
                    max={20}
                    step={1}
                  />
                  <SliderWithInput
                    label="ЗП повара (₽/мес)"
                    value={hall.cookSalary}
                    onChange={(v) => setHall({ ...hall, cookSalary: v })}
                    min={0}
                    max={200000}
                    step={1000}
                    unit="₽"
                  />
                </div>

                {/* Бариста */}
                <div className="grid grid-cols-2 gap-3">
                  <SliderWithInput
                    label="Бариста в смену"
                    value={coffee.baristas}
                    onChange={(v) => setCoffee({ ...coffee, baristas: v })}
                    min={0}
                    max={10}
                    step={1}
                  />
                  <SliderWithInput
                    label="ЗП бариста (₽/мес)"
                    value={hall.baristaSalary}
                    onChange={(v) => setHall({ ...hall, baristaSalary: v })}
                    min={0}
                    max={150000}
                    step={1000}
                    unit="₽"
                  />
                </div>

                {/* Официанты (только если есть зал) */}
                {hasHall && (
                  <div className="grid grid-cols-2 gap-3">
                    <SliderWithInput
                      label="Официантов в смену"
                      value={waitersCount}
                      onChange={(v) => {
                        setWaitersCount(v);
                        const newRatio = v > 0 ? Math.ceil(hall.seats / v) : 0;
                        setHall((prev) => ({ ...prev, waiterRatio: newRatio }));
                      }}
                      min={0}
                      max={20}
                      step={1}
                      description={waitersCount > 0 ? `Норматив: ${Math.ceil(hall.seats / waitersCount)} гостей/оф.` : 'Официантов нет'}
                      unit="чел"
                    />
                    <SliderWithInput
                      label="ЗП официанта (₽/мес)"
                      value={hall.waiterSalary}
                      onChange={(v) => setHall({ ...hall, waiterSalary: v })}
                      min={0}
                      max={100000}
                      step={1000}
                      unit="₽"
                    />
                  </div>
                )}

                {/* Мойщицы */}
                <div className="grid grid-cols-2 gap-3">
                  <SliderWithInput
                    label="Мойщиц в смену"
                    value={dishwashersCount}
                    onChange={(v) => {
                      setDishwashersCount(v);
                      const newRatio = v > 0 ? Math.ceil(hall.hallArea / v) : 0;
                      setHall((prev) => ({ ...prev, dishwasherRatio: newRatio }));
                    }}
                    min={0}
                    max={10}
                    step={1}
                    description={dishwashersCount > 0 ? `Норматив: ${Math.ceil(hall.hallArea / dishwashersCount)} м²/чел.` : 'Мойщиц нет'}
                    unit="чел"
                  />
                  <SliderWithInput
                    label="ЗП мойщицы (₽/мес)"
                    value={hall.dishwasherSalary}
                    onChange={(v) => setHall({ ...hall, dishwasherSalary: v })}
                    min={0}
                    max={100000}
                    step={1000}
                    unit="₽"
                  />
                </div>
              </div>
            </div>

            {/* 10. Общие настройки */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-600" /> Общие настройки
              </h3>
              <div className="space-y-4">
                <SliderWithInput
                  label="Длительность смены (ч)"
                  value={common.shiftHours}
                  onChange={(v) => setCommon({ ...common, shiftHours: v })}
                  min={1}
                  max={12}
                  step={0.5}
                  unit="ч"
                />
                <SliderWithInput
                  label="Общая загрузка мощностей"
                  value={common.loadFactor}
                  onChange={(v) => setCommon({ ...common, loadFactor: v })}
                  min={10}
                  max={100}
                  step={1}
                  unit="%"
                  description="Применяется ко всем расчётам (кухня, кофейня, зал)"
                />
                <SliderWithInput
                  label="Доля времени на заготовки"
                  value={common.prepRatio}
                  onChange={(v) => setCommon({ ...common, prepRatio: v })}
                  min={0}
                  max={40}
                  step={1}
                  unit="%"
                  description={`Время на заготовки: ${Math.round(common.shiftHours * 60 * (common.prepRatio / 100))} мин`}
                />
              </div>
            </div>

            {/* 11. Вентиляция */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Wind className="w-4 h-4 text-blue-600" /> Вентиляция
                </h3>
                <button onClick={() => openHelp('ventilation')} className="text-gray-400 hover:text-blue-600 transition">
                  <Info className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <SelectField
                  label="Тип кухни"
                  value={ventilation.kitchenType}
                  onChange={(v) => setVentilation({ ...ventilation, kitchenType: v })}
                  options={[
                    { value: 'hot', label: 'Горячая' },
                    { value: 'cold', label: 'Холодная' },
                    { value: 'mixed', label: 'Смешанная' },
                  ]}
                />
                <SelectField
                  label="Климатическая зона"
                  value={String(ventilation.climateZone)}
                  onChange={(v) => setVentilation({ ...ventilation, climateZone: Number(v) })}
                  options={CLIMATE_ZONES.map((z) => ({ value: String(z.temp), label: `${z.label} (${z.temp}°C)`, key: z.label }))}
                />
                <SliderWithInput
                  label="Желаемая t (°C)"
                  value={ventilation.indoorTemp}
                  onChange={(v) => setVentilation({ ...ventilation, indoorTemp: v })}
                  min={15}
                  max={30}
                  step={0.5}
                  unit="°C"
                />
                <SliderWithInput
                  label="Коэфф. запаса"
                  value={ventilation.safetyFactor}
                  onChange={(v) => setVentilation({ ...ventilation, safetyFactor: v })}
                  min={1}
                  max={2}
                  step={0.05}
                />
                <SliderWithInput
                  label="Цена за 1 кВт·ч (₽)"
                  value={ventilation.electricityPrice}
                  onChange={(v) => setVentilation({ ...ventilation, electricityPrice: v })}
                  min={0.5}
                  max={15}
                  step={0.1}
                  unit="₽/кВт·ч"
                />
              </div>
            </div>

            {/* 12. Кухня (меню) */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-blue-600" /> Кухня (меню)
                </h3>
                <button onClick={() => openHelp('kitchen')} className="text-gray-400 hover:text-blue-600 transition">
                  <Info className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <SliderWithInput
                  label="Параллельность (блюд/повара)"
                  value={kitchen.parallelism}
                  onChange={(v) => setKitchen({ ...kitchen, parallelism: v })}
                  min={1}
                  max={10}
                  step={1}
                  description="Сколько блюд одновременно готовит 1 повар"
                />
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Категории блюд</label>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 text-gray-500 font-semibold text-xs uppercase tracking-wider">Название</th>
                          <th className="text-left py-2 text-gray-500 font-semibold text-xs uppercase tracking-wider">Время (мин)</th>
                          <th className="text-left py-2 text-gray-500 font-semibold text-xs uppercase tracking-wider">Цена (₽)</th>
                          <th className="w-10 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {kitchen.dishes.map((d) => (
                          <tr key={d.id} className="border-b border-gray-100">
                            <td className="py-2">
                              <input
                                type="text"
                                value={d.name}
                                onChange={(e) => updateDish(d.id, 'name', e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 text-sm focus:border-blue-600 outline-none"
                              />
                            </td>
                            <td className="py-2">
                              <input
                                type="number"
                                value={d.time}
                                onChange={(e) => updateDish(d.id, 'time', Number(e.target.value))}
                                className="w-20 bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 text-sm focus:border-blue-600 outline-none"
                                min={1}
                              />
                            </td>
                            <td className="py-2">
                              <input
                                type="number"
                                value={d.price}
                                onChange={(e) => updateDish(d.id, 'price', Number(e.target.value))}
                                className="w-28 bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 text-sm focus:border-blue-600 outline-none"
                                min={1}
                              />
                            </td>
                            <td className="py-2 text-center">
                              <button
                                onClick={() => removeDish(d.id)}
                                className="text-red-500 hover:text-red-700 transition"
                                disabled={kitchen.dishes.length <= 1}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button onClick={addDish} className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 transition flex items-center gap-1.5">
                    <Plus className="w-3 h-3" /> Добавить категорию
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА: РЕЗУЛЬТАТЫ */}
          <div className="lg:col-span-2 space-y-6">
            {/* KPI */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Дневная выручка', value: fmt(results.dailyRevenue), desc: `Ограничение: ${results.bottleneck}` },
                { label: 'Месячная выручка', value: fmt(results.monthlyRevenue), desc: '×30 дней' },
                { label: 'Узкое место', value: results.bottleneck, desc: results.bottleneck === 'Зал' ? 'Не хватает мест или обслуживание медленное' : 'Кухня или кофейня не справляются' },
                { label: 'Доля аренды', value: results.rentShare.toFixed(1) + '%', desc: results.rentShare <= 10 ? 'Отличная аренда' : results.rentShare <= 14 ? 'В пределах нормы' : 'Аренда завышена' },
                { label: 'Прибыль (мес)', value: fmt(results.monthlyProfit), desc: `ФОТ+налоги: ${fmt(results.totalPayrollWithTaxes)}` },
                { label: 'ФОТ в месяц', value: fmt(results.totalPayroll), desc: `Штат: ${results.totalStaff} чел.` },
              ].map((item, idx) => {
                let colorClass = '';
                if (idx === 4) {
                  colorClass = results.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600';
                } else if (idx === 3) {
                  const rent = results.rentShare;
                  if (rent <= 10) colorClass = 'text-green-600';
                  else if (rent <= 14) colorClass = 'text-yellow-600';
                  else colorClass = 'text-red-600';
                }
                return (
                  <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{item.label}</div>
                        <div className={`text-2xl font-bold ${colorClass}`}>{item.value}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                      </div>
                      <button onClick={() => openHelp('kpi')} className="text-gray-400 hover:text-blue-600 transition">
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Производительность кухни */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-blue-600" /> Производительность кухни
                  </h3>
                  <button onClick={() => openHelp('kitchen')} className="text-gray-400 hover:text-blue-600 transition">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Доступно</div>
                    <div className="text-lg font-bold mt-1 text-gray-800">{Math.round(results.availMin)} мин</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Блюд</div>
                    <div className="text-lg font-bold mt-1 text-gray-800">{results.totalDishes}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Выручка</div>
                    <div className="text-lg font-bold mt-1 text-blue-600">{fmt(results.kitchenRev)} ₽</div>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Загрузка</span>
                    <span>{Math.round(results.kitchenLoad)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: Math.min(100, results.kitchenLoad) + '%',
                        background:
                          results.kitchenLoad > 95
                            ? 'linear-gradient(90deg,#ef4444,#f87171)'
                            : results.kitchenLoad > 80
                            ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
                            : 'linear-gradient(90deg,#22c55e,#4ade80)',
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    {results.kitchenLoad > 95
                      ? 'Критическая загрузка — риск сбоев'
                      : results.kitchenLoad > 80
                      ? 'Высокая загрузка — запас минимальный'
                      : 'Комфортная загрузка'}
                  </div>
                </div>
                <div className="overflow-x-auto mt-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-gray-500 text-xs uppercase tracking-wider">Категория</th>
                        <th className="text-left py-2 text-gray-500 text-xs uppercase tracking-wider">Время</th>
                        <th className="text-left py-2 text-gray-500 text-xs uppercase tracking-wider">Цена</th>
                        <th className="text-left py-2 text-gray-500 text-xs uppercase tracking-wider">Блюд</th>
                        <th className="text-left py-2 text-gray-500 text-xs uppercase tracking-wider">Выручка</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.dishRes.map((d: any) => (
                        <tr key={d.id} className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-800">{d.name}</td>
                          <td className="py-2 text-gray-500">{d.time} мин</td>
                          <td className="py-2 text-gray-500">{d.price} ₽</td>
                          <td className="py-2 font-bold text-gray-800">{d.maxDishes}</td>
                          <td className="py-2 text-blue-600 font-bold">{fmt(d.revenue)} ₽</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="py-2 font-bold text-gray-800">Итого</td>
                        <td className="py-2 font-bold text-gray-800">{results.totalDishes}</td>
                        <td className="py-2 font-bold text-blue-600">{fmt(results.kitchenRev)} ₽</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Производительность кофейни */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-blue-600" /> Производительность кофейни
                  </h3>
                  <button onClick={() => openHelp('coffee')} className="text-gray-400 hover:text-blue-600 transition">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Напитков за смену</div>
                    <div className="text-2xl font-bold mt-2 text-gray-800">{Math.round(results.coffeeCap).toLocaleString('ru-RU')}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Макс. выручка</div>
                    <div className="text-2xl font-bold mt-2 text-blue-600">{fmt(results.coffeeRev)} ₽</div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-2 border border-gray-100">
                  <div className="flex justify-between"><span className="text-gray-500">Бариста</span><span className="font-bold text-gray-800">{results.baristas}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Время на напиток</span><span className="font-bold text-gray-800">{results.drinkTime} сек</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Напитков в мин.</span><span className="font-bold text-gray-800">{results.baristas > 0 ? (60 / results.drinkTime * results.baristas).toFixed(1) : '0'}</span></div>
                </div>
              </div>

              {/* Пропускная способность зала (только если есть зал) */}
              {hasHall && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Armchair className="w-4 h-4 text-blue-600" /> Пропускная способность зала
                    </h3>
                    <button onClick={() => openHelp('hall')} className="text-gray-400 hover:text-blue-600 transition">
                      <Info className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded">
                    <div>
                      <div className="text-sm text-gray-600">Гостей за смену (при тек. загрузке)</div>
                      <div className="text-2xl font-bold">{results.realisticGuestsPerShift.toLocaleString('ru-RU')}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Выручка за смену (реалистичная)</div>
                      <div className="text-2xl font-bold text-green-700">{fmt(results.shiftRevenue)} ₽</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Загрузка зала</div>
                      <div className="text-2xl font-bold">{Math.round((results.realisticGuestsPerShift / results.maxGuestsWithoutLoad) * 100)}%</div>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Максимальная пропускная способность (потолок)</span>
                      <span className="font-bold">{results.maxGuestsWithoutLoad.toLocaleString('ru-RU')} гостей</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Максимальная возможная выручка (при 100% загрузке)</span>
                      <span className="font-bold text-blue-600">{fmt(results.hallRevPerShift)} ₽</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Среднее время гостя (норматив)</span>
                      <span className="font-bold">{results.guestTime} мин</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Оборачиваемость места (посадок за смену)</span>
                      <span className="font-bold">{results.turnsPerShift.toFixed(1)}</span>
                    </div>
                  </div>
                  <div
                    className={`mt-4 p-3 rounded border ${
                      results.maxGuestsPerShift >= results.benchmark
                        ? 'text-green-600 border-green-200 bg-green-50'
                        : 'text-red-600 border-red-200 bg-red-50'
                    }`}
                  >
                    <p className="text-sm">
                      {results.maxGuestsPerShift >= results.benchmark
                        ? '✅ В пределах рыночного ориентира'
                        : '⚠️ Ниже рыночного ориентира'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Ориентир для «{results.venueLabel}»: <strong>{results.benchmark}</strong> гостей/смена.
                      {results.maxGuestsPerShift >= results.benchmark
                        ? ` (+${results.maxGuestsPerShift - results.benchmark})`
                        : ` (${results.maxGuestsPerShift - results.benchmark})`}
                    </p>
                  </div>
                </div>
              )}

              {/* Вентиляция */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Wind className="w-4 h-4 text-blue-600" /> Вентиляция
                  </h3>
                  <button onClick={() => openHelp('ventilation')} className="text-gray-400 hover:text-blue-600 transition">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Зал</div>
                    <div className="text-base font-bold mt-1 text-gray-800">{results.ventHall.toLocaleString('ru-RU')} м³/ч</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Кухня</div>
                    <div className="text-base font-bold mt-1 text-gray-800">{results.ventKit.toLocaleString('ru-RU')} м³/ч</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Итого</div>
                    <div className="text-base font-bold mt-1 text-gray-800">{results.ventTotal.toLocaleString('ru-RU')} м³/ч</div>
                  </div>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Тепловая мощность (нагрев притока)</div>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Зал</span><span className="text-gray-800">{results.heatH.toFixed(1)} кВт</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Кухня</span><span className="text-gray-800">{results.heatK.toFixed(1)} кВт</span></div>
                  <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2">
                    <span className="text-gray-700">Общая (с запасом)</span>
                    <span className="text-blue-600">{results.heatTotal.toFixed(1)} кВт</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mb-2">ΔT = {results.inTemp}°C − ({results.outTemp}°C) = {results.dT}°C</div>
                <div className="flex gap-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-lg text-xs text-gray-700 leading-relaxed">
                  <Wind className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    {results.heatTotal < 10
                      ? 'Электрический калорифер — достаточно для небольшой тепловой мощности.'
                      : results.heatTotal <= 30
                      ? 'Водяной калорифер (подключение к системе отопления) или тепловой насос — оптимально для средней мощности.'
                      : 'Водяной калорифер (подключение к системе отопления) — обязательно для высокой тепловой мощности.'}
                  </div>
                </div>
              </div>

              {/* Вместимость по направлениям */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-blue-600" /> Вместимость по направлениям
                  </h3>
                  <button onClick={() => openHelp('capacity')} className="text-gray-400 hover:text-blue-600 transition">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Кухня', value: results.kitchenRev, color: '#ef4444', icon: Flame },
                    { label: 'Кофейня', value: results.coffeeRev, color: '#8b5cf6', icon: Coffee },
                    { label: 'Зал', value: hasHall ? results.hallRevPerShift : 0, color: '#2563eb', icon: Armchair },
                  ].filter(item => hasHall || item.label !== 'Зал').map((item) => {
                    const max = Math.max(results.kitchenRev, results.coffeeRev, hasHall ? results.hallRevPerShift : 0, 1);
                    const pct = Math.max(2, (item.value / max) * 100);
                    const isBottleneck =
                      (item.label === 'Зал' && results.bottleneck === 'Зал') ||
                      (item.label !== 'Зал' && results.bottleneck === 'Производство');
                    const Icon = item.icon;
                    return (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={`flex items-center gap-2 ${isBottleneck ? 'text-blue-700 font-bold' : 'text-gray-600'}`}>
                            <Icon className="w-4 h-4" /> {item.label}
                            {isBottleneck && (
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">УЗКОЕ МЕСТО</span>
                            )}
                          </span>
                          <span className="font-bold text-gray-800">{fmt(item.value)} ₽</span>
                        </div>
                        <div className="h-9 bg-gray-200 rounded-lg overflow-hidden relative">
                          <div
                            className="h-full rounded-lg transition-all duration-700 flex items-center px-3 text-xs font-bold text-white"
                            style={{
                              width: pct + '%',
                              background: item.color,
                              minWidth: pct > 15 ? 'auto' : '0',
                            }}
                          >
                            {pct > 15 && fmt(item.value) + ' ₽'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Структура дневной выручки</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-sm bg-red-500" />
                      <div>
                        <div className="text-sm font-semibold text-gray-800">Еда (кухня)</div>
                        <div className="text-xs text-gray-500">
                          {fmt(results.kitchenRev)} ₽ ·{' '}
                          {results.kitchenRev + results.coffeeRev > 0
                            ? Math.round((results.kitchenRev / (results.kitchenRev + results.coffeeRev)) * 100)
                            : 0}
                          %
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-sm bg-purple-500" />
                      <div>
                        <div className="text-sm font-semibold text-gray-800">Напитки (кофейня)</div>
                        <div className="text-xs text-gray-500">
                          {fmt(results.coffeeRev)} ₽ ·{' '}
                          {results.kitchenRev + results.coffeeRev > 0
                            ? Math.round((results.coffeeRev / (results.kitchenRev + results.coffeeRev)) * 100)
                            : 0}
                          %
                        </div>
                      </div>
                    </div>
                    <div className="sm:col-span-2 mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500">Общая дневная выручка</div>
                      <div className="text-lg font-extrabold text-blue-600">{fmt(results.dailyRevenue)} ₽</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ФОТ и штат */}
              <div className="lg:col-span-2">
                <PayrollBlock
                  cooksCount={kitchen.cooks}
                  cookSalary={hall.cookSalary}
                  baristasCount={coffee.baristas}
                  baristaSalary={hall.baristaSalary}
                  waitersCount={waitersCount}
                  waiterSalary={hall.waiterSalary}
                  dishwashersCount={dishwashersCount}
                  dishwasherSalary={hall.dishwasherSalary}
                  operatingHours={common.operatingHours}
                  shiftHours={common.shiftHours}
                />
              </div>

              {/* Рекомендации */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm lg:col-span-2">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-600" /> Рекомендации
                </h4>
                <div className="space-y-3">
                  {(() => {
                    const recs = [];
                    if (results.bottleneck === 'Зал') {
                      recs.push({
                        color: '#2563eb',
                        icon: Armchair,
                        title: 'Зал является узким местом',
                        text: 'Увеличьте количество мест или сократите время пребывания гостей.',
                      });
                      recs.push({
                        color: '#2563eb',
                        icon: Users,
                        title: 'Увеличьте посадочные места',
                        text: `Текущие ${results.seats} мест при загрузке ${Math.round(results.load * 100)}% дают ${results.realisticGuestsPerShift} гостей. Добавление мест повысит пропускную способность.`,
                      });
                      recs.push({
                        color: '#2563eb',
                        icon: Clock,
                        title: 'Ускорьте обслуживание',
                        text: 'Меньше времени на приём заказа, предзаказ через QR-код, электронные чеки — всё это сокращает время гостя.',
                      });
                      recs.push({
                        color: '#2563eb',
                        icon: TrendingUp,
                        title: 'Дополнительные каналы',
                        text: 'Внедрите предварительную запись, доставку или самовывоз.',
                      });
                    } else {
                      recs.push({
                        color: '#dc2626',
                        icon: Flame,
                        title: 'Производство — узкое место',
                        text: `Кухня (${fmt(results.kitchenRev)} ₽) + Кофейня (${fmt(results.coffeeRev)} ₽) = ${fmt(results.kitchenRev + results.coffeeRev)} ₽ — меньше потенциала зала (${fmt(results.hallRevPerShift)} ₽).`,
                      });
                      if (results.kitchenLoad > 90) {
                        recs.push({
                          color: '#dc2626',
                          icon: Users,
                          title: 'Увеличьте количество поваров',
                          text: `Загрузка кухни ${Math.round(results.kitchenLoad)}%. Добавление повара или повышение параллельности снизит нагрузку.`,
                        });
                      }
                      recs.push({
                        color: '#7c3aed',
                        icon: Coffee,
                        title: 'Проверьте кофейню',
                        text: `Максимум ${Math.round(results.coffeeCap).toLocaleString('ru-RU')} напитков за смену. Если поток гостей выше — добавьте бариста или сократите время приготовления.`,
                      });
                      recs.push({
                        color: '#d97706',
                        icon: Utensils,
                        title: 'Оптимизируйте меню',
                        text: 'Упростите самые медленные блюда или уберите их из основного меню.',
                      });
                    }
                    if (results.kitchenLoad > 95) {
                      recs.push({
                        color: '#dc2626',
                        icon: AlertTriangle,
                        title: 'Критическая загрузка кухни',
                        text: `${Math.round(results.kitchenLoad)}% — высокий риск сбоев. Рассмотрите дополнительные смены или сокращение меню.`,
                      });
                    } else if (results.kitchenLoad < 50 && results.cooks > 0) {
                      recs.push({
                        color: '#16a34a',
                        icon: TrendingDown,
                        title: 'Кухня недозагружена',
                        text: `${Math.round(results.kitchenLoad)}% загрузки при ${results.cooks} поварах. Можно сократить штат или увеличить ассортимент.`,
                      });
                    }
                    if (results.rentShare > 14) {
                      recs.push({
                        color: '#dc2626',
                        icon: Building,
                        title: 'Аренда завышена',
                        text: `Доля ${results.rentShare.toFixed(1)}% при норме до 14%. Это ${fmt(results.rent)} ₽/мес при рекомендуемом максимуме ${fmt(results.normalRent)} ₽.`,
                      });
                    } else if (results.rentShare <= 10 && results.rent > 0) {
                      recs.push({
                        color: '#16a34a',
                        icon: CheckCircle,
                        title: 'Отличная аренда',
                        text: `Доля ${results.rentShare.toFixed(1)}% — значительно ниже рыночной нормы. Сильное конкурентное преимущество.`,
                      });
                    }
                    return recs.map((r, i) => (
                      <div
                        key={i}
                        className="flex gap-3 p-3 bg-gray-50 rounded-xl border-l-4"
                        style={{ borderColor: r.color }}
                      >
                        <r.icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: r.color }} />
                        <div>
                          <div className="text-sm font-bold text-gray-800 mb-0.5">{r.title}</div>
                          <div className="text-xs text-gray-500 leading-relaxed">{r.text}</div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Модальное окно подсказки */}
        {helpModal.open && helpTexts[helpModal.block] && (
          <HelpModal isOpen={true} onClose={closeHelp} title={helpTexts[helpModal.block].title}>
            <p>{helpTexts[helpModal.block].text}</p>
          </HelpModal>
        )}
      </div>
    </div>
  );
}