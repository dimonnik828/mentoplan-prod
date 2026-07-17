// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SidebarWrapper } from "@/components/sidebar-wrapper";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MOMENTO — Аналитика ресторанного бизнеса",
  description: "Экспресс-аудит и аналитика показателей ресторана",
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AnalyticsProvider>
          <div className="flex min-h-screen">
            <SidebarWrapper />
            <main className="flex-1 min-w-0">
              <div className="lg:hidden h-14" />
              {children}
            </main>
          </div>
          <Toaster />
        </AnalyticsProvider>
      </body>
    </html>
  );
}