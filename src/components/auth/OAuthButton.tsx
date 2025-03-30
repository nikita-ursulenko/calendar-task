"use client";
import React from "react";
import { signIn } from "next-auth/react";
import { FaGithub } from "react-icons/fa";

const OAuthButton = () => {
  return (
    <div className="flex justify-center mt-6 space-x-4"> {/* Добавил space-x-4 для отступов между кнопками */}
      {/* Кнопка GitHub */}
      <button
        onClick={() => signIn("github")}
        className="w-14 h-14 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition duration-300"
      >
        <FaGithub size={28} />
      </button>

      {/* Кнопка Google */}
      <button
        onClick={() => signIn("google")}
        className="w-14 h-14 border border-gray-300 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition duration-300"
      >
        <img
          src="https://img.icons8.com/?size=96&id=17949&format=png"
          alt="Google"
          className="w-8 h-8"
        />
      </button>
    </div>
  );
};

export default OAuthButton;