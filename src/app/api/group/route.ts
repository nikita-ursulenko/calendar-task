import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/entities/session/next-auth-config";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(nextAuthConfig);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ users: [] }, { status: 200 });
    }

    const group = await prisma.group.findFirst({
      where: { adminId: session.user.id },
      include: {
        users: {
          include: {
            accounts: {
              where: { provider: "credentials" },
              select: {
                providerAccountId: true,
                hashedPassword: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Группа не найдена" }, { status: 404 });
    }

    const { adminId, users, ...rest } = group;

    const enrichedUsers = users
      .map((user) => {
        const account = user.accounts?.[0];
        return {
          id: user.id,
          name: user.name,
          role: user.role,
          login: account?.providerAccountId ?? "",
          password: account?.hashedPassword ?? "",
          online: false,
        };
      });

    return NextResponse.json({ ...rest, adminId, users: enrichedUsers });
  } catch (error) {
    console.error("Ошибка при получении группы:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(nextAuthConfig);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Некорректное название группы" }, { status: 400 });
    }

    const updatedGroup = await prisma.group.updateMany({
      where: { adminId: session.user.id },
      data: { name },
    });

    if (!updatedGroup.count) {
      return NextResponse.json({ error: "Группа не найдена" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка при обновлении группы:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(nextAuthConfig);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Некорректный userId" }, { status: 400 });
    }

    // Удаляем связанные аккаунты, сессии и саму учетную запись
    await prisma.account.deleteMany({ where: { userId } });
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка при удалении пользователя:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}