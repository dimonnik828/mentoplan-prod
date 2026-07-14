// app/page.tsx
import type { Metadata } from 'next';
import DashboardClient from './components/DashboardClient';

export const generateMetadata = (): Metadata => ({
  title: 'MOMENTO — Аудит и аналитика прибыли ресторана',
  description:
    'Онлайн-калькулятор фудкоста, анализ рентабельности, аудит ресторана. Управленческий учёт для владельцев кафе, ресторанов и общепита в Москве.',
  keywords: [
    'аудит ресторана',
    'рассчитать фудкост',
    'бизнес-аналитика общепита',
    'программа для управления рестораном',
    'калькулятор прибыли ресторана',
    'автоматизация кафе Москва',
  ],
  openGraph: {
    title: 'MOMENTO — Аудит и аналитика ресторана',
    description: 'Инструмент для расчёта прибыли, фудкоста и аренды заведения.',
    type: 'website',
    locale: 'ru_RU',
  },
  robots: {
    index: true,
    follow: true,
  },
});

export default function Page() {
  return <DashboardClient />;
}