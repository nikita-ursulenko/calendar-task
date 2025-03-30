import React from "react";

interface ViewModeButtonsProps {
  viewMode: "day" | "month" | "year";
  setViewMode: React.Dispatch<React.SetStateAction<"day" | "month" | "year">>;
  setIsScheduleOpen: React.Dispatch<React.SetStateAction<boolean>>;
  goToToday: () => void;
}

const ViewModeButtons: React.FC<ViewModeButtonsProps> = ({
  viewMode,
  setViewMode,
  setIsScheduleOpen,
  goToToday,
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex space-x-4">
        <button
          onClick={() => {
            setViewMode("day");
            setIsScheduleOpen(false);
          }}
          className={`p-3 text-sm rounded-md ${viewMode === "day" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
        >
          День
        </button>
        <button
          onClick={() => {
            setViewMode("month");
            setIsScheduleOpen(false);
          }}
          className={`p-3 text-sm rounded-md ${viewMode === "month" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
        >
          Месяц
        </button>
        <button
          onClick={() => {
            setViewMode("year");
            setIsScheduleOpen(false);
          }}
          className={`p-3 text-sm rounded-md ${viewMode === "year" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
        >
          Год
        </button>
      </div>

      {/* Кнопка перехода к текущей дате */}
      <button
        onClick={() => {
          goToToday();
          setIsScheduleOpen(false);
        }}
        className="p-2 bg-green-500 text-white rounded-md hover:bg-green-400"
      >
        Сегодня
      </button>
    </div>
  );
};

export default ViewModeButtons;