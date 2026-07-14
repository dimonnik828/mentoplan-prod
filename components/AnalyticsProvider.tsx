'use client';

import { useAnalytics } from '@/lib/useAnalytics';

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useAnalytics(); // просто запускает отслеживание
  return <>{children}</>;
}