import { useRef } from "react";

// Доступные цвета Tailwind
const eventColors = [
  "bg-red-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-gray-500",
];

const useUniqueEventColor = () => {
  // Используем useRef для хранения цветов без ререндеров
  const assignedColors = useRef(new Map<string, string>());

  // Функция для получения цвета по eventId
  const getUniqueEventColor = (eventId: string) => {
    if (!assignedColors.current.has(eventId)) {
      // Берем первый доступный цвет
      const availableColors = eventColors.filter(color => !Array.from(assignedColors.current.values()).includes(color));

      // Если все цвета использованы, начинаем заново (цикл)
      const selectedColor = availableColors.length > 0 ? availableColors[0] : eventColors[assignedColors.current.size % eventColors.length];

      // Запоминаем выбранный цвет
      assignedColors.current.set(eventId, selectedColor);
    }

    return assignedColors.current.get(eventId)!;
  };

  return { getUniqueEventColor };
};

export default useUniqueEventColor;