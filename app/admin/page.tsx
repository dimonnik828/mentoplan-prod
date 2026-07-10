'use client';

import { useState } from 'react';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
      if (res.ok) {
        setResult(data);
      } else {
        alert(data.error || 'Ошибка');
      }
    } catch (err) {
      alert('Ошибка при отправке');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">MOMENTO — что дальше</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Название</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block font-medium">Адрес</label>
            <input type="text" name="address" value={form.address} onChange={handleChange} className="w-full border p-2 rounded" required />
          </div>
          <div>
            <label className="block font-medium">Площадь общая (м²)</label>
            <input type="number" name="totalArea" value={form.totalArea} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block font-medium">Площадь зала (м²)</label>
            <input type="number" name="hallArea" value={form.hallArea} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block font-medium">Посадочных мест</label>
            <input type="number" name="seats" value={form.seats} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block font-medium">Количество сотрудников</label>
            <input type="number" name="staffCount" value={form.staffCount} onChange={handleChange} className="w-full border p-2 rounded" required />
          </div>
          <div>
            <label className="block font-medium">Выручка в месяц (₽)</label>
            <input type="number" name="revenue" value={form.revenue} onChange={handleChange} className="w-full border p-2 rounded" required />
          </div>
          <div>
            <label className="block font-medium">Средний чек (₽)</label>
            <input type="number" name="avgCheck" value={form.avgCheck} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block font-medium">Аренда (₽)</label>
            <input type="number" name="rent" value={form.rent} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block font-medium">Коммунальные платежи (₽)</label>
            <input type="number" name="utilities" value={form.utilities} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block font-medium">ФОТ (₽)</label>
            <input type="number" name="payroll" value={form.payroll} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block font-medium">Затраты на управление (₽)</label>
            <input type="number" name="managementCosts" value={form.managementCosts} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block font-medium">Себестоимость (₽)</label>
            <input type="number" name="costOfGoods" value={form.costOfGoods} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block font-medium">Прочие расходы (₽)</label>
            <input type="number" name="otherExpenses" value={form.otherExpenses} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-6 rounded disabled:opacity-50 w-full md:w-auto"
        >
          {loading ? 'Анализируем...' : 'Получить рекомендации'}
        </button>
      </form>

      {result && (
        <div className="mt-8 space-y-6">
          <div className="bg-green-50 p-4 rounded">
            <h2 className="text-xl font-bold">Аудит</h2>
            <div className="whitespace-pre-line">
              {result.auditSummary}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-sm">
              <p><strong>Выручка на сотрудника:</strong> {result.metrics.revenuePerEmployee.toFixed(0)} ₽</p>
              <p><strong>Выручка на место:</strong> {result.metrics.revenuePerSeat.toFixed(0)} ₽</p>
              <p><strong>Выручка на м²:</strong> {result.metrics.revenuePerSqM.toFixed(0)} ₽</p>
              <p><strong>Food cost:</strong> {result.metrics.foodCostPercent}%</p>
              <p><strong>ФОТ:</strong> {result.metrics.payrollPercent}%</p>
              <p><strong>Аренда:</strong> {result.metrics.rentPercent}%</p>
              <p><strong>Прибыль:</strong> {result.metrics.profitPercent}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-bold">Развитие</h3>
              <ul className="list-disc pl-5 text-sm">
                {result.recommendations.development.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <h3 className="font-bold">Менеджмент</h3>
              <ul className="list-disc pl-5 text-sm">
                {result.recommendations.management.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <h3 className="font-bold">Реклама</h3>
              <ul className="list-disc pl-5 text-sm">
                {result.recommendations.advertising.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <h3 className="font-bold">Финансы</h3>
              <ul className="list-disc pl-5 text-sm">
                {result.recommendations.finance.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold">Чек-листы</h3>
            {result.checklists.map((list: any, idx: number) => (
              <div key={idx} className="mt-2">
                <p className="font-semibold">{list.title}</p>
                <ul className="list-disc pl-5 text-sm">
                  {list.items.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold">Рекламные ресурсы</h3>
            {result.adResources.map((res: any, idx: number) => (
              <div key={idx} className="mt-2">
                <a href={res.link} target="_blank" rel="noopener" className="text-blue-600 underline">
                  {res.name}
                </a>
                <span className="text-gray-600"> — {res.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}