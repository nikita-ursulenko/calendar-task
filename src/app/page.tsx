"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Перенаправление на /profile
    router.push("/profile");
  }, [router]);

  return null; // Пустой возврат, так как редирект уже сработал
}