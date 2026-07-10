// app/business/components/SummaryTab.tsx
'use client';

import { CommonSettings } from '../types';

interface Props {
  kitchenResult: any;
  coffeeResult: any;
  hallResult: any;
  commonSettings: CommonSettings;
}

export default function SummaryTab({ kitchenResult, coffeeResult, hallResult, commonSettings }: Props) {
  const getValue = (val: any) => (val !== null && val !== undefined ? val : 0);

  const kitchenRevenue = getValue(kitchenResult?.totalRevenue);
  const coffeeRevenue = getValue(coffeeResult?.revenue);
  const hallRevenue = getValue(hallResult?.revenue);

  // Определяем узкое место
  let bottleneck: string | null = null;
  let recommendation = '';

  if (kitchenRevenue === 0 && coffeeRevenue === 0 && hallRevenue === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <p className="text-gray-500">Введите данные в других вкладках для расчёта сводки.</p>
      </div>
    );
  }

  // Приоритет: сначала сравниваем возможности кухни и кофейни (предложение) с пропускной способностью зала (спрос)
  const totalFOH = kitchenRevenue + coffeeRevenue; // потенциальная выручка от еды и напитков
  const hallCapacity = hallRevenue; // максимальная выручка зала (ограничение по количеству гостей)

  let totalRevenue = 0;
  if (totalFOH > 0 && hallCapacity > 0) {
    totalRevenue = Math.min(totalFOH, hallCapacity);
    if (totalFOH > hallCapacity) {
      bottleneck = 'hall';
      recommendation = 'Зал является узким местом. Увеличьте количество мест или сократите время пребывания гостей.';
    } else if (totalFOH < hallCapacity) {
      bottleneck = 'kitchen-coffee';
      recommendation = 'Кухня или кофейня не успевают за потоком гостей. Увеличьте количество поваров/бариста или сократите время приготовления.';
    } else {
      bottleneck = null;
      recommendation = 'Баланс достигнут. Все зоны работают синхронно.';
    }
  } else {
    totalRevenue = totalFOH + hallCapacity;
    if (totalFOH === 0 && hallCapacity === 0) {
      recommendation = 'Нет данных для расчёта.';
    } else if (totalFOH === 0) {
      recommendation = 'Отсутствуют данные о кухне и кофейне.';
    } else {
      recommendation = 'Отсутствуют данные о зале.';
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">📈 Сводка по бизнесу</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-orange-50 rounded">
          <div className="text-sm text-gray-600">🍳 Кухня</div>
          <div className="text-2xl font-bold">{kitchenRevenue.toLocaleString()} ₽</div>
        </div>
        <div className="p-4 bg-blue-50 rounded">
          <div className="text-sm text-gray-600">☕ Кофейня</div>
          <div className="text-2xl font-bold">{coffeeRevenue.toLocaleString()} ₽</div>
        </div>
        <div className="p-4 bg-purple-50 rounded">
          <div className="text-sm text-gray-600">🪑 Зал</div>
          <div className="text-2xl font-bold">{hallRevenue.toLocaleString()} ₽</div>
        </div>
      </div>

      <div className="p-4 bg-green-50 rounded mb-4">
        <div className="text-sm text-gray-600">Общая потенциальная выручка (с учётом ограничений)</div>
        <div className="text-3xl font-bold text-green-700">{totalRevenue.toLocaleString()} ₽</div>
        <div className="text-sm text-gray-500 mt-1">
          Ограничение: {bottleneck === 'hall' ? 'зал' : bottleneck === 'kitchen-coffee' ? 'кухня/кофейня' : 'нет'}
        </div>
      </div>

      <div className="p-4 bg-yellow-50 rounded">
        <h4 className="font-medium">Рекомендация</h4>
        <p className="text-sm">{recommendation}</p>
        {bottleneck === 'hall' && (
          <ul className="text-sm list-disc pl-5 mt-2">
            <li>Увеличьте количество посадочных мест (если позволяет площадь).</li>
            <li>Ускорьте обслуживание (меньше времени на приём заказа, быстрая подача).</li>
            <li>Внедрите предварительную запись или доставку, чтобы разгрузить зал.</li>
          </ul>
        )}
        {bottleneck === 'kitchen-coffee' && (
          <ul className="text-sm list-disc pl-5 mt-2">
            <li>Нанять дополнительных поваров или бариста.</li>
            <li>Оптимизировать процессы (улучшить организацию рабочего места, предварительная подготовка).</li>
            <li>Пересмотреть меню (убрать долгие позиции или упростить их).</li>
          </ul>
        )}
        {!bottleneck && totalRevenue > 0 && (
          <p className="text-sm mt-2">Отличный баланс! Вы можете масштабировать бизнес, сохраняя текущие пропорции.</p>
        )}
      </div>
    </div>
  );
}