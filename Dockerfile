FROM node:20-alpine

WORKDIR /app

# Копирование файлов package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копирование исходного кода
COPY . .

# Компиляция TypeScript в JavaScript
RUN npm run build || (mkdir -p dist && npx tsc)

# Открытие порта, на котором работает приложение
EXPOSE 7000

# Запуск приложения
CMD ["npm", "start"]

# Комментарий: Dockerfile для Node.js приложения с TypeScript
# Используется образ node:20-alpine для минимального размера
# Приложение будет доступно на порту 7000
