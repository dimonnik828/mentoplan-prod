'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BarChart3, FileText, History,
  Settings, Wrench, Megaphone, Menu, X, LayoutGrid, ChevronDown, Info,
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
          { href: '/ttk', label: 'Техкарты / Foodcost', icon: FileText },
          { href: '/history', label: 'История аудитов', icon: History },
        ],
      },
      { href: '/marketing', label: 'Маркетинг', icon: Megaphone },
      { href: '/about', label: 'О проекте', icon: Info },
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

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['audit']));

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <nav className="flex flex-col h-full">
      <div className="px-5 pt-6 pb-4">
        <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">M</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground leading-tight">MOMENTO</span>
            <span className="text-[11px] text-muted-foreground leading-tight">Аналитика</span>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-4">
            <div className="px-3 mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{group.title}</span>
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                if ('children' in item) {
                  const isOpen = expanded.has(item.label);
                  const isChildActive = item.children?.some((c) => c.href === pathname);
                  return (
                    <div key={item.label}>
                      <button
                        onClick={() => toggle(item.label)}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors ${
                          isChildActive ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        }`}
                      >
                        <item.icon className="h-[18px] w-[18px] shrink-0" />
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="mt-0.5 ml-4 space-y-0.5 border-l border-border pl-3">
                          {item.children?.map((child) => {
                            const active = pathname === child.href;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={onClose}
                                className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors ${
                                  active ? 'font-semibold text-primary bg-primary/8' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                                }`}
                              >
                                <child.icon className="h-4 w-4 shrink-0 opacity-70" />
                                <span>{child.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href!}
                    onClick={onClose}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors ${
                      active ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border px-5 py-3">
        <p className="text-[11px] text-muted-foreground">MOMENTO Analytics v1.0</p>
      </div>
    </nav>
  );
}

export function AppSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r bg-background h-screen sticky top-0">
        <NavContent />
      </aside>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 border-b bg-background/95 backdrop-blur px-4 h-14">
        <button onClick={() => setOpen(!open)} className="-ml-1 p-2">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">M</span>
          </div>
          <span className="text-sm font-bold text-foreground">MOMENTO</span>
        </div>
        {open && (
          <div className="absolute top-14 left-0 right-0 bg-background border-b z-50 shadow-lg">
            <NavContent onClose={() => setOpen(false)} />
          </div>
        )}
      </div>
    </>
  );
}