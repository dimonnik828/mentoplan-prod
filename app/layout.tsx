// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mentoplan.ru";

export const metadata: Metadata = {
  title: "MOMENTO — Аналитика ресторанного бизнеса",
  description: "Экспресс-аудит и аналитика показателей ресторана",
  icons: {
    icon: "/favicon.ico",
  },
  verification: {
    yandex: "7614d7c98e06cc37", // ← добавлено
  },
  openGraph: {
    title: "MOMENTO — Аналитика ресторанного бизнеса",
    description: "Экспресс-аудит и аналитика показателей ресторана",
    url: SITE_URL,
    siteName: "MOMENTO",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "MOMENTO — Аналитика ресторанного бизнеса",
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MOMENTO — Аналитика ресторанного бизнеса",
    description: "Экспресс-аудит и аналитика показателей ресторана",
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}