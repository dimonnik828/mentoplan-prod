// app/business/components/EfficiencyTab.tsx
import React from 'react';

interface EfficiencyTabProps {
  kitchenResult: any;
  coffeeResult: any;
  hallResult: any;
  rent: number; // текущая аренда
  revenue?: number; // текущая фактическая выручка (опционально)
}

export default function EfficiencyTab({ kitchenResult, coffeeResult, hallResult, rent, revenue }: EfficiencyTabProps) {
  // Извлекаем потенциальную выручку
  const kitchenRevenue = kitchenResult?.totalRevenue || 0;
  const coffeeRevenue = coffeeResult?.revenue || 0;
  const hallRevenue = hallResult?.revenue || 0;
  const potentialTotalRevenue = kitchenRevenue + coffeeRevenue + hallRevenue;

  const rentPercent = potentialTotalRevenue > 0 ? (rent / potentialTotalRevenue) * 100 : 0;
  const targetRentPercent = 14; // целевая доля аренды
  const normalRent = (targetRentPercent / 100) * potentialTotalRevenue;
  const rentOverpay = rent - normalRent;

  const isRentCritical = rentPercent > targetRentPercent;

  return (
    <div className="p-4 bg-white rounded-lg shadow space-y-6">
      <h2 className="text-xl font-semibold">📊 Анализ эффективности и стоимости аренды</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded">
          <div className="text-sm text-gray-600">Потенциальная выручка (все направления)</div>
          <div className="text-2xl font-bold text-blue-700">{potentialTotalRevenue.toLocaleString()} ₽</div>
          <div className="text-xs text-gray-500">
            Кухня: {kitchenRevenue.toLocaleString()} ₽ | Кофе: {coffeeRevenue.toLocaleString()} ₽ | Зал: {hallRevenue.toLocaleString()} ₽
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <div className="text-sm text-gray-600">Текущая аренда</div>
          <div className="text-2xl font-bold">{rent.toLocaleString()} ₽</div>
          <div className="text-sm text-gray-500">Доля от потенциальной выручки: {rentPercent.toFixed(1)}%</div>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <div className="text-sm text-gray-600">Нормальная аренда (14%)</div>
          <div className="text-2xl font-bold text-green-700">{normalRent.toLocaleString()} ₽</div>
          <div className="text-sm text-gray-500">Целевая доля: 14%</div>
        </div>
      </div>

      {isRentCritical ? (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <h3 className="font-bold text-red-700">⚠️ Аренда выше нормы</h3>
          <p className="text-sm">
            Текущая аренда составляет <strong>{rentPercent.toFixed(1)}%</strong> от потенциальной выручки, что превышает рекомендуемые 14%.
            Даже при полной загрузке всех мощностей аренда съедает значительную долю дохода.
          </p>
          <p className="text-sm mt-2">
            Рекомендуемая аренда для этого бизнеса: <strong>{normalRent.toLocaleString()} ₽</strong> (экономия: <strong>{rentOverpay.toLocaleString()} ₽</strong> в месяц).
          </p>
        </div>
      ) : (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
          <h3 className="font-bold text-green-700">✅ Аренда в норме</h3>
          <p className="text-sm">
            Доля аренды составляет <strong>{rentPercent.toFixed(1)}%</strong> от потенциальной выручки, что соответствует рекомендуемому уровню (≤14%).
          </p>
        </div>
      )}

      <div className="text-xs text-gray-400 italic">
        * Расчёт основан на максимальной производительности при полной загрузке персонала и зала.
      </div>
    </div>
  );
}