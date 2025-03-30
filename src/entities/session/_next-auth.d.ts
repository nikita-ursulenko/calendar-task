// /Users/semenov/Документы/GitHub/Calendar Task/my-calendar-app/src/entities/session/_next-auth.d.ts

import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string;
            email: string;
            image?: string;
            role?: string; 
            githubId?: string; 
            googleId?: string;
            groupId?: string; // 🔹 Группа, к которой относится пользователь
        };
    }
    interface User {
        id: string;
        email: string;
        name?: string;
        image?: string;
        role?: string; 
        githubId?: string; 
        googleId?: string;
        groupId?: string; // 🔹 Группа, к которой относится пользователь
    }
}
