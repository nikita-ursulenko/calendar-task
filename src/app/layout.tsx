"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { QueryProvider } from "@/app/_providers/query-provider";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LoadingScreen } from "@/components/LoadingScreen";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage =
    pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register");

  const [loading, setLoading] = useState(true); // Статус загрузки
  const [redirected, setRedirected] = useState(false); // Статус редиректа

  useEffect(() => {
    console.log("🔍 [AuthGuard] useEffect сработал");
    console.log("📍 Путь:", pathname);
    console.log("🔐 Статус сессии:", status);
    console.log("🧭 Это auth-страница?", isAuthPage);
    console.log("🔁 Уже был редирект?", redirected);

    const timer = setTimeout(() => {
      console.log("⏳ Таймер загрузки завершён");
      setLoading(false);
    }, 1500);

    if (status === "unauthenticated" && !isAuthPage && !redirected) {
      console.log("🚫 Неавторизованный доступ — перенаправляем на /auth/login");
      setRedirected(true);
      router.push("/auth/login");
    }

    return () => {
      console.log("🧹 Очистка таймера");
      clearTimeout(timer);
    };
  }, [status, pathname, router, redirected]);

  if (status === "loading" || loading) {
    console.log("⏳ Показываем экран загрузки...");
    return <LoadingScreen />;
  }

  console.log("✅ Пользователь авторизован. Показываем контент.");
  return <>{children}</>;
};

export default function RootLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
          <QueryProvider>
            <AuthGuard>{children}</AuthGuard>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}