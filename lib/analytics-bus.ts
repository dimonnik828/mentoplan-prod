// lib/analytics-bus.ts
type Listener = (event: Record<string, unknown>) => void;
let listener: Listener | null = null;

export function setAnalyticsListener(fn: Listener) {
  listener = fn;
}

export function sendAnalyticsEvent(event: Record<string, unknown>) {
  if (listener) listener(event);
}