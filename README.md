# 📅 Calendar Task — Next.js App

This project is a **calendar planning web application** built with [Next.js](https://nextjs.org) and bootstrapped using [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 2. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application running.

The page will auto-update as you edit the source code. The main entry point is `app/page.tsx`.

---

## ⚙️ Environment Variables

Before starting, you need to create a `.env.local` file in the root of your project and add the following environment variables:

```env
DATABASE_URL="file:./dev.db"

GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_random_generated_secret"

GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

> ⚠️ **Do not commit your real credentials to version control.**  
> The values shown above are only examples — replace them with your own.

---

## 📚 Learn More

To learn more about Next.js, check out the following resources:

- [Next.js Documentation](https://nextjs.org/docs) — explore Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) — an interactive tutorial.
- [NextAuth.js Documentation](https://next-auth.js.org/) — authentication for Next.js apps.

---

## ☁️ Deployment

The easiest way to deploy your Next.js app is to use [Vercel](https://vercel.com), created by the team behind Next.js.

For more information, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

---
