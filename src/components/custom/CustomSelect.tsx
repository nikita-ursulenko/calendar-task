import { useState, useRef, useEffect } from "react";

interface Option {
  id: string | number;
  name: string;
}

interface CustomSelectProps {
  options: Option[];
  value: Option | null;
  onChange: (selected: Option) => void;
  placeholder?: string;
}

export default function CustomSelect({ options, value, onChange, placeholder }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={selectRef}>
      <button
        type="button"
        className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-left flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value ? value.name : placeholder || "Выберите значение"}</span>
        <span className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}>&#9660;</span>
      </button>

      {isOpen && (
        <ul className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto z-10">
          {options.map((option) => (
            <li
              key={option.id}
              className={`cursor-pointer p-2 hover:bg-gray-100 ${
                value?.id === option.id ? "bg-gray-200 font-semibold" : ""
              }`}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {option.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}