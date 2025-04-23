/**
 * Утилиты общего назначения
 * Содержит общие функции, используемые в разных частях приложения
 */

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// JWT secret key - должен быть в переменных окружения в production
export const JWT_SECRET = 'your-secret-key-here';
export const JWT_EXPIRES_IN = '1h';

/**
 * Интерфейс для JWT payload
 */
export interface IJwtPayload {
  userId: number;
  login: string;
}

/**
 * Генерирует JWT токен
 * @param {number} userId - ID пользователя
 * @param {string} login - Логин пользователя
 * @returns {string} JWT токен
 */
export const generateJwtToken = (userId: number, login: string): string => {
  const payload: IJwtPayload = { userId, login };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Проверяет JWT токен
 * @param {string} token - JWT токен
 * @returns {IJwtPayload | null} Декодированный payload или null, если токен недействителен
 */
export const verifyJwtToken = (token: string): IJwtPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as IJwtPayload;
    return decoded;
  } catch (error) {
    console.error('Ошибка при проверке JWT токена:', error);
    return null;
  }
};

/**
 * Обрабатывает ошибки сервера и отправляет соответствующий ответ
 * @param {Response} res - HTTP ответ
 * @param {Error} error - Объект ошибки
 * @param {string} message - Сообщение об ошибке
 */
export const handleServerError = (res: Response, error: any, message: string): void => {
  console.error(message, error);
  res.status(500).json({ message: message });
};

/**
 * Проверяет, является ли строка числом
 * @param {string} value - Строка для проверки
 * @returns {boolean} true, если строка является числом
 */
export const isNumeric = (value: string): boolean => {
  return !isNaN(Number(value));
};

/**
 * Проверяет ID и возвращает его числовое значение или null
 * @param {string} id - ID для проверки
 * @returns {number | null} Числовое значение ID или null, если ID некорректен
 */
export const validateId = (id: string): number | null => {
  const numId = parseInt(id);
  return isNaN(numId) ? null : numId;
};

/**
 * Отправляет ответ с ошибкой валидации
 * @param {Response} res - HTTP ответ
 * @param {string} message - Сообщение об ошибке
 */
export const sendValidationError = (res: Response, message: string): void => {
  res.status(400).json({ message });
};

/**
 * Отправляет ответ с ошибкой "не найдено"
 * @param {Response} res - HTTP ответ
 * @param {string} message - Сообщение об ошибке
 */
export const sendNotFoundError = (res: Response, message: string): void => {
  res.status(404).json({ message });
};
