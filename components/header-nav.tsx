'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Info,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function HeaderNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const linkClassName = (href: string) =>
    cn(
      'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
      pathname === href
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
    );

  const isAuditActive = pathname === '/' || pathname === '/business';

  // Закрываем dropdown при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAuditOpen(false);
      }
    };
    if (auditOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [auditOpen]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Логотип */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">M</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground leading-tight">MOMENTO</span>
            <span className="text-[11px] text-muted-foreground leading-tight">Аналитика</span>
          </div>
        </Link>

        {/* Десктопная навигация */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Выпадающий "Аудит" */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setAuditOpen(!auditOpen)}
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isAuditActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Аудит
              <ChevronDown className={cn('h-3.5 w-3.5 opacity-50 transition-transform', auditOpen && 'rotate-180')} />
            </button>
            {auditOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 rounded-md border bg-popover p-1 shadow-md z-50">
                <Link
                  href="/"
                  onClick={() => setAuditOpen(false)}
                  className={cn(
                    'block rounded-md px-3 py-2 text-sm transition-colors',
                    pathname === '/' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent'
                  )}
                >
                  Экспресс-аудит
                </Link>
                <Link
                  href="/business"
                  onClick={() => setAuditOpen(false)}
                  className={cn(
                    'block rounded-md px-3 py-2 text-sm transition-colors',
                    pathname === '/business' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent'
                  )}
                >
                  Расширенный аудит
                </Link>
              </div>
            )}
          </div>

          <Link href="/about" className={linkClassName('/about')}>
            <Info className="h-4 w-4" />
            О проекте
          </Link>
        </nav>

        {/* Мобильная кнопка */}
        <button
          className="md:hidden p-2 -mr-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Меню"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Мобильное меню */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 pb-4 pt-2 space-y-1">
          <div className="py-2 text-sm font-medium text-muted-foreground">Аудит</div>
          <Link href="/" onClick={() => setMobileOpen(false)} className={linkClassName('/')}>
            Экспресс-аудит
          </Link>
          <Link href="/business" onClick={() => setMobileOpen(false)} className={linkClassName('/business')}>
            Расширенный аудит
          </Link>

          <Link href="/about" onClick={() => setMobileOpen(false)} className={linkClassName('/about')}>
            <Info className="h-4 w-4" />
            О проекте
          </Link>
        </div>
      )}
    </header>
  );
}