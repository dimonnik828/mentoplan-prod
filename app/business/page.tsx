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
  rent: number;
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
// КОНСТАНТЫ С НОРМАТИВАМИ
// ============================================================
const VENUE_TYPES = {
  fastfood: {
    label: 'Быстрое обслуживание',
    benchmark: 400,
    hallRate: 4.0,
    waiterRatio: 0,
    dishwasherRatio: 50,
    guestTime: 10,
    turnsPerShift: 4.5,
  },
  coffee: {
    label: 'Кофейня',
    benchmark: 300,
    hallRate: 3.5,
    waiterRatio: 25,
    dishwasherRatio: 45,
    guestTime: 25,
    turnsPerShift: 3.0,
  },
  restaurant: {
    label: 'Ресторан',
    benchmark: 150,
    hallRate: 3.0,
    waiterRatio: 14,
    dishwasherRatio: 40,
    guestTime: 50,
    turnsPerShift: 1.8,
  },
  cafe: {
    label: 'Кафе',
    benchmark: 200,
    hallRate: 3.2,
    waiterRatio: 20,
    dishwasherRatio: 45,
    guestTime: 35,
    turnsPerShift: 2.2,
  },
  canteen: {
    label: 'Столовая',
    benchmark: 350,
    hallRate: 4.5,
    waiterRatio: 0,
    dishwasherRatio: 50,
    guestTime: 20,
    turnsPerShift: 3.5,
  },
};

const VENUE_MIN_AREA_PER_SEAT = {
  fastfood: 1.4,
  coffee: 1.6,
  restaurant: 1.8,
  cafe: 1.6,
  canteen: 1.8,
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
// ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ
// ============================================================
function SliderWithLabel({ value, onChange, min = 0, max = 100, step = 1, label, unit = '%', description }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
        <span className="text-sm font-bold text-gray-800">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-blue-600 bg-gray-200 rounded-lg h-1.5" />
      {description && <p className="text-[11px] text-gray-400 mt-1">{description}</p>}
    </div>
  );
}

function InputField({ label, value, onChange, type = 'number', min, step, placeholder, unit, description, warning }: any) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={type}
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
          className={`w-full bg-white border rounded-lg px-3 py-2 text-gray-800 text-sm focus:ring-1 focus:ring-blue-600/20 outline-none transition ${warning ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-blue-600'}`}
          placeholder={placeholder}
        />
        {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{unit}</span>}
      </div>
      {warning && <p className="text-xs text-red-500 mt-1">{warning}</p>}
      {description && !warning && <p className="text-[11px] text-gray-400 mt-1">{description}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options, description }: any) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition appearance-none">
        {options.map((opt: any) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
      </select>
      {description && <p className="text-[11px] text-gray-400 mt-1">{description}</p>}
    </div>
  );
}

// ============================================================
// БЛОК ФОТ И ШТАТ
// ============================================================
function PayrollBlock({ cooksCount, cookSalary, baristasCount, baristaSalary, seats, waiterRatio, waiterSalary, hallArea, dishwasherRatio, dishwasherSalary, operatingHours, shiftHours }: any) {
  const shifts = Math.max(1, Math.ceil(operatingHours / shiftHours));
  const waitersCount = waiterRatio > 0 ? Math.max(1, Math.ceil(seats / waiterRatio)) : 0;
  const dishwashersCount = Math.max(1, Math.ceil(hallArea / dishwasherRatio));
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
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4 text-blue-600" /> ФОТ и штат</h4>
      <div className="grid grid-cols-2 gap-2 text-sm mb-2">
        <div className="text-gray-500">Режим работы</div>
        <div className="text-right font-medium">{operatingHours} ч/день, {shiftHours} ч/смена → {shifts} смен{shifts > 1 ? 'ы' : ''}</div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-gray-600">Повара</span><span className="font-medium">{cooksTotal} чел. ({cooksCount} в смену) — {Math.round(cooksPayroll).toLocaleString('ru-RU')} ₽</span></div>
        <div className="flex justify-between"><span className="text-gray-600">Бариста</span><span className="font-medium">{baristasTotal} чел. ({baristasCount} в смену) — {Math.round(baristasPayroll).toLocaleString('ru-RU')} ₽</span></div>
        {waitersTotal > 0 && <div className="flex justify-between"><span className="text-gray-600">Официанты</span><span className="font-medium">{waitersTotal} чел. ({waitersCount} в смену, {waiterRatio} гостей/оф.) — {Math.round(waitersPayroll).toLocaleString('ru-RU')} ₽</span></div>}
        <div className="flex justify-between"><span className="text-gray-600">Мойщицы</span><span className="font-medium">{dishwashersTotal} чел. ({dishwashersCount} в смену, {dishwasherRatio} м²/чел.) — {Math.round(dishwashersPayroll).toLocaleString('ru-RU')} ₽</span></div>
        <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold text-gray-800"><span>Итого штат / ФОТ в месяц</span><span className="text-blue-600">{totalStaff} чел. · {Math.round(totalPayroll).toLocaleString('ru-RU')} ₽</span></div>
      </div>
    </div>
  );
}

// ============================================================
// КОМПОНЕНТ МОДАЛЬНОГО ОКНА ДЛЯ ПОДСКАЗОК
// ============================================================
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
        <div className="p-5 text-sm text-gray-700 space-y-2">
          {children}
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
    rent: 120000,
    cookSalary: 80000,
    baristaSalary: 60000,
    waiterSalary: 50000,
    dishwasherSalary: 40000,
    waiterRatio: 20,
    dishwasherRatio: 45,
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

  const applyVenueDefaults = (venueType: string) => {
    const venue = VENUE_TYPES[venueType as keyof typeof VENUE_TYPES];
    if (venue) {
      setHall((prev) => ({
        ...prev,
        venueType,
        waiterRatio: venue.waiterRatio,
        dishwasherRatio: venue.dishwasherRatio,
      }));
    }
  };

  const recommendedHallArea = Math.round(hall.seats * (VENUE_MIN_AREA_PER_SEAT[hall.venueType as keyof typeof VENUE_MIN_AREA_PER_SEAT] || 1.6));
  const hallAreaWarning = hall.hallArea < recommendedHallArea ? `Площадь зала (${hall.hallArea} м²) меньше рекомендуемой (${recommendedHallArea} м²) для вашего формата.` : undefined;
  const recommendedKitchenArea = kitchen.cooks * 5;
  const kitchenAreaWarning = hall.kitchenArea < recommendedKitchenArea ? `Площадь кухни (${hall.kitchenArea} м²) меньше рекомендуемой (${recommendedKitchenArea} м²) для ${kitchen.cooks} поваров.` : undefined;

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
    let totalDishes = 0, kitchenRev = 0, totalCookMin = 0;
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

    // Зал
    const venueKey = hall.venueType as keyof typeof VENUE_TYPES;
    const venue = VENUE_TYPES[venueKey];
    const seats = Math.max(1, hall.seats);
    const avgCheck = Math.max(1, hall.avgCheck);
    const turnsPerShift = venue.turnsPerShift || 2.0;
    const guestTime = venue.guestTime || 30;

    const maxGuestsWithoutLoad = Math.floor(seats * turnsPerShift);
    const maxGuestsPerShift = Math.floor(seats * turnsPerShift * load);
    const realisticGuestsPerShift = maxGuestsPerShift;
    const realisticShiftRevenue = realisticGuestsPerShift * avgCheck;
    const hallRevPerShift = maxGuestsWithoutLoad * avgCheck;

    // Производство
    const productionCapPerShift = kitchenRev + coffeeRev;
    const shiftRevenue = Math.min(realisticShiftRevenue, productionCapPerShift);
    const bottleneck = realisticShiftRevenue <= productionCapPerShift ? 'Зал' : 'Производство';

    // Смены
    const shifts = Math.max(1, Math.ceil(common.operatingHours / common.shiftHours));
    const dailyRevenue = shiftRevenue * shifts;
    const monthlyRevenue = dailyRevenue * 30;

    // Аренда
    const rentVal = Math.max(0, hall.rent);
    const normalRent = monthlyRevenue * 0.14;
    const rentShare = monthlyRevenue > 0 ? (rentVal / monthlyRevenue) * 100 : 0;

    // Вентиляция
    const hallRate = venue.hallRate;
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

    // ФОТ
    const waitersCount = hall.waiterRatio > 0 ? Math.max(1, Math.ceil(hall.seats / hall.waiterRatio)) : 0;
    const dishwashersCount = Math.max(1, Math.ceil(hall.hallArea / hall.dishwasherRatio));
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
      avgCheck,
      seats,
      guestTime,
      turnsPerShift,
      shiftRevenue,
      dailyRevenue,
      monthlyRevenue,
      bottleneck,
      shifts,
      rent: rentVal,
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
      benchmark: venue.benchmark,
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
    });
  }, [common, hall, coffee, kitchen, ventilation, recommendedHallArea, recommendedKitchenArea]);

  if (!results) return <div className="p-8 text-center text-gray-400">Загрузка...</div>;

  const openHelp = (block: string) => setHelpModal({ block, open: true });
  const closeHelp = () => setHelpModal({ block: '', open: false });

  // ---- Вспомогательная функция для округления при выводе ----
  const fmt = (num: number) => Math.round(num).toLocaleString('ru-RU');
  const fmtPct = (num: number) => Math.round(num).toFixed(0) + '%';

  // ---- Тексты подсказок ----
  const helpTexts: Record<string, { title: string; text: string }> = {
    kpi: {
      title: 'Ключевые показатели',
      text: 'Дневная выручка – выручка за все смены (реалистичная). Месячная – дневная × 30. Узкое место – где заканчивается пропускная способность (зал или производство). Доля аренды – аренда / месячная выручка. Прибыль – выручка минус все расходы (аренда, ФОТ+налоги, отопление, себестоимость).',
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

  // ---- Рендер ----
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-blue-600" /></div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Бизнес-аналитика</h1>
          </div>
          <p className="text-gray-500 text-sm ml-12">Ресторан / Кафе / Кофейня — расчёт пропускной способности и узких мест</p>
        </header>

        {/* KPI */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Дневная выручка', value: fmt(results.dailyRevenue), desc: `Ограничение: ${results.bottleneck}` },
            { label: 'Месячная выручка', value: fmt(results.monthlyRevenue), desc: '×30 дней' },
            { label: 'Узкое место', value: results.bottleneck, desc: results.bottleneck === 'Зал' ? 'Не хватает мест или обслуживание медленное' : 'Кухня или кофейня не справляются' },
            { label: 'Доля аренды', value: results.rentShare.toFixed(1) + '%', desc: results.rentShare <= 10 ? 'Отличная аренда' : results.rentShare <= 14 ? 'В пределах нормы' : 'Аренда завышена' },
            { label: 'Прибыль (мес)', value: fmt(results.monthlyProfit), desc: `ФОТ+налоги: ${fmt(results.totalPayrollWithTaxes)} · Себест.: ${fmt(results.foodCostAbsolute)} / ${fmt(results.drinkCostAbsolute)}` },
          ].map((item, idx) => (
            <div key={idx} className={`bg-white border border-gray-200 rounded-2xl p-5 shadow-sm relative ${idx === 2 && results.bottleneck === 'Зал' ? 'border-blue-500' : idx === 2 && results.bottleneck === 'Производство' ? 'border-red-500' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">{item.label}</div>
                  <div className={`text-2xl font-extrabold ${idx === 4 ? (results.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-900'}`}>{item.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{item.desc}</div>
                </div>
                <button onClick={() => openHelp('kpi')} className="text-gray-400 hover:text-blue-600 transition">
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* Настройки и остальные блоки – без изменений, но с кнопками Info */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2"><Settings className="w-4 h-4" /> Настройки</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Общие настройки */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-gray-700"><Settings className="w-4 h-4 text-blue-600" /> Общие настройки</h3>
              <div className="space-y-4">
                <InputField label="Длительность смены (ч)" value={common.shiftHours} onChange={(v) => setCommon({ ...common, shiftHours: v })} min={1} step={0.5} />
                <InputField label="Часы работы заведения в день" value={common.operatingHours} onChange={(v) => setCommon({ ...common, operatingHours: v })} min={1} step={0.5} description="Для расчёта количества смен и штата" />
                <SliderWithLabel label="Общая загрузка мощностей" value={common.loadFactor} onChange={(v) => setCommon({ ...common, loadFactor: v })} min={10} max={100} description="Применяется ко всем расчётам (кухня, кофейня, зал)" />
                <SliderWithLabel label="Доля времени на заготовки" value={common.prepRatio} onChange={(v) => setCommon({ ...common, prepRatio: v })} min={0} max={40} description={`Время на заготовки: ${Math.round(common.shiftHours * 60 * (common.prepRatio / 100))} мин`} />
              </div>
            </div>

            {/* Зал */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm md:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2 text-gray-700"><Armchair className="w-4 h-4 text-blue-600" /> Зал</h3>
                <button onClick={() => openHelp('hall')} className="text-gray-400 hover:text-blue-600 transition"><Info className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <SelectField label="Тип заведения" value={hall.venueType} onChange={(e) => applyVenueDefaults(e)} options={Object.entries(VENUE_TYPES).map(([key, val]) => ({ value: key, label: val.label }))} />
                  <InputField label="Количество мест" value={hall.seats} onChange={(v) => setHall({ ...hall, seats: v })} min={1} />
                  <InputField label="Средний чек (₽)" value={hall.avgCheck} onChange={(v) => setHall({ ...hall, avgCheck: v })} min={1} />
                  <p className="text-[11px] text-gray-400">Загрузка зала определяется общим коэффициентом в настройках</p>
                </div>
                <div className="space-y-4">
                  <InputField label="Площадь зала (м²)" value={hall.hallArea} onChange={(v) => setHall({ ...hall, hallArea: v })} min={1} warning={hallAreaWarning} description={!hallAreaWarning ? `Рекомендуемая площадь: ${recommendedHallArea} м²` : undefined} />
                  {!hallAreaWarning && <p className="text-[11px] text-gray-400">Минимальная норма: <span className="font-medium">{recommendedHallArea} м²</span> (по СП 118.13330)</p>}
                  <InputField label="Площадь кухни (м²)" value={hall.kitchenArea} onChange={(v) => setHall({ ...hall, kitchenArea: v })} min={1} warning={kitchenAreaWarning} description={!kitchenAreaWarning ? `Рекомендуемая площадь: ${recommendedKitchenArea} м² (из расчёта 5 м²/повара)` : undefined} />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Аренда</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField label="Текущая аренда (₽/мес)" value={hall.rent} onChange={(v) => setHall({ ...hall, rent: v })} min={0} />
                  <div><div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Нормальная аренда (14%)</div><div className="text-lg font-bold text-green-600">{fmt(results.normalRent)} ₽</div></div>
                  <div><div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Доля аренды</div><div className={`text-lg font-bold ${results.rentShare <= 10 ? 'text-green-600' : results.rentShare <= 14 ? 'text-yellow-600' : 'text-red-600'}`}>{results.rentShare.toFixed(1)}%</div></div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Общая тепловая мощность (с запасом)</div><div className="text-lg font-bold text-blue-600">{results.heatTotal.toFixed(1)} кВт</div></div>
                  <div><div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Затраты на отопление в месяц</div><div className="text-lg font-bold text-orange-600">{fmt(results.monthlyHeatingCost)} ₽</div><div className="text-[10px] text-gray-400">* Расчёт при работе системы 24/7, 30 дней</div></div>
                </div>
              </div>
              <PayrollBlock
                cooksCount={kitchen.cooks}
                cookSalary={hall.cookSalary}
                baristasCount={coffee.baristas}
                baristaSalary={hall.baristaSalary}
                seats={hall.seats}
                waiterRatio={hall.waiterRatio}
                waiterSalary={hall.waiterSalary}
                hallArea={hall.hallArea}
                dishwasherRatio={hall.dishwasherRatio}
                dishwasherSalary={hall.dishwasherSalary}
                operatingHours={common.operatingHours}
                shiftHours={common.shiftHours}
              />
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Зарплаты и нормативы</h4>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="ЗП повара (₽/мес)" value={hall.cookSalary} onChange={(v) => setHall({ ...hall, cookSalary: v })} min={0} />
                  <InputField label="ЗП бариста (₽/мес)" value={hall.baristaSalary} onChange={(v) => setHall({ ...hall, baristaSalary: v })} min={0} />
                  <InputField label="ЗП официанта (₽/мес)" value={hall.waiterSalary} onChange={(v) => setHall({ ...hall, waiterSalary: v })} min={0} />
                  <InputField label="ЗП мойщицы (₽/мес)" value={hall.dishwasherSalary} onChange={(v) => setHall({ ...hall, dishwasherSalary: v })} min={0} />
                  <InputField label="Норматив: гостей на 1 официанта" value={hall.waiterRatio} onChange={(v) => setHall({ ...hall, waiterRatio: v })} min={0} description="0 — самообслуживание" />
                  <InputField label="Норматив: м² на 1 мойщицу" value={hall.dishwasherRatio} onChange={(v) => setHall({ ...hall, dishwasherRatio: v })} min={1} />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <InputField label="Себестоимость блюд (%)" value={hall.foodCostPercent} onChange={(v) => setHall({ ...hall, foodCostPercent: v })} min={0} max={100} unit="%" description={`Абс.: ${fmt(results.foodCostAbsolute)} ₽`} />
                  <InputField label="Себестоимость напитков (%)" value={hall.drinkCostPercent} onChange={(v) => setHall({ ...hall, drinkCostPercent: v })} min={0} max={100} unit="%" description={`Абс.: ${fmt(results.drinkCostAbsolute)} ₽`} />
                  <div className="col-span-2"><div className="text-xs font-medium text-gray-500">Общая себестоимость</div><div className="text-lg font-bold text-gray-800">{fmt(results.totalCostOfGoods)} ₽</div></div>
                </div>
              </div>
            </div>

            {/* Кофейня */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-gray-700"><Coffee className="w-4 h-4 text-blue-600" /> Кофейня</h3>
                <button onClick={() => openHelp('coffee')} className="text-gray-400 hover:text-blue-600 transition"><Info className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <InputField label="Количество бариста" value={coffee.baristas} onChange={(v) => setCoffee({ ...coffee, baristas: v })} min={0} />
                <InputField label="Время на 1 напиток (сек)" value={coffee.drinkTime} onChange={(v) => setCoffee({ ...coffee, drinkTime: v })} min={5} />
                <InputField label="Средняя цена напитка (₽)" value={coffee.drinkPrice} onChange={(v) => setCoffee({ ...coffee, drinkPrice: v })} min={1} />
              </div>
            </div>

            {/* Кухня */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm md:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-gray-700"><Flame className="w-4 h-4 text-blue-600" /> Кухня</h3>
                <button onClick={() => openHelp('kitchen')} className="text-gray-400 hover:text-blue-600 transition"><Info className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <InputField label="Поваров в смену" value={kitchen.cooks} onChange={(v) => setKitchen({ ...kitchen, cooks: v })} min={0} />
                <InputField label="Параллельность (блюд/повара)" value={kitchen.parallelism} onChange={(v) => setKitchen({ ...kitchen, parallelism: v })} min={1} description="Сколько блюд одновременно готовит 1 повар" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-200"><th className="text-left py-2 text-gray-500 font-semibold text-xs uppercase tracking-wider">Название</th><th className="text-left py-2 text-gray-500 font-semibold text-xs uppercase tracking-wider">Время (мин)</th><th className="text-left py-2 text-gray-500 font-semibold text-xs uppercase tracking-wider">Цена (₽)</th><th className="w-10 py-2"></th></tr></thead>
                  <tbody>
                    {kitchen.dishes.map((d) => (
                      <tr key={d.id} className="border-b border-gray-100">
                        <td className="py-2"><input type="text" value={d.name} onChange={(e) => updateDish(d.id, 'name', e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 text-sm focus:border-blue-600 outline-none" /></td>
                        <td className="py-2"><input type="number" value={d.time} onChange={(e) => updateDish(d.id, 'time', Number(e.target.value))} className="w-20 bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 text-sm focus:border-blue-600 outline-none" min={1} /></td>
                        <td className="py-2"><input type="number" value={d.price} onChange={(e) => updateDish(d.id, 'price', Number(e.target.value))} className="w-28 bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 text-sm focus:border-blue-600 outline-none" min={1} /></td>
                        <td className="py-2 text-center"><button onClick={() => removeDish(d.id)} className="text-red-500 hover:text-red-700 transition" disabled={kitchen.dishes.length <= 1}><X className="w-4 h-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={addDish} className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-800 transition flex items-center gap-1.5"><Plus className="w-3 h-3" /> Добавить категорию</button>
            </div>

            {/* Вентиляция */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-gray-700"><Wind className="w-4 h-4 text-blue-600" /> Вентиляция</h3>
                <button onClick={() => openHelp('ventilation')} className="text-gray-400 hover:text-blue-600 transition"><Info className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <SelectField label="Тип кухни" value={ventilation.kitchenType} onChange={(v) => setVentilation({ ...ventilation, kitchenType: v })} options={[{ value: 'hot', label: 'Горячая' }, { value: 'cold', label: 'Холодная' }, { value: 'mixed', label: 'Смешанная' }]} />
                <SelectField label="Климатическая зона" value={String(ventilation.climateZone)} onChange={(v) => setVentilation({ ...ventilation, climateZone: Number(v) })} options={CLIMATE_ZONES.map((z) => ({ value: String(z.temp), label: `${z.label} (${z.temp}°C)` }))} />
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Желаемая t (°C)" value={ventilation.indoorTemp} onChange={(v) => setVentilation({ ...ventilation, indoorTemp: v })} min={15} max={30} />
                  <InputField label="Коэфф. запаса" value={ventilation.safetyFactor} onChange={(v) => setVentilation({ ...ventilation, safetyFactor: v })} min={1} max={2} step={0.05} />
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <InputField label="Цена за 1 кВт·ч (₽)" value={ventilation.electricityPrice} onChange={(v) => setVentilation({ ...ventilation, electricityPrice: v })} min={0} step={0.1} unit="₽/кВт·ч" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Результаты */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Результаты</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Кухня */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2 text-gray-700"><Flame className="w-4 h-4 text-blue-600" /> Производительность кухни</h3>
                <button onClick={() => openHelp('kitchen')} className="text-gray-400 hover:text-blue-600 transition"><Info className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100"><div className="text-[11px] text-gray-500 uppercase tracking-wider">Доступно</div><div className="text-lg font-bold mt-1 text-gray-800">{Math.round(results.availMin)} мин</div></div>
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100"><div className="text-[11px] text-gray-500 uppercase tracking-wider">Блюд</div><div className="text-lg font-bold mt-1 text-gray-800">{results.totalDishes}</div></div>
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100"><div className="text-[11px] text-gray-500 uppercase tracking-wider">Выручка</div><div className="text-lg font-bold mt-1 text-blue-600">{fmt(results.kitchenRev)} ₽</div></div>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-[11px] text-gray-500 mb-1"><span>Загрузка</span><span>{Math.round(results.kitchenLoad)}%</span></div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: Math.min(100, results.kitchenLoad) + '%', background: results.kitchenLoad > 95 ? 'linear-gradient(90deg,#ef4444,#f87171)' : results.kitchenLoad > 80 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#22c55e,#4ade80)' }} /></div>
                <div className="text-[10px] text-gray-400 mt-1">{results.kitchenLoad > 95 ? 'Критическая загрузка — риск сбоев' : results.kitchenLoad > 80 ? 'Высокая загрузка — запас минимальный' : 'Комфортная загрузка'}</div>
              </div>
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-200"><th className="text-left py-2 text-gray-500 text-xs uppercase tracking-wider">Категория</th><th className="text-left py-2 text-gray-500 text-xs uppercase tracking-wider">Время</th><th className="text-left py-2 text-gray-500 text-xs uppercase tracking-wider">Цена</th><th className="text-left py-2 text-gray-500 text-xs uppercase tracking-wider">Блюд</th><th className="text-left py-2 text-gray-500 text-xs uppercase tracking-wider">Выручка</th></tr></thead>
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
                  <tfoot><tr><td colSpan={3} className="py-2 font-bold text-gray-800">Итого</td><td className="py-2 font-bold text-gray-800">{results.totalDishes}</td><td className="py-2 font-bold text-blue-600">{fmt(results.kitchenRev)} ₽</td></tr></tfoot>
                </table>
              </div>
            </div>

            {/* Кофейня */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2 text-gray-700"><Coffee className="w-4 h-4 text-blue-600" /> Производительность кофейни</h3>
                <button onClick={() => openHelp('coffee')} className="text-gray-400 hover:text-blue-600 transition"><Info className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100"><div className="text-[11px] text-gray-500 uppercase tracking-wider">Напитков за смену</div><div className="text-2xl font-extrabold mt-2 text-gray-800">{Math.round(results.coffeeCap).toLocaleString('ru-RU')}</div></div>
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100"><div className="text-[11px] text-gray-500 uppercase tracking-wider">Макс. выручка</div><div className="text-2xl font-extrabold mt-2 text-blue-600">{fmt(results.coffeeRev)} ₽</div></div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-2 border border-gray-100">
                <div className="flex justify-between"><span className="text-gray-500">Бариста</span><span className="font-bold text-gray-800">{results.baristas}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Время на напиток</span><span className="font-bold text-gray-800">{results.drinkTime} сек</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Напитков в мин.</span><span className="font-bold text-gray-800">{results.baristas > 0 ? (60 / results.drinkTime * results.baristas).toFixed(1) : '0'}</span></div>
              </div>
            </div>

            {/* Зал */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2 text-gray-700"><Armchair className="w-4 h-4 text-blue-600" /> Пропускная способность зала</h3>
                <button onClick={() => openHelp('hall')} className="text-gray-400 hover:text-blue-600 transition"><Info className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded">
                <div><div className="text-sm text-gray-600">Гостей за смену (при тек. загрузке)</div><div className="text-3xl font-bold">{results.realisticGuestsPerShift.toLocaleString('ru-RU')}</div></div>
                <div><div className="text-sm text-gray-600">Выручка за смену (реалистичная)</div><div className="text-3xl font-bold text-green-700">{fmt(results.shiftRevenue)} ₽</div></div>
                <div><div className="text-sm text-gray-600">Загрузка зала</div><div className="text-3xl font-bold">{Math.round((results.realisticGuestsPerShift / results.maxGuestsWithoutLoad) * 100)}%</div></div>
              </div>
              <div className="mt-3 p-3 bg-gray-50 rounded">
                <div className="flex justify-between text-sm"><span className="text-gray-600">Максимальная пропускная способность (потолок)</span><span className="font-bold">{results.maxGuestsWithoutLoad.toLocaleString('ru-RU')} гостей</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Максимальная возможная выручка (при 100% загрузке)</span><span className="font-bold text-blue-600">{fmt(results.hallRevPerShift)} ₽</span></div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                <div className="flex justify-between text-sm"><span className="text-gray-600">Среднее время гостя (норматив)</span><span className="font-bold">{results.guestTime} мин</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Оборачиваемость места (посадок за смену)</span><span className="font-bold">{results.turnsPerShift.toFixed(1)}</span></div>
              </div>
              <div className={`mt-4 p-3 rounded border ${results.maxGuestsPerShift >= results.benchmark ? 'text-green-600 border-green-200 bg-green-50' : 'text-red-600 border-red-200 bg-red-50'}`}>
                <p className="text-sm">{results.maxGuestsPerShift >= results.benchmark ? '✅ В пределах рыночного ориентира' : '⚠️ Ниже рыночного ориентира'}</p>
                <p className="text-xs text-gray-500 mt-1">Ориентир для «{results.venueLabel}»: <strong>{results.benchmark}</strong> гостей/смена. {results.maxGuestsPerShift >= results.benchmark ? `(+${results.maxGuestsPerShift - results.benchmark})` : `(${results.maxGuestsPerShift - results.benchmark})`}</p>
              </div>
            </div>

            {/* Вентиляция */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2 text-gray-700"><Wind className="w-4 h-4 text-blue-600" /> Вентиляция</h3>
                <button onClick={() => openHelp('ventilation')} className="text-gray-400 hover:text-blue-600 transition"><Info className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100"><div className="text-[11px] text-gray-500 uppercase tracking-wider">Зал</div><div className="text-base font-bold mt-1 text-gray-800">{results.ventHall.toLocaleString('ru-RU')} м³/ч</div></div>
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100"><div className="text-[11px] text-gray-500 uppercase tracking-wider">Кухня</div><div className="text-base font-bold mt-1 text-gray-800">{results.ventKit.toLocaleString('ru-RU')} м³/ч</div></div>
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100"><div className="text-[11px] text-gray-500 uppercase tracking-wider">Итого</div><div className="text-base font-bold mt-1 text-gray-800">{results.ventTotal.toLocaleString('ru-RU')} м³/ч</div></div>
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Тепловая мощность (нагрев притока)</div>
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Зал</span><span className="text-gray-800">{results.heatH.toFixed(1)} кВт</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Кухня</span><span className="text-gray-800">{results.heatK.toFixed(1)} кВт</span></div>
                <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2"><span className="text-gray-700">Общая (с запасом)</span><span className="text-blue-600">{results.heatTotal.toFixed(1)} кВт</span></div>
              </div>
              <div className="text-xs text-gray-400 mb-2">ΔT = {results.inTemp}°C − ({results.outTemp}°C) = {results.dT}°C</div>
              <div className="flex gap-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-lg text-xs text-gray-700 leading-relaxed">
                <Wind className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>{results.heatTotal < 10 ? 'Электрический калорифер — достаточно для небольшой тепловой мощности.' : results.heatTotal <= 30 ? 'Водяной калорифер (подключение к системе отопления) или тепловой насос — оптимально для средней мощности.' : 'Водяной калорифер (подключение к системе отопления) — обязательно для высокой тепловой мощности.'}</div>
              </div>
            </div>

            {/* Вместимость */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2 text-gray-700"><Gauge className="w-4 h-4 text-blue-600" /> Вместимость по направлениям</h3>
                <button onClick={() => openHelp('capacity')} className="text-gray-400 hover:text-blue-600 transition"><Info className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Кухня', value: results.kitchenRev, color: '#ef4444', icon: Flame },
                  { label: 'Кофейня', value: results.coffeeRev, color: '#8b5cf6', icon: Coffee },
                  { label: 'Зал', value: results.hallRevPerShift, color: '#2563eb', icon: Armchair },
                ].map((item) => {
                  const max = Math.max(results.kitchenRev, results.coffeeRev, results.hallRevPerShift, 1);
                  const pct = Math.max(2, (item.value / max) * 100);
                  const isBottleneck = (item.label === 'Зал' && results.bottleneck === 'Зал') || (item.label !== 'Зал' && results.bottleneck === 'Производство');
                  const Icon = item.icon;
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={`flex items-center gap-2 ${isBottleneck ? 'text-blue-700 font-bold' : 'text-gray-600'}`}>
                          <Icon className="w-4 h-4" /> {item.label}
                          {isBottleneck && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">УЗКОЕ МЕСТО</span>}
                        </span>
                        <span className="font-bold text-gray-800">{fmt(item.value)} ₽</span>
                      </div>
                      <div className="h-9 bg-gray-200 rounded-lg overflow-hidden relative">
                        <div className="h-full rounded-lg transition-all duration-700 flex items-center px-3 text-xs font-bold text-white" style={{ width: pct + '%', background: item.color, minWidth: pct > 15 ? 'auto' : '0' }}>{pct > 15 && fmt(item.value) + ' ₽'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Структура дневной выручки</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-sm bg-red-500" /><div><div className="text-sm font-semibold text-gray-800">Еда (кухня)</div><div className="text-xs text-gray-500">{fmt(results.kitchenRev)} ₽ · {results.kitchenRev + results.coffeeRev > 0 ? Math.round((results.kitchenRev / (results.kitchenRev + results.coffeeRev)) * 100) : 0}%</div></div></div>
                  <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-sm bg-purple-500" /><div><div className="text-sm font-semibold text-gray-800">Напитки (кофейня)</div><div className="text-xs text-gray-500">{fmt(results.coffeeRev)} ₽ · {results.kitchenRev + results.coffeeRev > 0 ? Math.round((results.coffeeRev / (results.kitchenRev + results.coffeeRev)) * 100) : 0}%</div></div></div>
                  <div className="sm:col-span-2 mt-2 pt-2 border-t border-gray-200"><div className="text-xs text-gray-500">Общая дневная выручка</div><div className="text-lg font-extrabold text-blue-600">{fmt(results.dailyRevenue)} ₽</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Рекомендации – без изменений, но добавим кнопку Info? Можно не добавлять, т.к. рекомендации и так понятны */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2"><Lightbulb className="w-4 h-4" /> Рекомендации</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="space-y-3">
              {(() => {
                const recs = [];
                if (results.bottleneck === 'Зал') {
                  recs.push({ color: '#2563eb', icon: Armchair, title: 'Зал является узким местом', text: 'Увеличьте количество мест или сократите время пребывания гостей.' });
                  recs.push({ color: '#2563eb', icon: Users, title: 'Увеличьте посадочные места', text: `Текущие ${results.seats} мест при загрузке ${Math.round(results.load*100)}% дают ${results.realisticGuestsPerShift} гостей. Добавление мест повысит пропускную способность.` });
                  recs.push({ color: '#2563eb', icon: Clock, title: 'Ускорьте обслуживание', text: 'Меньше времени на приём заказа, предзаказ через QR-код, электронные чеки — всё это сокращает время гостя.' });
                  recs.push({ color: '#2563eb', icon: TrendingUp, title: 'Дополнительные каналы', text: 'Внедрите предварительную запись, доставку или самовывоз.' });
                } else {
                  recs.push({ color: '#dc2626', icon: Flame, title: 'Производство — узкое место', text: `Кухня (${fmt(results.kitchenRev)} ₽) + Кофейня (${fmt(results.coffeeRev)} ₽) = ${fmt(results.kitchenRev + results.coffeeRev)} ₽ — меньше потенциала зала (${fmt(results.hallRevPerShift)} ₽).` });
                  if (results.kitchenLoad > 90) recs.push({ color: '#dc2626', icon: Users, title: 'Увеличьте количество поваров', text: `Загрузка кухни ${Math.round(results.kitchenLoad)}%. Добавление повара или повышение параллельности снизит нагрузку.` });
                  recs.push({ color: '#7c3aed', icon: Coffee, title: 'Проверьте кофейню', text: `Максимум ${Math.round(results.coffeeCap).toLocaleString('ru-RU')} напитков за смену. Если поток гостей выше — добавьте бариста или сократите время приготовления.` });
                  recs.push({ color: '#d97706', icon: Utensils, title: 'Оптимизируйте меню', text: 'Упростите самые медленные блюда или уберите их из основного меню.' });
                }
                if (results.kitchenLoad > 95) recs.push({ color: '#dc2626', icon: AlertTriangle, title: 'Критическая загрузка кухни', text: `${Math.round(results.kitchenLoad)}% — высокий риск сбоев. Рассмотрите дополнительные смены или сокращение меню.` });
                else if (results.kitchenLoad < 50 && results.cooks > 0) recs.push({ color: '#16a34a', icon: TrendingDown, title: 'Кухня недозагружена', text: `${Math.round(results.kitchenLoad)}% загрузки при ${results.cooks} поварах. Можно сократить штат или увеличить ассортимент.` });
                if (results.rentShare > 14) recs.push({ color: '#dc2626', icon: Building, title: 'Аренда завышена', text: `Доля ${results.rentShare.toFixed(1)}% при норме до 14%. Это ${fmt(results.rent)} ₽/мес при рекомендуемом максимуме ${fmt(results.normalRent)} ₽.` });
                else if (results.rentShare <= 10 && results.rent > 0) recs.push({ color: '#16a34a', icon: CheckCircle, title: 'Отличная аренда', text: `Доля ${results.rentShare.toFixed(1)}% — значительно ниже рыночной нормы. Сильное конкурентное преимущество.` });
                return recs.map((r, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl border-l-4" style={{ borderColor: r.color }}>
                    <r.icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: r.color }} />
                    <div><div className="text-sm font-bold text-gray-800 mb-0.5">{r.title}</div><div className="text-xs text-gray-500 leading-relaxed">{r.text}</div></div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Модальное окно подсказки */}
        {helpModal.open && helpTexts[helpModal.block] && (
          <HelpModal
            isOpen={true}
            onClose={closeHelp}
            title={helpTexts[helpModal.block].title}
          >
            <p>{helpTexts[helpModal.block].text}</p>
          </HelpModal>
        )}
      </div>
    </div>
  );
}