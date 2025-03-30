"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import AuthContainer from "./AuthContainer";
import InputField from "./InputField";
import SubmitButton from "./SubmitButton";
import OAuthButton from "./OAuthButton";

const AuthForm = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: `${login}@local`,
      password,
      callbackUrl: "/profile",
      redirect: true,
    });

    if (!result) {
      setError("Ошибка сети. Попробуйте позже.");
      setLoading(false);
      return;
    }

    if (result.error) {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <AuthContainer>
      <h2 className="text-2xl font-semibold text-center text-blue-700 mb-6">
        Войти в аккаунт
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Логин"
          type="text"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="Введите логин"
        />
        <InputField
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Введите пароль"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <SubmitButton text={loading ? "Вход..." : "Войти"} />
      </form>

      <div className="text-center mt-4">
        <OAuthButton />
      </div>
    </AuthContainer>
  );
};

export default AuthForm;