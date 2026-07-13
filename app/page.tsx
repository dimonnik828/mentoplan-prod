// app/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePlan } from '../lib/usePlan';
import {
  Wallet,
  Megaphone,
  UsersRound,
  ArrowRight,
  PlusCircle,
  Target,
  CheckCircle,
  XCircle,
  ChevronDown,
  Edit,
} from 'lucide-react';

// ---- Типы ----
type BusinessData = {
  name: string;
  address: string;
  totalArea: number;
  hallArea: number;
  seats: number;
  staffCount: number;
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

// ---- Данные по умолчанию ----
const defaultBusiness: BusinessData = {
  name: 'Кафе MOMENTO на Тверской',
  address: 'Москва, ул. Тверская, 10',
  totalArea: 110,
  hallArea: 80,
  seats: 48,
  staffCount: 12,
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

// ---- Вспомогательная функция для форматирования процентов ----
const formatPercent = (value: number): string => value.toFixed(2);

// ---- Пересчёт показателей ----
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

  const healthIndex = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        100 -
        (rentPercent > 14 ? (rentPercent - 14) * 2 : 0) -
        (payrollPercent > 25 ? (payrollPercent - 25) * 1.5 : 0) -
        (foodCostPercent > 32 ? (foodCostPercent - 32) * 1.2 : 0) +
        (profitPercent > 10 ? (profitPercent - 10) * 2 : 0)
      )
    )
  );

  return {
    ...defaultBusiness,
    ...data,
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

// ---- Зоны внимания ----
const getAttentionZones = (data: BusinessData) => {
  const zones = [];
  if (data.rentPercent > 14) {
    zones.push({
      id: '1',
      title: 'Аренда выше комфортного уровня',
      status: 'critical',
      description: `Аренда составляет ${formatPercent(data.rentPercent)}% от выручки, ориентир — до 14%.`,
      potential: `Снизить нагрузку на ${Math.round((data.rentPercent - 14) / 100 * data.revenue)} ₽ в месяц.`,
    });
  }
  if (data.foodCostPercent > 32) {
    zones.push({
      id: '2',
      title: 'Высокая себестоимость',
      status: 'attention',
      description: `Food cost составляет ${formatPercent(data.foodCostPercent)}%, целевой уровень — до 32%.`,
      potential: 'Оптимизировать закупки и пересмотреть граммовки популярных блюд.',
    });
  }
  if (data.profitPercent < 12) {
    zones.push({
      id: '3',
      title: 'Низкая операционная прибыль',
      status: 'attention',
      description: `Прибыль составляет ${formatPercent(data.profitPercent)}% от выручки, потенциал — 15%+.`,
      potential: 'Сократить долю аренды и ФОТ, увеличить дневную выручку.',
    });
  }
  if (zones.length === 0) {
    zones.push({
      id: '0',
      title: 'Бизнес в хорошей форме',
      status: 'opportunity',
      description: 'Все ключевые показатели в норме.',
      potential: 'Сосредоточьтесь на росте и масштабировании.',
    });
  }
  return zones;
};

// ---- Toast ----
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'info'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-blue-600';
  return (
    <div className={`fixed bottom-6 right-6 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all`}>
      {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-white/80 hover:text-white">×</button>
    </div>
  );
};

// ---- HealthGauge ----
const HealthGauge = ({ score }: { score: number }) => {
  const percent = Math.min(100, score);
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90">
          <circle cx="64" cy="64" r="56" fill="none" stroke="#e2e8f0" strokeWidth="12" />
          <circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            stroke="#2f62d6"
            strokeWidth="12"
            strokeDasharray={2 * Math.PI * 56}
            strokeDashoffset={2 * Math.PI * 56 * (1 - percent / 100)}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">{score}</span>
          <span className="text-xs text-gray-500">из 100</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full">
        {score >= 70 ? 'Хорошо' : score >= 50 ? 'Зона внимания' : 'Требует действий'}
      </span>
    </div>
  );
};

// ---- AttentionZoneCard ----
const AttentionZoneCard = ({ zone }: { zone: any }) => {
  const statusColors = {
    critical: 'border-red-200 bg-red-50',
    attention: 'border-yellow-200 bg-yellow-50',
    opportunity: 'border-green-200 bg-green-50',
  };
  const statusText = {
    critical: 'Критично',
    attention: 'Внимание',
    opportunity: 'Возможность',
  };
  return (
    <div className={`border-l-4 p-4 rounded-md ${statusColors[zone.status]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase">{statusText[zone.status]}</span>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Разобрать</button>
      </div>
      <h4 className="font-semibold text-gray-900 mt-1">{zone.title}</h4>
      <p className="text-sm text-gray-600 mt-1">{zone.description}</p>
      <p className="text-sm text-gray-500 mt-1">Потенциал: {zone.potential}</p>
    </div>
  );
};

// ---- Аккордеон ----
const AccordionSection = ({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3">
          <Icon size={20} className="text-gray-600" />
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="p-4 pt-0 border-t border-gray-100">{children}</div>}
    </div>
  );
};

// ---- Модальное окно ввода данных ----
const DataModal = ({
  isOpen,
  onClose,
  data,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: BusinessData;
  onSave: (newData: Partial<BusinessData>) => void;
}) => {
  const [form, setForm] = useState(data);

  useEffect(() => {
    setForm(data);
  }, [data, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value === '' ? 0 : Number(value) }));
  };
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">Вводные данные бизнеса</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Название</label>
            <input type="text" name="name" value={form.name} onChange={handleTextChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Адрес расположения</label>
            <input type="text" name="address" value={form.address} onChange={handleTextChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'totalArea', label: 'Площадь общая (м²)' },
              { name: 'hallArea', label: 'Площадь зала (м²)' },
              { name: 'seats', label: 'Посадочных мест' },
              { name: 'staffCount', label: 'Количество сотрудников' },
              { name: 'revenue', label: 'Выручка в месяц (₽)' },
              { name: 'avgCheck', label: 'Средний чек (₽)' },
              { name: 'rent', label: 'Аренда (₽)' },
              { name: 'utilities', label: 'Коммунальные платежи (₽)' },
              { name: 'payroll', label: 'ФОТ (₽)' },
              { name: 'managementCosts', label: 'Затраты на управление (₽)' },
              { name: 'costOfGoods', label: 'Себестоимость (₽)' },
              { name: 'otherExpenses', label: 'Прочие расходы (₽)' },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                <input
                  type="number"
                  name={field.name}
                  value={form[field.name as keyof BusinessData] as number}
                  onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">Отмена</button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---- Главная страница (Dashboard) ----
export default function Dashboard() {
  const [businessData, setBusinessData] = useState<BusinessData>(defaultBusiness);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const { plan, addAction, removeAction } = usePlan();

  // Загрузка данных из БД, затем из localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/audits/latest');
        if (res.ok) {
          const data = await res.json();
          const businessFromDB: BusinessData = {
            name: data.name || defaultBusiness.name,
            address: data.address,
            totalArea: data.totalArea || 0,
            hallArea: data.hallArea || 0,
            seats: data.seats || 0,
            staffCount: data.staffCount || 0,
            avgCheck: data.avgCheck || 0,
            revenue: data.revenue || 0,
            rent: data.rent || 0,
            utilities: data.utilities || 0,
            payroll: data.payroll || 0,
            managementCosts: data.managementCosts || 0,
            costOfGoods: data.costOfGoods || 0,
            otherExpenses: data.otherExpenses || 0,
            foodCostPercent: data.foodCostPercent || 0,
            payrollPercent: data.payrollPercent || 0,
            rentPercent: data.rentPercent || 0,
            utilitiesPercent: data.utilitiesPercent || 0,
            managementPercent: data.managementPercent || 0,
            otherPercent: data.otherPercent || 0,
            profitPercent: data.profitPercent || 0,
            operatingProfit: data.profitAbsolute || 0,
            healthIndex: data.healthIndex || 0,
          };
          setBusinessData(businessFromDB);
          localStorage.setItem('momentoBusinessData', JSON.stringify(businessFromDB));
        } else {
          const saved = localStorage.getItem('momentoBusinessData');
          if (saved) {
            const parsed = JSON.parse(saved);
            setBusinessData(recalcBusiness(parsed));
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки аудита:', error);
        const saved = localStorage.getItem('momentoBusinessData');
        if (saved) {
          const parsed = JSON.parse(saved);
          setBusinessData(recalcBusiness(parsed));
        }
      }
    };
    loadData();
  }, []);

  // Сохранение данных (в localStorage и в БД)
  const saveBusinessData = async (newData: Partial<BusinessData>) => {
    const updated = recalcBusiness(newData);
    setBusinessData(updated);
    localStorage.setItem('momentoBusinessData', JSON.stringify(updated));

    try {
      const payload = {
        name: updated.name,
        address: updated.address,
        totalArea: updated.totalArea,
        hallArea: updated.hallArea,
        seats: updated.seats,
        staffCount: updated.staffCount,
        avgCheck: updated.avgCheck,
        revenue: updated.revenue,
        rent: updated.rent,
        utilities: updated.utilities,
        payroll: updated.payroll,
        managementCosts: updated.managementCosts,
        costOfGoods: updated.costOfGoods,
        otherExpenses: updated.otherExpenses,
      };
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast('Данные сохранены в базу', 'success');
      } else {
        showToast('Ошибка сохранения в БД', 'info');
      }
    } catch (error) {
      console.error('Ошибка отправки в БД:', error);
      showToast('Ошибка соединения', 'info');
    }
  };

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
  };
  const closeToast = () => setToast(null);

  const attentionZones = getAttentionZones(businessData);

  const demandSummary = 'Точка недополучает дневной спрос: рядом расположены офисы, но предложение для бизнес-ланча не сформировано.';
  const financeSummary = `Доля аренды составляет ${formatPercent(businessData.rentPercent)}% выручки, целевой ориентир — до 14%.`;
  const operationsSummary = 'У 30% блюд нет актуальных ТТК, поэтому сложно контролировать себестоимость.';

  return (
    <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Верхняя панель */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Картина бизнеса на сегодня</h1>
            <p className="text-gray-500 mt-1">Мы нашли {attentionZones.length} зон, которые сейчас влияют на прибыль и рост точки.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
          >
            <Edit size={18} />
            Вводные данные
          </button>
        </div>

        {/* Индекс здоровья + зоны */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center">
            <HealthGauge score={businessData.healthIndex} />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                {businessData.healthIndex >= 70
                  ? 'Бизнес в хорошей форме, но есть потенциал для роста.'
                  : businessData.healthIndex >= 50
                  ? 'Есть зоны, требующие внимания. Сосредоточьтесь на ключевых проблемах.'
                  : 'Необходимо срочно принять меры для улучшения показателей.'}
              </p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md transition">
                  Полная диагностика
                </button>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-4 py-2 rounded-md transition">
                  План на 30 дней
                </button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            {attentionZones.map((zone) => (
              <AttentionZoneCard key={zone.id} zone={zone} />
            ))}
          </div>
        </div>

        {/* Финансовая картина */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900">На что уходит выручка</h3>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
            <div><span className="font-medium">Себестоимость:</span> {formatPercent(businessData.foodCostPercent)}%</div>
            <div><span className="font-medium">ФОТ:</span> {formatPercent(businessData.payrollPercent)}%</div>
            <div><span className="font-medium">Аренда:</span> {formatPercent(businessData.rentPercent)}%</div>
            <div><span className="font-medium">Коммунальные:</span> {formatPercent(businessData.utilitiesPercent)}%</div>
            <div><span className="font-medium">Управление:</span> {formatPercent(businessData.managementPercent)}%</div>
            <div><span className="font-medium">Прочие:</span> {formatPercent(businessData.otherPercent)}%</div>
            <div className="text-green-600 col-span-2"><span className="font-medium">Прибыль:</span> {formatPercent(businessData.profitPercent)}%</div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Главное ограничение прибыли — сочетание высокой аренды ({formatPercent(businessData.rentPercent)}%) и затрат на персонал ({formatPercent(businessData.payrollPercent)}%).
          </p>
        </div>

        {/* Аккордеон */}
        <div className="space-y-4">
          <AccordionSection title="Маркетинг и спрос" icon={Megaphone} defaultOpen>
            <p className="text-sm text-gray-600">{demandSummary}</p>
            <div className="mt-2 bg-gray-50 p-3 rounded-md text-sm">
              <p className="font-medium">Ключевые метрики:</p>
              <ul className="list-disc list-inside text-gray-600 mt-1">
                <li>Средний чек: {businessData.avgCheck} ₽</li>
                <li>Выручка: {businessData.revenue.toLocaleString('ru-RU')} ₽/мес</li>
                <li>Потенциал роста дневной выручки: +8–12%</li>
              </ul>
            </div>
          </AccordionSection>
          <AccordionSection title="Финансы" icon={Wallet} defaultOpen>
            <p className="text-sm text-gray-600">{financeSummary}</p>
            <div className="mt-2 bg-gray-50 p-3 rounded-md text-sm">
              <div className="flex justify-between"><span>Food cost</span><span>{formatPercent(businessData.foodCostPercent)}% (ориентир 28–32%)</span></div>
              <div className="flex justify-between"><span>ФОТ</span><span>{formatPercent(businessData.payrollPercent)}% (ориентир 22–25%)</span></div>
              <div className="flex justify-between"><span>Аренда</span><span>{formatPercent(businessData.rentPercent)}% (ориентир до 14%)</span></div>
              <div className="flex justify-between font-medium text-green-600"><span>Операционная прибыль</span><span>{formatPercent(businessData.profitPercent)}% (ориентир 15%+)</span></div>
            </div>
          </AccordionSection>
          <AccordionSection title="Операции и команда" icon={UsersRound} defaultOpen>
            <p className="text-sm text-gray-600">{operationsSummary}</p>
            <div className="mt-2 bg-gray-50 p-3 rounded-md text-sm">
              <ul className="list-disc list-inside text-gray-600">
                <li>30% блюд без актуальных ТТК</li>
                <li>Расписание смен не привязано к спросу</li>
                <li>Текучесть персонала: 18% за квартал</li>
              </ul>
            </div>
          </AccordionSection>
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      {/* Модалка */}
      <DataModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={businessData}
        onSave={saveBusinessData}
      />
    </main>
  );
}