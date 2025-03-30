import React from "react";
import { Dayjs } from "dayjs";

interface YearViewProps {
  currentDate: Dayjs;
  goToPrevious5Years: () => void;
  goToNext5Years: () => void;
  generateDays: () => Dayjs[];
  handleYearClick: (year: number) => void;
  isCurrentYear: (year: number) => boolean;
}

const YearView: React.FC<YearViewProps> = ({
  currentDate,
  goToPrevious5Years,
  goToNext5Years,
  generateDays,
  handleYearClick,
  isCurrentYear,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={goToPrevious5Years}
          className="text-blue-600 p-2 hover:bg-blue-100 rounded"
        >
          {"<< 5 лет"}
        </button>
        <span className="text-xl font-semibold">{currentDate.format("YYYY")}</span>
        <button
          onClick={goToNext5Years}
          className="text-blue-600 p-2 hover:bg-blue-100 rounded"
        >
          {"5 лет >>"}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 10 }, (_, index) => {
          const year = currentDate.year() - 5 + index;
          return (
            <div
              key={year}
              onClick={() => handleYearClick(year)}
              className={`text-center cursor-pointer p-3 rounded-md ${
                isCurrentYear(year) ? "bg-blue-500 text-white" : "text-black"
              } hover:bg-blue-100`}
            >
              {year}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default YearView;