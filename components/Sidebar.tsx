'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  History,
  Settings,
  Wrench,
  Megaphone,
} from 'lucide-react';

const navGroups = [
  {
    title: 'Основное',
    items: [
      { title: 'Дашборд', href: '/', icon: LayoutDashboard },
      { title: 'Бизнес-аналитика', href: '/business', icon: BarChart3 },
      { title: 'Маркетинг', href: '/marketing', icon: Megaphone },
    ],
  },
  {
    title: 'Данные',
    items: [
      { title: 'Технологические карты', href: '/ttk', icon: FileText },
      { title: 'История аудитов', href: '/history', icon: History },
    ],
  },
  {
    title: 'Система',
    items: [
      { title: 'Управление ТТК', href: '/admin/ttk', icon: Settings },
      { title: 'Диагностика', href: '/diagnostics', icon: Wrench },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 bg-white border-r flex flex-col z-40"
      style={{
        width: 'var(--sidebar-w)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Логотип */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'var(--primary)' }}
          >
            M
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: 'var(--text)', lineHeight: 1.2 }}>
              MOMENTO
            </div>
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Аудит общепита
            </div>
          </div>
        </Link>
      </div>

      {/* Навигация */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="nav-section-title">{group.title}</div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item ${active ? 'active' : ''}`}
                  >
                    <item.icon className="nav-icon" />
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Подвал */}
      <div
        className="px-5 py-3.5 border-t text-xs"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
        <div className="flex items-center justify-between">
          <span>v0.1.0</span>
          <span className="badge badge-neutral" style={{ fontSize: 10, padding: '1px 8px' }}>
            Демо
          </span>
        </div>
      </div>
    </aside>
  );
}