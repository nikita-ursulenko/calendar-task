import { ReactNode } from "react";

interface MenuItemProps {
  icon: ReactNode; // Иконка
  text: string; // Текст элемента
  onClick: () => void; // Функция, вызываемая при клике
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded-md w-full text-left"
  >
    <span>{icon}</span>
    <span>{text}</span>
  </button>
);

export default MenuItem;