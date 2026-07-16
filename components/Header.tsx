'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BarChart3, FileText, History,
  Settings, Wrench, Megaphone, Menu, X, LayoutGrid,
  ChevronDown,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    title: 'Основное',
    items: [
      {
        href: '#',
        label: 'Аудит',
        icon: LayoutDashboard,
        children: [
          { href: '/', label: 'Экспресс-аудит', icon: LayoutDashboard },
          { href: '/business', label: 'Расширенный аудит', icon: BarChart3 },
          { href: '/ttk', label: 'Технологические карты / Foodcost', icon: FileText },
          { href: '/history', label: 'История аудитов', icon: History },
        ],
      },
      { href: '/marketing', label: 'Маркетинг', icon: Megaphone },
    ],
  },
  {
    title: 'Система',
    items: [
      { href: '/admin/ttk', label: 'Управление ТТК', icon: Settings },
      { href: '/diagnostics', label: 'Диагностика', icon: Wrench },
    ],
  },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex items-center h-14 px-4 sm:px-6">
        {/* Логотип */}
        <Link href="/" className="flex items-center gap-2.5 mr-6 flex-shrink-0 no-underline">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--primary-light)' }}
          >
            <LayoutGrid size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <span className="text-sm font-bold tracking-tight hidden sm:inline" style={{ color: 'var(--text)' }}>
            MOMENTO
          </span>
        </Link>

        {/* Десктопная навигация */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="flex items-center gap-1 mr-2">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                const hasChildren = 'children' in item && item.children && item.children.length > 0;

                if (hasChildren) {
                  const isOpen = openMenus[item.label] || false;
                  return (
                    <div key={item.label} className="relative">
                      <button
                        onClick={() => toggleMenu(item.label)}
                        className={`nav-item whitespace-nowrap flex items-center gap-1 ${active ? 'active' : ''}`}
                      >
                        <Icon size={16} className="nav-icon" />
                        {item.label}
                        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[250px] z-50">
                          {(item as any).children.map((child: any) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() => toggleMenu(item.label)}
                            >
                              <child.icon size={16} className="text-gray-400" />
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item whitespace-nowrap ${active ? 'active' : ''}`}
                  >
                    <Icon size={16} className="nav-icon" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Правая часть */}
        <div className="ml-auto flex items-center gap-2">
          <span className="badge badge-neutral text-[11px] hidden sm:inline-flex">
            Аудит общепита
          </span>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Меню"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      {mobileOpen && (
        <div
          className="md:hidden border-t"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-card-hover)',
          }}
        >
          <nav className="flex flex-col p-2 gap-0.5">
            {NAV_GROUPS.map((group) => (
              <div key={group.title}>
                <div className="text-[11px] px-2 py-1 text-muted">{group.title}</div>
                {group.items.map((item: any) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  const hasChildren = item.children && item.children.length > 0;

                  if (hasChildren) {
                    const isOpen = openMenus[item.label] || false;
                    return (
                      <div key={item.label}>
                        <button
                          onClick={() => toggleMenu(item.label)}
                          className={`nav-item w-full text-left flex items-center justify-between ${active ? 'active' : ''}`}
                        >
                          <span className="flex items-center gap-2">
                            <Icon size={16} className="nav-icon" />
                            {item.label}
                          </span>
                          <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="pl-6 py-1 space-y-0.5">
                            {item.children.map((child: any) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => setMobileOpen(false)}
                                className="nav-item text-sm"
                              >
                                <child.icon size={14} className="nav-icon" />
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`nav-item ${active ? 'active' : ''}`}
                    >
                      <Icon size={16} className="nav-icon" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}