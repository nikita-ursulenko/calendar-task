import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  console.log(`🔹 Полученный userId: ${userId}`);

  if (!userId) {
    console.error('❌ Ошибка: Не указан userId');
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const events = await prisma.event.findMany({
      where: { userId },
      orderBy: { startTime: 'asc' }, // Сортируем по времени начала
    });


    // Преобразуем события в нужную структуру
    const formattedEvents = events.map(event => {
      const startDate = new Date(event.startTime);
      return {
        id: event.id,
        date: startDate.toLocaleDateString('sv-SE'), // yyyy-mm-dd (локальное время)
        hour: startDate.getHours(),
        firstName: event.firstName,
        lastName: event.lastName,
        procedure: event.procedure,
        startTime: event.startTime,
        endTime: event.endTime,
        duration: event.duration,
        userId: event.userId,
      };
    });
    return NextResponse.json(formattedEvents, { status: 200 });
  } catch (error) {
    console.error('❌ Ошибка при получении событий:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  console.log('🟢 [POST] Запрос на создание события поступил');

  const requestData = await req.json();

  const { firstName, lastName, procedure, startTime, duration, userId } = requestData;

  if (!firstName || !lastName || !procedure || !startTime || !duration || !userId) {
    console.error('❌ Ошибка: Отсутствуют обязательные поля');
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const endTime = new Date(new Date(startTime).getTime() + duration * 60000);

  try {
    const event = await prisma.event.create({
      data: {
        firstName,
        lastName,
        procedure,
        startTime,
        endTime,
        duration,
        userId: userId.toString(),
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('❌ Ошибка при создании события:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  console.log('🟢 [PUT] Запрос на обновление события поступил');
  
  const requestData = await req.json();

  const { id, firstName, lastName, procedure, startTime, duration, userId } = requestData;

  if (!id || !firstName || !lastName || !procedure || !startTime || !duration || !userId) {
    console.error('❌ Ошибка: Отсутствуют обязательные поля');
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const endTime = new Date(new Date(startTime).getTime() + duration * 60000);

  try {
    // Проверка на существование события
    const event = await prisma.event.findUnique({
      where: { id: id.toString() },
    });

    if (!event) {
      console.error('❌ Ошибка: Событие не найдено');
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Проверка прав доступа
    if (event.userId !== userId) {
      console.error('❌ Ошибка: Попытка обновить чужое событие');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Обновление события
    const updatedEvent = await prisma.event.update({
      where: { id: id.toString() },
      data: {
        firstName,
        lastName,
        procedure,
        startTime: new Date(startTime),
        endTime,
        duration,
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('❌ Ошибка при обновлении события:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {

  const requestData = await req.json();

  const { id, userId } = requestData;

  if (!id || !userId) {
    console.error('❌ Ошибка: Отсутствуют обязательные поля (id или userId)');
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Проверяем, существует ли событие с данным id
    const event = await prisma.event.findUnique({
      where: { id: id.toString() },
    });

    if (!event) {
      console.error(`❌ Ошибка: Событие с id ${id} не найдено в базе данных`);
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }


    // Проверяем, принадлежит ли событие этому пользователю
    if (event.userId !== userId) {
      console.error(`❌ Ошибка: Попытка удалить чужое событие (event.userId: ${event.userId}, userId: ${userId})`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }


    // Удаляем событие
    await prisma.event.delete({
      where: { id: id.toString() },
    });


    return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('❌ Ошибка при удалении события:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}