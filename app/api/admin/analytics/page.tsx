// app/admin/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ErrorBoundary } from '../../../components/ErrorBoundary';

export default function AnalyticsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [topPages, setTopPages] = useState<{ page: string; count: number }[]>([]);
  const [recentErrors, setRecentErrors] = useState<any[]>([]);
  const [attackAttempts, setAttackAttempts] = useState<any[]>([]);
  const [pageMetrics, setPageMetrics] = useState<any>(null);
  const [clicks, setClicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsRes, pagesRes, errorsRes, attacksRes, metricsRes, clicksRes] = await Promise.all([
          fetch('/api/admin/analytics/sessions'),
          fetch('/api/admin/analytics/top-pages'),
          fetch('/api/admin/analytics/recent-errors'),
          fetch('/api/admin/analytics/attacks'),
          fetch('/api/admin/analytics/page-metrics'),
          fetch('/api/admin/analytics/recent-clicks'),
        ]);

        const parseJSON = async (res: Response) => {
          const text = await res.text();
          try { return JSON.parse(text); } catch { return []; }
        };

        setSessions(await parseJSON(sessionsRes));
        setTopPages(await parseJSON(pagesRes));
        setRecentErrors(await parseJSON(errorsRes));
        setAttackAttempts(await parseJSON(attacksRes));
        setPageMetrics(await parseJSON(metricsRes));
        setClicks(await parseJSON(clicksRes));
      } catch (e) {
        setError('Ошибка загрузки данных');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-6" style={{ color: 'var(--text-muted)' }}>Загрузка...</div>;
  if (error) return <div className="p-6" style={{ color: 'var(--danger)' }}>{error}</div>;

  return (
    <ErrorBoundary>
      <div>
        <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>Аналитика и безопасность</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Активные сессии */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Активные сессии</h2>
            <div className="space-y-2">
              {sessions.slice(0, 5).map((s: any) => (
                <div key={s.id} className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {s.ip || 'IP скрыт'} — {new Date(s.createdAt).toLocaleTimeString('ru-RU')}
                </div>
              ))}
            </div>
          </div>

          {/* Топ страниц */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Популярные страницы</h2>
            <div className="space-y-2">
              {topPages.map((p) => (
                <div key={p.page} className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-secondary)' }}>{p.page}</span>
                  <span style={{ color: 'var(--text)' }}>{p.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Время и отказы */}
          {pageMetrics && (
            <>
              <div className="card p-5">
                <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Среднее время на странице (сек)</h2>
                <div className="space-y-2">
                  {pageMetrics.timeOnPage?.map((p: any) => (
                    <div key={p.page} className="flex justify-between text-xs">
                      <span style={{ color: 'var(--text-secondary)' }}>{p.page}</span>
                      <span style={{ color: 'var(--text)' }}>{Math.round(p._avg.seconds ?? 0)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card p-5">
                <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Показатель отказов</h2>
                <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                  {pageMetrics.bounceRate}%
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Доля посетителей, покинувших сайт после просмотра одной страницы</p>
              </div>
            </>
          )}

          {/* Тепловая карта кликов */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Последние клики (x, y)</h2>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {clicks.map((c: any) => (
                <div key={c.id} className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  ({c.data?.x}, {c.data?.y}) — {c.page}
                </div>
              ))}
              {clicks.length === 0 && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Нет данных</p>}
            </div>
          </div>

          {/* Ошибки */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Последние ошибки</h2>
            <div className="space-y-2">
              {recentErrors.map((e: any) => (
                <div key={e.id} className="text-xs" style={{ color: 'var(--danger)' }}>
                  {e.page}: {e.data?.message}
                </div>
              ))}
            </div>
          </div>

          {/* Атаки */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Попытки атак</h2>
            <div className="space-y-2">
              {attackAttempts.map((a: any) => (
                <div key={a.id} className="text-xs" style={{ color: 'var(--warning)' }}>
                  {a.data?.ip} — {a.data?.reason} ({new Date(a.createdAt).toLocaleTimeString('ru-RU')})
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}