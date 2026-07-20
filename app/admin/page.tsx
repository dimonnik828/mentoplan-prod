'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, Users, DollarSign, AlertTriangle } from 'lucide-react';

export default function Home() {
  const [form, setForm] = useState({
    name: '',
    address: '',
    totalArea: '',
    hallArea: '',
    seats: '',
    staffCount: '',
    avgCheck: '',
    revenue: '',
    rent: '',
    utilities: '',
    payroll: '',
    managementCosts: '',
    costOfGoods: '',
    otherExpenses: '',
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: form.name || 'Не указано',
        address: form.address,
        totalArea: Number(form.totalArea) || 0,
        hallArea: Number(form.hallArea) || 0,
        seats: Number(form.seats) || 0,
        staffCount: Number(form.staffCount) || 0,
        avgCheck: Number(form.avgCheck) || 0,
        revenue: Number(form.revenue) || 0,
        rent: Number(form.rent) || 0,
        utilities: Number(form.utilities) || 0,
        payroll: Number(form.payroll) || 0,
        managementCosts: Number(form.managementCosts) || 0,
        costOfGoods: Number(form.costOfGoods) || 0,
        otherExpenses: Number(form.otherExpenses) || 0,
      };

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка сервера');

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Не удалось выполнить анализ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Экспресс-аудит</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Данные заведения</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Название</label>
                <Input name="name" value={form.name} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Адрес</label>
                <Input name="address" value={form.address} onChange={handleChange} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Общая площадь (м²)</label>
                <Input type="number" name="totalArea" value={form.totalArea} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Площадь зала (м²)</label>
                <Input type="number" name="hallArea" value={form.hallArea} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Посадочных мест</label>
                <Input type="number" name="seats" value={form.seats} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Сотрудников</label>
                <Input type="number" name="staffCount" value={form.staffCount} onChange={handleChange} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Выручка в месяц (₽)</label>
                <Input type="number" name="revenue" value={form.revenue} onChange={handleChange} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Средний чек (₽)</label>
                <Input type="number" name="avgCheck" value={form.avgCheck} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Аренда (₽)</label>
                <Input type="number" name="rent" value={form.rent} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Коммунальные (₽)</label>
                <Input type="number" name="utilities" value={form.utilities} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">ФОТ (₽)</label>
                <Input type="number" name="payroll" value={form.payroll} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Управление (₽)</label>
                <Input type="number" name="managementCosts" value={form.managementCosts} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Себестоимость (₽)</label>
                <Input type="number" name="costOfGoods" value={form.costOfGoods} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Прочие расходы (₽)</label>
                <Input type="number" name="otherExpenses" value={form.otherExpenses} onChange={handleChange} />
              </div>
            </div>
            {error && <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">{error}</div>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Анализируем...' : 'Получить рекомендации'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          {/* Ключевые метрики */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Прибыль, %</p>
                  <p className="text-lg font-bold">{result.metrics.profitPercent}%</p>
                </div>
                <TrendingUp className="h-5 w-5 text-primary" />
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Выручка/сотр</p>
                  <p className="text-lg font-bold">{Math.round(result.metrics.revenuePerEmployee).toLocaleString()} ₽</p>
                </div>
                <Users className="h-5 w-5 text-emerald-500" />
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Food cost</p>
                  <p className="text-lg font-bold">{result.metrics.foodCostPercent}%</p>
                </div>
                <DollarSign className="h-5 w-5 text-amber-500" />
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">ФОТ, %</p>
                  <p className="text-lg font-bold">{result.metrics.payrollPercent}%</p>
                </div>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </CardContent>
            </Card>
          </div>

          {/* Аудит */}
          <Card>
            <CardHeader>
              <CardTitle>Сводка аудита</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm">{result.auditSummary}</p>
            </CardContent>
          </Card>

          {/* Рекомендации */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(result.recommendations).map(([key, items]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="capitalize">{key}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {(items as string[]).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Чек-листы */}
          {result.checklists?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Чек-листы</CardTitle>
              </CardHeader>
              <CardContent>
                {result.checklists.map((list: any, idx: number) => (
                  <div key={idx} className="mb-4 last:mb-0">
                    <h4 className="font-semibold text-sm">{list.title}</h4>
                    <ul className="list-disc pl-5 text-sm">
                      {list.items.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Рекламные ресурсы */}
          {result.adResources?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Рекламные ресурсы</CardTitle>
              </CardHeader>
              <CardContent>
                {result.adResources.map((res: any, idx: number) => (
                  <div key={idx} className="mb-2 last:mb-0">
                    <a href={res.link} target="_blank" rel="noopener noreferrer" className="text-primary underline text-sm">
                      {res.name}
                    </a>
                    <span className="text-sm text-muted-foreground"> — {res.description}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}