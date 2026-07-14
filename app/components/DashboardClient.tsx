// app/components/DashboardClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePlan } from '../../lib/usePlan';
import {
  Wallet,
  Megaphone,
  UsersRound,
  CheckCircle,
  ChevronDown,
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
    venueType: data.venueType ?? defaultBusiness.venueType,
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

const getAttentionZones = (data: BusinessData) => {
  const zones: { id: string; title: string; status: string; description: string; potential: string }[] = [];
  if (data.rentPercent > 14) {
    zones.push({
      id: '1', title: 'Аренда выше комфортного уровня', status: 'critical',
      description: `Аренда составляет ${formatPercent(data.rentPercent)}% от выручки, ориентир — до 14%.`,
      potential: `Снизить нагрузку на ${Math.round((data.rentPercent - 14) / 100 * data.revenue)} ₽ в месяц.`,
    });
  }
  if (data.foodCostPercent > 32) {
    zones.push({
      id: '2', title: 'Высокая себестоимость', status: 'attention',
      description: `Food cost составляет ${formatPercent(data.foodCostPercent)}%, целевой уровень — до 32%.`,
      potential: 'Оптимизировать закупки и пересмотреть граммовки популярных блюд.',
    });
  }
  if (data.profitPercent < 12) {
    zones.push({
      id: '3', title: 'Низкая операционная прибыль', status: 'attention',
      description: `Прибыль составляет ${formatPercent(data.profitPercent)}% от выручки, потенциал — 15%+.`,
      potential: 'Сократить долю аренды и ФОТ, увеличить дневную выручку.',
    });
  }
  if (zones.length === 0) {
    zones.push({
      id: '0', title: 'Бизнес в хорошей форме', status: 'opportunity',
      description: 'Все ключевые показатели в норме.',
      potential: 'Сосредоточьтесь на росте и масштабировании.',
    });
  }
  return zones;
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

const HealthGauge = ({ score }: { score: number }) => {
  const pct = Math.min(100, Math.max(0, score));
  const r = 52;
  const circ = 2 * Math.PI * r;
  const color = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)';
  const label = pct >= 70 ? 'Хорошо' : pct >= 50 ? 'Зона внимания' : 'Требует действий';
  const badgeClass = pct >= 70 ? 'badge-success' : pct >= 50 ? 'badge-warning' : 'badge-danger';
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 120, height: 120 }}>
        <svg width={120} height={120} className="-rotate-90">
          <circle cx={60} cy={60} r={r} fill="none" stroke="#f3f4f6" strokeWidth={10} />
          <circle cx={60} cy={60} r={r} fill="none" stroke={color} strokeWidth={10}
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{score}</span>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>из 100</span>
        </div>
      </div>
      <span className={`badge ${badgeClass} mt-3`}>{label}</span>
    </div>
  );
};

const AttentionZoneCard = ({ zone }: { zone: { id: string; title: string; status: string; description: string; potential: string } }) => {
  const styles: Record<string, { bg: string; border: string; label: string; labelClass: string }> = {
    critical: { bg: 'var(--danger-light)', border: 'var(--danger)', label: 'Критично', labelClass: 'badge-danger' },
    attention: { bg: 'var(--warning-light)', border: 'var(--warning)', label: 'Внимание', labelClass: 'badge-warning' },
    opportunity: { bg: 'var(--success-light)', border: 'var(--success)', label: 'Хорошо', labelClass: 'badge-success' },
  };
  const s = styles[zone.status] || styles.attention;
  return (
    <div className="card p-4" style={{ borderLeftWidth: 3, borderLeftColor: s.border, background: s.bg }}>
      <span className={`badge ${s.labelClass} mb-2`}>{s.label}</span>
      <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>{zone.title}</h4>
      <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{zone.description}</p>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}><span className="font-medium">Потенциал:</span> {zone.potential}</p>
    </div>
  );
};

const CostRow = ({ label, value, target, bold, color }: { label: string; value: number; target?: string; bold?: boolean; color?: string }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color || 'var(--text-muted)' }} />
      <span className="text-sm" style={{ color: 'var(--text-secondary)', fontWeight: bold ? 600 : 400 }}>{label}</span>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold tabular-nums" style={{ color: color || 'var(--text)', fontWeight: bold ? 700 : 600 }}>
        {formatPercent(value)}%
      </span>
      {target && <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{target}</span>}
    </div>
  </div>
);

const AccordionSection = ({
  title, icon: Icon, children, defaultOpen = false,
}: {
  title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="card overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50/50 transition">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-light)' }}>
            <Icon size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{title}</span>
        </div>
        <ChevronDown size={18} style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-0 border-t" style={{ borderColor: 'var(--border-light)' }}>
          {children}
        </div>
      )}
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
    { name: 'revenue', label: 'Выручка в месяц (₽)' },
    { name: 'avgCheck', label: 'Средний чек (₽)' },
    { name: 'rent', label: 'Аренда (₽)' },
    { name: 'utilities', label: 'Коммунальные платежи (₽)' },
    { name: 'payroll', label: 'ФОТ (₽)' },
    { name: 'managementCosts', label: 'Затраты на управление (₽)' },
    { name: 'costOfGoods', label: 'Себестоимость (₽)' },
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
                {fields.slice(0, 4).map(f => (
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
                {fields.slice(4).map(f => (
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
  const { plan, addAction, removeAction } = usePlan();

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/audits/latest');
        if (res.ok) {
          const data = await res.json();
          const b: BusinessData = {
            name: data.name || defaultBusiness.name,
            address: data.address || '',
            venueType: data.venueType || 'cafe',
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
      setToast({ message: res.ok ? 'Данные сохранены' : 'Ошибка сохранения', type: res.ok ? 'success' : 'info' });
    } catch {
      setToast({ message: 'Ошибка соединения', type: 'info' });
    }
  };

  const attentionZones = getAttentionZones(businessData);
  const kpis = [
    { label: 'Выручка/мес', value: `${fmt(businessData.revenue)} ₽`, sub: `Чек: ${fmt(businessData.avgCheck)} ₽`, cls: 'kpi-indigo' as const, icon: TrendingUp },
    { label: 'Операционная прибыль', value: `${formatPercent(businessData.profitPercent)}%`, sub: `${fmt(businessData.operatingProfit)} ₽`, cls: businessData.profitPercent >= 10 ? 'kpi-emerald' as const : 'kpi-rose' as const, icon: businessData.profitPercent >= 10 ? TrendingUp : TrendingDown },
    { label: 'Food cost', value: `${formatPercent(businessData.foodCostPercent)}%`, sub: businessData.foodCostPercent > 32 ? 'Выше нормы' : 'В норме', cls: businessData.foodCostPercent > 32 ? 'kpi-amber' as const : 'kpi-emerald' as const, icon: businessData.foodCostPercent > 32 ? AlertTriangle : CheckCircle },
    { label: 'ФОТ', value: `${formatPercent(businessData.payrollPercent)}%`, sub: businessData.payrollPercent > 25 ? 'Выше нормы' : 'В норме', cls: businessData.payrollPercent > 25 ? 'kpi-amber' as const : 'kpi-emerald' as const, icon: businessData.payrollPercent > 25 ? AlertTriangle : CheckCircle },
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <div className="card p-6 flex flex-col items-center justify-center">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-4 w-32 mt-4" />
              </div>
            </div>
            <div className="lg:col-span-8 space-y-3">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
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
              {businessData.address} · {attentionZones.filter(z => z.status !== 'opportunity').length} зон требуют внимания
            </p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary"><Edit size={16} /> Изменить данные</button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map(kpi => (
            <div key={kpi.label} className={`kpi-card ${kpi.cls}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{kpi.label}</span>
                <kpi.icon size={16} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
              </div>
              <div className="text-lg font-bold" style={{ color: 'var(--text)' }}>{kpi.value}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          <div className="lg:col-span-4 card p-6 flex flex-col items-center justify-center">
            <div className="section-label text-center w-full">Индекс здоровья</div>
            <HealthGauge score={businessData.healthIndex} />
            <p className="text-xs text-center mt-4" style={{ color: 'var(--text-secondary)', maxWidth: 200 }}>
              {businessData.healthIndex >= 70 ? 'Бизнес в хорошей форме, но есть потенциал для роста.' :
               businessData.healthIndex >= 50 ? 'Есть зоны, требующие внимания. Сосредоточьтесь на ключевых проблемах.' :
               'Необходимо срочно принять меры для улучшения показателей.'}
            </p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              <button className="btn-primary" style={{ padding: '7px 14px', fontSize: 12 }}>Полная диагностика</button>
              <button className="btn-ghost" style={{ padding: '7px 14px', fontSize: 12 }}>План на 30 дней</button>
            </div>
          </div>
          <div className="lg:col-span-8">
            <div className="section-label">Зоны внимания</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {attentionZones.map(zone => <AttentionZoneCard key={zone.id} zone={zone} />)}
            </div>
          </div>
        </div>

        <div className="card p-5 mb-6">
          <div className="section-label">На что уходит выручка</div>
          <CostRow label="Себестоимость" value={businessData.foodCostPercent} target="→ 28–32%" color={businessData.foodCostPercent > 32 ? 'var(--warning)' : 'var(--success)'} />
          <CostRow label="ФОТ" value={businessData.payrollPercent} target="→ 22–25%" color={businessData.payrollPercent > 25 ? 'var(--warning)' : 'var(--success)'} />
          <CostRow label="Аренда" value={businessData.rentPercent} target="→ до 14%" color={businessData.rentPercent > 14 ? 'var(--danger)' : 'var(--success)'} />
          <CostRow label="Коммунальные" value={businessData.utilitiesPercent} color="#8b5cf6" />
          <CostRow label="Управление" value={businessData.managementPercent} color="#8b5cf6" />
          <CostRow label="Прочие" value={businessData.otherPercent} color="#8b5cf6" />
          <div className="divider" />
          <CostRow label="Операционная прибыль" value={businessData.profitPercent} target="→ 15%+" bold color={businessData.profitPercent >= 10 ? 'var(--success)' : 'var(--danger)'} />
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            Главное ограничение прибыли — сочетание высокой аренды ({formatPercent(businessData.rentPercent)}%) и затрат на персонал ({formatPercent(businessData.payrollPercent)}%).
          </p>
        </div>

        <div className="space-y-3">
          <AccordionSection title="Маркетинг и спрос" icon={Megaphone} defaultOpen>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Точка недополучает дневной спрос: рядом расположены офисы, но предложение для бизнес-ланча не сформировано.</p>
            <div className="rounded-lg p-4" style={{ background: 'var(--border-light)' }}>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Ключевые метрики:</div>
              <div className="space-y-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex justify-between"><span>Средний чек</span><span className="font-semibold" style={{ color: 'var(--text)' }}>{fmt(businessData.avgCheck)} ₽</span></div>
                <div className="flex justify-between"><span>Выручка</span><span className="font-semibold" style={{ color: 'var(--text)' }}>{fmt(businessData.revenue)} ₽/мес</span></div>
                <div className="flex justify-between"><span>Потенциал роста</span><span className="font-semibold" style={{ color: 'var(--success)' }}>+8–12%</span></div>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection title="Финансы" icon={Wallet} defaultOpen>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Доля аренды составляет {formatPercent(businessData.rentPercent)}% выручки, целевой ориентир — до 14%.</p>
            <div className="rounded-lg p-4" style={{ background: 'var(--border-light)' }}>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Food cost</span><span className="font-medium" style={{ color: 'var(--text)' }}>{formatPercent(businessData.foodCostPercent)}% <span style={{ color: 'var(--text-muted)' }}>(→ 28–32%)</span></span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>ФОТ</span><span className="font-medium" style={{ color: 'var(--text)' }}>{formatPercent(businessData.payrollPercent)}% <span style={{ color: 'var(--text-muted)' }}>(→ 22–25%)</span></span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Аренда</span><span className="font-medium" style={{ color: 'var(--text)' }}>{formatPercent(businessData.rentPercent)}% <span style={{ color: 'var(--text-muted)' }}>(→ до 14%)</span></span></div>
                <div className="divider" style={{ margin: '8px 0' }} />
                <div className="flex justify-between"><span className="font-semibold" style={{ color: 'var(--text)' }}>Операционная прибыль</span><span className="font-bold" style={{ color: 'var(--success)' }}>{formatPercent(businessData.profitPercent)}% <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(→ 15%+)</span></span></div>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection title="Операции и команда" icon={UsersRound} defaultOpen>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>У 30% блюд нет актуальных ТТК, поэтому сложно контролировать себестоимость.</p>
            <div className="rounded-lg p-4" style={{ background: 'var(--border-light)' }}>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)', listStyle: 'none', padding: 0, margin: 0 }}>
                {['30% блюд без актуальных ТТК', 'Расписание смен не привязано к спросу', 'Текучесть персонала: 18% за квартал'].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--warning)' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </AccordionSection>
        </div>

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <DataModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={businessData} onSave={saveBusinessData} />
      </div>
    </ErrorBoundary>
  );
}