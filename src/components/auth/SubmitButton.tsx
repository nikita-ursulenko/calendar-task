// /Users/semenov/Документы/GitHub/Calendar Task/my-calendar-app/src/components/SubmitButton.tsx
"use client";
import React from "react";

interface SubmitButtonProps {
  text: string;
  onClick?: () => void;
  className?: string; // Добавляем поддержку кастомных классов
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ text, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 ${className}`}
    >
      {text}
    </button>
  );
};

export default SubmitButton;