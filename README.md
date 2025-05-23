# Checks FNS Application

Приложение для управления чеками и поездками с использованием Node.js, TypeScript и MySQL.

## Запуск с использованием Docker

### Предварительные требования

- Docker
- Docker Compose

### Шаги для запуска

1. Клонируйте репозиторий:
   ```
   git clone <repository-url>
   cd checks_fns
   ```

2. Запустите приложение с помощью Docker Compose:
   ```
   docker-compose up -d
   ```

   Это запустит два контейнера:
   - Node.js приложение (доступно на порту 7000)
   - MySQL база данных (доступна на порту 3306)

3. Проверьте, что приложение работает, открыв в браузере:
   ```
   http://localhost:7000
   ```

4. Для остановки приложения выполните:
   ```
   docker-compose down
   ```

5. Для остановки приложения и удаления всех данных:
   ```
   docker-compose down -v
   ```

## Структура проекта

- `src/` - исходный код приложения
  - `backend/` - серверная часть приложения
    - `config/` - конфигурационные файлы
    - `controllers/` - контроллеры
    - `models/` - модели данных
    - `routes/` - маршруты API
- `Dockerfile` - инструкции для сборки Docker-образа приложения
- `docker-compose.yml` - конфигурация для запуска приложения и базы данных
- `init.sql` - SQL-скрипт для инициализации базы данных

## База данных

Приложение использует MySQL базу данных со следующими таблицами:
- `users` - пользователи
- `trips` - поездки
- `trip_checks` - проверки поездок
- `goods` - товары
- `trips_users` - связь между поездками и пользователями

## Разработка

Для разработки без Docker можно использовать:

```
npm install
npm run dev
```

Для запуска тестов:

```
npm test
```
