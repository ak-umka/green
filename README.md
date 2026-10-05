# GREEN-API Telegram Chat

Тестовое задание «Фронтенд-разработчик React»: простой веб-интерфейс для отправки и получения
текстовых сообщений в **Telegram** через [GREEN-API](https://green-api.com/telegram/docs/).
Внешний вид — в стиле веб-мессенджера (список чатов слева, переписка справа).

## Возможности

- Вход по учётным данным GREEN-API (`idInstance`, `apiTokenInstance`) с проверкой через `getStateInstance`
- Создание чата по номеру телефона получателя
- Отправка текстовых сообщений — метод [`SendMessage`](https://green-api.com/telegram/docs/api/sending/SendMessage/)
- Получение сообщений — технология [HTTP API](https://green-api.com/telegram/docs/api/receiving/technology-http-api/)
  (`ReceiveNotification` с long polling → `DeleteNotification`)
- Статусы исходящих сообщений (отправлено / доставлено / прочитано / ошибка)
- История чатов сохраняется в `localStorage`

## Запуск

Нужен Node.js 20+ (версия указана в `.nvmrc`).

```bash
nvm use
npm install
npm run dev      # http://localhost:5173
```

Сборка: `npm run build`, результат в `dist/`.

## Подготовка инстанса

1. Создайте инстанс **Telegram** в [личном кабинете GREEN-API](https://console.green-api.com) и авторизуйте его.
2. В настройках инстанса оставьте **пустым `webhookUrl`** (иначе уведомления уходят на вебхук, а не в очередь HTTP API)
   и включите получение входящих уведомлений (`incomingWebhook`), а также уведомлений об исходящих
   сообщениях и их статусах (`outgoingAPIMessageWebhook`, `outgoingMessageWebhook`).
3. Скопируйте `idInstance`, `apiTokenInstance` и `apiUrl`. Если `apiUrl` не указать,
   он вычисляется по первым четырём цифрам `idInstance`: `https://XXXX.api.green-api.com`.

## Сценарий проверки

1. Открыть приложение, ввести `idInstance` и `apiTokenInstance`.
2. Ввести номер телефона получателя (например, `79991234567`) и нажать «+».
3. Написать сообщение и отправить (Enter, Shift+Enter — перенос строки).
4. Получатель отвечает в Telegram — ответ появляется в чате.

## Особенность Telegram

Сообщение отправляется на `номер@c.us`, но входящий ответ из Telegram приходит с числовым `chatId`
(например, `10000000`). Чтобы ответ попал в тот же чат, приложение берёт `chatId` из уведомления
`outgoingAPIMessageReceived` (сопоставляя его по `idMessage`) и сохраняет как алиас чата.
Сообщение от неизвестного собеседника создаёт новый чат автоматически.

## Структура

```
src/
  api/greenApi.ts          — запросы к GREEN-API
  hooks/useNotifications.ts — цикл ReceiveNotification → DeleteNotification
  chatsReducer.ts          — состояние чатов и обработка уведомлений
  components/              — LoginForm, Sidebar, ChatWindow
  App.tsx                  — вход/выход, отправка сообщений
```

## Ограничения

- Только текстовые сообщения (по условию задания); остальные типы уведомлений пропускаются.
- Учётные данные хранятся в `localStorage` браузера — это допустимо для демо, но не для продакшена.
