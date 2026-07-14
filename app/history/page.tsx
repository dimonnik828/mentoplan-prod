'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Audit = {
  id: string;
  name: string | null;
  address: string;
  revenue: number;
  healthIndex: number | null;
  createdAt: string;
};

export default function HistoryPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAudits = async () => {
      try {
        const res = await fetch('/api/audits');
        if (!res.ok) throw new Error('Ошибка загрузки');
        const data = await res.json();

        // API возвращает { audits: [...] }, поэтому берём data.audits
        const list = Array.isArray(data.audits) ? data.audits : [];
        setAudits(list);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadAudits();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Загрузка...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-sm" style={{ color: 'var(--danger)' }}>Ошибка: {error}</div>;
  }

  return (
    <div className="p-6 lg:p-8" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>История аудитов</h1>

      {audits.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Нет сохранённых аудитов.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {audits.map((audit) => (
            <Link key={audit.id} href={`/audit/${audit.id}`}>
              <div className="card p-4 hover:shadow-md transition cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
                      {audit.name || 'Без названия'}
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{audit.address}</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                      Выручка: {audit.revenue?.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                  <div className="text-right">
                    {audit.healthIndex !== null && (
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          audit.healthIndex >= 70
                            ? 'bg-green-100 text-green-800'
                            : audit.healthIndex >= 50
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        Здоровье: {audit.healthIndex}
                      </span>
                    )}
                    <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                      {new Date(audit.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}