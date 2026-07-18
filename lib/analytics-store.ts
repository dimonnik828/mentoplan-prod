// lib/analytics-store.ts
import { prisma } from '@/lib/prisma';

export type EventType =
  | 'api_call'
  | 'action'
  | 'performance'
  | 'session_start'
  | 'session_end'
  | 'page_view'
  | 'click'
  | 'scroll'
  | 'error'
  | 'security'
  | 'navigation'
  | 'page_duration';

export interface TrackedEvent {
  id: string;
  type: EventType;
  path: string;
  sessionId: string;
  timestamp: number;
  data: Record<string, unknown>;
}

const sessions: Record<string, {
  id: string; userAgent: string; isActive: boolean;
  lastActivity: number; currentPage: string; pageViews: number;
}> = {};

export async function trackEvent(e: Omit<TrackedEvent, 'id' | 'timestamp'>): Promise<TrackedEvent> {
  const event = await prisma.analyticsEvent.create({
    data: {
      type: e.type,
      path: e.path,
      sessionId: e.sessionId,
      timestamp: BigInt(Date.now()),
      data: e.data,
    },
  });
  return {
    id: event.id,
    type: event.type as EventType,
    path: event.path ?? '',
    sessionId: event.sessionId,
    timestamp: Number(event.timestamp),
    data: event.data as Record<string, unknown>,
  };
}

export function startSession(sessionId: string, userAgent: string) {
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      id: sessionId, userAgent, isActive: true,
      lastActivity: Date.now(), currentPage: '/', pageViews: 0,
    };
  }
}

export function endSession(sessionId: string) {
  if (sessions[sessionId]) sessions[sessionId].isActive = false;
}

export function getSessions() {
  return Object.values(sessions);
}

async function getFilteredEvents(types?: EventType[]) {
  const where = types ? { type: { in: types } } : {};
  const events = await prisma.analyticsEvent.findMany({ where });
  return events.map(e => ({
    ...e,
    timestamp: Number(e.timestamp),
  }));
}

export async function getTopPages(n: number) {
  const events = await getFilteredEvents(['page_view']);
  const pages: Record<string, { count: number; totalDuration: number }> = {};
  events.forEach(e => {
    const p = e.path ?? '/';
    if (!pages[p]) pages[p] = { count: 0, totalDuration: 0 };
    pages[p].count++;
    const data = e.data as any;
    if (typeof data?.duration === 'number') pages[p].totalDuration += data.duration;
  });
  return Object.entries(pages)
    .map(([page, data]) => ({ page, count: data.count, avgDuration: data.count ? data.totalDuration / data.count : 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

export async function getRecentErrors(n: number) {
  const events = await prisma.analyticsEvent.findMany({
    where: { type: 'error' },
    orderBy: { createdAt: 'desc' },
    take: n,
  });
  return events.map(e => ({
    id: e.id,
    type: e.type,
    path: e.path ?? '',
    sessionId: e.sessionId,
    timestamp: Number(e.timestamp),
    data: e.data as Record<string, unknown>,
  }));
}

export async function getAttackAttempts(n: number) {
  const events = await prisma.analyticsEvent.findMany({
    where: { type: 'security' },
    orderBy: { createdAt: 'desc' },
    take: n,
  });
  return events.map(e => ({
    id: e.id,
    type: e.type,
    path: e.path ?? '',
    sessionId: e.sessionId,
    timestamp: Number(e.timestamp),
    data: e.data as Record<string, unknown>,
  }));
}

export async function getPerformanceMetrics() {
  const apiEvents = await getFilteredEvents(['api_call']);
  const perfEvents = await getFilteredEvents(['performance']);
  const errorEvents = await getFilteredEvents(['error']);
  const totalEvents = await prisma.analyticsEvent.count();

  const avgApiTime = apiEvents.length
    ? apiEvents.reduce((sum, e) => sum + ((e.data as any)?.duration || 0), 0) / apiEvents.length
    : 0;
  const avgPageLoad = perfEvents.length
    ? perfEvents.reduce((sum, e) => sum + ((e.data as any)?.value || 0), 0) / perfEvents.length
    : 0;
  const errorRate = totalEvents ? (errorEvents.length / totalEvents) * 100 : 0;

  const pages = await getTopPages(10);
  const slowestPages = pages
    .map(p => ({ page: p.page, loadTime: p.avgDuration * 1000 }))
    .sort((a, b) => b.loadTime - a.loadTime);

  return {
    avgApiTime,
    avgPageLoad,
    errorRate: parseFloat(errorRate.toFixed(2)),
    slowestPages,
    totalEvents,
  };
}

export async function getBehaviorData() {
  const allEvents = await prisma.analyticsEvent.findMany();

  const clickEvents = allEvents.filter(e => e.type === 'click');
  const heatmapMap = new Map<string, { path: string; element: string; count: number }>();
  clickEvents.forEach(e => {
    const data = e.data as any;
    const key = `${e.path}::${data?.element || data?.tag || 'unknown'}`;
    const prev = heatmapMap.get(key);
    if (prev) {
      prev.count++;
    } else {
      const [path, element] = key.split('::');
      heatmapMap.set(key, { path, element, count: 1 });
    }
  });
  const clickHeatmap = Array.from(heatmapMap.values()).sort((a, b) => b.count - a.count);

  const navEvents = allEvents.filter(e => e.type === 'navigation');
  const navFlowMap = new Map<string, { from: string; to: string; count: number }>();
  navEvents.forEach(e => {
    const data = e.data as any;
    const from = data?.from;
    const to = data?.to;
    if (from && to) {
      const key = `${from}->${to}`;
      const prev = navFlowMap.get(key);
      if (prev) {
        prev.count++;
      } else {
        navFlowMap.set(key, { from, to, count: 1 });
      }
    }
  });
  const navigationFlow = Array.from(navFlowMap.values()).sort((a, b) => b.count - a.count);

  const durEvents = allEvents.filter(e => e.type === 'page_duration');
  const durMap = new Map<string, { totalDuration: number; visits: number }>();
  durEvents.forEach(e => {
    const data = e.data as any;
    const page = data?.page || e.path || '/';
    const duration = Number(data?.duration) || 0;
    const prev = durMap.get(page);
    if (prev) {
      prev.totalDuration += duration;
      prev.visits++;
    } else {
      durMap.set(page, { totalDuration: duration, visits: 1 });
    }
  });
  const pageDurations = Array.from(durMap.entries()).map(([page, data]) => ({
    page,
    avgSeconds: Math.round(data.totalDuration / data.visits / 1000),
    visits: data.visits,
  })).sort((a, b) => b.visits - a.visits);

  const actionCounts = new Map<string, number>();
  allEvents.forEach(e => {
    const type = e.type;
    if (!['navigation', 'page_duration', 'session_start', 'session_end'].includes(type)) {
      actionCounts.set(type, (actionCounts.get(type) || 0) + 1);
    }
  });
  const actionFrequency = Array.from(actionCounts.entries()).map(([action, count]) => ({
    action,
    count,
  })).sort((a, b) => b.count - a.count);

  return {
    clickHeatmap,
    navigationFlow,
    pageDurations,
    actionFrequency,
  };
}

export async function getProcessLog(n: number) {
  const events = await prisma.analyticsEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: n,
  });
  return events.map(e => ({
    id: e.id,
    type: e.type,
    path: e.path ?? '',
    sessionId: e.sessionId,
    timestamp: Number(e.timestamp),
    data: e.data as Record<string, unknown>,
  })).reverse();
}

export async function getStats() {
  const now = Date.now();
  const lastHour = now - 3600000;
  const totalEvents = await prisma.analyticsEvent.count();
  const eventsLastHour = await prisma.analyticsEvent.count({
    where: { timestamp: { gte: BigInt(lastHour) } },
  });
  return {
    totalEvents,
    activeSessions: Object.values(sessions).filter(s => s.isActive).length,
    totalSessions: Object.keys(sessions).length,
    eventsLastHour,
    topPages: await getTopPages(10),
    recentErrors: await getRecentErrors(5),
    performance: await getPerformanceMetrics(),
  };
}

// Новая функция: возвращает агрегированные данные по дням для указанных типов событий
export async function getBehaviorTimeline() {
  // Получаем все события за последние 30 дней (или все, если их мало)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const events = await prisma.analyticsEvent.findMany({
    where: {
      createdAt: { gte: thirtyDaysAgo },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Собираем статистику по дням
  const dailyMap = new Map<string, { clicks: number; pageViews: number; scrolls: number; errors: number }>();

  events.forEach(e => {
    const date = new Date(e.createdAt).toISOString().slice(0, 10); // YYYY-MM-DD
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { clicks: 0, pageViews: 0, scrolls: 0, errors: 0 });
    }
    const day = dailyMap.get(date)!;
    switch (e.type) {
      case 'click': day.clicks++; break;
      case 'page_view': day.pageViews++; break;
      case 'scroll': day.scrolls++; break;
      case 'error': day.errors++; break;
    }
  });

  // Преобразуем в массив, сортированный по дате
  const timeline = Array.from(dailyMap.entries())
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return timeline;
}