// app/business/page.tsx
'use client';

import { useState, useEffect } from 'react';

// ================ ТИПЫ ================
interface Category {
  id: string;
  name: string;
  timePerDish: number;
  price: number;
}

interface CommonSettings {
  shiftHours: number;
  loadFactor: number;
}

// ================ ВКЛАДКА ВЕНТИЛЯЦИИ ================
function VentilationTab() {
  const [hallArea, setHallArea] = useState(80);
  const [kitchenArea, setKitchenArea] = useState(30);
  const [kitchenType, setKitchenType] = useState<'open' | 'closed'>('closed');
  const [selectedCity, setSelectedCity] = useState({ name: 'Москва', temp: -25 });
  const [customTemp, setCustomTemp] = useState(-25);
  const [indoorTemp, setIndoorTemp] = useState(22);
  const [safetyFactor, setSafetyFactor] = useState(1.1);

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

  const getOutdoorTemp = () => {
    if (selectedCity.name === 'Свой вариант') {
      return customTemp;
    }
    return selectedCity.temp || -25;
  };

  const outdoorTemp = getOutdoorTemp();
  const deltaT = indoorTemp - outdoorTemp;

  const hallVentilation = hallArea * 3;
  const kitchenNorm = kitchenType === 'open' ? 50 : 70;
  const kitchenVentilation = kitchenArea * kitchenNorm;
  const totalVentilation = hallVentilation + kitchenVentilation;

  const coeff = 0.00034;
  const powerHall = hallVentilation * coeff * deltaT;
  const powerKitchen = kitchenVentilation * coeff * deltaT;
  const powerTotal = (powerHall + powerKitchen) * safetyFactor;

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

// ================ ВКЛАДКА КУХНИ ================
function KitchenTab({
  categories,
  setCategories,
  cooksCount,
  setCooksCount,
  parallelism,
  setParallelism,
  commonSettings,
  kitchenResult,
  setKitchenResult,
}: any) {
  useEffect(() => {
    const shiftMinutes = commonSettings.shiftHours * 60;
    const prepTime = shiftMinutes * 0.2;
    const availableTime = shiftMinutes * commonSettings.loadFactor - prepTime;
    const totalFlowTime = availableTime * cooksCount * parallelism;

    const categoryCount = categories.length;
    const timePerCategory = categoryCount > 0 ? totalFlowTime / categoryCount : 0;

    const categoryResults = categories.map((cat: Category) => {
      const dishes = Math.floor(timePerCategory / cat.timePerDish);
      const revenue = dishes * cat.price;
      return { ...cat, dishes, revenue, timeUsed: dishes * cat.timePerDish };
    });

    const totalDishes = categoryResults.reduce((sum, cat) => sum + cat.dishes, 0);
    const totalRevenue = categoryResults.reduce((sum, cat) => sum + cat.revenue, 0);
    const totalTimeUsed = categoryResults.reduce((sum, cat) => sum + cat.timeUsed, 0);
    const utilization = totalFlowTime > 0 ? (totalTimeUsed / totalFlowTime) * 100 : 0;

    const result = {
      availableTime,
      prepTime,
      totalFlowTime,
      categoryResults,
      totalDishes,
      totalRevenue,
      utilization,
    };
    setKitchenResult(result);
  }, [categories, cooksCount, parallelism, commonSettings, setKitchenResult]);

  const result = kitchenResult || {
    availableTime: 0,
    prepTime: 0,
    totalFlowTime: 0,
    categoryResults: [],
    totalDishes: 0,
    totalRevenue: 0,
    utilization: 0,
  };

  const addCategory = () => {
    setCategories([...categories, { id: String(Date.now()), name: 'Новая категория', timePerDish: 15, price: 400 }]);
  };
  const removeCategory = (id: string) => {
    setCategories(categories.filter((c: Category) => c.id !== id));
  };
  const updateCategory = (id: string, field: string, value: any) => {
    setCategories(categories.map((c: Category) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">🍳 Расчёт производительности кухни</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">Количество поваров</label>
          <input
            type="number"
            min="1"
            max="20"
            value={cooksCount}
            onChange={(e) => setCooksCount(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Параллельность (блюд на повара)</label>
          <input
            type="number"
            min="1"
            max="5"
            step="1"
            value={parallelism}
            onChange={(e) => setParallelism(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
          <span className="text-xs text-gray-500">Сколько блюд одновременно готовит 1 повар</span>
        </div>
        <div>
          <label className="block text-sm font-medium">Общее потоко-время</label>
          <div className="text-lg font-semibold">
            {Math.round(result.totalFlowTime).toLocaleString('ru-RU')} мин
          </div>
          <span className="text-xs text-gray-500">
            ({cooksCount} × {parallelism} потоков)
          </span>
        </div>
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-sm text-gray-600">Доступное время (с учётом заготовок)</span>
            <div className="text-2xl font-bold">{Math.round(result.availableTime).toLocaleString('ru-RU')} мин</div>
          </div>
          <div>
            <span className="text-sm text-gray-600">Общее количество блюд (равномерное распределение)</span>
            <div className="text-2xl font-bold">{result.totalDishes.toLocaleString('ru-RU')}</div>
          </div>
          <div>
            <span className="text-sm text-gray-600">Максимальная выручка</span>
            <div className="text-2xl font-bold text-green-700">{result.totalRevenue.toLocaleString('ru-RU')} ₽</div>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Загрузка: {result.utilization.toFixed(0)}% (время на заготовки: {Math.round(result.prepTime).toLocaleString('ru-RU')} мин)
        </div>
      </div>

      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Категории блюд (равномерное распределение)</h3>
        <button
          onClick={addCategory}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          + Добавить категорию
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Название</th>
              <th className="p-2 text-left">Время (мин)</th>
              <th className="p-2 text-left">Цена (₽)</th>
              <th className="p-2 text-left">Блюд</th>
              <th className="p-2 text-left">Выручка</th>
              <th className="p-2 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {result.categoryResults.map((cat: any) => (
              <tr key={cat.id} className="border-b">
                <td className="p-2">
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => updateCategory(cat.id, 'name', e.target.value)}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    min="1"
                    value={cat.timePerDish}
                    onChange={(e) => updateCategory(cat.id, 'timePerDish', Number(e.target.value))}
                    className="w-20 p-1 border rounded"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={cat.price}
                    onChange={(e) => updateCategory(cat.id, 'price', Number(e.target.value))}
                    className="w-24 p-1 border rounded"
                  />
                </td>
                <td className="p-2 font-semibold">{cat.dishes.toLocaleString('ru-RU')}</td>
                <td className="p-2">{cat.revenue.toLocaleString('ru-RU')} ₽</td>
                <td className="p-2">
                  <button
                    onClick={() => removeCategory(cat.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-gray-50">
              <td colSpan={3} className="p-2 text-right">Итого:</td>
              <td className="p-2">{result.totalDishes.toLocaleString('ru-RU')}</td>
              <td className="p-2 text-green-700">{result.totalRevenue.toLocaleString('ru-RU')} ₽</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ================ ВКЛАДКА КОФЕЙНИ ================
function CoffeeTab({
  baristasCount,
  setBaristasCount,
  timePerDrink,
  setTimePerDrink,
  avgDrinkPrice,
  setAvgDrinkPrice,
  coffeeResult,
}: any) {
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
            onChange={(e) => setBaristasCount(Number(e.target.value))}
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
            onChange={(e) => setTimePerDrink(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Средняя цена напитка (₽)</label>
          <input
            type="number"
            min="50"
            step="10"
            value={avgDrinkPrice}
            onChange={(e) => setAvgDrinkPrice(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded">
        <div>
          <div className="text-sm text-gray-600">Максимум напитков за смену</div>
          <div className="text-3xl font-bold">{coffeeResult?.maxDrinks?.toLocaleString('ru-RU') || 0}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Максимальная выручка</div>
          <div className="text-3xl font-bold text-green-700">{coffeeResult?.revenue?.toLocaleString('ru-RU') || 0} ₽</div>
        </div>
      </div>
    </div>
  );
}

// ================ ВКЛАДКА ЗАЛА ================
function HallTab({
  seats,
  setSeats,
  avgStayTime,
  setAvgStayTime,
  avgCheck,
  setAvgCheck,
  hallLoadFactor,
  setHallLoadFactor,
  hallResult,
}: any) {
  const formats = [
    {
      id: 'coffee-small',
      label: 'Кофейня (4–6 мест)',
      defaultSeats: 4,
      avgStayTime: 30,
      hallLoadFactor: 0.8,
      avgCheck: 350,
      guestsPerDay: 76,
      description: 'Средняя успешная кофейня в Москве',
    },
    {
      id: 'coffee-medium',
      label: 'Кофейня (10–15 мест)',
      defaultSeats: 12,
      avgStayTime: 30,
      hallLoadFactor: 0.75,
      avgCheck: 400,
      guestsPerDay: 150,
      description: 'Для нормальной окупаемости',
    },
    {
      id: 'coffee-food',
      label: 'Кофейня с едой',
      defaultSeats: 20,
      avgStayTime: 45,
      hallLoadFactor: 0.7,
      avgCheck: 500,
      guestsPerDay: 150,
      description: 'Новый формат «Кофе Хауз»',
    },
    {
      id: 'cafe-franchise',
      label: 'Кафе (франшиза)',
      defaultSeats: 40,
      avgStayTime: 60,
      hallLoadFactor: 0.75,
      avgCheck: 500,
      guestsPerDay: 200,
      description: 'Успешный проект',
    },
    {
      id: 'restaurant-weekday',
      label: 'Ресторан (будни)',
      defaultSeats: 60,
      avgStayTime: 90,
      hallLoadFactor: 0.6,
      avgCheck: 1200,
      guestsPerDay: 70,
      description: 'Средний ресторан в будни',
    },
    {
      id: 'restaurant-weekend',
      label: 'Ресторан (выходные)',
      defaultSeats: 60,
      avgStayTime: 90,
      hallLoadFactor: 0.85,
      avgCheck: 1500,
      guestsPerDay: 120,
      description: 'Средний ресторан в выходные',
    },
    {
      id: 'custom',
      label: 'Свой вариант',
      defaultSeats: 40,
      avgStayTime: 60,
      hallLoadFactor: 0.7,
      avgCheck: 500,
      guestsPerDay: 0,
      description: 'Настройте параметры вручную',
    },
  ];

  const [selectedFormat, setSelectedFormat] = useState(formats[3]);

  const applyFormat = (format: any) => {
    setSelectedFormat(format);
    if (format.id !== 'custom') {
      setSeats(format.defaultSeats);
      setAvgStayTime(format.avgStayTime);
      setHallLoadFactor(format.hallLoadFactor);
      setAvgCheck(format.avgCheck);
    }
  };

  const shiftMinutes = 8 * 60;
  const cycles = shiftMinutes / avgStayTime;
  const maxGuests = Math.floor(cycles * seats * hallLoadFactor);
  const revenue = maxGuests * avgCheck;
  const recommendedGuests = selectedFormat.guestsPerDay;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">🪑 Расчёт пропускной способности зала</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium">Тип заведения</label>
        <select
          value={selectedFormat.id}
          onChange={(e) => {
            const format = formats.find((f) => f.id === e.target.value);
            if (format) applyFormat(format);
          }}
          className="w-full md:w-1/2 p-2 border rounded"
        >
          {formats.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
        {selectedFormat.description && (
          <p className="text-xs text-gray-500 mt-1">{selectedFormat.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">Количество мест</label>
          <input
            type="number"
            min="1"
            value={seats}
            onChange={(e) => setSeats(Number(e.target.value))}
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
            onChange={(e) => setAvgStayTime(Number(e.target.value))}
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
            onChange={(e) => setAvgCheck(Number(e.target.value))}
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
            onChange={(e) => setHallLoadFactor(Number(e.target.value))}
            className="w-full"
          />
          <span className="text-sm">{Math.round(hallLoadFactor * 100)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded">
        <div>
          <div className="text-sm text-gray-600">Максимум гостей за смену</div>
          <div className="text-3xl font-bold">{maxGuests.toLocaleString('ru-RU')}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Максимальная выручка зала</div>
          <div className="text-3xl font-bold text-green-700">{revenue.toLocaleString('ru-RU')} ₽</div>
        </div>
      </div>

      {recommendedGuests > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 rounded border border-yellow-200">
          <h4 className="font-semibold text-yellow-800">📊 Ориентир для вашего формата</h4>
          <p className="text-sm">
            <span className="font-medium">Рекомендуемое количество гостей в день:</span>{' '}
            <span className="font-bold text-lg">{recommendedGuests}</span>
          </p>
          {maxGuests < recommendedGuests * 0.8 && (
            <p className="text-sm text-red-600 mt-1">
              ⚠️ Ваш расчёт ({maxGuests} гостей) значительно ниже рыночного ориентира.
              Рассмотрите возможность увеличить количество мест, сократить время пребывания или повысить загрузку.
            </p>
          )}
          {maxGuests >= recommendedGuests * 0.8 && maxGuests <= recommendedGuests * 1.2 && (
            <p className="text-sm text-green-600 mt-1">
              ✅ Ваш расчёт ({maxGuests} гостей) близок к рыночному ориентиру. Отличный показатель!
            </p>
          )}
          {maxGuests > recommendedGuests * 1.2 && (
            <p className="text-sm text-blue-600 mt-1">
              🚀 Ваш расчёт ({maxGuests} гостей) превышает средний ориентир.
              Убедитесь, что у вас достаточно мощностей кухни и персонала для обслуживания такого потока.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ================ ВКЛАДКА СВОДКИ ================
function SummaryTab({ summary }: any) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">📈 Сводка по бизнесу</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-orange-50 rounded">
          <div className="text-sm text-gray-600">🍳 Кухня</div>
          <div className="text-2xl font-bold">{summary.kitchenRevenue.toLocaleString('ru-RU')} ₽</div>
        </div>
        <div className="p-4 bg-blue-50 rounded">
          <div className="text-sm text-gray-600">☕ Кофейня</div>
          <div className="text-2xl font-bold">{summary.coffeeRevenue.toLocaleString('ru-RU')} ₽</div>
        </div>
        <div className="p-4 bg-purple-50 rounded">
          <div className="text-sm text-gray-600">🪑 Зал</div>
          <div className="text-2xl font-bold">{summary.hallRevenue.toLocaleString('ru-RU')} ₽</div>
        </div>
      </div>

      <div className="p-4 bg-green-50 rounded mb-4">
        <div className="text-sm text-gray-600">Общая потенциальная выручка (с учётом ограничений)</div>
        <div className="text-3xl font-bold text-green-700">{summary.totalRevenue.toLocaleString('ru-RU')} ₽</div>
        <div className="text-sm text-gray-500 mt-1">
          Ограничение: {summary.bottleneck || 'нет'}
        </div>
      </div>

      <div className="p-4 bg-yellow-50 rounded">
        <h4 className="font-medium">Рекомендация</h4>
        <p className="text-sm">{summary.recommendation}</p>
        {summary.bottleneck === 'Зал' && (
          <ul className="text-sm list-disc pl-5 mt-2">
            <li>Увеличьте количество посадочных мест (если позволяет площадь).</li>
            <li>Ускорьте обслуживание (меньше времени на приём заказа, быстрая подача).</li>
            <li>Внедрите предварительную запись или доставку, чтобы разгрузить зал.</li>
          </ul>
        )}
        {summary.bottleneck === 'Кухня/кофейня' && (
          <ul className="text-sm list-disc pl-5 mt-2">
            <li>Нанять дополнительных поваров или бариста.</li>
            <li>Оптимизировать процессы (улучшить организацию рабочего места, предварительная подготовка).</li>
            <li>Пересмотреть меню (убрать долгие позиции или упростить их).</li>
          </ul>
        )}
        {summary.bottleneck === 'Баланс' && summary.totalRevenue > 0 && (
          <p className="text-sm mt-2">Отличный баланс! Вы можете масштабировать бизнес, сохраняя текущие пропорции.</p>
        )}
      </div>
    </div>
  );
}

// ================ ГЛАВНАЯ СТРАНИЦА ================
export default function BusinessPage() {
  const [commonSettings, setCommonSettings] = useState<CommonSettings>({
    shiftHours: 8,
    loadFactor: 0.75,
  });

  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Салаты', timePerDish: 10, price: 350 },
    { id: '2', name: 'Горячее', timePerDish: 35, price: 650 },
    { id: '3', name: 'Пицца', timePerDish: 15, price: 550 },
    { id: '4', name: 'Десерты', timePerDish: 8, price: 300 },
  ]);
  const [cooksCount, setCooksCount] = useState(3);
  const [parallelism, setParallelism] = useState(2);
  const [kitchenResult, setKitchenResult] = useState<any>(null);

  const [baristasCount, setBaristasCount] = useState(2);
  const [timePerDrink, setTimePerDrink] = useState(75);
  const [avgDrinkPrice, setAvgDrinkPrice] = useState(250);
  const [coffeeResult, setCoffeeResult] = useState<any>(null);

  const [seats, setSeats] = useState(40);
  const [avgStayTime, setAvgStayTime] = useState(60);
  const [avgCheck, setAvgCheck] = useState(500);
  const [hallLoadFactor, setHallLoadFactor] = useState(0.8);
  const [hallResult, setHallResult] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<'kitchen' | 'coffee' | 'hall' | 'ventilation' | 'summary'>('kitchen');

  const calcCoffee = () => {
    const shiftSeconds = commonSettings.shiftHours * 3600;
    const availableSeconds = shiftSeconds * commonSettings.loadFactor * baristasCount;
    const maxDrinks = Math.floor(availableSeconds / timePerDrink);
    const result = { maxDrinks, revenue: maxDrinks * avgDrinkPrice };
    setCoffeeResult(result);
    return result;
  };

  const calcHall = () => {
    const shiftMinutes = commonSettings.shiftHours * 60;
    const cycles = shiftMinutes / avgStayTime;
    const maxGuests = Math.floor(cycles * seats * hallLoadFactor);
    const result = { maxGuests, revenue: maxGuests * avgCheck };
    setHallResult(result);
    return result;
  };

  useEffect(() => {
    calcCoffee();
  }, [commonSettings, baristasCount, timePerDrink, avgDrinkPrice]);

  useEffect(() => {
    calcHall();
  }, [commonSettings, seats, avgStayTime, avgCheck, hallLoadFactor]);

  const getSummary = () => {
    const kitchenRevenue = kitchenResult?.totalRevenue || 0;
    const coffeeRevenue = coffeeResult?.revenue || 0;
    const hallRevenue = hallResult?.revenue || 0;

    const totalFOH = kitchenRevenue + coffeeRevenue;
    const hallCapacity = hallRevenue;
    let totalRevenue = 0;
    let bottleneck: string | null = null;
    let recommendation = '';

    if (totalFOH > 0 && hallCapacity > 0) {
      totalRevenue = Math.min(totalFOH, hallCapacity);
      if (totalFOH > hallCapacity) {
        bottleneck = 'Зал';
        recommendation = 'Зал является узким местом. Увеличьте количество мест или сократите время пребывания гостей.';
      } else if (totalFOH < hallCapacity) {
        bottleneck = 'Кухня/кофейня';
        recommendation = 'Кухня или кофейня не успевают за потоком гостей. Увеличьте количество поваров/бариста или сократите время приготовления.';
      } else {
        bottleneck = 'Баланс';
        recommendation = 'Баланс достигнут. Все зоны работают синхронно.';
      }
    } else {
      totalRevenue = totalFOH + hallCapacity;
      recommendation = 'Нет данных для расчёта.';
    }

    return { totalRevenue, bottleneck, recommendation, kitchenRevenue, coffeeRevenue, hallRevenue };
  };

  const summary = getSummary();

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">📊 Бизнес-аналитика</h1>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <h3 className="font-semibold mb-2">Общие настройки</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Длительность смены (ч)</label>
            <input
              type="number"
              min="4"
              max="12"
              step="0.5"
              value={commonSettings.shiftHours}
              onChange={(e) =>
                setCommonSettings({ ...commonSettings, shiftHours: Number(e.target.value) })
              }
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Коэффициент загрузки</label>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={commonSettings.loadFactor}
              onChange={(e) =>
                setCommonSettings({ ...commonSettings, loadFactor: Number(e.target.value) })
              }
              className="w-full"
            />
            <span className="text-sm">{Math.round(commonSettings.loadFactor * 100)}%</span>
          </div>
          <div>
            <label className="block text-sm font-medium">Время на заготовки (фикс. 20%)</label>
            <div className="text-lg font-semibold">
              {Math.round(commonSettings.shiftHours * 60 * 0.2)} мин
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-4">
          {[
            { key: 'kitchen', label: '🍳 Кухня' },
            { key: 'coffee', label: '☕ Кофейня' },
            { key: 'hall', label: '🪑 Зал' },
            { key: 'ventilation', label: '🌬️ Вентиляция' },
            { key: 'summary', label: '📈 Сводка' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-4">
        {activeTab === 'kitchen' && (
          <KitchenTab
            categories={categories}
            setCategories={setCategories}
            cooksCount={cooksCount}
            setCooksCount={setCooksCount}
            parallelism={parallelism}
            setParallelism={setParallelism}
            commonSettings={commonSettings}
            kitchenResult={kitchenResult}
            setKitchenResult={setKitchenResult}
          />
        )}
        {activeTab === 'coffee' && (
          <CoffeeTab
            baristasCount={baristasCount}
            setBaristasCount={setBaristasCount}
            timePerDrink={timePerDrink}
            setTimePerDrink={setTimePerDrink}
            avgDrinkPrice={avgDrinkPrice}
            setAvgDrinkPrice={setAvgDrinkPrice}
            coffeeResult={coffeeResult}
          />
        )}
        {activeTab === 'hall' && (
          <HallTab
            seats={seats}
            setSeats={setSeats}
            avgStayTime={avgStayTime}
            setAvgStayTime={setAvgStayTime}
            avgCheck={avgCheck}
            setAvgCheck={setAvgCheck}
            hallLoadFactor={hallLoadFactor}
            setHallLoadFactor={setHallLoadFactor}
            hallResult={hallResult}
          />
        )}
        {activeTab === 'ventilation' && (
          <VentilationTab />
        )}
        {activeTab === 'summary' && (
          <SummaryTab summary={summary} />
        )}
      </div>
    </div>
  );
}