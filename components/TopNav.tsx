'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BarChart3, FileText, History } from 'lucide-react';

export function TopNav() {
  const pathname = usePathname();

  const menuItems = [
    { title: 'Главная', href: '/', icon: LayoutDashboard },
    { title: 'Бизнес-аналитика', href: '/business', icon: BarChart3 },
    { title: 'ТТК (список)', href: '/ttk', icon: FileText },
    { title: 'История', href: '/history', icon: History },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-8">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-gray-800">Мой аудит общепита</span>
        </Link>
        <div className="flex space-x-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon size={18} />
                {item.title}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full border border-gray-200">Демо</span>
        <span className="text-sm text-gray-500">Без авторизации</span>
      </div>
    </nav>
  );
}