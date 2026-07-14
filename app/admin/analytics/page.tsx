// app/admin/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ErrorBoundary } from '../../../components/ErrorBoundary';

export default function AnalyticsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [topPages, setTopPages] = useState<{ page: string; count: number }[]>([]);
  const [recentErrors, setRecentErrors] = useState<any[]>([]);
  const [attackAttempts, setAttackAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsRes, pagesRes, errorsRes, attacksRes] = await Promise.all([
          fetch('/api/admin/analytics/sessions'),
          fetch('/api/admin/analytics/top-pages'),
          fetch('/api/admin/analytics/recent-errors'),
          fetch('/api/admin/analytics/attacks'),
        ]);

        // Безопасный парсинг каждого ответа
        const parseJSON = async (response: Response) => {
          const text = await response.text();
          try {
            return JSON.parse(text);
          } catch {
            return [];
          }
        };

        setSessions(await parseJSON(sessionsRes));
        setTopPages(await parseJSON(pagesRes));
        setRecentErrors(await parseJSON(errorsRes));
        setAttackAttempts(await parseJSON(attacksRes));
      } catch (e) {
        setError('Не удалось загрузить данные аналитики');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6" style={{ color: 'var(--text-muted)' }}>
        Загрузка данных аналитики...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6" style={{ color: 'var(--danger)' }}>
        {error}
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div>
        <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>
          Аналитика и безопасность
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Активные сессии */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
              Активные сессии
            </h2>
            <div className="space-y-2">
              {sessions.slice(0, 5).map((s: any) => (
                <div key={s.id} className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {s.ip || 'IP скрыт'} — {new Date(s.createdAt).toLocaleTimeString('ru-RU')}
                </div>
              ))}
              {sessions.length === 0 && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Пока нет данных
                </p>
              )}
            </div>
          </div>

          {/* Топ страниц */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
              Популярные страницы
            </h2>
            <div className="space-y-2">
              {topPages.map((p: any) => (
                <div key={p.page} className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-secondary)' }}>{p.page}</span>
                  <span style={{ color: 'var(--text)' }}>{p.count}</span>
                </div>
              ))}
              {topPages.length === 0 && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Нет данных
                </p>
              )}
            </div>
          </div>

          {/* Последние ошибки */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
              Последние ошибки
            </h2>
            <div className="space-y-2">
              {recentErrors.map((e: any) => (
                <div key={e.id} className="text-xs" style={{ color: 'var(--danger)' }}>
                  {e.page}: {e.data?.message || 'Неизвестная ошибка'}
                </div>
              ))}
              {recentErrors.length === 0 && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Ошибок не зафиксировано
                </p>
              )}
            </div>
          </div>

          {/* Попытки атак */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
              Попытки атак
            </h2>
            <div className="space-y-2">
              {attackAttempts.map((a: any) => (
                <div key={a.id} className="text-xs" style={{ color: 'var(--warning)' }}>
                  {a.data?.ip || 'IP скрыт'} — {a.data?.reason || 'Нарушение'} (
                  {new Date(a.createdAt).toLocaleTimeString('ru-RU')})
                </div>
              ))}
              {attackAttempts.length === 0 && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Атак не зафиксировано
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}