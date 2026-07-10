// app/business/components/VentilationTab.tsx
'use client';

import { useState, useEffect } from 'react';

interface VentilationTabProps {
  // Если мы хотим синхронизировать с залом, можно передать seats и hallLoadFactor, но пока не будем
  // Пока просто локальное состояние
}

const cities = [
  { name: 'Москва', temp: -25 },
  { name: 'Санкт-Петербург', temp: -24 },
  { name: 'Новосибирск', temp: -39 },
  { name: 'Екатеринбург', temp: -35 },
  { name: 'Казань', temp: -30 },
  { name: 'Нижний Новгород', temp: -28 },
  { name: 'Ростов-на-Дону', temp: -19 },
  { name: 'Сочи', temp: -5 },
  { name: 'Владивосток', temp: -23 },
  { name: 'Хабаровск', temp: -35 },
  { name: 'Иркутск', temp: -38 },
  { name: 'Калининград', temp: -18 },
  { name: 'Свой вариант', temp: null },
];

export default function VentilationTab() {
  const [hallArea, setHallArea] = useState(80);
  const [kitchenArea, setKitchenArea] = useState(30);
  const [kitchenType, setKitchenType] = useState<'open' | 'closed'>('closed');
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [customTemp, setCustomTemp] = useState(-25);
  const [indoorTemp, setIndoorTemp] = useState(22);
  const [safetyFactor, setSafetyFactor] = useState(1.1);

  const getOutdoorTemp = () => {
    if (selectedCity.name === 'Свой вариант') {
      return customTemp;
    }
    return selectedCity.temp || -25;
  };

  const outdoorTemp = getOutdoorTemp();
  const deltaT = indoorTemp - outdoorTemp;

  // Расчёт воздухообмена
  const hallVentilation = hallArea * 3; // м³/час
  const kitchenNorm = kitchenType === 'open' ? 50 : 70;
  const kitchenVentilation = kitchenArea * kitchenNorm;
  const totalVentilation = hallVentilation + kitchenVentilation;

  // Расчёт тепловой мощности (кВт)
  const coeff = 0.00034; // упрощённый коэффициент
  const powerHall = hallVentilation * coeff * deltaT;
  const powerKitchen = kitchenVentilation * coeff * deltaT;
  const powerTotal = (powerHall + powerKitchen) * safetyFactor;

  // Рекомендация по типу нагрева
  let recommendation = '';
  if (powerTotal < 10) {
    recommendation = 'Электрический калорифер (подойдёт для небольших помещений)';
  } else if (powerTotal < 50) {
    recommendation = 'Водяной калорифер (подключение к системе отопления) или тепловой насос';
  } else {
    recommendation = 'Промышленная приточная установка с рекуперацией (энергоэффективное решение)';
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">🌬️ Расчёт вентиляции и тепловой мощности</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">Площадь зала (м²)</label>
          <input
            type="number"
            min="1"
            value={hallArea}
            onChange={(e) => setHallArea(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Площадь кухни (м²)</label>
          <input
            type="number"
            min="1"
            value={kitchenArea}
            onChange={(e) => setKitchenArea(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Тип кухни</label>
          <select
            value={kitchenType}
            onChange={(e) => setKitchenType(e.target.value as 'open' | 'closed')}
            className="w-full p-2 border rounded"
          >
            <option value="open">Открытая (интегрирована в зал)</option>
            <option value="closed">Закрытая (изолированная)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Климатическая зона (город)</label>
          <select
            value={selectedCity.name}
            onChange={(e) => {
              const city = cities.find(c => c.name === e.target.value);
              if (city) setSelectedCity(city);
            }}
            className="w-full p-2 border rounded"
          >
            {cities.map((city) => (
              <option key={city.name} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
        {selectedCity.name === 'Свой вариант' && (
          <div>
            <label className="block text-sm font-medium">Температура наружного воздуха (°C)</label>
            <input
              type="number"
              value={customTemp}
              onChange={(e) => setCustomTemp(Number(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium">Желаемая температура в помещении (°C)</label>
          <input
            type="number"
            min="16"
            max="28"
            value={indoorTemp}
            onChange={(e) => setIndoorTemp(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Коэффициент запаса</label>
          <input
            type="range"
            min="1.0"
            max="1.3"
            step="0.05"
            value={safetyFactor}
            onChange={(e) => setSafetyFactor(Number(e.target.value))}
            className="w-full"
          />
          <span className="text-sm">{safetyFactor.toFixed(2)}</span>
        </div>
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-sm text-gray-600">Воздухообмен зала</span>
            <div className="text-2xl font-bold">{Math.round(hallVentilation)} м³/час</div>
          </div>
          <div>
            <span className="text-sm text-gray-600">Воздухообмен кухни</span>
            <div className="text-2xl font-bold">{Math.round(kitchenVentilation)} м³/час</div>
          </div>
          <div>
            <span className="text-sm text-gray-600">Общий воздухообмен</span>
            <div className="text-2xl font-bold">{Math.round(totalVentilation)} м³/час</div>
          </div>
        </div>
      </div>

      <div className="mb-4 p-3 bg-green-50 rounded">
        <h3 className="font-semibold mb-2">Тепловая мощность (для нагрева приточного воздуха)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-sm text-gray-600">Зал</span>
            <div className="text-2xl font-bold text-orange-700">{powerHall.toFixed(1)} кВт</div>
          </div>
          <div>
            <span className="text-sm text-gray-600">Кухня</span>
            <div className="text-2xl font-bold text-orange-700">{powerKitchen.toFixed(1)} кВт</div>
          </div>
          <div>
            <span className="text-sm text-gray-600">Общая (с учётом запаса)</span>
            <div className="text-2xl font-bold text-red-700">{powerTotal.toFixed(1)} кВт</div>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          ΔT = {indoorTemp}°C - ({outdoorTemp}°C) = {deltaT.toFixed(0)}°C
        </div>
      </div>

      <div className="p-3 bg-yellow-50 rounded">
        <h4 className="font-medium">Рекомендация по оборудованию</h4>
        <p className="text-sm">{recommendation}</p>
        <p className="text-sm mt-1 text-gray-600">
          Для поддержания комфортной температуры в холодное время года рекомендуемая мощность системы отопления/вентиляции.
        </p>
      </div>
    </div>
  );
}