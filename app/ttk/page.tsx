'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TtkCard {
  id: number;
  title: string;
  number: string | null;
  category: string | null;
  calories: number | null;
  proteins: number | null;
  fats: number | null;
  carbs: number | null;
  technology: string | null;
  presentation: string | null;
  storage: string | null;
  quality: string | null;
  ingredients: any[];
}

const PAGE_SIZE = 20; // карт на странице

export default function TtkPage() {
  const [cards, setCards] = useState<TtkCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'categories' | 'ingredients'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Загружаем все карты (один раз)
  useEffect(() => {
    const loadAllCards = async () => {
      try {
        const res = await fetch('/api/ttk?limit=1000', {
          headers: { 'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || '' },
        });
        if (!res.ok) throw new Error('Ошибка загрузки');
        const json = await res.json();
        setCards(json.data || []);
      } catch {
        setError('Не удалось загрузить карты');
      } finally {
        setLoading(false);
      }
    };
    loadAllCards();
  }, []);

  // Получаем уникальные категории
  const categories = useMemo(() => {
    const cats = new Set<string>();
    cards.forEach(c => { if (c.category) cats.add(c.category); });
    return Array.from(cats).sort();
  }, [cards]);

  // Получаем уникальные ингредиенты (из названий)
  const ingredients = useMemo(() => {
    const ingrSet = new Set<string>();
    cards.forEach(c => {
      if (Array.isArray(c.ingredients)) {
        c.ingredients.forEach((i: any) => {
          if (i.productName) ingrSet.add(i.productName);
        });
      }
    });
    return Array.from(ingrSet).sort();
  }, [cards]);

  // Фильтрация
  const filteredCards = useMemo(() => {
    let result = cards;

    // Поиск
    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter(
        c =>
          c.title.toLowerCase().includes(lower) ||
          (c.number && c.number.toLowerCase().includes(lower))
      );
    }

    // Фильтр по категории
    if (filterMode === 'categories' && selectedCategory) {
      result = result.filter(c => c.category === selectedCategory);
    }

    // Фильтр по ингредиенту (упрощённо: проверяем наличие в массиве)
    if (filterMode === 'ingredients' && selectedIngredient) {
      result = result.filter(c =>
        Array.isArray(c.ingredients) &&
        c.ingredients.some((i: any) => i.productName === selectedIngredient)
      );
    }

    return result;
  }, [cards, search, filterMode, selectedCategory, selectedIngredient]);

  // Пагинация
  const totalPages = Math.ceil(filteredCards.length / PAGE_SIZE);
  const paginatedCards = filteredCards.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Сброс страницы при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedIngredient, filterMode]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">📋 Технологические карты</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">📋 Технологические карты</h1>
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">📋 Технологические карты</h1>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          type="text"
          placeholder="Поиск по названию или номеру..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px]"
        />

        <div className="flex items-center gap-2 border rounded p-1">
          <button
            onClick={() => { setFilterMode('categories'); setSelectedCategory(null); }}
            className={`px-3 py-1 rounded text-sm ${filterMode === 'categories' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            По категориям
          </button>
          <button
            onClick={() => { setFilterMode('ingredients'); setSelectedIngredient(null); }}
            className={`px-3 py-1 rounded text-sm ${filterMode === 'ingredients' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            По ингредиентам
          </button>
        </div>

        {/* Выпадающий список категорий/ингредиентов */}
        {filterMode === 'categories' && (
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="p-2 border rounded min-w-[150px] text-sm"
          >
            <option value="">Все категории</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}

        {filterMode === 'ingredients' && (
          <select
            value={selectedIngredient || ''}
            onChange={(e) => setSelectedIngredient(e.target.value || null)}
            className="p-2 border rounded min-w-[150px] text-sm"
          >
            <option value="">Все ингредиенты</option>
            {ingredients.map(ing => (
              <option key={ing} value={ing}>{ing}</option>
            ))}
          </select>
        )}
      </div>

      {/* Счётчик */}
      <p className="text-sm text-muted-foreground mb-4">
        Показано {paginatedCards.length} из {filteredCards.length} карт
        {filteredCards.length !== cards.length && ` (всего ${cards.length})`}
      </p>

      {/* Сетка карточек */}
      {paginatedCards.length === 0 ? (
        <p className="text-muted-foreground">Ничего не найдено</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedCards.map(card => (
            <Card key={card.id} className="hover:shadow-md transition">
              <CardHeader>
                <CardTitle className="text-lg">{card.title}</CardTitle>
                <div className="flex gap-2 mt-1">
                  {card.number && (
                    <Badge variant="outline" className="text-xs">
                      № {card.number}
                    </Badge>
                  )}
                  {card.category && (
                    <Badge variant="secondary" className="text-xs">
                      {card.category}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  {card.calories && <p>🔥 {card.calories} ккал</p>}
                  {card.proteins && <p>🥩 Белки: {card.proteins} г</p>}
                  {card.fats && <p>🧈 Жиры: {card.fats} г</p>}
                  {card.carbs && <p>🍞 Углеводы: {card.carbs} г</p>}
                </div>

                {card.technology && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-muted-foreground">Технология:</p>
                    <p className="text-xs line-clamp-3">{card.technology}</p>
                  </div>
                )}
                {card.presentation && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-muted-foreground">Подача:</p>
                    <p className="text-xs line-clamp-2">{card.presentation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}