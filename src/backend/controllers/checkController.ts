import { Request, Response } from 'express';
import Check, { ICheck } from '../models/Check';

/**
 * Контроллер чеков
 * Содержит методы для управления чеками
 */
export default {
  /**
   * Получить все чеки
   * @param {Request} req - HTTP запрос
   * @param {Response} res - HTTP ответ
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const checks = await Check.getAll();
      res.status(200).json(checks);
    } catch (error) {
      console.error('Ошибка при получении всех чеков:', error);
      res.status(500).json({ message: 'Ошибка сервера при получении чеков' });
    }
  },

  /**
   * Получить чек по ID
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

      const check = await Check.getById(id);
      if (!check) {
        res.status(404).json({ message: 'Чек не найден' });
        return;
      }

      res.status(200).json(check);
    } catch (error) {
      console.error(`Ошибка при получении чека по ID:`, error);
      res.status(500).json({ message: 'Ошибка сервера при получении чека' });
    }
  },

  /**
   * Получить все чеки поездки
   * @param {Request} req - HTTP запрос с параметром tripId
   * @param {Response} res - HTTP ответ
   */
  async getByTripId(req: Request, res: Response): Promise<void> {
    try {
      const tripId = parseInt(req.params.tripId);
      if (isNaN(tripId)) {
        res.status(400).json({ message: 'Неверный формат ID поездки' });
        return;
      }

      const checks = await Check.getByTripId(tripId);
      res.status(200).json(checks);
    } catch (error) {
      console.error(`Ошибка при получении чеков поездки:`, error);
      res.status(500).json({ message: 'Ошибка сервера при получении чеков поездки' });
    }
  },

  /**
   * Получить все чеки пользователя
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

      const checks = await Check.getByUserId(userId);
      res.status(200).json(checks);
    } catch (error) {
      console.error(`Ошибка при получении чеков пользователя:`, error);
      res.status(500).json({ message: 'Ошибка сервера при получении чеков пользователя' });
    }
  },

  /**
   * Создать новый чек
   * @param {Request} req - HTTP запрос с данными чека в теле
   * @param {Response} res - HTTP ответ
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const checkData: ICheck = req.body;

      // Валидация данных
      if (!checkData.TRIP_ID || !checkData.USER_ID || checkData.CHECK_SUM === undefined) {
        res.status(400).json({ message: 'Не все обязательные поля заполнены' });
        return;
      }

      const newCheck = await Check.create(checkData);
      res.status(201).json(newCheck);
    } catch (error) {
      console.error('Ошибка при создании чека:', error);
      res.status(500).json({ message: 'Ошибка сервера при создании чека' });
    }
  },

  /**
   * Обновить чек частично или полностью
   * @param req - Запрос Express
   * @param res - Ответ Express
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ message: 'Неверный формат ID' });
        return;
      }

      // Используем Partial<ICheck> для частичного обновления
      const checkData: Partial<ICheck> = req.body;

      // Проверка валидности предоставленных данных (если они есть)
      if (Object.keys(checkData).length === 0) {
        res.status(400).json({ message: 'Не предоставлены данные для обновления' });
        return;
      }

      // Валидация отдельных полей, если они присутствуют
      if (checkData.TRIP_ID !== undefined && typeof checkData.TRIP_ID !== 'number') {
        res.status(400).json({ message: 'Некорректное значение TRIP_ID' });
        return;
      }

      if (checkData.USER_ID !== undefined && typeof checkData.USER_ID !== 'number') {
        res.status(400).json({ message: 'Некорректное значение USER_ID' });
        return;
      }

      if (checkData.CHECK_SUM !== undefined && typeof checkData.CHECK_SUM !== 'number') {
        res.status(400).json({ message: 'Некорректное значение CHECK_SUM' });
        return;
      }

      // Проверка существования записи
      const existingCheck = await Check.getById(id);
      if (!existingCheck) {
        res.status(404).json({ message: 'Чек не найден' });
        return;
      }

      const updated = await Check.update(id, checkData);
      if (updated) {
        res.status(200).json({ message: 'Чек успешно обновлен' });
      } else {
        res.status(500).json({ message: 'Не удалось обновить чек' });
      }
    } catch (error) {
      console.error(`Ошибка при обновлении чека:`, error);
      res.status(500).json({ message: 'Ошибка сервера при обновлении чека' });
    }
  },

  /**
   * Удалить чек
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
      const existingCheck = await Check.getById(id);
      if (!existingCheck) {
        res.status(404).json({ message: 'Чек не найден' });
        return;
      }

      const deleted = await Check.delete(id);
      if (deleted) {
        res.status(200).json({ message: 'Чек успешно удален' });
      } else {
        res.status(500).json({ message: 'Не удалось удалить чек' });
      }
    } catch (error) {
      console.error(`Ошибка при удалении чека:`, error);
      res.status(500).json({ message: 'Ошибка сервера при удалении чека' });
    }
  },

  /**
   * Получить общую сумму чеков по поездке
   * @param {Request} req - HTTP запрос с параметром tripId
   * @param {Response} res - HTTP ответ
   */
  async getTotalSumByTrip(req: Request, res: Response): Promise<void> {
    try {
      const tripId = parseInt(req.params.tripId);
      if (isNaN(tripId)) {
        res.status(400).json({ message: 'Неверный формат ID поездки' });
        return;
      }

      const totalSum = await Check.getTotalSumByTrip(tripId);
      res.status(200).json({ totalSum });
    } catch (error) {
      console.error(`Ошибка при получении общей суммы чеков поездки:`, error);
      res.status(500).json({ message: 'Ошибка сервера при получении общей суммы чеков' });
    }
  }
};
