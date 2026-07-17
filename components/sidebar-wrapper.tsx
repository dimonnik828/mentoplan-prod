'use client';

import { usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/sidebar-nav';

export function SidebarWrapper() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;
  return <AppSidebar />;
}