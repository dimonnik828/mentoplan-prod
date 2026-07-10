// app/business/components/HallTab.tsx
'use client';

import { useEffect } from 'react';
import { CommonSettings } from '../types';

interface Props {
  commonSettings: CommonSettings;
  hallSettings: {
    seats: number;
    avgStayTime: number;
    avgCheck: number;
    hallLoadFactor: number;
  };
  setHallSettings: (settings: any) => void;
  onResultChange: (result: any) => void;
}

export default function HallTab({ commonSettings, hallSettings, setHallSettings, onResultChange }: Props) {
  const { seats, avgStayTime, avgCheck, hallLoadFactor } = hallSettings;

  const calculate = () => {
    const shiftMinutes = commonSettings.shiftHours * 60;
    // Количество "циклов" посадки за смену
    const cycles = shiftMinutes / avgStayTime;
    const maxGuests = Math.floor(cycles * seats * hallLoadFactor);
    const revenue = maxGuests * avgCheck;
    const result = { maxGuests, revenue };
    onResultChange(result);
    return result;
  };

  const result = calculate();

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">🪑 Расчёт пропускной способности зала</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">Количество мест</label>
          <input
            type="number"
            min="1"
            value={seats}
            onChange={(e) =>
              setHallSettings({ ...hallSettings, seats: Number(e.target.value) })
            }
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Среднее время гостя (мин)</label>
          <input
            type="number"
            min="15"
            max="180"
            step="5"
            value={avgStayTime}
            onChange={(e) =>
              setHallSettings({ ...hallSettings, avgStayTime: Number(e.target.value) })
            }
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Средний чек (₽)</label>
          <input
            type="number"
            min="100"
            step="50"
            value={avgCheck}
            onChange={(e) =>
              setHallSettings({ ...hallSettings, avgCheck: Number(e.target.value) })
            }
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Загрузка зала</label>
          <input
            type="range"
            min="0.4"
            max="1.0"
            step="0.05"
            value={hallLoadFactor}
            onChange={(e) =>
              setHallSettings({ ...hallSettings, hallLoadFactor: Number(e.target.value) })
            }
            className="w-full"
          />
          <span className="text-sm">{Math.round(hallLoadFactor * 100)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded">
        <div>
          <div className="text-sm text-gray-600">Максимум гостей за смену</div>
          <div className="text-3xl font-bold">{result.maxGuests.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Максимальная выручка зала</div>
          <div className="text-3xl font-bold text-green-700">{result.revenue.toLocaleString()} ₽</div>
        </div>
      </div>
    </div>
  );
}