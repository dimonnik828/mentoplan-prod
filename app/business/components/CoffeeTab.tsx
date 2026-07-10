// app/business/components/CoffeeTab.tsx
'use client';

import { useEffect } from 'react';
import { CommonSettings } from '../types';

interface Props {
  commonSettings: CommonSettings;
  coffeeSettings: {
    baristasCount: number;
    timePerDrink: number;
    avgPrice: number;
  };
  setCoffeeSettings: (settings: any) => void;
  onResultChange: (result: any) => void;
}

export default function CoffeeTab({ commonSettings, coffeeSettings, setCoffeeSettings, onResultChange }: Props) {
  const { baristasCount, timePerDrink, avgPrice } = coffeeSettings;

  const calculate = () => {
    const shiftSeconds = commonSettings.shiftHours * 3600;
    const availableSeconds = shiftSeconds * commonSettings.loadFactor * baristasCount;
    const maxDrinks = Math.floor(availableSeconds / timePerDrink);
    const revenue = maxDrinks * avgPrice;
    const result = { maxDrinks, revenue };
    onResultChange(result);
    return result;
  };

  const result = calculate();

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">☕ Расчёт производительности кофейни</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">Количество бариста</label>
          <input
            type="number"
            min="1"
            max="10"
            value={baristasCount}
            onChange={(e) =>
              setCoffeeSettings({ ...coffeeSettings, baristasCount: Number(e.target.value) })
            }
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Время на 1 напиток (сек)</label>
          <input
            type="number"
            min="30"
            max="180"
            step="5"
            value={timePerDrink}
            onChange={(e) =>
              setCoffeeSettings({ ...coffeeSettings, timePerDrink: Number(e.target.value) })
            }
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Средняя цена напитка (₽)</label>
          <input
            type="number"
            min="50"
            step="10"
            value={avgPrice}
            onChange={(e) =>
              setCoffeeSettings({ ...coffeeSettings, avgPrice: Number(e.target.value) })
            }
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded">
        <div>
          <div className="text-sm text-gray-600">Максимум напитков за смену</div>
          <div className="text-3xl font-bold">{result.maxDrinks.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Максимальная выручка</div>
          <div className="text-3xl font-bold text-green-700">{result.revenue.toLocaleString()} ₽</div>
        </div>
      </div>
    </div>
  );
}