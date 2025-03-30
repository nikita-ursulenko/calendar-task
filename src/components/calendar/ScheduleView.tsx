import React, { useEffect, useState } from "react";
import { Dayjs } from "dayjs";
import { useAppSession } from "@/entities/session/use-app-session";
import "./ScheduleView.css";
import useUniqueEventColor from "@/hooks/useUniqueEventColor"; // Подключаем наш хук
import { FaTimes } from "react-icons/fa";

// Пропсы
interface ScheduleViewProps {
  // Выбранная дата в календаре (может быть null, если не выбрана)
  selectedDate: Dayjs | null;

  // Флаг, указывающий, открыт ли режим расписания
  isScheduleOpen: boolean;

  // Функция для установки выбранной даты
  setSelectedDate: (date: Dayjs) => void;

  // Объект, содержащий события, сгруппированные по ключу (обычно это дата)
  events: {
    [key: string]: {
      id: string; // Уникальный идентификатор события
      time: string; // Время события в формате строки
      firstName: string; // Имя участника события
      lastName: string; // Фамилия участника события
      procedure: string; // Название процедуры (например, стрижка, маникюр и т. д.)
      duration: number; // Длительность события в минутах
    };
  };

  // Функция для добавления нового события в расписание
  addEvent: (
    date: string, // Дата события в формате строки
    time: string, // Время события
    firstName: string, // Имя участника
    lastName: string, // Фамилия участника
    procedure: string, // Название процедуры
    duration: number,
    activeUserId: string // Длительность события в минутах
  ) => void;
  

  // Функция для редактирования существующего события
  editEvent: (
    id: string, // Идентификатор события
    date: string, // Новая дата события
    time: string, // Новое время события
    firstName: string, // Обновлённое имя участника
    lastName: string, // Обновлённая фамилия участника
    procedure: string, // Обновлённая процедура
    duration: number, // Новая длительность события
    userId: string // Идентификатор пользователя, вносящего изменения
  ) => void;

  // Функция для удаления события
  deleteEvent: (
    id: string, // Идентификатор события
    userId: string // Идентификатор пользователя, удаляющего событие
  ) => void;

  activeUserId: string | null;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({
  selectedDate,
  isScheduleOpen,
  setSelectedDate,
  events,
  addEvent,
  editEvent,
  deleteEvent,
  activeUserId,
}) => {
  // Состояние для управления открытием/закрытием модального окна события
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  
  const { getUniqueEventColor } = useUniqueEventColor(); // Используем хук

  // Получение данных сессии пользователя
  const session = useAppSession();
  const userId = session.data?.user.id;

  // Состояние для хранения данных текущего события
  const [eventData, setEventData] = useState({
    time: "", // Время события
    firstName: "", // Имя участника
    lastName: "", // Фамилия участника
    procedure: "", // Название процедуры
    duration: 0, // Длительность события в минутах
  });

  // Состояние для форсированного ререндеринга компонента при изменении событий
  const [forceRender, setForceRender] = useState(0);

  // Логирование и форсированный ререндер при изменении списка событий
  useEffect(() => {
    console.log("🔄 ScheduleView обновился! Новые события:", events);
    setForceRender((prev) => prev + 1);
  }, [events]);

  // Состояние для хранения выбранной ячейки (временного слота)
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  // Набор для объединенных ячеек (используется для рендеринга длительных событий)
  const mergedCells = new Set();

  // Если расписание закрыто или дата не выбрана, компонент не рендерится
  if (!isScheduleOpen || !selectedDate) return null;

  // Функция открытия модального окна для добавления/редактирования события
  const openEventModal = (date: string, hour: number, minutes?: number) => {
    const formattedHour = hour.toString().padStart(2, "0");
    const formattedMinutes = minutes !== undefined ? minutes.toString().padStart(2, "0") : "00";
    const key = `${date} ${formattedHour}:${formattedMinutes}`;
    
    console.log("OpenModal Key: ", key)
    console.log("OpenModal events: ", events )
    console.log("📌 Проверка события по ключу:", key, events[key]);
    setSelectedCell(key);
    setIsEventModalOpen(true);
  
    if (events[key]) {
      console.log("🟢 Открыто событие для редактирования:", events[key]);
      setEventData({
        time: events[key].time,
        firstName: events[key].firstName,
        lastName: events[key].lastName,
        procedure: events[key].procedure,
        duration: events[key].duration,
      });
    } else {
      console.log("🟡 Открыто новое событие для создания.");
      setEventData({
        time: `${hour}:${formattedMinutes}`, // Добавляем минуты
        firstName: "",
        lastName: "",
        procedure: "",
        duration: 0,
      });
    }
  };

  // Функция закрытия модального окна и сброса данных события
  const closeEventModal = () => {
    setIsEventModalOpen(false);
    setEventData({ time: "", firstName: "", lastName: "", procedure: "", duration: 0 });
    console.log("⚪ Модальное окно закрыто.");
  };

  const handleEventSave = async () => {
    // Извлекаем данные из состояния eventData
    const { time, firstName, lastName, procedure, duration } = eventData;
  
    if (!selectedCell) {
      console.log("⚠️ Не удалось сохранить событие. Отсутствуют данные или ячейка не выбрана.");
      return;
    }
  
    // Извлекаем дату из ключа выбранной ячейки (например, "2025-03-19 14:00" -> "2025-03-19")
    const date = selectedCell.split(" ")[0];
  
    // Преобразуем время события в минуты с начала дня
    const [eventHour, eventMinutes] = time.split(":").map(Number);
    const newEventStart = eventHour * 60 + eventMinutes;
    const newEventEnd = newEventStart + duration;
  
    console.log("⏳ Проверяем пересечения...");
    let hasOverlap = false;
  
    Object.keys(events).forEach((eventKey) => {
      const [eventDate, eventTime] = eventKey.split(" ");
      if (eventDate === date) {
        const [eHour, eMinutes] = events[eventKey].time.split(":").map(Number);
        const existingStart = eHour * 60 + eMinutes;
        const existingEnd = existingStart + events[eventKey].duration;
  
        // Проверяем пересечения
        if (
          (newEventStart >= existingStart && newEventStart < existingEnd) || // Начало внутри существующего события
          (newEventEnd > existingStart && newEventEnd <= existingEnd) || // Конец внутри существующего события
          (newEventStart <= existingStart && newEventEnd >= existingEnd) // Полное перекрытие
        ) {
          console.log("❌ Конфликт с событием:", events[eventKey]);
          hasOverlap = true;
        }
      }
    });
  
    if (hasOverlap) {
      console.warn("🚨 Ошибка: Временной слот уже занят! Создание невозможно.");
      return;
    }
  
    console.log("✅ Нет пересечений. Можно сохранять событие!");
  
    // Если событие уже существует, редактируем его
    if (events[selectedCell]) {
      const eventId = events[selectedCell].id;
  
      if (userId) {
        await editEvent(
          eventId,
          date,
          time,
          firstName,
          lastName,
          procedure,
          duration,
          userId
        );
  
        console.log("🟣 Событие отправлено на редактирование!");
      } else {
        console.error("❌ User ID is undefined");
      }
    } else {
      if (!activeUserId) {
        console.error("❌ Невозможно создать событие: activeUserId не задан");
        return;
      }
      // Если события нет, добавляем новое
      await addEvent(date, time, firstName, lastName, procedure, duration, activeUserId);
      console.log("📌 Добавлено событие:", {
        date,
        time,
        firstName,
        lastName,
        procedure,
        duration,
      });
      console.log("📌 Полный ключ (selectedCell):", selectedCell);
      console.log("📌 userId после добавления:", userId);
    }
  
    // Закрываем модальное окно
    closeEventModal();
  };
  
  return (
    <div className="mt-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <button onClick={() => setSelectedDate(selectedDate?.subtract(4, "day"))} className="text-blue-600 p-2 hover:bg-blue-100 rounded">
          {"< Назад"}
        </button>
        <button onClick={() => setSelectedDate(selectedDate?.add(4, "day"))} className="text-blue-600 p-2 hover:bg-blue-100 rounded">
          {"Вперед >"}
        </button>
      </div>

      <div className="schedule-container">
        <div className="schedule-grid">
          {/* Заголовок для времени */}
          <div className="time-header">Время</div>

          {/* Заголовки дней (4 дня начиная с выбранной даты) */}
          {[...Array(4)].map((_, index) => (
            <div key={index} className="day-header">
              {/* Форматируем дату: добавляем `index` дней к `selectedDate`, чтобы получить следующие дни */}
              {selectedDate?.add(index, "day")?.format("DD MMMM")}
            </div>
          ))}

          {/* Генерируем временные слоты на 24 часа в день */}
          {[...Array(24)].map((_, hour) => (
            <React.Fragment key={`hour-${hour}`}>
              {/* Колонка с отметками времени (00:00 - 23:00) */}
              <div className="time-cell">{`${hour}:00`}</div>

              {/* Генерируем ячейки для каждого из 4 дней */}
              {[...Array(4)].map((_, index) => {
                // Определяем текущую дату (YYYY-MM-DD), соответствующую данной ячейке
                const currentDate = selectedDate?.add(index, "day").format("YYYY-MM-DD");

                /**
                 * Определяем ключ для поиска события:
                 *  - Проверяем, есть ли событие в списке `events`
                 *  - Ключ состоит из даты и часа (например, "2025-03-19 14:00")
                 *  - Если события нет, создаём ключ для пустой ячейки
                 */
                // Находим ВСЕ события, у которых eventHour === hour (все события в одном часу)
                let eventsInThisHour = Object.keys(events).filter((eKey) => {
                  const [eventDate, eventTime] = eKey.split(" ");
                  const [eventHour] = eventTime.split(":").map(Number);
                  
                  return eventDate === currentDate && eventHour === hour;
                });

                // Если событий нет, создаем новый ключ `hour:00`
                let key = eventsInThisHour.length > 0 ? eventsInThisHour[0] : `${currentDate} ${hour}:00`;
                // Если эта ячейка уже объединена в другой (многочасовое событие), пропускаем её
                if (mergedCells.has(key)) return null;

                /**
                 * Получаем событие, соответствующее текущему временному слоту:
                 * - Либо используем найденное событие по `key`
                 * - Либо создаём новый временной слот, если события нет
                 */
                const event = events[key] || events[`${currentDate} ${hour}:00`] || null;

                /**
                 * Определяем высоту (rowSpan) ячейки:
                 * - Если событие есть, вычисляем `rowSpan`, основываясь на его длительности (в часах)
                 * - Если события нет, `rowSpan` = 1 (обычная 1-часовая ячейка)
                 */ // Оставшиеся минуты (неполный час)
                const rowSpan = Math.ceil(event?.duration / 60) || 1; // Округляем вверх, чтобы занять нужные слоты

                /**
                 * Если событие занимает несколько часов, добавляем временные слоты в `mergedCells`,
                 * чтобы они не рендерились отдельно (объединение ячеек)
                 */
                if (event && event.duration) {
                  for (let i = 1; i < rowSpan; i++) {
                    mergedCells.add(`${currentDate} ${hour + i}:00`);
                  }
                }

                const cellHeight = 50; // 🔹 Высота одной строки (1 час) в пикселях. 
                // Это фиксированное значение, используемое для вычисления высоты событий и их смещения вниз.
                // Если событие длится 1 час (60 минут), оно должно занимать `50px`.
                // Если событие длится 30 минут, оно должно занимать `25px` (50px * 0.5).

                
                return (
                  <div
                    key={`${key}-${event?.id || "empty"}`} // 🔹 Уникальный ключ для React (нужно для корректного ререндеринга).
                    className="schedule-cell relative" // 🔹 CSS-класс schedule-cell с `position: relative` (важно для позиционирования `absolute` внутри).
                    style={{
                      gridRow: `span ${rowSpan}`, // 🔹 Указываем, сколько строк (`rowSpan`) занимает событие в CSS Grid.
                      // Например, если `rowSpan = 2`, то событие займет 2 строки в таблице (эквивалентно 2 часам).
                      // `rowSpan` рассчитывается на основе `event.duration / 60`, округляется вверх с помощью `Math.ceil()`.
                    }}
                    
                    
                    // 🔹 При клике на ячейку открываем модальное окно для редактирования события.
                    onClick={() => {
                      const [hour] = key.split(" ")[1].split(":").map(Number);
                      console.log("🟡 Клик по ячейке:", { key, hour });
                      console.log("📌 selectedCell перед openEventModal:", key);
                      openEventModal(currentDate, hour);
                    }}
                  
                  
                  >
                    {/* Если в этом часовом слоте есть несколько событий, рендерим их ВСЕ */}
                    {eventsInThisHour.map((eventKey) => {
                      const event = events[eventKey];

                      return (
                        <div
                          key={event.id}
                          className={`event-cell ${getUniqueEventColor(event.id)}`}
                          style={{
                            zIndex: 10,
                            height: `${(event.duration / 60) * cellHeight - 3}px`,
                            top: `${(parseInt(event.time.split(":")[1]) / 60) * cellHeight}px`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            const [hour, minutes] = event.time.split(":").map(Number);
                            console.log("Нажатие на окно события, currentDate: ", hour, minutes);
                            openEventModal(currentDate, hour, minutes);
                          }}
                        >
                          {event.procedure} ({event.duration} мин)
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {isEventModalOpen && (
        // Полупрозрачный фон, накрывающий весь экран при открытом модальном окне
        <div className="absolute top-0 left-0 w-full h-full bg-black/30 backdrop-blur-xs flex justify-center items-center z-50">
          
          {/* Основной контейнер модального окна */}
          <div className="relative bg-white p-6 rounded-lg w-96">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 p-2 rounded-full transition-all hover:bg-gray-200"
              onClick={closeEventModal}
            >
              <FaTimes className="w-6 h-6" />
            </button>
            {/* Заголовок модального окна */}
            <h3 className="text-xl mb-4">Создать/Редактировать событие</h3>

            {/* Поле для ввода имени клиента */}
            <div className="mb-4">
              <label htmlFor="firstName" className="block text-sm font-semibold">Имя клиента</label>
              <input
                type="text"
                id="firstName"
                value={eventData.firstName} // Подключаем текущее значение из состояния
                onChange={(e) => setEventData({ ...eventData, firstName: e.target.value })} // Обновляем состояние при вводе
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Введите имя клиента"
              />
            </div>

            {/* Поле для ввода фамилии клиента */}
            <div className="mb-4">
              <label htmlFor="lastName" className="block text-sm font-semibold">Фамилия клиента</label>
              <input
                type="text"
                id="lastName"
                value={eventData.lastName}
                onChange={(e) => setEventData({ ...eventData, lastName: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Введите фамилию клиента"
              />
            </div>

            {/* Поле для ввода названия процедуры */}
            <div className="mb-4">
              <label htmlFor="procedure" className="block text-sm font-semibold">Процедура</label>
              <input
                type="text"
                id="procedure"
                value={eventData.procedure}
                onChange={(e) => setEventData({ ...eventData, procedure: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Введите процедуру"
              />
            </div>

            {/* Поле для выбора времени начала (часы фиксированные, минуты можно менять) */}
            <div className="mb-4">
              <label htmlFor="startTime" className="block text-sm font-semibold">Время начала</label>
              <div className="flex items-center">
                
                {/* Фиксированное поле с часами (из `selectedCell`) */}
                <span className="p-2 border border-gray-300 rounded-l bg-gray-100 w-12 text-center">
                  {selectedCell?.split(" ")[1].split(":")[0] || "00"} {/* Берем часы из `selectedCell` */}
                </span>

                {/* Поле для ввода минут (можно изменять) */}
                <input
                  type="number"
                  id="startTime"
                  value={eventData.time.split(":")[1] || "00"} // Показываем текущие минуты или "00"
                  onChange={(e) => {
                    let minutes = parseInt(e.target.value, 10);
                    if (isNaN(minutes)) minutes = 0; // Если не число, устанавливаем 0
                    if (minutes < 0) minutes = 0; // Минуты не могут быть отрицательными
                    if (minutes > 59) minutes = 59; // Ограничение до 59 минут

                    // Обновляем только минуты, оставляя часы неизменными
                    setEventData((prev) => ({
                      ...prev,
                      time: `${prev.time.split(":")[0]}:${minutes.toString().padStart(2, "0")}`,
                    }));
                  }}
                  className="w-16 p-2 border border-gray-300 rounded-r text-center"
                  min="0"
                  max="59"
                  placeholder="00"
                />
              </div>
            </div>

            {/* Поле для ввода продолжительности события в минутах */}
            <div className="mb-4">
              <label htmlFor="duration" className="block text-sm font-semibold">Продолжительность (в минутах)</label>
              <input
                type="number"
                id="duration"
                value={eventData.duration}
                onChange={(e) => setEventData({ ...eventData, duration: +e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Введите продолжительность"
              />
            </div>

            {/* Кнопки управления (Отмена, Удалить, Сохранить) */}
            <div className="flex justify-between">

              {/* Кнопка удаления события (если оно уже существует) */}
              <button
                onClick={() => {
                  console.log("📌 Проверка перед удалением:");
                  console.log("→ selectedCell:", selectedCell);
                  console.log("→ userId:", userId);
                  console.log("→ событие:", selectedCell ? events[selectedCell] : null);
                  if (selectedCell && events[selectedCell] && userId) {
                    deleteEvent(events[selectedCell].id, userId); // Удаляем событие по ID
                    closeEventModal();
                  } else {
                    console.error("❌ User ID is undefined or no event selected");
                  }
                }}
                className="bg-red-500 rounded px-4 py-2 text-white"
              >
                Удалить
              </button>

              {/* Кнопка сохранения нового или отредактированного события */}
              <button onClick={handleEventSave} className="px-4 py-2 bg-blue-600 text-white rounded">
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleView;

