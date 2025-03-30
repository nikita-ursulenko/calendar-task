import React from "react";
import { Dayjs } from "dayjs";

interface MonthViewProps {
  currentDate: Dayjs;
  goToPreviousYear: () => void;
  goToNextYear: () => void;
  generateMonths: () => string[];
  isCurrentMonth: (index: number) => boolean;
  handleMonthClick: (index: number) => void;
}

const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  goToPreviousYear,
  goToNextYear,
  generateMonths,
  isCurrentMonth,
  handleMonthClick,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={goToPreviousYear}
          className="text-blue-600 p-2 hover:bg-blue-100 rounded"
        >
          {"< Год"}
        </button>
        <span className="text-xl font-semibold">{currentDate.format("YYYY")}</span>
        <button
          onClick={goToNextYear}
          className="text-blue-600 p-2 hover:bg-blue-100 rounded"
        >
          {"Год >"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {generateMonths().map((month, index) => (
          <div
            key={index}
            onClick={() => handleMonthClick(index)}
            className={`text-center cursor-pointer p-3 rounded-md ${
              isCurrentMonth(index) ? "bg-blue-500 text-white" : "text-black"
            } hover:bg-blue-100`}
          >
            {month}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthView;