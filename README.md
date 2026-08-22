# Virtual Auto Market — панель управления

Админ-панель на Next.js (JSX) + SCSS для виртуального авто-маркета.
Подключается к готовому API (вход, категории, автомобили, статистика).

## Технологии

- Next.js 14 (Pages Router)
- React 18
- SCSS Modules (тёмная digital-glass тема)

## Структура

```
components/   Layout, Modal — переиспользуемые UI-блоки
context/      AuthContext — токен, пользователь, login/logout
lib/api.js    обёртка над fetch для запросов к бэкенду
pages/        login, dashboard, categories, products
styles/       SCSS-модули + переменные темы
```

## Разделы панели

- **Главная** — общая статистика (авто, категории, стоимость склада)
- **Автомобили** — список с фильтрами, добавление/редактирование, статус, удаление
- **Категории** — список, добавление/редактирование, статус, удаление

## Запуск

1. Установить зависимости:
   ```
   npm install
   ```
2. Скопировать `.env.example` в `.env.local` и указать адрес бэкенда:
   ```
   NEXT_PUBLIC_API_URL=https://backend.magnateshop.uz
   ```
3. Запустить:
   ```
   npm run dev
   ```
4. Открыть http://localhost:3000 — данные для входа по умолчанию:
   `admin / admin123`

## Заметки

- Все запросы идут через `lib/api.js` (`api.get/post/patch/put/del`).
- Токен хранится в `localStorage` под ключом `as_token`.
# car-admin
