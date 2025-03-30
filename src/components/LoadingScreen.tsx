"use client";
import { useState, useEffect } from "react";

export const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return oldProgress + 5; // Увеличиваем на 2% каждые 100 мс (5 секунд в сумме)
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white">
      <div className="relative flex items-center justify-center">
        <div className="w-20 h-20 border-4 border-gray-600 border-t-transparent border-b-transparent rounded-full animate-spin" />
        <div className="absolute w-16 h-16 border-4 border-gray-400 border-t-transparent border-b-transparent rounded-full animate-[spin_1.5s_linear_infinite]" />
      </div>
      <p className="mt-4 text-lg">Loading...</p>
      <div className="w-48 h-2 mt-4 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};