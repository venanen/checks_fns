import { Request, Response } from 'express';
import Good, { IGood } from '../models/Good';

/**
 * Контроллер товаров
 * Содержит методы для управления товарами
 */
export default {
  /**
   * Получить все товары
   * @param {Request} req - HTTP запрос
   * @param {Response} res - HTTP ответ
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const goods = await Good.getAll();
      res.status(200).json(goods);
    } catch (error) {
      console.error('Ошибка при получении всех товаров:', error);
      res.status(500).json({ message: 'Ошибка сервера при получении товаров' });
    }
  },

  /**
   * Получить товар по ID
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

      const good = await Good.getById(id);
      if (!good) {
        res.status(404).json({ message: 'Товар не найден' });
        return;
      }

      res.status(200).json(good);
    } catch (error) {
      console.error(`Ошибка при получении товара по ID:`, error);
      res.status(500).json({ message: 'Ошибка сервера при получении товара' });
    }
  },

  /**
   * Получить все товары чека
   * @param {Request} req - HTTP запрос с параметром checkId
   * @param {Response} res - HTTP ответ
   */
  async getByCheckId(req: Request, res: Response): Promise<void> {
    try {
      const checkId = parseInt(req.params.checkId);
      if (isNaN(checkId)) {
        res.status(400).json({ message: 'Неверный формат ID чека' });
        return;
      }

      const goods = await Good.getByCheckId(checkId);
      res.status(200).json(goods);
    } catch (error) {
      console.error(`Ошибка при получении товаров чека:`, error);
      res.status(500).json({ message: 'Ошибка сервера при получении товаров чека' });
    }
  },

  /**
   * Создать новый товар
   * @param {Request} req - HTTP запрос с данными товара в теле
   * @param {Response} res - HTTP ответ
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const goodData: IGood = req.body;

      // Валидация данных
      if (!goodData.CHECK_ID || !goodData.NAME || goodData.PRICE === undefined || goodData.QUANTITY === undefined) {
        res.status(400).json({ message: 'Не все обязательные поля заполнены' });
        return;
      }

      const newGood = await Good.create(goodData);
      res.status(201).json(newGood);
    } catch (error) {
      console.error('Ошибка при создании товара:', error);
      res.status(500).json({ message: 'Ошибка сервера при создании товара' });
    }
  },

  /**
   * Обновить товар
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

      const goodData: IGood = req.body;

      // Валидация данных
      if (!goodData.CHECK_ID || !goodData.NAME || goodData.PRICE === undefined || goodData.QUANTITY === undefined) {
        res.status(400).json({ message: 'Не все обязательные поля заполнены' });
        return;
      }

      // Проверка существования записи
      const existingGood = await Good.getById(id);
      if (!existingGood) {
        res.status(404).json({ message: 'Товар не найден' });
        return;
      }

      const updated = await Good.update(id, goodData);
      if (updated) {
        res.status(200).json({ message: 'Товар успешно обновлен' });
      } else {
        res.status(500).json({ message: 'Не удалось обновить товар' });
      }
    } catch (error) {
      console.error(`Ошибка при обновлении товара:`, error);
      res.status(500).json({ message: 'Ошибка сервера при обновлении товара' });
    }
  },

  /**
   * Удалить товар
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
      const existingGood = await Good.getById(id);
      if (!existingGood) {
        res.status(404).json({ message: 'Товар не найден' });
        return;
      }

      const deleted = await Good.delete(id);
      if (deleted) {
        res.status(200).json({ message: 'Товар успешно удален' });
      } else {
        res.status(500).json({ message: 'Не удалось удалить товар' });
      }
    } catch (error) {
      console.error(`Ошибка при удалении товара:`, error);
      res.status(500).json({ message: 'Ошибка сервера при удалении товара' });
    }
  },

  /**
   * Получить общую стоимость товаров в чеке
   * @param {Request} req - HTTP запрос с параметром checkId
   * @param {Response} res - HTTP ответ
   */
  async getTotalByCheck(req: Request, res: Response): Promise<void> {
    try {
      const checkId = parseInt(req.params.checkId);
      if (isNaN(checkId)) {
        res.status(400).json({ message: 'Неверный формат ID чека' });
        return;
      }

      const total = await Good.getTotalByCheck(checkId);
      res.status(200).json({ total });
    } catch (error) {
      console.error(`Ошибка при получении общей стоимости товаров чека:`, error);
      res.status(500).json({ message: 'Ошибка сервера при получении общей стоимости товаров' });
    }
  },

  /**
   * Массовое создание товаров
   * @param {Request} req - HTTP запрос с массивом товаров в теле
   * @param {Response} res - HTTP ответ
   */
  async bulkCreate(req: Request, res: Response): Promise<void> {
    try {
      const goodsData: IGood[] = req.body;

      // Валидация данных
      if (!Array.isArray(goodsData) || goodsData.length === 0) {
        res.status(400).json({ message: 'Не передан массив товаров' });
        return;
      }

      for (const good of goodsData) {
        if (!good.CHECK_ID || !good.NAME || good.PRICE === undefined || good.QUANTITY === undefined) {
          res.status(400).json({ message: 'Не все обязательные поля заполнены в одном из товаров' });
          return;
        }
      }

      const createdGoods = await Good.bulkCreate(goodsData);
      res.status(201).json(createdGoods);
    } catch (error) {
      console.error('Ошибка при массовом создании товаров:', error);
      res.status(500).json({ message: 'Ошибка сервера при массовом создании товаров' });
    }
  },

  /**
   * Получить все товары поездки
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

      const goods = await Good.getByTripId(tripId);
      res.status(200).json(goods);
    } catch (error) {
      console.error(`Ошибка при получении товаров поездки:`, error);
      res.status(500).json({ message: 'Ошибка сервера при получении товаров поездки' });
    }
  }
};
