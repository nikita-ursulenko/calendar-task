"use client";

import { useAppSession } from "@/entities/session/use-app-session";
import { useSignOut } from "@/entities/session/use-sign-out";
import { useState, useEffect } from "react";
import { FaTimes, FaBars } from "react-icons/fa";
import SubmitButton from "@/components/auth/SubmitButton";
import UserProfile from "@/components/sidebar/UseProfile"; // Импортируем новый компонент
import Menu from "@/components/sidebar/Menu"; // Импортируем новый компонент
import { useRouter } from "next/navigation"; // Используем useRouter для редиректа

const Sidebar = () => {
  const signOut = useSignOut();
  const router = useRouter(); // Используем useRouter для навигации
  const [menuOpen, setMenuOpen] = useState(false); // Для отслеживания состояния меню

  // Закрываем меню при клике вне его
  const handleClickOutside = (event: MouseEvent) => {
    const menu = document.getElementById("sidebar");
    if (menu && !menu.contains(event.target as Node)) {
      setMenuOpen(false);
    }
  };

  // Добавляем и удаляем слушатель кликов вне меню
  useEffect(() => {
    if (menuOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpen]);

  // Функция для перехода на страницы
  const handleTabChange = (tab: "overview" | "settings" | "notifications" | "calendar" | "group") => {
    router.push(`/${tab}`); // Перенаправляем на страницу с соответствующим названием
    setMenuOpen(false); // Закрываем меню
  };

  return (
    <div className="lg:relative h-screen">
      {/* Бургер-меню и кнопка для открытия/закрытия */}
      <div className="lg:hidden fixed z-10">
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-4">
          {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`h-ful w-64 z-100 bg-white shadow-md p-6 flex flex-col transition-all duration-300 ease-in-out fixed top-0 left-0 bottom-0 transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 min-h-screen`}
      >
        {/* Кнопка бургер для мобильных устройств */}
        <button
          className="lg:hidden top-4 left-4 p-4 z-50"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        <UserProfile /> {/* Новый компонент профиля */}

        <Menu onTabChange={handleTabChange} /> {/* Новый компонент меню */}

        <SubmitButton
          text="Выйти"
          onClick={signOut.signOut}
          className="mt-auto bg-red-500 hover:bg-red-600 text-white"
        />
      </aside>


    </div>
  );
};

export default Sidebar;