'use client';

import { useState, useEffect } from 'react';

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = document.cookie
      .split('; ')
      .find((row) => row.startsWith('mentoplan_cookie_consent='));
    if (!consent) setShow(true);
  }, []);

  const accept = () => {
    document.cookie = 'mentoplan_cookie_consent=true; max-age=' + 60 * 60 * 24 * 365 + '; path=/';
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 text-slate-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
      <p className="text-sm">
        Используем cookies и Метрику для стабильной работы сайта, подробнее в{' '}
        <a href="/privacy" className="underline text-indigo-300 hover:text-indigo-200">
          политике конфиденциальности
        </a>
        .
      </p>
      <button
        onClick={accept}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shrink-0"
      >
        Принять
      </button>
    </div>
  );
}