import React from "react";
import { Dayjs } from "dayjs"; // Используем dayjs вместо moment.js

interface DayViewProps {
  currentDate: Dayjs;
  viewMode: string;
  selectedDate: Dayjs | null;
  isToday: (day: Dayjs) => boolean;
  generateDays: () => Dayjs[];
  handleDayClick: (day: Dayjs) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
}

const DayView: React.FC<DayViewProps> = ({
  currentDate,
  viewMode,
  selectedDate,
  isToday,
  generateDays,
  handleDayClick,
  goToPreviousMonth,
  goToNextMonth,
}) => {
  if (viewMode !== "day") return null;

  return (
    <div>
      {/* Заголовок с навигацией по месяцам */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={goToPreviousMonth}
          className="text-blue-600 p-2 hover:bg-blue-100 rounded"
        >
          {"< Месяц"}
        </button>
        <span className="text-xl font-semibold">{currentDate.format("MMMM YYYY")}</span>
        <button
          onClick={goToNextMonth}
          className="text-blue-600 p-2 hover:bg-blue-100 rounded"
        >
          {"Месяц >"}
        </button>
      </div>

      {/* Дни недели */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
          <div key={index} className="text-sm font-semibold text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* Дни месяца */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {generateDays().map((day, index) => (
          <div
            key={index}
            onClick={() => handleDayClick(day)}
            className={`p-3 cursor-pointer rounded-md text-center ${
              selectedDate && day.isSame(selectedDate, "day")
                ? "bg-blue-500 text-white"
                : isToday(day)
                ? "bg-gray-300"
                : day.day() === 0 // Воскресенье
                ? "text-red-600"
                : "text-black"
            } hover:bg-blue-100`}
          >
            {day.date()}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayView;