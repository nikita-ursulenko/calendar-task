import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        name: { not: null },
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    return NextResponse.json([], { status: 500 });
  }
}