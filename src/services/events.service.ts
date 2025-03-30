// events.service.ts
import prisma from '@/lib/prisma';

export async function addEvent(eventData: {
  firstName: string;
  lastName: string;
  procedure: string;
  startTime: string;
  endTime: string;
  duration: number;
  userId: string;
}) {
  const { firstName, lastName, procedure, startTime, endTime, duration, userId } = eventData;

  // Проверяем, что все обязательные поля присутствуют
  if (!firstName || !lastName || !procedure || !startTime || !endTime || !duration || !userId) {
    throw new Error('Missing required fields');
  }

  try {
    // Добавление события в базу данных с использованием Prisma
    const event = await prisma.event.create({
      data: {
        firstName,
        lastName,
        procedure,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration,
        userId,
      },
    });
    return event;
  } catch (error) {
    console.error('❌ Ошибка при создании события:', error);
    throw new Error('Failed to create event');
  }
}