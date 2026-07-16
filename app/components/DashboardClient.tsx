// app/components/DashboardClient.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle,
  Edit,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { Skeleton, SkeletonCard } from '../../components/Skeleton';

// ---- Типы ----
type BusinessData = {
  name: string;
  address: string;
  venueType: string;
  totalArea: number;
  hallArea: number;
  seats: number;
  staffCount: number;
  dailyGuests: number; // новое поле
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
  venueType: 'cafe',
  totalArea: 110,
  hallArea: 80,
  seats: 48,
  staffCount: 12,
  dailyGuests: 50, // начальное значение
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

const formatPercent = (value: number): string => value.toFixed(2);
const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU');

// Нормы для цветовой индикации
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

const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'info'; onClose: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium"
      style={{ background: type === 'success' ? 'var(--success)' : 'var(--primary)' }}>
      {type === 'success' ? <CheckCircle size={18} /> : <Info size={18} />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 transition">×</button>
    </div>
  );
};

const MetricRow = ({ label, value, unit = '%', target, colorLevel }: {
  label: string; value: number; unit?: string; target?: string; colorLevel: ColorLevel;
}) => {
  const cssColor = colorLevel === 'green' ? '#10b981' : colorLevel === 'orange' ? '#f59e0b' : colorLevel === 'red' ? '#ef4444' : '#6b7280';
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cssColor }} />
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold tabular-nums" style={{ color: cssColor }}>
          {unit === '₽' ? fmt(value) + ' ₽' : `${formatPercent(value)}%`}
        </span>
        {target && <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{target}</span>}
      </div>
    </div>
  );
};

const DataModal = ({ isOpen, onClose, data, onSave }: {
  isOpen: boolean; onClose: () => void; data: BusinessData; onSave: (newData: Partial<BusinessData>) => void;
}) => {
  const [form, setForm] = useState(data);
  useEffect(() => { setForm(data); }, [data, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value === '' ? 0 : Number(value) }));
  };
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(form); onClose(); };
  if (!isOpen) return null;

  const fields = [
    { name: 'totalArea', label: 'Площадь общая (м²)' },
    { name: 'hallArea', label: 'Площадь зала (м²)' },
    { name: 'seats', label: 'Посадочных мест' },
    { name: 'staffCount', label: 'Количество сотрудников' },
    { name: 'dailyGuests', label: 'Гостей в день (среднее)' },
    { name: 'revenue', label: 'Выручка в месяц (₽)' },
    { name: 'avgCheck', label: 'Средний чек (₽)' },
    { name: 'rent', label: 'Аренда (₽)' },
    { name: 'utilities', label: 'Коммунальные платежи (₽)' },
    { name: 'payroll', label: 'ФОТ (₽)' },
    { name: 'managementCosts', label: 'Затраты на управление (₽)' },
    { name: 'costOfGoods', label: 'Foodcost (₽)' },
    { name: 'otherExpenses', label: 'Прочие расходы (₽)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col" style={{ boxShadow: 'var(--shadow-modal)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Вводные данные бизнеса</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition" style={{ color: 'var(--text-muted)' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            <div>
              <label className="section-label block">Основная информация</label>
              <input type="text" name="name" value={form.name} onChange={handleTextChange} className="input-field mb-3" placeholder="Название" />
              <input type="text" name="address" value={form.address} onChange={handleTextChange} className="input-field mb-3" placeholder="Адрес" />
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>Тип заведения</label>
              <select name="venueType" value={form.venueType} onChange={handleSelectChange} className="input-field">
                <option value="cafe">Кафе</option>
                <option value="restaurant">Ресторан</option>
                <option value="coffee">Кофейня</option>
                <option value="canteen">Столовая</option>
                <option value="fastfood">Быстрое обслуживание</option>
                <option value="darkkitchen">Дарк китчен</option>
              </select>
            </div>
            <div>
              <label className="section-label block">Площади и ресурсы</label>
              <div className="grid grid-cols-2 gap-3">
                {fields.slice(0, 5).map(f => (
                  <div key={f.name}>
                    <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
                    <input type="number" name={f.name} value={form[f.name as keyof BusinessData] as number} onChange={handleChange} className="input-field" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="section-label block">Финансы (₽/мес)</label>
              <div className="grid grid-cols-2 gap-3">
                {fields.slice(5).map(f => (
                  <div key={f.name}>
                    <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
                    <input type="number" name={f.name} value={form[f.name as keyof BusinessData] as number} onChange={handleChange} className="input-field" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
        <div className="flex justify-end gap-2 px-6 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button type="button" onClick={onClose} className="btn-ghost">Отмена</button>
          <button type="submit" onClick={handleSubmit} className="btn-primary">Сохранить</button>
        </div>
      </div>
    </div>
  );
};

export default function DashboardClient() {
  const [businessData, setBusinessData] = useState<BusinessData>(defaultBusiness);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

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
      setToast({ message: 'Данные сохранены', type: 'success' });
    } catch {
      setToast({ message: 'Ошибка соединения', type: 'info' });
    }
  };

  const kpis = [
    { label: 'Выручка/мес', value: `${fmt(businessData.revenue)} ₽`, sub: `Чек: ${fmt(businessData.avgCheck)} ₽` },
    {
      label: 'Операционная прибыль',
      value: `${formatPercent(businessData.profitPercent)}%`,
      sub: `${fmt(businessData.operatingProfit)} ₽`,
      colorLevel: getColorLevel('profitPercent', businessData.profitPercent).color,
    },
    {
      label: 'Food cost',
      value: `${formatPercent(businessData.foodCostPercent)}%`,
      sub: businessData.foodCostPercent > 32 ? 'Выше нормы' : 'В норме',
      colorLevel: getColorLevel('foodCostPercent', businessData.foodCostPercent).color,
    },
    {
      label: 'ФОТ',
      value: `${formatPercent(businessData.payrollPercent)}%`,
      sub: businessData.payrollPercent > 25 ? 'Выше нормы' : 'В норме',
      colorLevel: getColorLevel('payrollPercent', businessData.payrollPercent).color,
    },
  ];

  if (loading) {
    return (
      <ErrorBoundary>
        <div className="p-6 lg:p-8" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-6 lg:p-8" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{businessData.name}</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {businessData.address} · Гостей в день: {businessData.dailyGuests}
            </p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary"><Edit size={16} /> Изменить данные</button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi, i) => (
            <div key={i} className="card p-4 bg-white rounded-xl border border-gray-100">
              <div className="text-xs font-medium text-gray-400 mb-1">{kpi.label}</div>
              <div className={`text-lg font-bold tabular-nums ${kpi.colorLevel === 'green' ? 'text-emerald-600' : kpi.colorLevel === 'orange' ? 'text-amber-600' : kpi.colorLevel === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
                {kpi.value}
              </div>
              <div className="text-xs text-gray-400 mt-1">{kpi.sub}</div>
            </div>
          ))}
        </div>

        <div className="card p-5 mb-6">
          <div className="section-label">На что уходит выручка</div>
          <MetricRow label="Foodcost" value={businessData.foodCostPercent} target="→ 28–32%" colorLevel={getColorLevel('foodCostPercent', businessData.foodCostPercent).color} />
          <MetricRow label="ФОТ" value={businessData.payrollPercent} target="→ 22–25%" colorLevel={getColorLevel('payrollPercent', businessData.payrollPercent).color} />
          <MetricRow label="Аренда" value={businessData.rentPercent} target="→ до 14%" colorLevel={getColorLevel('rentPercent', businessData.rentPercent).color} />
          <MetricRow label="Коммунальные" value={businessData.utilitiesPercent} colorLevel="neutral" />
          <MetricRow label="Управление" value={businessData.managementPercent} colorLevel="neutral" />
          <MetricRow label="Прочие" value={businessData.otherPercent} colorLevel="neutral" />
          <div className="divider" />
          <MetricRow label="Операционная прибыль" value={businessData.profitPercent} target="→ 15%+" colorLevel={getColorLevel('profitPercent', businessData.profitPercent).color} />
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Индекс здоровья</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${businessData.healthIndex}%`, backgroundColor: businessData.healthIndex >= 70 ? '#10b981' : businessData.healthIndex >= 40 ? '#f59e0b' : '#ef4444' }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{businessData.healthIndex}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="section-label">Экспресс-аудит</div>
          <div className="space-y-3 mt-3">
            <MetricRow label="Foodcost" value={businessData.foodCostPercent} target="→ 28–32%" colorLevel={getColorLevel('foodCostPercent', businessData.foodCostPercent).color} />
            <MetricRow label="ФОТ" value={businessData.payrollPercent} target="→ 22–25%" colorLevel={getColorLevel('payrollPercent', businessData.payrollPercent).color} />
            <MetricRow label="Аренда" value={businessData.rentPercent} target="→ до 14%" colorLevel={getColorLevel('rentPercent', businessData.rentPercent).color} />
            <MetricRow label="Прибыль" value={businessData.profitPercent} target="→ 15%+" colorLevel={getColorLevel('profitPercent', businessData.profitPercent).color} />
          </div>
        </div>

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <DataModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={businessData} onSave={saveBusinessData} />
      </div>
    </ErrorBoundary>
  );
}