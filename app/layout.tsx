import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '../components/Sidebar';

export const metadata: Metadata = {
  title: 'MOMENTO — Аудит общепита',
  description: 'Анализ бизнеса, технологические карты, диагностика',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main
            className="flex-1 overflow-y-auto"
            style={{ marginLeft: 'var(--sidebar-w)' }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}