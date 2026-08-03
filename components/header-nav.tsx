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
  Shield,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function HeaderNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const adminDropdownRef = useRef<HTMLDivElement>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Проверка авторизации админа
  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='));
    setIsAdmin(token?.split('=')[1] === 'true');
  }, [pathname]);

  const linkClassName = (href: string) =>
    cn(
      'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
      pathname === href
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
    );

  const isAdminActive = pathname.startsWith('/admin');

  // Закрываем dropdown при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setAdminOpen(false);
      }
    };
    if (adminOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [adminOpen]);

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
          {/* Аудит — одна ссылка на /super */}
          <Link href="/super" className={linkClassName('/super')}>
            <LayoutDashboard className="h-4 w-4" />
            Аудит
          </Link>

          <Link href="/about" className={linkClassName('/about')}>
            <Info className="h-4 w-4" />
            О проекте
          </Link>

          {/* Админское меню — только для авторизованных */}
          {isAdmin && (
            <div className="relative" ref={adminDropdownRef}>
              <button
                onClick={() => setAdminOpen(!adminOpen)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isAdminActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Shield className="h-4 w-4" />
                Админ
                <ChevronDown className={cn('h-3.5 w-3.5 opacity-50 transition-transform', adminOpen && 'rotate-180')} />
              </button>
              {adminOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 rounded-md border bg-popover p-1 shadow-md z-50">
                  <Link
                    href="/admin/analytics"
                    onClick={() => setAdminOpen(false)}
                    className={cn(
                      'block rounded-md px-3 py-2 text-sm transition-colors',
                      pathname === '/admin/analytics' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent'
                    )}
                  >
                    Аналитика
                  </Link>
                  <Link
                    href="/admin/messages"
                    onClick={() => setAdminOpen(false)}
                    className={cn(
                      'block rounded-md px-3 py-2 text-sm transition-colors',
                      pathname === '/admin/messages' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent'
                    )}
                  >
                    Сообщения
                  </Link>
                </div>
              )}
            </div>
          )}
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
          <Link href="/super" onClick={() => setMobileOpen(false)} className={linkClassName('/super')}>
            <LayoutDashboard className="h-4 w-4" />
            Аудит
          </Link>

          <Link href="/about" onClick={() => setMobileOpen(false)} className={linkClassName('/about')}>
            <Info className="h-4 w-4" />
            О проекте
          </Link>

          {/* Админ-меню в мобильной версии */}
          {isAdmin && (
            <>
              <div className="py-2 text-sm font-medium text-muted-foreground">Админ</div>
              <Link href="/admin/analytics" onClick={() => setMobileOpen(false)} className={linkClassName('/admin/analytics')}>
                Аналитика
              </Link>
              <Link href="/admin/messages" onClick={() => setMobileOpen(false)} className={linkClassName('/admin/messages')}>
                Сообщения
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}