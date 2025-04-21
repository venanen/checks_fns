import { Request, Response } from 'express';
import Trip, { ITrip } from '../models/Trip';

/**
 * Контроллер поездок
 * Содержит методы для управления поездками
 */
export default {
  /**
   * Получить все поездки
   * @param {Request} req - HTTP запрос
   * @param {Response} res - HTTP ответ
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const trips = await Trip.getAll();
      res.status(200).json(trips);
    } catch (error) {
      console.error('Ошибка при получении всех поездок:', error);
      res.status(500).json({ message: 'Ошибка сервера при получении поездок' });
    }
  },

  /**
   * Получить поездку по ID
   * @param {Request} req - HTTP запрос с параметром id
   * @param {Response} res - HTTP ответ
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ message: 'Неверный формат ID' });
        return;
      }

      const trip = await Trip.getById(id);
      if (!trip) {
        res.status(404).json({ message: 'Поездка не найдена' });
        return;
      }

      res.status(200).json(trip);
    } catch (error) {
      console.error(`Ошибка при получении поездки по ID:`, error);
      res.status(500).json({ message: 'Ошибка сервера при получении поездки' });
    }
  },

  /**
   * Получить все поездки пользователя
   * @param {Request} req - HTTP запрос с параметром userId
   * @param {Response} res - HTTP ответ
   */
  async getByUserId(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        res.status(400).json({ message: 'Неверный формат ID пользователя' });
        return;
      }

      const trips = await Trip.getByUserId(userId);
      res.status(200).json(trips);
    } catch (error) {
      console.error(`Ошибка при получении поездок пользователя:`, error);
      res.status(500).json({ message: 'Ошибка сервера при получении поездок пользователя' });
    }
  },

  /**
   * Создать новую поездку
   * @param {Request} req - HTTP запрос с данными поездки в теле
   * @param {Response} res - HTTP ответ
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const tripData: ITrip = req.body;

      // Валидация данных
      if (!tripData.USER_ID || !tripData.NAME) {
        res.status(400).json({ message: 'Не все обязательные поля заполнены' });
        return;
      }

      const newTrip = await Trip.create(tripData);
      res.status(201).json(newTrip);
    } catch (error) {
      console.error('Ошибка при создании поездки:', error);
      res.status(500).json({ message: 'Ошибка сервера при создании поездки' });
    }
  },

  /**
   * Обновить поездку
   * @param {Request} req - HTTP запрос с параметром id и данными в теле
   * @param {Response} res - HTTP ответ
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ message: 'Неверный формат ID' });
        return;
      }

      const tripData: ITrip = req.body;

      // Валидация данных
      if (!tripData.USER_ID || !tripData.NAME) {
        res.status(400).json({ message: 'Не все обязательные поля заполнены' });
        return;
      }

      // Проверка существования записи
      const existingTrip = await Trip.getById(id);
      if (!existingTrip) {
        res.status(404).json({ message: 'Поездка не найдена' });
        return;
      }

      const updated = await Trip.update(id, tripData);
      if (updated) {
        res.status(200).json({ message: 'Поездка успешно обновлена' });
      } else {
        res.status(500).json({ message: 'Не удалось обновить поездку' });
      }
    } catch (error) {
      console.error(`Ошибка при обновлении поездки:`, error);
      res.status(500).json({ message: 'Ошибка сервера при обновлении поездки' });
    }
  },

  /**
   * Удалить поездку
   * @param {Request} req - HTTP запрос с параметром id
   * @param {Response} res - HTTP ответ
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ message: 'Неверный формат ID' });
        return;
      }

      // Проверка существования записи
      const existingTrip = await Trip.getById(id);
      if (!existingTrip) {
        res.status(404).json({ message: 'Поездка не найдена' });
        return;
      }

      const deleted = await Trip.delete(id);
      if (deleted) {
        res.status(200).json({ message: 'Поездка успешно удалена' });
      } else {
        res.status(500).json({ message: 'Не удалось удалить поездку' });
      }
    } catch (error) {
      console.error(`Ошибка при удалении поездки:`, error);
      res.status(500).json({ message: 'Ошибка сервера при удалении поездки' });
    }
  },

  /**
   * Добавить пользователя в поездку
   * @param {Request} req - HTTP запрос с параметрами id и userId
   * @param {Response} res - HTTP ответ
   */
  async addUser(req: Request, res: Response): Promise<void> {
    try {
      const tripId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);

      if (isNaN(tripId) || isNaN(userId)) {
        res.status(400).json({ message: 'Неверный формат ID' });
        return;
      }

      // Проверка существования поездки
      const existingTrip = await Trip.getById(tripId);
      if (!existingTrip) {
        res.status(404).json({ message: 'Поездка не найдена' });
        return;
      }

      const tripUser = await Trip.addUser(tripId, userId);
      res.status(201).json(tripUser);
    } catch (error) {
      console.error(`Ошибка при добавлении пользователя в поездку:`, error);
      res.status(500).json({ message: 'Ошибка сервера при добавлении пользователя в поездку' });
    }
  },

  /**
   * Удалить пользователя из поездки
   * @param {Request} req - HTTP запрос с параметрами id и userId
   * @param {Response} res - HTTP ответ
   */
  async removeUser(req: Request, res: Response): Promise<void> {
    try {
      const tripId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);

      if (isNaN(tripId) || isNaN(userId)) {
        res.status(400).json({ message: 'Неверный формат ID' });
        return;
      }

      const removed = await Trip.removeUser(tripId, userId);
      if (removed) {
        res.status(200).json({ message: 'Пользователь успешно удален из поездки' });
      } else {
        res.status(404).json({ message: 'Пользователь не найден в поездке' });
      }
    } catch (error) {
      console.error(`Ошибка при удалении пользователя из поездки:`, error);
      res.status(500).json({ message: 'Ошибка сервера при удалении пользователя из поездки' });
    }
  },

  /**
   * Получить всех пользователей поездки
   * @param {Request} req - HTTP запрос с параметром id
   * @param {Response} res - HTTP ответ
   */
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const tripId = parseInt(req.params.id);
      if (isNaN(tripId)) {
        res.status(400).json({ message: 'Неверный формат ID' });
        return;
      }

      // Проверка существования поездки
      const existingTrip = await Trip.getById(tripId);
      if (!existingTrip) {
        res.status(404).json({ message: 'Поездка не найдена' });
        return;
      }

      const users = await Trip.getUsers(tripId);
      res.status(200).json(users);
    } catch (error) {
      console.error(`Ошибка при получении пользователей поездки:`, error);
      res.status(500).json({ message: 'Ошибка сервера при получении пользователей поездки' });
    }
  }
};
