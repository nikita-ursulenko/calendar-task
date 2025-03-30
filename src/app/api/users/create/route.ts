import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcrypt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, login, password, role, groupId } = body;

    if (!login || !password) {
      return NextResponse.json({ message: "Логин и пароль обязательны" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        role,
        groupId,
        email: `${login}@local`, // ✅ добавляем email для совместимости
        accounts: {
          create: {
            type: "credentials",
            provider: "credentials",
            providerAccountId: login,
            hashedPassword,
          },
        },
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("❌ Ошибка при создании пользователя:", error);
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}