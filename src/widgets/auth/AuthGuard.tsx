"use client";

import { useAppSession } from "@/entities/session/use-app-session";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const PUBLIC_ROUTES = ["/auth/login", "/auth/register"];

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const session = useAppSession();
  const router = useRouter();
  const pathname = usePathname(); // Текущий путь

  
  useEffect(() => {
    if (!session.data && !PUBLIC_ROUTES.includes(pathname)) {
      router.push("/auth/login");
    }
  }, [session.data, pathname]);

  if (!session.data && !PUBLIC_ROUTES.includes(pathname)) {
    return null; // Пока идёт редирект — ничего не показываем
  }

  return <>{children}</>;
};