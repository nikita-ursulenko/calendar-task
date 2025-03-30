
# 📅 Календарь планирования

Веб-приложение для планирования, организации и управления событиями и расписанием. Проект выполнен в рамках производственной практики (Facultatea Tehnologii Informaționale, ULIM).

## ✨ Основные возможности

- Календарь с режимами: день, неделя, месяц
- Создание, редактирование и удаление событий
- Система пользователей и групп
- Панель администратора для фильтрации событий по пользователям
- Поддержка аутентификации через Google, GitHub и логин/пароль
- Разграничение прав доступа
- Защищенное хранение данных

## ⚙️ Используемые технологии

- Next.js
- React
- TypeScript
- Prisma ORM
- SQLite
- NextAuth.js
- Tailwind CSS

## 📂 Структура проекта

- `/src` — код приложения
- `/prisma` — схема базы данных
- `/public` — статические файлы
- `next.config.ts` — конфигурация Next.js
- `tailwind.config.js` — конфигурация стилей

## ✅ Установка и запуск проекта

### Требования:
- Node.js >= 18.x
- Yarn или npm
- SQLite

### Установка:

1. Клонируйте проект:

```bash
git clone https://github.com/nikita-ursulenko/calendar-task.git
cd calendar-task
```

2. Установите зависимости:

```bash
yarn install
```

3. Настройте базу данных и выполните миграции:

```bash
npx prisma migrate dev --name init
```

4. Запустите проект в режиме разработки:

```bash
yarn dev
```

5. Перейдите в браузер:

```
http://localhost:3000
```

## 👨‍💻 Автор

Ursulenco Nichita  
Facultatea Tehnologii Informaționale, ULIM  
2025

## 🔗 Ссылка на GitHub

[Перейти к проекту на GitHub](https://github.com/nikita-ursulenko/calendar-task)
