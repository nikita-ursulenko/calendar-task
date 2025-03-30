// useGenerateDays.ts
import dayjs, { Dayjs } from "dayjs";

export const useGenerateDays = (currentDate: Dayjs) => {
  const generateDays = (): Dayjs[] => {
    const startOfMonth = currentDate.startOf("month");
    const endOfMonth = currentDate.endOf("month");
    const startOfCalendar = startOfMonth.startOf("week").add(1, "day"); // Начинаем с понедельника
    const endOfCalendar = endOfMonth.endOf("week");
    const days: Dayjs[] = [];
    let day = startOfCalendar;
    while (day.isBefore(endOfCalendar, "day")) {
      days.push(day);
      day = day.add(1, "day");
    }
    return days;
  };

  return { generateDays };
};