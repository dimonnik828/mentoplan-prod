'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type AuditSummary = {
  id: string;
  name: string | null;
  address: string;
  revenue: number;
  createdAt: string;
  profitPercent: number | null;
  healthIndex: number | null;
};

export default function HistoryPage() {
  const [audits, setAudits] = useState<AuditSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/audits')
      .then(res => res.json())
      .then(data => {
        setAudits(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Загрузка...</div>;

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">История диагностик</h1>
      {audits.length === 0 ? (
        <p>Пока нет сохранённых аудитов. Пройдите диагностику на главной странице.</p>
      ) : (
        <div className="space-y-4">
          {audits.map((audit) => (
            <Link key={audit.id} href={`/audit/${audit.id}`}>
              <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition border border-gray-200 cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold text-lg">{audit.name || 'Без названия'}</h2>
                    <p className="text-gray-600 text-sm">{audit.address}</p>
                    <p className="text-gray-500 text-sm">
                      Выручка: {audit.revenue.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      audit.healthIndex && audit.healthIndex >= 70 ? 'bg-green-100 text-green-800' :
                      audit.healthIndex && audit.healthIndex >= 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      Индекс здоровья: {audit.healthIndex ?? '—'}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(audit.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      <div className="mt-6">
        <Link href="/" className="text-blue-600 hover:underline">← На главную</Link>
      </div>
    </main>
  );
}