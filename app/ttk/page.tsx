'use client';

import { useState, useEffect } from 'react';

interface TTK {
  id: number;
  title: string;
  number: string | null;
  category: string | null;          // будем использовать applicationArea
  ingredients: any[];
  technology: string;
  calories: number | null;
  totalOutputKg: number | null;
  applicationArea: string | null;
  receiptName?: string | null;
  normUnit?: string | null;
}

export default function TTKPage() {
  const [ttks, setTtks] = useState<TTK[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterIngredient, setFilterIngredient] = useState('');
  const [groupBy, setGroupBy] = useState<'category' | 'ingredient'>('category');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ingredientsList, setIngredientsList] = useState<string[]>([]);
  const limit = 20;

  // Загрузка списка ингредиентов
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const res = await fetch('/api/ingredients');
        const data = await res.json();
        setIngredientsList(data.ingredients || []);
      } catch (error) {
        console.error('Ошибка загрузки ингредиентов:', error);
      }
    };
    fetchIngredients();
  }, []);

  const fetchData = async (pageNum: number) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('q', search);
    if (filterIngredient) params.append('ingredient', filterIngredient);
    params.append('page', String(pageNum));
    params.append('limit', String(limit));
    const res = await fetch(`/api/ttk?${params.toString()}`);
    const data = await res.json();
    setTtks(data.data || []);
    setTotalPages(data.pagination?.pages || 1);
    setLoading(false);
  };

  useEffect(() => {
    fetchData(page);
  }, [search, filterIngredient, page]);

  const getIngredients = (ttk: TTK): any[] => {
    if (!ttk.ingredients) return [];
    if (Array.isArray(ttk.ingredients)) return ttk.ingredients;
    if (typeof ttk.ingredients === 'string') {
      try {
        const parsed = JSON.parse(ttk.ingredients);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const getTechnology = (ttk: TTK): string => {
    return ttk.technology && ttk.technology.trim() !== '' ? ttk.technology : 'Не указана';
  };

  // Группировка по категориям (applicationArea)
  const groupByCategory = (list: TTK[]) => {
    const grouped: Record<string, TTK[]> = {};
    list.forEach((ttk) => {
      const key = ttk.applicationArea || 'Без категории';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(ttk);
    });
    return grouped;
  };

  // Группировка по ингредиентам
  const groupByIngredients = (list: TTK[]) => {
    const grouped: Record<string, TTK[]> = {};
    list.forEach((ttk) => {
      const ingredients = getIngredients(ttk);
      ingredients.forEach((ing: any) => {
        const name = ing.product_name || ing.name || ing.product;
        if (!name) return;
        if (!grouped[name]) grouped[name] = [];
        // Добавляем блюдо, если его ещё нет в этой группе (избегаем дублей)
        if (!grouped[name].some((item) => item.id === ttk.id)) {
          grouped[name].push(ttk);
        }
      });
    });
    return grouped;
  };

  const getGroupedData = () => {
    if (groupBy === 'category') {
      return groupByCategory(ttks);
    } else {
      return groupByIngredients(ttks);
    }
  };

  const grouped = getGroupedData();

  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    if (groupBy === 'category') {
      // Сортировка категорий: можно по алфавиту или задать порядок вручную
      const order = ['блюдо', 'заготовка', 'напитки', 'десерты', 'Без категории'];
      const indexA = order.indexOf(a.toLowerCase());
      const indexB = order.indexOf(b.toLowerCase());
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    } else {
      return a.localeCompare(b);
    }
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">📋 Технологические карты</h1>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Поиск по названию или номеру..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-[200px] p-2 border rounded"
        />

        <select
          value={filterIngredient}
          onChange={(e) => { setFilterIngredient(e.target.value); setPage(1); }}
          className="p-2 border rounded min-w-[150px]"
        >
          <option value="">Все ингредиенты</option>
          {ingredientsList.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <div className="flex items-center gap-2 border rounded p-1">
          <button
            onClick={() => setGroupBy('category')}
            className={`px-3 py-1 rounded ${groupBy === 'category' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            По категориям
          </button>
          <button
            onClick={() => setGroupBy('ingredient')}
            className={`px-3 py-1 rounded ${groupBy === 'ingredient' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            По ингредиентам
          </button>
        </div>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : ttks.length === 0 ? (
        <p className="text-gray-500">Ничего не найдено</p>
      ) : (
        <>
          {sortedKeys.map((key) => (
            <div key={key} className="mb-8">
              <h2 className="text-2xl font-bold mb-4 border-b pb-2">
                {key}
                {groupBy === 'ingredient' && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({grouped[key].length} блюд)
                  </span>
                )}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped[key].map((ttk) => {
                  const ingredients = getIngredients(ttk);
                  const tech = getTechnology(ttk);
                  return (
                    <div key={ttk.id} className="border p-4 rounded shadow hover:shadow-md transition">
                      <h3 className="text-lg font-semibold">{ttk.title}</h3>
                      <p className="text-sm text-gray-500">№ {ttk.number}</p>
                      {ttk.receiptName && (
                        <p className="text-sm text-gray-600 mt-1">Рецепт: {ttk.receiptName}</p>
                      )}
                      {ttk.normUnit && (
                        <p className="text-sm text-gray-600">Единица: {ttk.normUnit}</p>
                      )}
                      <p className="text-sm mt-1">
                        <span className="inline-block px-2 py-0.5 bg-gray-200 rounded-full text-xs">
                          {ttk.applicationArea || 'без категории'}
                        </span>
                      </p>
                      {ttk.calories && (
                        <p className="text-sm text-gray-600">{ttk.calories} ккал</p>
                      )}
                      <details className="mt-2">
                        <summary className="cursor-pointer text-blue-600 text-sm">Ингредиенты</summary>
                        {ingredients.length > 0 ? (
                          <ul className="list-disc pl-5 text-sm mt-1">
                            {ingredients.slice(0, 10).map((item: any, idx: number) => (
                              <li key={idx}>
                                {item.product_name || item.name || '—'}
                                {item.net_weight_g !== undefined && ` — ${item.net_weight_g} г`}
                                {item.net_weight_kg !== undefined && ` — ${item.net_weight_kg} кг`}
                                {item.unit && ` (${item.unit})`}
                                {item.gross_per_unit !== undefined && `, закладка: ${item.gross_per_unit}`}
                              </li>
                            ))}
                            {ingredients.length > 10 && (
                              <li className="text-gray-500">… и ещё {ingredients.length - 10}</li>
                            )}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500 mt-1">Нет данных</p>
                        )}
                      </details>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-green-600 text-sm">Технология</summary>
                        <p className="text-sm mt-1 whitespace-pre-wrap">{tech}</p>
                      </details>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Назад
              </button>
              <span className="px-3 py-1">
                Страница {page} из {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Вперёд
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}