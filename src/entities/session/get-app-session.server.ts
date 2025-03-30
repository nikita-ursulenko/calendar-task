//Users/semenov/Документы/GitHub/Calendar Task/my-calendar-app/src/entities/session/get-app-session.server.ts
import { getServerSession } from "next-auth"
import { nextAuthConfig } from "./next-auth-config"

// Получение сессии пользователя на сервере
export const getAppSession = getServerSession(nextAuthConfig);