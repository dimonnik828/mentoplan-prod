'use client';

import { useState, useEffect, useCallback } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import {
  Activity, MousePointerClick, Eye, Clock, Zap, ShieldAlert,
  Terminal, BarChart3, Globe, Users, AlertTriangle, TrendingUp,
  ArrowRight, Server, Timer, FileWarning, MousePointer, ScrollText,
  ArrowDownUp, LayoutDashboard, RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

/* ─── Types ─── */
interface OverviewStats {
  totalEvents: number;
  activeSessions: number;
  totalSessions: number;
  eventsLastHour: number;
  topPages: { page: string; count: number; avgDuration: number }[];
  recentErrors: ProcessEntry[];
  performance: PerformanceMetrics;
}

interface PerformanceMetrics {
  avgPageLoad: number;
  avgApiTime: number;
  slowestPages: { page: string; loadTime: number }[];
  errorRate: number;
  totalEvents: number;
}

interface BehaviorData {
  clickHeatmap: { path: string; element: string; count: number }[];
  navigationFlow: { from: string; to: string; count: number }[];
  pageDurations: { page: string; avgSeconds: number; visits: number }[];
  actionFrequency: { action: string; count: number }[];
}

interface ProcessEntry {
  id: string;
  type: string;
  path: string;
  timestamp: number;
  sessionId: string;
  data: Record<string, unknown>;
}

/* ─── Helpers ─── */
function fmtTime(ms: number): string {
  if (ms < 1000) return `${ms} мс`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)} с`;
  return `${Math.floor(ms / 60_000)} мин ${Math.round((ms % 60_000) / 1000)} с`;
}

function fmtTs(ts: number): string {
  return new Date(ts).toLocaleTimeString('ru-RU', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function timeAgo(ts: number): string {
  const d = Date.now() - ts;
  if (d < 60_000) return 'только что';
  if (d < 3_600_000) return `${Math.floor(d / 60_000)} мин назад`;
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)} ч назад`;
  return `${Math.floor(d / 86_400_000)} д назад`;
}

function EvIcon({ type }: { type: string }) {
  switch (type) {
    case 'api_call': return <Server className="size-3.5 text-blue-500" />;
    case 'action':   return <MousePointerClick className="size-3.5 text-indigo-500" />;
    case 'performance': return <Zap className="size-3.5 text-amber-500" />;
    case 'session_start': return <Users className="size-3.5 text-emerald-500" />;
    case 'session_end': return <Users className="size-3.5 text-muted-foreground" />;
    case 'page_view': return <Eye className="size-3.5 text-sky-500" />;
    case 'click': return <MousePointer className="size-3.5 text-violet-500" />;
    case 'scroll': return <ScrollText className="size-3.5 text-teal-500" />;
    case 'error': return <AlertTriangle className="size-3.5 text-destructive" />;
    default: return <Activity className="size-3.5 text-muted-foreground" />;
  }
}

function evLabel(type: string) {
  const m: Record<string, string> = {
    api_call: 'API запрос', action: 'Действие', performance: 'Метрика',
    session_start: 'Сессия', session_end: 'Конец сессии',
    page_view: 'Просмотр', click: 'Клик', scroll: 'Скролл', error: 'Ошибка',
  };
  return m[type] || type;
}

/* ─── Stat Card ─── */
function StatCard({ icon: Icon, label, value, sub, color = 'text-primary' }: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; color?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className={cn('text-2xl font-bold tabular-nums leading-tight', color)}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className="rounded-lg bg-muted/80 p-2.5 shrink-0">
            <Icon className={cn('size-5', color)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Empty State ─── */
function Empty({ text }: { text: string }) {
  return <p className="text-xs text-muted-foreground text-center py-10">{text}</p>;
}

/* ═══════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════ */
export default function AdminAnalyticsPage() {
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [topPages, setTopPages] = useState<OverviewStats['topPages']>([]);
  const [errors, setErrors] = useState<ProcessEntry[]>([]);
  const [attacks, setAttacks] = useState<ProcessEntry[]>([]);
  const [perf, setPerf] = useState<PerformanceMetrics | null>(null);
  const [behavior, setBehavior] = useState<BehaviorData | null>(null);
  const [processes, setProcesses] = useState<ProcessEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [procFilter, setProcFilter] = useState('all');
  const [timeline, setTimeline] = useState<any[]>([]);

const fetchSection = useCallback(async (section: string) => {
  try {
    const r = await fetch(`/api/admin/analytics/data?section=${section}`, {
      headers: { 'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || '' },
    });
    if (!r.ok) throw new Error('Unauthorized');
    const t = await r.text();
    try { return JSON.parse(t); } catch { return null; }
  } catch { return null; }
}, []);

  const reload = useCallback(async () => {
    try {
      const [ov, ses, pg, err, atk, pr, beh, proc, tl] = await Promise.all([
        fetchSection('overview'), fetchSection('sessions'),
        fetchSection('top-pages'), fetchSection('errors'),
        fetchSection('attacks'), fetchSection('performance'),
        fetchSection('behavior'), fetchSection('processes'),
        fetchSection('behavior-timeline'),
      ]);
      console.log('Behavior data:', beh);
      if (ov) setOverview(ov);
      if (Array.isArray(ses)) setSessions(ses);
      if (Array.isArray(pg)) setTopPages(pg);
      if (Array.isArray(err)) setErrors(err);
      if (Array.isArray(atk)) setAttacks(atk);
      if (pr) setPerf(pr);
      if (beh) setBehavior(beh);
      if (Array.isArray(proc)) setProcesses(proc);
      if (Array.isArray(tl)) setTimeline(tl);
      setError(null);
    } catch {
      setError('Не удалось загрузить данные аналитики');
    } finally {
      setLoading(false);
    }
  }, [fetchSection]);

  useEffect(() => {
    reload();
    const interval = setInterval(reload, 10_000);
    return () => clearInterval(interval);
  }, [reload]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-72" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="m-6 border-destructive/30">
        <CardContent className="p-6 flex items-center gap-3">
          <AlertTriangle className="size-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="ml-auto" onClick={reload}>
            <RefreshCw className="size-3.5 mr-1.5" /> Повторить
          </Button>
        </CardContent>
      </Card>
    );
  }

  const maxPV = topPages.length ? topPages[0].count : 1;
  const maxFlow = behavior?.navigationFlow?.[0]?.count ?? 1;
  const filtered = processes.filter(p => procFilter === 'all' || p.type === procFilter);

  return (
    <ErrorBoundary>
      <div className="p-6 space-y-6">
        {/* Header: всё в одной строке */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Аналитика и безопасность</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Поведение, производительность и процессы в реальном времени
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Вкладки */}
            {[
              { key: 'overview', label: 'Обзор', icon: LayoutDashboard },
              { key: 'behavior', label: 'Поведение', icon: MousePointer },
              { key: 'performance', label: 'Производительность', icon: Zap },
              { key: 'security', label: 'Безопасность', icon: ShieldAlert },
              { key: 'processes', label: 'Процессы', icon: Terminal },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                  tab === t.key
                    ? 'bg-muted text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <t.icon className="size-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}

            <div className="flex items-center gap-2 ml-1">
              <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs" onClick={reload}>
                <RefreshCw className="size-3.5 mr-1" /> Обновить
              </Button>
              <Badge variant="outline" className="h-8 px-2.5 gap-1 border-emerald-500/30 text-emerald-600 hidden sm:inline-flex text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Live
              </Badge>
            </div>
          </div>
        </div>

        {/* ═══════ OVERVIEW ═══════ */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Activity} label="Событий всего"
                value={overview?.totalEvents ?? 0}
                sub={`${overview?.eventsLastHour ?? 0} за последний час`} />
              <StatCard icon={Users} label="Активных сессий"
                value={overview?.activeSessions ?? 0}
                sub={`Всего: ${overview?.totalSessions ?? 0}`}
                color="text-emerald-600" />
              <StatCard icon={Users} label="Уникальные польз."
                value={overview?.totalSessions ?? 0}
                sub="Всего сессий"
                color="text-blue-600" />
              <StatCard icon={Zap} label="Загрузка стр."
                value={fmtTime(overview?.performance?.avgPageLoad ?? 0)}
                sub={`API: ${fmtTime(overview?.performance?.avgApiTime ?? 0)}`}
                color="text-amber-600" />
              <StatCard icon={AlertTriangle} label="Ошибки"
                value={errors.length}
                sub={`Rate: ${overview?.performance?.errorRate ?? 0}%`}
                color="text-destructive" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="size-4 text-primary" /> Популярные страницы
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topPages.length === 0 ? (
                    <Empty text="Посещений пока нет" />
                  ) : (
                    topPages.slice(0, 8).map(p => (
                      <div key={p.page} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-mono text-xs text-foreground truncate max-w-[200px]" title={p.page}>{p.page}</span>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-muted-foreground">{p.avgDuration > 0 ? fmtTime(p.avgDuration * 1000) : '—'}</span>
                            <Badge variant="secondary" className="tabular-nums font-mono text-xs px-1.5">{p.count}</Badge>
                          </div>
                        </div>
                        <Progress value={(p.count / maxPV) * 100} className="h-1.5" />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Globe className="size-4 text-emerald-500" /> Активные сессии
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Сессия</TableHead>
                        <TableHead className="text-xs">Страница</TableHead>
                        <TableHead className="text-xs text-right">Просмотры</TableHead>
                        <TableHead className="text-xs text-right">Активность</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.filter(s => s.isActive).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-xs text-muted-foreground text-center py-8">Нет активных сессий</TableCell>
                        </TableRow>
                      ) : (
                        sessions.filter(s => s.isActive).slice(0, 8).map(s => (
                          <TableRow key={s.id}>
                            <TableCell className="text-xs font-mono text-muted-foreground">{s.id.slice(0, 16)}…</TableCell>
                            <TableCell className="text-xs font-mono">{s.currentPage}</TableCell>
                            <TableCell className="text-xs text-right tabular-nums">{s.pageViews}</TableCell>
                            <TableCell className="text-xs text-right text-muted-foreground">{timeAgo(s.lastActivity)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileWarning className="size-4 text-destructive" /> Последние ошибки
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {errors.length === 0 ? (
                    <div className="flex items-center gap-2 py-6 justify-center">
                      <div className="size-2 rounded-full bg-emerald-500" />
                      <p className="text-xs text-emerald-600 font-medium">Всё чисто — ошибок нет</p>
                    </div>
                  ) : (
                    errors.slice(0, 6).map(e => (
                      <div key={e.id} className="flex items-start gap-2 p-2.5 rounded-lg bg-destructive/5 border border-destructive/10">
                        <AlertTriangle className="size-3.5 text-destructive mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-destructive font-medium truncate">{String(e.data?.message ?? '') || 'Неизвестная ошибка'}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{e.path} · {fmtTs(e.timestamp)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="size-4 text-blue-500" /> Лента активности
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-[340px] overflow-y-auto space-y-0.5">
                  {processes.length === 0 ? (
                    <Empty text="Событий пока нет" />
                  ) : (
                    processes.slice(0, 20).map(p => (
                      <div key={p.id} className="flex items-center gap-2.5 py-1.5 px-1 rounded hover:bg-muted/40 transition-colors">
                        <EvIcon type={p.type} />
                        <span className="text-xs text-foreground truncate flex-1 min-w-0">
                          {p.type === 'api_call'
                            ? <><span className="font-mono">{p.data?.endpoint || 'API'}</span>
                               <Badge variant={Number(p.data?.status) >= 400 ? 'destructive' : 'secondary'} className="ml-1 text-[10px] px-1 py-0">{p.data?.status || '?'}</Badge>
                               {p.data?.duration > 0 && <span className="text-muted-foreground ml-1">{fmtTime(p.data.duration as number)}</span>}</>
                            : p.type === 'action' ? p.data?.action || 'Действие'
                            : p.type === 'performance' ? <>{p.data?.metric}: {fmtTime(p.data?.value as number || 0)}</>
                            : p.type === 'page_view' ? <>просмотр <span className="font-mono">{p.path}</span></>
                            : p.type === 'click' ? <>{p.data?.element || p.data?.tag || 'click'}</>
                            : evLabel(p.type)}
                        </span>
                        <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums">{fmtTs(p.timestamp)}</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ═══════ BEHAVIOR ═══════ */}
        {tab === 'behavior' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Click Heatmap */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <MousePointerClick className="size-4 text-indigo-500" /> Тепловая карта кликов
                  </CardTitle>
                  <CardDescription>Самые нажимаемые элементы</CardDescription>
                </CardHeader>
                <CardContent>
                  {!behavior || !behavior.clickHeatmap || behavior.clickHeatmap.length === 0 ? (
                    <Empty text="Данных о кликах пока нет — начните взаимодействовать со страницами" />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Элемент</TableHead>
                          <TableHead className="text-xs">Страница</TableHead>
                          <TableHead className="text-xs text-right">Кликов</TableHead>
                          <TableHead className="text-xs text-right">Интенс.</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {behavior.clickHeatmap.slice(0, 12).map((c, i) => {
                          const pct = Math.round((c.count / behavior.clickHeatmap[0].count) * 100);
                          return (
                            <TableRow key={i}>
                              <TableCell className="text-xs font-mono max-w-[160px] truncate" title={c.element}>{c.element}</TableCell>
                              <TableCell className="text-xs font-mono text-muted-foreground">{c.path}</TableCell>
                              <TableCell className="text-xs text-right tabular-nums">{c.count}</TableCell>
                              <TableCell className="text-xs text-right w-28">
                                <div className="flex items-center gap-2">
                                  <Progress value={pct} className="h-1.5 flex-1" />
                                  <span className="tabular-nums text-muted-foreground w-8 text-right">{pct}%</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Navigation Flow */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ArrowDownUp className="size-4 text-blue-500" /> Навигационные потоки
                  </CardTitle>
                  <CardDescription>Как пользователи перемещаются</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {!behavior || !behavior.navigationFlow || behavior.navigationFlow.length === 0 ? (
                    <Empty text="Навигационных данных пока нет" />
                  ) : (
                    behavior.navigationFlow.slice(0, 12).map((f, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                        <Badge variant="outline" className="text-xs font-mono shrink-0 max-w-[120px] truncate">{f.from}</Badge>
                        <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
                        <Badge variant="outline" className="text-xs font-mono shrink-0 max-w-[120px] truncate">{f.to}</Badge>
                        <div className="flex-1" />
                        <Badge variant="secondary" className="tabular-nums text-xs">{f.count}x</Badge>
                        <Progress value={(f.count / maxFlow) * 100} className="h-1.5 w-16" />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Page Durations */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Timer className="size-4 text-amber-500" /> Время на странице
                  </CardTitle>
                  <CardDescription>Средняя продолжительность визита</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!behavior || !behavior.pageDurations || behavior.pageDurations.length === 0 ? (
                    <Empty text="Данных о времени на странице пока нет" />
                  ) : (
                    behavior.pageDurations.map((d, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-mono text-xs text-foreground truncate max-w-[220px]">{d.page}</span>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-muted-foreground tabular-nums">{fmtTime(d.avgSeconds * 1000)}</span>
                            <Badge variant="secondary" className="tabular-nums text-xs px-1.5">{d.visits} виз.</Badge>
                          </div>
                        </div>
                        <Progress value={(d.visits / (behavior.pageDurations[0].visits || 1)) * 100} className="h-1.5" />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Action Frequency */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <TrendingUp className="size-4 text-emerald-500" /> Частота действий
                  </CardTitle>
                  <CardDescription>Самые популярные действия</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  {!behavior || !behavior.actionFrequency || behavior.actionFrequency.length === 0 ? (
                    <Empty text="Данных о действиях пока нет" />
                  ) : (
                    behavior.actionFrequency.map((a, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors">
                        <span className="text-xs font-bold text-muted-foreground tabular-nums w-5 text-right">{i + 1}</span>
                        <span className="text-xs text-foreground flex-1">{a.action}</span>
                        <Badge variant="secondary" className="tabular-nums text-xs">{a.count}</Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Динамика за 30 дней */}
            <div className="mt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <TrendingUp className="size-4 text-emerald-500" /> Динамика за последние 30 дней
                  </CardTitle>
                  <CardDescription>Количество событий по дням</CardDescription>
                </CardHeader>
                <CardContent>
                  {timeline.length === 0 ? (
                    <Empty text="Данных для отображения недостаточно" />
                  ) : (
                    <div className="w-full overflow-x-auto">
                      <svg viewBox={`0 0 ${timeline.length * 60 + 40} 220`} className="w-full h-48">
                        {timeline.map((day, i) => {
                          const maxVal = Math.max(day.clicks, day.pageViews, day.scrolls, day.errors, 1);
                          const barWidth = 12;
                          const x = 40 + i * 55;
                          const colors = { clicks: '#6366f1', pageViews: '#0ea5e9', scrolls: '#10b981', errors: '#ef4444' };
                          const types = ['clicks', 'pageViews', 'scrolls', 'errors'] as const;
                          return (
                            <g key={day.date}>
                              <text x={x + 5} y={200} className="text-[10px] fill-muted-foreground" textAnchor="middle">
                                {day.date.slice(5)}
                              </text>
                              {types.map((t, j) => (
                                <rect
                                  key={t}
                                  x={x + j * (barWidth + 2)}
                                  y={180 - (day[t] / maxVal) * 150}
                                  width={barWidth}
                                  height={(day[t] / maxVal) * 150}
                                  fill={colors[t]}
                                  rx={1}
                                />
                              ))}
                              {i === 0 && (
                                <g transform="translate(0, 10)">
                                  {types.map((t, j) => (
                                    <rect key={t} x={5 + j * 55} y={0} width={8} height={8} fill={colors[t]} rx={1} />
                                  ))}
                                  {types.map((t, j) => (
                                    <text key={t} x={15 + j * 55} y={8} className="text-[8px] fill-muted-foreground">
                                      {t === 'pageViews' ? 'просм.' : t}
                                    </text>
                                  ))}
                                </g>
                              )}
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* ═══════ PERFORMANCE ═══════ */}
        {tab === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={Zap} label="Загрузка страницы"
                value={fmtTime(perf?.avgPageLoad ?? 0)} sub="среднее"
                color={perf && perf.avgPageLoad > 3000 ? 'text-destructive' : perf && perf.avgPageLoad > 1500 ? 'text-amber-600' : 'text-emerald-600'} />
              <StatCard icon={Server} label="API ответ"
                value={fmtTime(perf?.avgApiTime ?? 0)} sub="среднее"
                color={perf && perf.avgApiTime > 1000 ? 'text-destructive' : perf && perf.avgApiTime > 500 ? 'text-amber-600' : 'text-emerald-600'} />
              <StatCard icon={AlertTriangle} label="Rate ошибок"
                value={`${perf?.errorRate ?? 0}%`} sub="от всех действий"
                color={perf && perf.errorRate > 5 ? 'text-destructive' : perf && perf.errorRate > 1 ? 'text-amber-600' : 'text-emerald-600'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Slowest Pages */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Timer className="size-4 text-amber-500" /> Самые медленные страницы
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {!perf || !perf.slowestPages || perf.slowestPages.length === 0 ? (
                    <Empty text="Данных о производительности пока нет" />
                  ) : (
                    perf.slowestPages.map((p, i) => {
                      const slow = p.loadTime > 3000;
                      const med = p.loadTime > 1500 && !slow;
                      return (
                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border">
                          <div className={cn(
                            'size-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold',
                            slow ? 'bg-destructive/10 text-destructive' : med ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
                          )}>{i + 1}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-mono text-foreground truncate">{p.page}</p>
                            <Progress value={Math.min((p.loadTime / (perf.slowestPages[0].loadTime || 1)) * 100, 100)} className="h-1.5 mt-1.5" />
                          </div>
                          <Badge variant={slow ? 'destructive' : med ? 'outline' : 'secondary'} className="tabular-nums text-xs shrink-0">{fmtTime(p.loadTime)}</Badge>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              {/* Performance Log */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Activity className="size-4 text-blue-500" /> Лог метрик
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-[400px] overflow-y-auto space-y-0.5">
                  {processes.filter(p => p.type === 'performance').length === 0 ? (
                    <Empty text="Метрик производительности пока нет" />
                  ) : (
                    processes.filter(p => p.type === 'performance').slice(0, 25).map(p => (
                      <div key={p.id} className="flex items-center gap-2.5 py-1.5 px-1 rounded hover:bg-muted/40 transition-colors">
                        <Zap className="size-3.5 text-amber-500 shrink-0" />
                        <span className="text-xs text-foreground flex-1">
                          <span className="font-medium">{p.data?.metric}</span>
                          <span className="text-muted-foreground ml-2">{fmtTime(p.data?.value as number || 0)}</span>
                          {p.data?.ttfb != null && <span className="text-muted-foreground ml-2">TTFB: {fmtTime(p.data.ttfb as number)}</span>}
                        </span>
                        <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">{fmtTs(p.timestamp)}</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ═══════ SECURITY ═══════ */}
        {tab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Errors */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileWarning className="size-4 text-destructive" /> Журнал ошибок
                </CardTitle>
                <CardDescription>Все зафиксированные ошибки</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[480px] overflow-y-auto">
                {errors.length === 0 ? (
                  <div className="flex flex-col items-center py-10 gap-2">
                    <div className="size-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                      <Activity className="size-5 text-emerald-600" />
                    </div>
                    <p className="text-sm text-emerald-600 font-medium">Всё чисто</p>
                    <p className="text-xs text-muted-foreground">Ошибок не зафиксировано</p>
                  </div>
                ) : (
                  errors.map(e => (
                    <div key={e.id} className="p-3 rounded-lg border border-destructive/15 bg-destructive/5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Badge variant="destructive" className="text-xs">{e.data?.source === 'api' ? 'API' : e.data?.source === 'promise' ? 'Promise' : 'Runtime'}</Badge>
                        <span className="text-[11px] text-muted-foreground tabular-nums">{fmtTs(e.timestamp)}</span>
                      </div>
                      <p className="text-xs text-foreground break-all">{e.data?.message || 'Неизвестная ошибка'}</p>
                      {e.path && <p className="text-xs text-muted-foreground font-mono">{e.path}</p>}
                      {e.data?.lineno && (
                        <p className="text-[11px] text-muted-foreground">Строка {e.data.lineno}:{e.data.colno} — {String(e.data.filename || '').split('/').pop()}</p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Attacks */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ShieldAlert className="size-4 text-amber-500" /> Попытки атак
                </CardTitle>
                <CardDescription>Подозрительная активность</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[480px] overflow-y-auto">
                {attacks.length === 0 ? (
                  <div className="flex flex-col items-center py-10 gap-2">
                    <div className="size-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                      <ShieldAlert className="size-5 text-emerald-600" />
                    </div>
                    <p className="text-sm text-emerald-600 font-medium">Защита активна</p>
                    <p className="text-xs text-muted-foreground">Атак не зафиксировано</p>
                  </div>
                ) : (
                  attacks.map(a => (
                    <div key={a.id} className="p-3 rounded-lg border border-amber-500/15 bg-amber-50 dark:bg-amber-950/20 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs">{a.data?.event || 'Нарушение'}</Badge>
                        <span className="text-[11px] text-muted-foreground tabular-nums">{fmtTs(a.timestamp)}</span>
                      </div>
                      <p className="text-xs text-foreground">{a.data?.reason || a.data?.event || 'Подозрительная активность'}</p>
                      {a.data?.ip && <p className="text-xs text-muted-foreground font-mono">IP: {a.data.ip}</p>}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ═══════ PROCESSES ═══════ */}
        {tab === 'processes' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Select value={procFilter} onValueChange={setProcFilter}>
                <SelectTrigger className="w-48 h-8 text-xs">
                  <SelectValue placeholder="Тип событий" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все события</SelectItem>
                  <SelectItem value="api_call">API запросы</SelectItem>
                  <SelectItem value="action">Действия</SelectItem>
                  <SelectItem value="performance">Производительность</SelectItem>
                  <SelectItem value="page_view">Просмотры</SelectItem>
                  <SelectItem value="click">Клики</SelectItem>
                  <SelectItem value="error">Ошибки</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">{filtered.length} записей</span>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs w-10">Тип</TableHead>
                      <TableHead className="text-xs">Описание</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Страница</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Сессия</TableHead>
                      <TableHead className="text-xs text-right">Время</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-xs text-muted-foreground text-center py-10">Нет событий выбранного типа</TableCell>
                      </TableRow>
                    ) : (
                      filtered.slice(0, 60).map(p => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <EvIcon type={p.type} />
                            </div>
                          </TableCell>
                          <TableCell className="text-xs max-w-[320px]">
                            <div className="truncate">
                              {p.type === 'api_call' && (
                                <>
                                  <span className="font-mono">{p.data?.endpoint}</span>
                                  <Badge variant={Number(p.data?.status) >= 400 ? 'destructive' : 'secondary'} className="ml-1.5 text-[10px] px-1.5 py-0">{p.data?.status || 'pending'}</Badge>
                                  {p.data?.duration > 0 && <span className="text-muted-foreground ml-1.5">{fmtTime(p.data.duration as number)}</span>}
                                </>
                              )}
                              {p.type === 'action' && <span>{p.data?.action || 'Действие'}</span>}
                              {p.type === 'performance' && <span>{p.data?.metric}: <span className="tabular-nums">{fmtTime(p.data?.value as number || 0)}</span></span>}
                              {p.type === 'session_start' && <span className="text-emerald-600">Сессия начата</span>}
                              {p.type === 'session_end' && <span className="text-muted-foreground">Завершена ({fmtTime(p.data?.duration as number || 0)})</span>}
                              {p.type === 'page_view' && (
                                <><Eye className="size-3 inline mr-1 text-sky-500" />
                                  {p.data?.isExit ? 'Выход' : 'Просмотр'} <span className="font-mono">{p.path}</span>
                                  {p.data?.duration > 0 && <span className="text-muted-foreground ml-1.5">{fmtTime(p.data.duration as number)}</span>}
                                </>
                              )}
                              {p.type === 'click' && (
                                <><MousePointer className="size-3 inline mr-1 text-violet-500" />{p.data?.element || p.data?.tag || 'click'}</>
                              )}
                              {p.type === 'scroll' && (
                                <><ScrollText className="size-3 inline mr-1 text-teal-500" />Скролл до {p.data?.depth}%</>
                              )}
                              {p.type === 'error' && (
                                <span className="text-destructive">{p.data?.message || 'Ошибка'}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground hidden md:table-cell">{p.path}</TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground hidden lg:table-cell">{p.sessionId.slice(0, 10)}…</TableCell>
                          <TableCell className="text-xs text-right tabular-nums text-muted-foreground">{fmtTs(p.timestamp)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}