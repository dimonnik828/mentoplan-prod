'use client';

import { useState, useEffect } from 'react';

interface TTK {
  id: number;
  title: string;
  number: string | null;
  type: string;
  category: string | null;
  ingredients: any[] | string; // может быть массивом или строкой
  technology: string;
}

export default function TTKPage() {
  const [ttks, setTtks] = useState<TTK[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('q', search);
    const res = await fetch(`/api/ttk?${params.toString()}`);
    const data = await res.json();
    setTtks(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  // Функция для безопасного получения ингредиентов
  const getIngredients = (ttk: TTK) => {
    if (!ttk.ingredients) return [];
    if (Array.isArray(ttk.ingredients)) return ttk.ingredients;
    try {
      return JSON.parse(ttk.ingredients);
    } catch {
      return [];
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">📋 Технологические карты</h1>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Поиск по названию или номеру..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : ttks.length === 0 ? (
        <p className="text-gray-500">Ничего не найдено</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ttks.map((ttk) => {
            const ingredients = getIngredients(ttk);
            return (
              <div key={ttk.id} className="border p-4 rounded shadow hover:shadow-md transition">
                <h2 className="text-lg font-semibold">{ttk.title}</h2>
                <p className="text-sm text-gray-500">№ {ttk.number}</p>
                <p className="text-sm mt-1">
                  <span className="inline-block px-2 py-0.5 bg-gray-200 rounded-full text-xs">{ttk.type}</span>
                  {ttk.category && (
                    <span className="inline-block ml-1 px-2 py-0.5 bg-blue-100 rounded-full text-xs">{ttk.category}</span>
                  )}
                </p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-600 text-sm">Ингредиенты</summary>
                  {ingredients.length > 0 ? (
                    <ul className="list-disc pl-5 text-sm mt-1">
                      {ingredients.slice(0, 5).map((item: any, idx: number) => (
                        <li key={idx}>{item.name} — {item.weightNetto} {item.unit}</li>
                      ))}
                      {ingredients.length > 5 && <li>… и ещё {ingredients.length - 5}</li>}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">Нет данных</p>
                  )}
                </details>
                <details className="mt-2">
                  <summary className="cursor-pointer text-green-600 text-sm">Технология</summary>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{ttk.technology || 'Не указана'}</p>
                </details>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}