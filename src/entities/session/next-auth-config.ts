import { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "../../lib/prisma";
import { compact } from "lodash-es";
import { privateConfig } from "@/settings/private";
import type { User } from "next-auth";
import { randomUUID } from "crypto";
import { serialize } from "cookie"; // для установки cookie

export const nextAuthConfig: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: compact([
    privateConfig.GITHUB_CLIENT_ID &&
      privateConfig.GITHUB_CLIENT_SECRET &&
      GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      }),
    privateConfig.GOOGLE_CLIENT_ID &&
      privateConfig.GOOGLE_CLIENT_SECRET &&
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials, req) {
          if (!credentials?.email || !credentials?.password) return null;
      
          const login = credentials.email.replace("@local", "");
      
          const account = await prisma.account.findFirst({
              where: {
                  provider: "credentials",
                  providerAccountId: login,
              },
              include: { user: true },
          });
      
          if (!account?.user || !account.hashedPassword) return null;
      
          const isValid = await compare(credentials.password, account.hashedPassword);
          if (!isValid) return null;
      
          const user = account.user;
      
          return {
            id: user.id,
            name: user.name ?? "",
            email: user.email ?? "",
            image: user.image ?? "",
            role: user.role ?? "user",
            groupId: user.groupId ?? ""
          };
      }
        
      }),
  ]),

  callbacks: {
    async session({ session, token }) {
      if (!session.user) {
        session.user = {
          id: "",
          role: "user",
          groupId: "",
          name: "",
          email: "",
          image: "",
        };
      }

      if (token?.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role ?? "user";
          session.user.groupId = dbUser.groupId ?? "";
          session.user.name = dbUser.name ?? "";
          session.user.email = dbUser.email ?? "";
          session.user.image = dbUser.image ?? "";
        }
      }

      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.sub = user.id;
      }
      return token;
    },

    async redirect({ url, baseUrl }) {
      console.log("🔄 [REDIRECT] Перенаправление:", { url, baseUrl });

      if (url.startsWith(baseUrl + "/auth/login")) {
        return baseUrl + "/profile";
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },

  events: {
    async signIn({ user }) {
      console.log("✅ [AUTH] Пользователь успешно вошел:", user.email);

      setTimeout(async () => {
        try {
          const accountRes = await prisma.account.findFirst({
            where: { userId: user.id },
            select: { provider: true, providerAccountId: true },
          });

          if (!accountRes) {
            console.warn("⚠️ [AUTH] Не найден provider для пользователя:", user.id);
            return;
          }

          console.log("🔵 [AUTH] Account найден в БД:", accountRes);

          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/users/init`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              provider: accountRes.provider,
              providerAccountId: accountRes.providerAccountId,
            }),
          });

          const result = await response.json();
          console.log("✅ [AUTH] Инициализация завершена:", result);
        } catch (error) {
          console.error("❌ [AUTH] Ошибка при инициализации пользователя:", error);
        }
      }, 500);
    },
  },
};
