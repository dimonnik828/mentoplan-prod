'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Wallet,
  Megaphone,
  UsersRound,
  ChevronDown,
} from 'lucide-react';

function formatPercent(value: number): string {
  return (value ?? 0).toFixed(2);
}

function HealthGauge({ score }: { score: number }) {
  const percent = Math.min(100, score ?? 0);
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
          <span className="text-3xl font-bold text-gray-900">{score ?? 0}</span>
          <span className="text-xs text-gray-500">из 100</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full">
        {(score ?? 0) >= 70 ? 'Хорошо' : (score ?? 0) >= 50 ? 'Зона внимания' : 'Требует действий'}
      </span>
    </div>
  );
}

function AttentionZoneCard({ zone }: { zone: any }) {
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
}

function AccordionSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
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
}

function getAttentionZones(data: any) {
  const zones = [];
  if ((data.rentPercent ?? 0) > 14) {
    zones.push({
      id: '1',
      title: 'Аренда выше комфортного уровня',
      status: 'critical',
      description: `Аренда составляет ${formatPercent(data.rentPercent)}% от выручки, ориентир — до 14%.`,
      potential: `Снизить нагрузку на ${Math.round(((data.rentPercent ?? 0) - 14) / 100 * (data.revenue ?? 0))} ₽ в месяц.`,
    });
  }
  if ((data.foodCostPercent ?? 0) > 32) {
    zones.push({
      id: '2',
      title: 'Высокая себестоимость',
      status: 'attention',
      description: `Food cost составляет ${formatPercent(data.foodCostPercent)}%, целевой уровень — до 32%.`,
      potential: 'Оптимизировать закупки и пересмотреть граммовки популярных блюд.',
    });
  }
  if ((data.profitPercent ?? 0) < 12) {
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
}

export default function AuditDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/audits/${id}`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6">Загрузка...</div>;
  if (!data) return <div className="p-6">Аудит не найден</div>;

  const attentionZones = getAttentionZones(data);
  const revenue = data.revenue ?? 0;
  const avgCheck = data.avgCheck ?? 0;

  return (
    <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Картина бизнеса</h1>
            <p className="text-gray-500">Данные от {new Date(data.createdAt).toLocaleDateString('ru-RU')}</p>
          </div>
          <Link href="/history" className="text-blue-600 hover:underline">← К списку</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center">
            <HealthGauge score={data.healthIndex ?? 0} />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                {(data.healthIndex ?? 0) >= 70 ? 'Бизнес в хорошей форме, но есть потенциал для роста.' :
                 (data.healthIndex ?? 0) >= 50 ? 'Есть зоны, требующие внимания. Сосредоточьтесь на ключевых проблемах.' :
                 'Необходимо срочно принять меры для улучшения показателей.'}
              </p>
            </div>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            {attentionZones.map((zone) => (
              <AttentionZoneCard key={zone.id} zone={zone} />
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900">На что уходит выручка</h3>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
            <div><span className="font-medium">Себестоимость:</span> {formatPercent(data.foodCostPercent ?? 0)}%</div>
            <div><span className="font-medium">ФОТ:</span> {formatPercent(data.payrollPercent ?? 0)}%</div>
            <div><span className="font-medium">Аренда:</span> {formatPercent(data.rentPercent ?? 0)}%</div>
            <div><span className="font-medium">Коммунальные:</span> {formatPercent(data.utilitiesPercent ?? 0)}%</div>
            <div><span className="font-medium">Управление:</span> {formatPercent(data.managementPercent ?? 0)}%</div>
            <div><span className="font-medium">Прочие:</span> {formatPercent(data.otherPercent ?? 0)}%</div>
            <div className="text-green-600 col-span-2"><span className="font-medium">Прибыль:</span> {formatPercent(data.profitPercent ?? 0)}%</div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Главное ограничение прибыли — сочетание высокой аренды ({formatPercent(data.rentPercent ?? 0)}%) и затрат на персонал ({formatPercent(data.payrollPercent ?? 0)}%).
          </p>
        </div>

        <div className="space-y-4">
          <AccordionSection title="Маркетинг и спрос" icon={Megaphone} defaultOpen>
            <p className="text-sm text-gray-600">Точка недополучает дневной спрос: рядом расположены офисы, но предложение для бизнес-ланча не сформировано.</p>
            <div className="mt-2 bg-gray-50 p-3 rounded-md text-sm">
              <p className="font-medium">Ключевые метрики:</p>
              <ul className="list-disc list-inside text-gray-600 mt-1">
                <li>Средний чек: {avgCheck} ₽</li>
                <li>Выручка: {revenue.toLocaleString('ru-RU')} ₽/мес</li>
                <li>Потенциал роста дневной выручки: +8–12%</li>
              </ul>
            </div>
          </AccordionSection>
          <AccordionSection title="Финансы" icon={Wallet} defaultOpen>
            <p className="text-sm text-gray-600">Доля аренды составляет {formatPercent(data.rentPercent ?? 0)}% выручки, целевой ориентир — до 14%.</p>
            <div className="mt-2 bg-gray-50 p-3 rounded-md text-sm">
              <div className="flex justify-between"><span>Food cost</span><span>{formatPercent(data.foodCostPercent ?? 0)}% (ориентир 28–32%)</span></div>
              <div className="flex justify-between"><span>ФОТ</span><span>{formatPercent(data.payrollPercent ?? 0)}% (ориентир 22–25%)</span></div>
              <div className="flex justify-between"><span>Аренда</span><span>{formatPercent(data.rentPercent ?? 0)}% (ориентир до 14%)</span></div>
              <div className="flex justify-between font-medium text-green-600"><span>Операционная прибыль</span><span>{formatPercent(data.profitPercent ?? 0)}% (ориентир 15%+)</span></div>
            </div>
          </AccordionSection>
          <AccordionSection title="Операции и команда" icon={UsersRound} defaultOpen>
            <p className="text-sm text-gray-600">У 30% блюд нет актуальных ТТК, поэтому сложно контролировать себестоимость.</p>
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
    </main>
  );
}