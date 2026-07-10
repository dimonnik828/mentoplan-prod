// lib/usePlan.ts
import { useState, useEffect } from 'react';

export function usePlan() {
  const [plan, setPlan] = useState<string[]>([]);

  // Загружаем сохранённый план при монтировании
  useEffect(() => {
    const stored = localStorage.getItem('momentoplan');
    if (stored) {
      try {
        setPlan(JSON.parse(stored));
      } catch {
        setPlan([]);
      }
    }
  }, []);

  // Добавляем действие
  const addAction = (id: string) => {
    if (plan.includes(id)) return; // уже есть
    const newPlan = [...plan, id];
    setPlan(newPlan);
    localStorage.setItem('momentoplan', JSON.stringify(newPlan));
  };

  // Удаление (опционально)
  const removeAction = (id: string) => {
    const newPlan = plan.filter((item) => item !== id);
    setPlan(newPlan);
    localStorage.setItem('momentoplan', JSON.stringify(newPlan));
  };

  return { plan, addAction, removeAction };
}