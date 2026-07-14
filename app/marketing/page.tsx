// app/marketing/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  CreditCard,
  TicketPercent,
  PlusCircle,
  CheckCircle,
  Gift,
  Calendar,
  Megaphone,
  MapPin,
  MessageCircle,
  Settings,
  AlertTriangle,
} from 'lucide-react';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { Skeleton, SkeletonCard } from '../../components/Skeleton';

// ---- Типы ----
type Promotion = {
  id: string;
  name: string;
  type: 'discount' | 'cashback' | 'combo' | 'happyhour';
  discount: number;
  startDate: string;
  endDate: string;
  active: boolean;
};

// ---- Форматирование ----
const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU');

// ---- Главный компонент ----
export default function MarketingPage() {
  const [businessData, setBusinessData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPromo, setNewPromo] = useState({
    name: '',
    type: 'discount' as const,
    discount: 10,
  });

  // Загрузка данных бизнеса и акций
  useEffect(() => {
    const savedBusiness = localStorage.getItem('momentoBusinessData');
    if (savedBusiness) {
      setBusinessData(JSON.parse(savedBusiness));
    }
    const savedPromos = localStorage.getItem('marketingPromotions');
    if (savedPromos) {
      setPromotions(JSON.parse(savedPromos));
    }
    setLoading(false);
  }, []);

  // Сохранение акций в localStorage
  const savePromotions = (updated: Promotion[]) => {
    setPromotions(updated);
    localStorage.setItem('marketingPromotions', JSON.stringify(updated));
  };

  // Добавление новой акции
  const addPromotion = () => {
    if (!newPromo.name.trim()) return;
    const promo: Promotion = {
      id: Date.now().toString(),
      name: newPromo.name,
      type: newPromo.type,
      discount: newPromo.type === 'discount' ? newPromo.discount : 0,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      active: true,
    };
    savePromotions([...promotions, promo]);
    setNewPromo({ name: '', type: 'discount', discount: 10 });
    setShowAddForm(false);
  };

  // Переключение активности
  const togglePromo = (id: string) => {
    savePromotions(
      promotions.map((p) =>
        p.id === id ? { ...p, active: !p.active } : p
      )
    );
  };

  // Удаление акции
  const deletePromo = (id: string) => {
    savePromotions(promotions.filter((p) => p.id !== id));
  };

  // Отображение скелетонов при загрузке
  if (loading || !businessData) {
    return (
      <ErrorBoundary>
        <div className="p-6 lg:p-8" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // Расчётные показатели
  const dailyRevenue = businessData.revenue / 30;
  const avgCheck = businessData.avgCheck;
  const dailyGuests = avgCheck > 0 ? Math.round(dailyRevenue / avgCheck) : 0;
  const activePromos = promotions.filter((p) => p.active);
  const totalDiscountPercent = activePromos
    .filter((p) => p.type === 'discount')
    .reduce((sum, p) => sum + p.discount, 0);
  const estimatedRevenueImpact = businessData.revenue > 0
    ? Math.round((businessData.revenue * totalDiscountPercent) / 100)
    : 0;

  // Каналы привлечения (заглушка)
  const channels = [
    { name: 'Социальные сети', icon: MessageCircle, share: 45, growth: '+12%' },
    { name: 'Геосервисы', icon: MapPin, share: 30, growth: '+5%' },
    { name: 'Сарафанное радио', icon: Users, share: 25, growth: 'стабильно' },
  ];

  return (
    <ErrorBoundary>
      <div className="p-6 lg:p-8" style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Заголовок */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              Маркетинг и гости
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Управление акциями, каналами привлечения и лояльностью
            </p>
          </div>
          <button onClick={() => setShowAddForm(true)} className="btn-primary">
            <PlusCircle size={16} /> Новая акция
          </button>
        </div>

        {/* KPI-карточки */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="kpi-card kpi-indigo">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Дневная выручка
              </span>
              <TrendingUp size={16} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
            </div>
            <div className="text-lg font-bold" style={{ color: 'var(--text)' }}>
              {fmt(dailyRevenue)} ₽
            </div>
          </div>

          <div className="kpi-card kpi-indigo">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Гостей в день
              </span>
              <Users size={16} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
            </div>
            <div className="text-lg font-bold" style={{ color: 'var(--text)' }}>
              {dailyGuests}
            </div>
          </div>

          <div className="kpi-card kpi-indigo">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Средний чек
              </span>
              <CreditCard size={16} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
            </div>
            <div className="text-lg font-bold" style={{ color: 'var(--text)' }}>
              {avgCheck} ₽
            </div>
          </div>

          <div className={`kpi-card ${totalDiscountPercent > 15 ? 'kpi-rose' : 'kpi-amber'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Активных акций
              </span>
              <TicketPercent size={16} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
            </div>
            <div className="text-lg font-bold" style={{ color: 'var(--text)' }}>
              {activePromos.length}
            </div>
            {totalDiscountPercent > 0 && (
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Суммарная скидка: {totalDiscountPercent}%
              </div>
            )}
          </div>
        </div>

        {/* Основной контент: две колонки */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая колонка (2/3): акции */}
          <div className="lg:col-span-2 space-y-6">
            {/* Форма добавления */}
            {showAddForm && (
              <div className="card p-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
                  Новая акция
                </h3>
                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    placeholder="Название акции"
                    value={newPromo.name}
                    onChange={(e) => setNewPromo({ ...newPromo, name: e.target.value })}
                    className="input-field flex-1 min-w-[200px]"
                  />
                  <select
                    value={newPromo.type}
                    onChange={(e) =>
                      setNewPromo({ ...newPromo, type: e.target.value as any })
                    }
                    className="input-field"
                    style={{ minWidth: 140 }}
                  >
                    <option value="discount">Скидка %</option>
                    <option value="cashback">Кешбэк</option>
                    <option value="combo">Комбо</option>
                    <option value="happyhour">Счастливые часы</option>
                  </select>
                  {newPromo.type === 'discount' && (
                    <input
                      type="number"
                      placeholder="% скидки"
                      value={newPromo.discount}
                      onChange={(e) =>
                        setNewPromo({ ...newPromo, discount: Number(e.target.value) })
                      }
                      className="input-field"
                      style={{ width: 100 }}
                      min={1}
                      max={50}
                    />
                  )}
                  <button onClick={addPromotion} className="btn-primary">
                    Добавить
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="btn-ghost"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}

            {/* Список акций */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
                Активные акции
              </h3>
              {promotions.length === 0 ? (
                <p className="text-sm py-4" style={{ color: 'var(--text-muted)' }}>
                  Нет акций. Создайте первую, чтобы привлечь гостей.
                </p>
              ) : (
                <div className="space-y-3">
                  {promotions.map((promo) => (
                    <div
                      key={promo.id}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{
                        background: promo.active
                          ? 'var(--success-light)'
                          : 'var(--border-light)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => togglePromo(promo.id)}
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                          style={{
                            borderColor: promo.active
                              ? 'var(--success)'
                              : 'var(--text-muted)',
                            background: promo.active
                              ? 'var(--success)'
                              : 'transparent',
                          }}
                        >
                          {promo.active && (
                            <CheckCircle size={14} style={{ color: '#fff' }} />
                          )}
                        </button>
                        <div>
                          <div
                            className="text-sm font-medium"
                            style={{ color: 'var(--text)' }}
                          >
                            {promo.name}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {promo.type === 'discount'
                              ? `Скидка ${promo.discount}%`
                              : promo.type === 'cashback'
                              ? 'Кешбэк'
                              : promo.type === 'combo'
                              ? 'Комбо'
                              : 'Счастливые часы'}{' '}
                            | {promo.startDate} – {promo.endDate}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deletePromo(promo.id)}
                        className="text-xs hover:text-red-600"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Влияние на выручку */}
              {totalDiscountPercent > 0 && (
                <div
                  className="mt-4 p-3 rounded-lg flex items-start gap-3"
                  style={{ background: 'var(--primary-light)' }}
                >
                  <AlertTriangle size={18} style={{ color: 'var(--primary)' }} />
                  <div>
                    <div
                      className="text-sm font-medium"
                      style={{ color: 'var(--primary)' }}
                    >
                      Суммарная скидка: {totalDiscountPercent}%
                    </div>
                    <div
                      className="text-xs mt-1"
                      style={{ color: 'var(--primary)' }}
                    >
                      При текущей выручке это ~{fmt(estimatedRevenueImpact)} ₽
                      потенциального снижения дохода. Убедитесь, что акции окупаются
                      ростом потока гостей.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Правая колонка (1/3): каналы, лояльность, календарь */}
          <div className="space-y-6">
            {/* Каналы привлечения */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
                Каналы привлечения
              </h3>
              <div className="space-y-4">
                {channels.map((ch) => (
                  <div key={ch.name} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--primary-light)' }}
                    >
                      <ch.icon size={16} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div className="flex-1">
                      <div
                        className="text-sm font-medium"
                        style={{ color: 'var(--text)' }}
                      >
                        {ch.name}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {ch.share}% трафика
                      </div>
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: ch.growth.startsWith('+')
                          ? 'var(--success)'
                          : 'var(--text-muted)',
                      }}
                    >
                      {ch.growth}
                    </span>
                  </div>
                ))}
              </div>
              <button
                className="btn-ghost w-full mt-4 text-xs"
                style={{ padding: '6px 10px' }}
              >
                <Settings size={14} /> Настроить интеграции
              </button>
            </div>

            {/* Программа лояльности */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
                Программа лояльности
              </h3>
              <div
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ background: 'var(--warning-light)' }}
              >
                <Gift size={20} style={{ color: 'var(--warning)' }} />
                <div className="text-sm">
                  <div className="font-medium" style={{ color: 'var(--text)' }}>
                    Не внедрена
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Бонусная система увеличит возврат гостей на 15–20%
                  </div>
                </div>
              </div>
              <button
                className="btn-primary w-full mt-4 text-xs"
                style={{ padding: '6px 10px' }}
              >
                Настроить программу
              </button>
            </div>

            {/* Календарь активностей (заглушка) */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
                Календарь активностей
              </h3>
              <div
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ background: 'var(--border-light)' }}
              >
                <Calendar size={20} style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Предстоящие события не запланированы
                </span>
              </div>
              <button
                className="btn-ghost w-full mt-4 text-xs"
                style={{ padding: '6px 10px' }}
              >
                <PlusCircle size={14} /> Добавить событие
              </button>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}