'use client';

import { usePathname } from 'next/navigation';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
import { HeaderNav } from '@/components/header-nav';
import { Toaster } from '@/components/ui/toaster';
import { CookieBanner } from '@/components/CookieBanner';
import Script from 'next/script';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Отключаем аналитику на страницах логина и аналитики
  const isAdminPage = pathname === '/admin/login' || pathname.startsWith('/admin/analytics');

  if (isAdminPage) {
    return (
      <>
        <HeaderNav />
        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
        <Toaster />
        <CookieBanner />
      </>
    );
  }

  // Для остальных страниц — полный комплект с аналитикой
  return (
    <>
      <AnalyticsProvider>
        <HeaderNav />
        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
        <Toaster />
      </AnalyticsProvider>

      {/* Яндекс.Метрика */}
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=110892278', 'ym');

          ym(110892278, 'init', {
            ssr:true,
            webvisor:true,
            clickmap:true,
            ecommerce:"dataLayer",
            referrer: document.referrer,
            url: location.href,
            accurateTrackBounce:true,
            trackLinks:true
          });
        `}
      </Script>
      <noscript>
        <div>
          <img
            src="https://mc.yandex.ru/watch/110892278"
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>

      <CookieBanner />
    </>
  );
}