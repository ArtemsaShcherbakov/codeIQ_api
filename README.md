# code-iq_api

NestJS API для приёма вебхуков GitHub/GitLab и загрузки изменений в pull/merge request.

## Переменные окружения

Создай файл `.env` в корне проекта (не коммить в git). Примеры:

- **База:** `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- **GitHub API:** `GITHUB_TOKEN` — PAT с доступом к репозиторию (для `GET .../pulls/{n}/files`)
- **Подпись вебхука:** `GITHUB_WEBHOOK_SECRET`, `GITLAB_WEBHOOK_SECRET`
- **Локальная отладка без подписи GitHub:** `ALLOW_GITHUB_UNSIGNED_WEBHOOKS=true` (только для dev)
- **Синхронизация схемы TypeORM (опасно в prod):** `DB_SYNCHRONIZE=true`

В Docker Compose сервис `api` подхватывает `.env` через `env_file`.

## HTTP API

| Метод | Путь | Назначение |
|--------|------|------------|
| `POST` | `/repositories` | Зарегистрировать репозиторий |
| `GET` | `/repositories` | Список зарегистрированных |
| `GET` | `/repositories/:id/changes/latest` | Последний обработанный PR/MR (файлы + `patch`) |
| `POST` | `/webhooks/github` | Webhook GitHub |
| `POST` | `/webhooks/gitlab` | Webhook GitLab |

Пример регистрации репозитория:

```json
{
  "provider": "github",
  "owner": "ArtemsaShcherbakov",
  "name": "test",
  "webhookSecret": "123"
}
```

## Docker Compose

Из корня репозитория.

### Запуск API и PostgreSQL

```bash
docker compose up --build
```

В фоне:

```bash
docker compose up -d --build
```

### Только база данных

```bash
docker compose up -d db
```

### Остановка

```bash
docker compose down
```

### Логи сервиса API

```bash
docker compose logs -f api
```

Последние строки:

```bash
docker compose logs --tail=200 api
```

### Перезапуск API без пересборки

```bash
docker compose restart api
```

### Пересборка образа без кеша

```bash
docker compose build --no-cache
docker compose up -d
```

### Проверка PostgreSQL из контейнера

```bash
docker compose exec db psql -U codeiq -d codeiq -c "SELECT 1"
```

## Локальный запуск без Docker

```bash
pnpm install
pnpm run start:dev
```

Убедись, что Postgres доступен по `DB_HOST` / `DB_PORT` из `.env`.
