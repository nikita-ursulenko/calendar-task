import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  try {
    const { userId, provider, providerAccountId } = await req.json();

    console.log("🔵 [INIT] Получены данные запроса:", { userId, provider, providerAccountId });

    if (!userId || !provider || !providerAccountId) {
      console.warn("⚠️ [INIT] Недостаточно данных для обработки запроса");
      return NextResponse.json({ error: "Недостаточно данных" }, { status: 400 });
    }

    // Проверяем, есть ли пользователь в базе
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, groupId: true, githubId: true, googleId: true },
    });

    if (!existingUser) {
      console.error("❌ [INIT] Ошибка: Пользователь не найден в базе данных");
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    console.log("🟢 [INIT] Найден пользователь в базе:", existingUser);

    const updateData: any = {};

    // Привязываем providerId, если его нет
    if (provider === "github" && !existingUser.githubId) {
      updateData.githubId = providerAccountId;
      updateData.role = "admin";
      console.log("✅ [INIT] Привязали GitHub ID и назначили роль 'admin'");
    }
    if (provider === "google" && !existingUser.googleId) {
      updateData.googleId = providerAccountId;
      updateData.role = "admin";
      console.log("✅ [INIT] Привязали Google ID и назначили роль 'admin'");
    }

    // Создаем группу, если её нет
    if (!existingUser.groupId) {
      const newGroupId = nanoid(10);
      const newGroup = await prisma.group.create({
        data: {
          id: newGroupId,
          name: `Группа ${newGroupId}`,
          adminId: userId,
        },
      });

      updateData.groupId = newGroup.id;
      console.log("✅ [INIT] Создана новая группа:", newGroup);
    }

    // Если есть, что обновлять, выполняем update
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
      console.log("✅ [INIT] Данные пользователя обновлены:", updateData);
      return NextResponse.json({ message: "✅ Данные пользователя обновлены", updateData });
    }

    console.log("🔹 [INIT] Никаких изменений не требуется, пользователь уже настроен.");
    return NextResponse.json({ message: "🔹 Никаких изменений не требуется" });
  } catch (error) {
    console.error("❌ [INIT] Ошибка инициализации пользователя:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}