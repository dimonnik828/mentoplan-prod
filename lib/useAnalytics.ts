// lib/useAnalytics.ts
'use client';

import { useEffect, useRef, useCallback } from 'react';

let sessionId: string | null = null;

async function getSessionId(): Promise<string> {
  if (sessionId) return sessionId;
  const res = await fetch('/api/analytics');
  const data = await res.json();
  sessionId = data.sessionId;
  return sessionId;
}

async function sendEvent(type: string, page?: string, data?: any) {
  try {
    const sid = await getSessionId();
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sid,
        type,
        page: page || window.location.pathname,
        data,
      }),
    });
  } catch (e) {
    // тихо
  }
}

export function useAnalytics() {
  const startTime = useRef(Date.now());
  const currentPage = useRef<string | null>(null);
  const clicksRef = useRef<any[]>([]);

  useEffect(() => {
    currentPage.current = window.location.pathname;
    sendEvent('pageview', currentPage.current);

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.tagName === 'INPUT') {
        const clickData = {
          tag: target.tagName,
          text: target.textContent?.slice(0, 50) || '',
          id: target.id || '',
          className: target.className?.slice(0, 50) || '',
          x: e.clientX,
          y: e.clientY,
          timestamp: Date.now(),
        };
        clicksRef.current.push(clickData);
        sendEvent('click', currentPage.current || window.location.pathname, clickData);
      }
    };

    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
      sendEvent('time_on_page', currentPage.current || window.location.pathname, {
        seconds: timeSpent,
        clicks: clicksRef.current.length,
      });
    };
  }, []);

  const trackError = useCallback((message: string) => {
    sendEvent('error', window.location.pathname, { message });
  }, []);

  return { trackError };
}