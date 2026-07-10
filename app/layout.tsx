import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Мой аудит общепита",
  description: "Платформа для аудита и управления предприятиями общественного питания",
};

// Временные компоненты прямо внутри layout
function Header() {
  return (
    <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-800">Мой аудит общепита</h1>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Демо</span>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-500">Без авторизации</span>
      </div>
    </header>
  );
}

function Sidebar() {
  const menuItems = [
    { title: "Главная", href: "/" },
    { title: "Вводные данные", href: "/admin" },
    { title: "Моделирвоание", href: "/business" },
    { title: "ТТК (список)", href: "/ttk" },
    { title: "История", href: "/history" },
  ];

  return (
    <aside className="w-64 bg-white border-r p-4 flex flex-col h-full">
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {item.title}
          </Link>
        ))}
      </nav>
      <div className="border-t pt-4 text-sm text-gray-500">Версия 0.1.0</div>
    </aside>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full flex">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 bg-gray-50">{children}</main>
        </div>
      </body>
    </html>
  );
}