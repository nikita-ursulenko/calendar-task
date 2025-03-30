import { ReactNode } from "react";
import { FaUser, FaCog, FaBell, FaCalendarAlt, FaUsersCog } from "react-icons/fa";
import MenuItem from "@/components/sidebar/MenuItem";
import { useAppSession } from "@/entities/session/use-app-session"; // Импортируем хук useAppSession

// Типизация для onTabChange
interface MenuProps {
  onTabChange: (tab: "overview" | "settings" | "calendar" | "group") => void;
}

const Menu: React.FC<MenuProps> = ({ onTabChange }) => {
  const session = useAppSession(); // Используем хук для получения сессии
  const role = session.data?.user.role;

  return (
    <nav className="flex-1 mt-6 space-y-2">
      <MenuItem
        icon={<FaUser />}
        text="Обзор"
        onClick={() => onTabChange("overview")}
      />
      <MenuItem
        icon={<FaCog />}
        text="Настройки"
        onClick={() => onTabChange("settings")}
      />
      <MenuItem
        icon={<FaCalendarAlt />}
        text="Календарь"
        onClick={() => onTabChange("calendar")}
      />
      {role === "admin" && ( // Отображаем пункт меню "Группа" только для администраторов
        <MenuItem
          icon={<FaUsersCog />}
          text="Группа"
          onClick={() => onTabChange("group")}
        />
      )}
    </nav>
  );
};

export default Menu;