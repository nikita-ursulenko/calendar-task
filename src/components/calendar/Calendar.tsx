"use client";
// /Users/semenov/Документы/GitHub/Calendar Task/my-calendar-app/src/components/calendar/Calendar.tsx
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Europe/Moscow');
import "dayjs/locale/ru"; // Импортируем русскую локализацию
import ViewModeButtons from "./ViewModeButtons";
import DayView from "./DayView";
import ScheduleView from "./ScheduleView";
import MonthView from "./MonthView";
import YearView from "./YearView";
import { useGenerateDays } from "@/hooks/useGenerateDays";
import UsersList from './UserList';
import { useAppSession } from "@/entities/session/use-app-session";

const Calendar: React.FC = () => {

  const session = useAppSession();
  // Получаем userId из сессии
  const userId = session.data?.user.id
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [viewMode, setViewMode] = useState<"day" | "month" | "year">("day");
  const [isScheduleOpen, setIsScheduleOpen] = useState(false); // Состояние для расписания

  const [containerHeight, setContainerHeight] = useState(0);
  // Стейт для хранения событий
  const [events, setEvents] = useState<{ [key: string]: {id: string; time: string; firstName: string; lastName: string; procedure: string; duration: number } }>({});

  useEffect(() => {
    if (!activeUserId) return;
    // Функция для получения событий с сервера
    const fetchEvents = async () => {
      try {
        // Отправляем GET-запрос на сервер для получения списка событий пользователя
        const response = await fetch(`/api/users-events?userId=${activeUserId}`);
  
        // Проверяем, успешно ли выполнен запрос (статус HTTP 200-299)
        if (!response.ok) {
          throw new Error('Ошибка загрузки данных'); // Генерируем ошибку, если сервер вернул ошибку
        }
  
        // Преобразуем ответ сервера в JSON-формат
        const data = await response.json();
        console.log("📥 Данные от сервера:", data);
  
        /**
         * Создаём пустой объект `formattedEvents`, куда будем сохранять отформатированные события.
         * Ключи будут в формате `"YYYY-MM-DD ЧЧ:ММ"`, а значения — объект с информацией о событии.
         */
        const formattedEvents: {
          [key: string]: { 
            id: string; 
            time: string; 
            firstName: string; 
            lastName: string; 
            procedure: string; 
            duration: number;
          };
        } = {};
  
        /**
         * Обрабатываем каждый объект `event`, полученный от сервера.
         * `data.forEach` проходит по массиву событий и формирует удобный объект `formattedEvents`.
         */
        data.forEach((event: any) => {
          // Преобразуем `startTime` из строки в объект `Date`
          const startTime = new Date(event.startTime);
  
          // Получаем часы события и приводим к формату двух цифр (например, "09" вместо "9")
          const hours = startTime.getHours().toString().padStart(2, "0");
  
          // Получаем минуты события и также приводим к формату двух цифр
          const minutes = startTime.getMinutes().toString().padStart(2, "0");
  
          // Формируем уникальный ключ события в формате `"YYYY-MM-DD ЧЧ:ММ"`
          const eventKey = `${event.date} ${hours}:${minutes}`;
  
          /**
           * Сохраняем информацию о событии в объект `formattedEvents`
           * - `id` — идентификатор события из базы данных.
           * - `time` — время начала события в формате `"ЧЧ:ММ"`.
           * - `firstName`, `lastName`, `procedure`, `duration` — данные о клиенте и услуге.
           */
          formattedEvents[eventKey] = {
            id: event.id,
            time: `${hours}:${minutes}`, // Используем точное время
            firstName: event.firstName,
            lastName: event.lastName,
            procedure: event.procedure,
            duration: event.duration,
          };
        });
  
        // Обновляем состояние `events`, передавая новый отформатированный объект
        setEvents(formattedEvents);
      } catch (error) {
        // Если произошла ошибка во время запроса, логируем её в консоль
        console.error('❌ Ошибка при загрузке событий:', error);
      }
    };
  
    // Вызываем `fetchEvents`, чтобы загрузить события с сервера при изменении `userId`
    fetchEvents();
  }, [activeUserId, session.status]); // `useEffect` выполняется каждый раз при изменении `activeUserId`
  // Функция Добавления события
  const addEventHandler = async (
    date: string, // Дата события в формате YYYY-MM-DD
    time: string, // Время события в формате ЧЧ:ММ
    firstName: string, // Имя клиента
    lastName: string, // Фамилия клиента
    procedure: string, // Название процедуры
    duration: number, // Длительность события в минутах
    userId: string // ID пользователя, который добавляет событие
) => {
    console.log("Шаг 1: Начинаем добавление события...");

    // Проверяем, есть ли userId в сессии
    if (!userId) {
        console.log("Ошибка: Не удалось найти userId из сессии");
        return; // Если userId отсутствует, выходим из функции
    }

    console.log(`Шаг 2: Формируем дату и время: ${date} ${time}`);
    
    // Разбиваем строку времени (ЧЧ:ММ) на часы и минуты, преобразуем их в числа
    const [hour, minutes] = time.split(":").map(Number);

    // Форматируем часы и минуты так, чтобы они всегда были двухзначными (например, "09" вместо "9")
    const formattedHour = hour.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    console.log(`Шаг 2: Формируем дату и время: ${date} ${formattedHour}:${formattedMinutes}`);

    // Создаем объект `startTime`, представляющий дату и время начала события в формате ISO 8601
    const startTime = dayjs(`${date} ${formattedHour}:${formattedMinutes}`, "YYYY-MM-DD HH:mm").toISOString();

    console.log(`Шаг 3: Отправляем запрос на сервер...  ${startTime}` );
    
    try {
        // Отправляем POST-запрос на API для создания нового события
        const response = await fetch('/api/users-events', {
            method: 'POST', // Указываем метод запроса
            headers: { 'Content-Type': 'application/json' }, // Указываем, что отправляем JSON-данные
            body: JSON.stringify({ 
                firstName, // Имя клиента
                lastName,  // Фамилия клиента
                procedure, // Название процедуры
                startTime, // Дата и время начала события в формате ISO 8601
                duration,  // Длительность события в минутах
                userId     // Идентификатор пользователя
            }),
        });

        // Преобразуем ответ сервера в JSON-объект
        const event = await response.json();

        // Проверяем, успешно ли выполнен запрос (статус HTTP 200-299)
        if (!response.ok) {
            console.error("❌ Ошибка при создании события:", event.error);
            return; // Если ошибка, выходим из функции
        }
        
        // Обновляем состояние `events`, добавляя новое событие
        setEvents((prevEvents) => {
            const newEvents = { ...prevEvents }; // Создаем копию текущего объекта событий (чтобы не мутировать state)
          
            // Создаем уникальный ключ для события в формате "YYYY-MM-DD ЧЧ:ММ"
            const [h, m] = time.split(":");
            const formattedTime = `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
            const eventKey = `${date} ${formattedTime}`;
            
            // Добавляем новое событие в `newEvents`
            newEvents[eventKey] = {
                id: event.id,  // ID нового события, полученный от сервера
                time,          // Время события (ЧЧ:ММ)
                firstName,     // Имя клиента
                lastName,      // Фамилия клиента
                procedure,     // Название процедуры
                duration,      // Длительность события в минутах
            };

            console.log("📌 Добавляем событие с ключом:", eventKey);
            console.log("✅ Обновленный `events` (гарантированно новый объект):", newEvents);
            
            return { ...newEvents }; // Возвращаем новый объект событий, чтобы React перерисовал компонент
        });

    } catch (error) {
        // Если произошла ошибка в процессе выполнения запроса (например, сервер недоступен)
        console.error("❌ Ошибка при выполнении запроса:", error);
    }
};
  // Функция Изменения события
  const editEvent = async (
    id: string, // Уникальный идентификатор события
    date: string, // Дата события (формат YYYY-MM-DD)
    time: string, // Время события (формат ЧЧ:ММ)
    firstName: string | undefined, // Имя клиента (может быть undefined)
    lastName: string | undefined, // Фамилия клиента (может быть undefined)
    procedure: string | undefined, // Название процедуры (может быть undefined)
    duration: number | undefined, // Длительность события в минутах (может быть undefined)
    userId: string // ID пользователя, который редактирует событие
  ) => {
    // Разбиваем строку `time` (ЧЧ:ММ) на часы и минуты, преобразуем в числа
    const [hour, minutes] = time.split(":").map(Number);

    // Формируем уникальный ключ для события в формате `"YYYY-MM-DD ЧЧ:ММ"`
    const key = `${date} ${hour}:${minutes}`;
    console.log(`🟢 Шаг 1: Начинаем редактирование события с ключом ${key}...`);

    try {
        console.log("🔹 Проверяем перед созданием startTime:", { date, hour });

        // Используем dayjs для корректного форматирования даты и преобразования в ISO 8601
        const startTime = dayjs.tz(`${date} ${hour}:${minutes || 0}`, "YYYY-MM-DD HH:mm").toISOString();

        console.log("🔹 Форматированный startTime:", startTime);

        console.log("🔹 Шаг 2: Отправка запроса на сервер для обновления события...");

        // Отправляем `PUT`-запрос на сервер для обновления события
        const response = await fetch("/api/users-events", {
            method: "PUT", // Используем метод `PUT` для обновления данных
            headers: {
                "Content-Type": "application/json", // Сообщаем серверу, что отправляем JSON
            },
            body: JSON.stringify({
                id, // Передаём ID редактируемого события
                firstName, // Обновлённое имя клиента
                lastName, // Обновлённая фамилия клиента
                procedure, // Обновлённая процедура
                startTime, // Время начала события (в формате ISO 8601)
                duration, // Обновлённая длительность события в минутах
                userId, // ID пользователя, совершающего редактирование
            }),
        });

        // Проверяем, успешно ли выполнен запрос
        if (!response.ok) {
            throw new Error(`Ошибка при обновлении: ${response.statusText}`);
        }

        // Получаем обновлённые данные события от сервера
        const updatedEvent = await response.json();

        // Обновляем состояние `events`, заменяя старое событие новым
        setEvents((prevEvents) => {
            console.log("🔹 Шаг 3: Обновляем список событий в state...");

            // Создаём новый объект `newEvents`, чтобы не мутировать состояние напрямую
            const newEvents = { ...prevEvents, [key]: updatedEvent };

            console.log("📌 Обновленный список событий:", newEvents);

            return newEvents; // Возвращаем новый объект, что приведёт к обновлению UI
        });

        console.log("🟢 Шаг 4: Редактирование события завершено.");
    } catch (error) {
        // В случае ошибки логируем её в консоль
        console.error("❌ Ошибка при редактировании события:", error);
    }
  };
  // Функция Удаления события
  const deleteEvent = async (id: string, userId: string) => {
      try {
          // Отправляем DELETE-запрос на сервер, передавая id события и userId пользователя
          const response = await fetch(`/api/users-events`, {
              method: 'DELETE', // Метод DELETE для удаления события
              headers: {
                  'Content-Type': 'application/json', // Указываем, что отправляем JSON-данные
              },
              body: JSON.stringify({ id, userId }), // Передаём в теле запроса id события и userId пользователя
          });

          // Проверяем, успешно ли выполнен запрос
          if (!response.ok) {
              throw new Error(`Ошибка при удалении события: ${response.statusText}`);
          }

          // 🔹 Шаг 2: Обновляем локальное состояние после удаления события
          setEvents((prevEvents) => {
              // Создаём копию текущего состояния событий
              const newEvents = { ...prevEvents };

              // 🔹 Ищем ключ в prevEvents, который соответствует удаляемому событию
              const eventKeyToDelete = Object.keys(newEvents).find(
                  (key) => newEvents[key].id === id // Сравниваем id событий
              );

              if (eventKeyToDelete) {
                  // Если событие найдено, удаляем его из newEvents
                  delete newEvents[eventKeyToDelete];
                  console.log(`🗑 Событие ${id} удалено. Обновлённое состояние:`, newEvents);
              } else {
                  // Если событие не найдено, выводим ошибку в консоль
                  console.error(`❌ Событие с id ${id} не найдено в состоянии.`);
              }

              return newEvents; // Возвращаем обновлённый объект событий
          });

      } catch (error) {
          // Если во время удаления произошла ошибка, выводим её в консоль
          console.error("❌ Ошибка при удалении события:", error);
      }
  };

  // Используем хук useGenerateDays для генерации дней на основе текущей даты
  const { generateDays } = useGenerateDays(currentDate);
  useEffect(() => {
    if (!activeUserId && session.status === 'authenticated') {
      setActiveUserId(session.data?.user.id || null);
    }
  }, [activeUserId, session, userId]);
  useEffect(() => {
    if (!selectedDate && session.status === 'authenticated') {
        setSelectedDate(dayjs()); // Устанавливаем текущий день
        setIsScheduleOpen(true);  // Открываем расписание
    }
  }, [session.status]);

  useEffect(() => {
    const updateHeight = () => {
      // Получаем высоту окна браузера
      const screenHeight = window.innerHeight;
      // Учитываем отступы и марджины (например, верхний отступ и другие элементы страницы)
      const offset = 60; // Например, отступ сверху для элементов (можно скорректировать)
      setContainerHeight(screenHeight - offset);
    };

    // Обновляем высоту при монтировании и изменении размера окна
    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);
  
  
  // Функции перехода
  const goToPreviousMonth = () => setCurrentDate(currentDate.subtract(1, "month"));
  const goToNextMonth = () => setCurrentDate(currentDate.add(1, "month"));
  const goToPreviousYear = () => setCurrentDate(currentDate.subtract(1, "year"));
  const goToNextYear = () => setCurrentDate(currentDate.add(1, "year"));
  const goToPrevious5Years = () => setCurrentDate(currentDate.subtract(5, "year"));
  const goToNext5Years = () => setCurrentDate(currentDate.add(5, "year"));
  const goToToday = () => {
    setCurrentDate(dayjs()); // Устанавливаем текущую дату
    setViewMode("day"); // Переключаем режим на "день"
  }; // Переход к сегодняшней дате

 

  // Генерация месяцев
  const generateMonths = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      months.push(currentDate.month(i).format("MMMM"));
    }
    return months;
  };
  // Проверка, является ли день сегодняшним
  const isToday = (day: dayjs.Dayjs) => day.isSame(dayjs(), "day");
  // Проверка, является ли месяц текущим
  const isCurrentMonth = (month: number) => currentDate.month() === month;
  // Проверка, является ли год текущим
  const isCurrentYear = (year: number) => currentDate.year() === year;
  
  // Выбор дня
  const handleDayClick = (day: dayjs.Dayjs) => {
    setSelectedDate(day);
    setIsScheduleOpen(true); // Открытие расписания
  };

  // Выбор месяца
  const handleMonthClick = (month: number) => {
    setCurrentDate(currentDate.month(month));
    setViewMode("day");
    setIsScheduleOpen(false);
  };

  // Выбор года
  const handleYearClick = (year: number) => {
    setCurrentDate(currentDate.year(year));
    setViewMode("month"); // Переключаемся на месяцы
    setIsScheduleOpen(false);
  };

  return (
    <div
      className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg overflow-y-auto"
      style={{ height: `${containerHeight}px` }} // Динамически устанавливаем высоту контейнера
    >
      {/* 🔹 1. Добавляем компонент UsersList перед календарем */}
      <UsersList activeUserId={activeUserId} setActiveUserId={setActiveUserId} />
  
      {/* 🔹 2. Кнопки для переключения режима отображения (день, месяц, год) */}
      <ViewModeButtons
        viewMode={viewMode} // Текущий режим отображения ("day", "month", "year")
        setViewMode={setViewMode} // Функция для изменения режима
        setIsScheduleOpen={setIsScheduleOpen} // Функция для переключения расписания
        goToToday={goToToday} // Функция для перехода к сегодняшнему дню
      />
  
      {/* 🔹 3. Отображение `DayView` (режим дня), если выбран "day" и расписание не открыто */}
      {viewMode === "day" && !isScheduleOpen && (
        <DayView
          currentDate={currentDate} // Текущая дата
          viewMode={viewMode} // Текущий режим (день, месяц, год)
          selectedDate={selectedDate} // Выбранная дата
          isToday={isToday} // Проверка, является ли выбранная дата сегодняшним днем
          generateDays={generateDays} // Функция для генерации дней месяца
          handleDayClick={handleDayClick} // Функция обработки клика по дню
          goToPreviousMonth={goToPreviousMonth} // Переключение на предыдущий месяц
          goToNextMonth={goToNextMonth} // Переключение на следующий месяц
        />
      )}
  
      {/* 🔹 4. Отображение `ScheduleView` (расписание), если оно открыто и выбрана дата */}
      {isScheduleOpen && selectedDate && (
        <ScheduleView
          selectedDate={selectedDate} // Выбранная дата для отображения расписания
          isScheduleOpen={isScheduleOpen} // Флаг, открыто ли расписание
          setSelectedDate={setSelectedDate} // Функция для изменения выбранной даты
          events={events} // Список событий на выбранный день
          addEvent={addEventHandler} // Функция добавления события
          editEvent={editEvent} // Функция редактирования события
          deleteEvent={deleteEvent} // Функция удаления события
          activeUserId={activeUserId}
        />
      )}
  
      {/* 🔹 5. Отображение `MonthView` (режим месяца), если выбран "month" и расписание не открыто */}
      {viewMode === "month" && !isScheduleOpen && (
        <MonthView
          currentDate={currentDate} // Текущая дата
          goToPreviousYear={goToPreviousYear} // Переключение на предыдущий год
          goToNextYear={goToNextYear} // Переключение на следующий год
          generateMonths={generateMonths} // Функция для генерации месяцев в календаре
          isCurrentMonth={isCurrentMonth} // Проверка, является ли текущий месяц активным
          handleMonthClick={handleMonthClick} // Функция обработки клика по месяцу
        />
      )}
  
      {/* 🔹 6. Отображение `YearView` (режим года), если выбран "year" и расписание не открыто */}
      {viewMode === "year" && !isScheduleOpen && (
        <YearView
          currentDate={currentDate} // Текущая дата
          generateDays={generateDays} // Функция генерации дней года
          goToPrevious5Years={goToPrevious5Years} // Переключение на предыдущие 5 лет
          goToNext5Years={goToNext5Years} // Переключение на следующие 5 лет
          handleYearClick={handleYearClick} // Функция обработки клика по году
          isCurrentYear={isCurrentYear} // Проверка, является ли текущий год активным
        />
      )}
    </div>
  );
};

export default Calendar;