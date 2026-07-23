'use client';

import { useEffect, useState } from 'react';

interface Props {
  /** Селектор целевого элемента, например '#submit-btn' */
  targetSelector: string;
  /** Ключ для localStorage, чтобы запомнить, что показывали */
  storageKey?: string;
}

export function FirstVisitOverlay({ targetSelector, storageKey = 'momento_onboarding_done' }: Props) {
  const [show, setShow] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    // Если уже видели – не показываем
    if (localStorage.getItem(storageKey)) return;

    const el = document.querySelector(targetSelector);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
      setShow(true);
    }
  }, [targetSelector, storageKey]);

  const handleDismiss = () => {
    localStorage.setItem(storageKey, '1');
    setShow(false);
  };

  if (!show || !targetRect) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={handleDismiss}
    >
      {/* Размытый фон */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Подсвеченная область (кнопка) */}
      <button
        className="absolute rounded-lg transition-all duration-300"
        style={{
          left: targetRect.left - 4,
          top: targetRect.top - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8,
        }}
        onClick={(e) => {
          e.stopPropagation();
          // Клик по кнопке сработает, но мы ещё закроем подсказку
          const realBtn = document.querySelector(targetSelector) as HTMLElement;
          if (realBtn) realBtn.click();
          handleDismiss();
        }}
      >
        <div className="relative w-full h-full">
          {/* Белая обводка с анимацией */}
          <div className="absolute inset-0 rounded-lg ring-2 ring-white ring-offset-2 ring-offset-transparent animate-pulse" />
          {/* Стрелка и подсказка */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-gray-900 text-sm font-medium px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
            👋 Начните здесь – введите данные и получите рекомендации
          </div>
        </div>
      </button>
    </div>
  );
}