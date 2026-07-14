// app/business/page.tsx
import type { Metadata } from 'next';
import BusinessClient from './components/BusinessClient';

export const generateMetadata = (): Metadata => ({
  title: 'Бизнес-аналитика ресторана — MOMENTO',
  description:
    'Расчёт пропускной способности, ФОТ, аренды, вентиляции. Оптимизируйте прибыль вашего кафе или ресторана.',
  keywords: [
    'анализ прибыли кафе',
    'рассчитать фудкост онлайн',
    'аренда ресторана норма',
    'калькулятор себестоимости блюд',
    'доля ФОТ в выручке',
  ],
  openGraph: {
    title: 'Бизнес-аналитика ресторана | MOMENTO',
    description: 'Глубокий анализ финансовых показателей заведения.',
    type: 'website',
    locale: 'ru_RU',
  },
});

export default function Page() {
  return <BusinessClient />;
}