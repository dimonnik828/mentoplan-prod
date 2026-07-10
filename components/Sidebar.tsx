'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  {
    title: 'Главная',
    href: '/',
  },
  {
    title: 'Бизнес',
    href: '/business',
  },
  {
    title: 'ТТК (список)',
    href: '/ttk',
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <aside className="w-64 bg-white border-r p-4 flex flex-col h-full">
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isItemActive = isActive(item.href);
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isItemActive
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.title}
              </Link>
              {item.children && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(child.href)
                          ? 'bg-gray-200 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="border-t pt-4 text-sm text-gray-500">
        Версия 0.1.0
      </div>
    </aside>
  );
}