# OmyDoc: Docker для serverless containers

Этот образ подходит для Cloud Run / Fly.io / Render (web service).

## Локальная проверка

```bash
docker build -t omydoc:serverless .
docker run --rm -p 3000:3000 \
  -e PORT=3000 \
  -e DADATA_API_KEY=xxx \
  omydoc:serverless
```

Открыть: http://localhost:3000

## Важные env

- `PORT` — выставляется платформой автоматически
- `NODE_ENV=production`
- `DADATA_API_KEY` (и прочие ключи проекта)

## Почему этот Dockerfile подходит для serverless

- Next.js собирается в `standalone` и запускается одним `node server.js`
- Приложение слушает `0.0.0.0:$PORT`
- Runtime-образ минимальный (только нужные артефакты)
- Не зависит от локальных файлов `node_modules/.next` в рантайме
