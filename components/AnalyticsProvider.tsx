'use client';

import { useEffect, useRef } from 'react';

const ENDPOINT = '/api/admin/analytics/track';
const BATCH_INTERVAL = 5000;

function getElementClass(target: Element): string {
  if (typeof target.className === 'string') {
    return target.className.split(/\s+/)[0] || '';
  }
  if (target.className && typeof (target.className as any).baseVal === 'string') {
    return (target.className as any).baseVal.split(/\s+/)[0] || '';
  }
  return '';
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const buffer = useRef<Record<string, unknown>[]>([]);
  const sessionId = useRef(crypto.randomUUID());
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentPage = useRef<string>('');
  const pageEnterTime = useRef<number>(0);

  const flush = async () => {
    if (buffer.current.length === 0) return;
    const batch = [...buffer.current];
    buffer.current = [];
    try {
      await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch }),
      });
    } catch (e) {
      buffer.current = [...batch, ...buffer.current];
    }
  };

  const track = (event: Record<string, unknown>) => {
    buffer.current.push({
      ...event,
      sessionId: sessionId.current,
      timestamp: Date.now(),
    });
  };

  const endCurrentPage = () => {
    const duration = Date.now() - pageEnterTime.current;
    if (duration > 0) {
      track({
        type: 'page_duration',
        path: currentPage.current,
        data: {
          page: currentPage.current,
          duration,
        },
      });
    }
  };

  const collectPerformanceMetrics = (pagePath?: string) => {
    setTimeout(() => {
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries.length > 0) {
        const nav = navEntries[0] as PerformanceNavigationTiming;
        const pageLoadTime = nav.loadEventEnd > 0
          ? nav.loadEventEnd - nav.fetchStart
          : nav.domContentLoadedEventEnd - nav.fetchStart;
        const ttfb = nav.responseStart - nav.fetchStart;
        if (pageLoadTime > 0) {
          track({
            type: 'performance',
            path: pagePath || currentPage.current,
            data: {
              metric: 'page_load',
              value: Math.round(pageLoadTime),
              ttfb: Math.round(ttfb),
            },
          });
        }
      }
    }, 0);
  };

  const handlePageChange = (newPath: string) => {
    if (newPath !== currentPage.current) {
      endCurrentPage();
      track({
        type: 'navigation',
        path: newPath,
        data: {
          from: currentPage.current,
          to: newPath,
        },
      });
      currentPage.current = newPath;
      pageEnterTime.current = Date.now();
      collectPerformanceMetrics(newPath);
    }
    track({ type: 'page_view', path: newPath });
  };

  useEffect(() => {
    currentPage.current = window.location.pathname;
    pageEnterTime.current = Date.now();

    timer.current = setInterval(flush, BATCH_INTERVAL);

    const handleUnload = () => {
      endCurrentPage();
      flush();
    };
    window.addEventListener('beforeunload', handleUnload);

    const pushState = history.pushState;
    history.pushState = function (...args) {
      pushState.apply(this, args);
      handlePageChange(window.location.pathname);
    };
    window.addEventListener('popstate', () => {
      handlePageChange(window.location.pathname);
    });

    track({ type: 'page_view', path: currentPage.current });
    collectPerformanceMetrics(currentPage.current);

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName?.toLowerCase() || '';
      const id = target.id ? `#${target.id}` : '';
      const cls = getElementClass(target);
      const classStr = cls ? `.${cls}` : '';
      const element = tag + id + classStr;
      track({
        type: 'click',
        path: window.location.pathname,
        data: { element, tag: target.tagName },
      });
    };
    document.addEventListener('click', handleClick, true);

    let lastDepth = 0;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.round((scrollY / docHeight) * 100);
      const checkpoints = [25, 50, 75, 90];
      for (const cp of checkpoints) {
        if (pct >= cp && lastDepth < cp) {
          lastDepth = cp;
          track({
            type: 'scroll',
            path: window.location.pathname,
            data: { depth: cp },
          });
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleError = (e: ErrorEvent) => {
      track({
        type: 'error',
        path: window.location.pathname,
        data: {
          message: e.message,
          lineno: e.lineno,
          colno: e.colno,
          filename: e.filename,
        },
      });
    };
    window.addEventListener('error', handleError);

    const handleRejection = (e: PromiseRejectionEvent) => {
      track({
        type: 'error',
        path: window.location.pathname,
        data: {
          message: e.reason?.message || 'Unhandled rejection',
          source: 'promise',
        },
      });
    };
    window.addEventListener('unhandledrejection', handleRejection);

    const originalFetch = window.fetch;
    window.fetch = async function (...args: Parameters<typeof fetch>) {
      const start = performance.now();
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - start;
        track({
          type: 'api_call',
          path: window.location.pathname,
          data: {
            endpoint: args[0],
            duration,
            status: response.status,
          },
        });
        return response;
      } catch (error) {
        const duration = performance.now() - start;
        track({
          type: 'api_call',
          path: window.location.pathname,
          data: {
            endpoint: args[0],
            duration,
            status: 0,
            error: (error as Error).message,
          },
        });
        throw error;
      }
    };

    return () => {
      if (timer.current) clearInterval(timer.current);
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
      window.fetch = originalFetch;
      history.pushState = pushState;
    };
  }, []);

  return <>{children}</>;
}