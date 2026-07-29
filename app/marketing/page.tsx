// app/marketing/page.tsx
import type { Metadata } from 'next';
import MarketingClient from './components/MarketingClient';

export const generateMetadata = (): Metadata => ({
  title: 'Маркетинг для ресторана — MOMENTO',
  description:
    'Управление акциями, программа лояльности, каналы привлечения гостей. Увеличьте поток посетителей и средний чек.',
  keywords: [
    'маркетинг для ресторана',
    'программа лояльности для кафе',
    'как привлечь гостей в кафе',
    'управление акциями ресторана',
  ],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Маркетинг и гости | MOMENTO',
    description: 'Инструменты для продвижения и удержания клиентов.',
    type: 'website',
    locale: 'ru_RU',
  },
});

export default function Page() {
  return <MarketingClient />;
}