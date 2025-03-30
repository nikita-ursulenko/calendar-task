//Users/semenov/Документы/GitHub/Calendar Task/my-calendar-app/src/entities/session/app-session-provider.tsx
"use client";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export function AppSessionProvider({
    children,
}: { 
    children: React.ReactNode;
}) {
    return (
        <NextAuthSessionProvider>
            {children}
        </NextAuthSessionProvider>
    );
}