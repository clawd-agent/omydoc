# OmyDoc → Serverless migration notes

## Что уже подготовлено

- Убрана сборка `output: "standalone"` (Docker-ориентированный режим)
- API routes явно закреплены за `runtime = 'nodejs'`
- Добавлены лимиты `maxDuration` для serverless-функций
- Убран filesystem-debug (`/tmp/dadata-debug.log`) из DaData helper

## Целевая платформа (рекомендуется)

- **Vercel** для Next.js app router
- PostgreSQL: Neon / Supabase / managed Postgres

## Переменные окружения

Минимум для текущего функционала:

- `DADATA_API_KEY`
- `NEXT_PUBLIC_YANDEX_METRIKA_ID` (если используете метрику)

Если включаете сохранение документов в БД:

- `DATABASE_URL`

## Checklist запуска

1. Подключить GitHub-репозиторий в Vercel
2. Выбрать project root: `omydoc/`
3. Добавить env vars в Vercel Project Settings
4. Deploy
5. Проверить:
   - `/api/dadata` автозаполнение
   - `/api/generate` генерация PDF
   - скачивание PDF в браузере

## Что ещё можно сделать (следующий шаг)

- Добавить `vercel.json` с `regions` и route-level tuning
- Ограничить rate-limit на `/api/generate` и `/api/dadata`
- Включить Sentry для ошибок serverless-функций
