# TradeOn

## Запуск через Docker Compose

1. Скопируйте `.env.example` в `.env` и при необходимости измените настройки.
2. Запустите приложение:

   ```bash
   docker compose up --build
   ```

После запуска доступны:

- frontend: http://localhost:3000
- backend API: http://localhost:8080/api
- Swagger: http://localhost:8080/api/swagger/index.html
- PostgreSQL: `localhost:5432`

Миграции применяются автоматически перед запуском backend. Данные PostgreSQL
хранятся в именованном Docker volume `tradeon_postgres_data`.

Остановка:

```bash
docker compose down
```

Чтобы также удалить локальные данные базы:

```bash
docker compose down -v
```
