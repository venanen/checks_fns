import { Pool } from 'mysql2/promise';
import { pool as database } from '../config/database';

// Интерфейс для объекта товара
export interface IGood {
  GOOD_ID?: number;
  CHECK_ID: number;
  NAME: string;
  PRICE: number;
  QUANTITY: number;
}

/**
 * Класс для работы с товарами
 */
class Good {
  private db: Pool;

  constructor() {
    this.db = database;
  }

  /**
   * Получить все товары
   * @returns {Promise<IGood[]>} Список всех товаров
   */
  async getAll(): Promise<IGood[]> {
    try {
      const [rows] = await this.db.query('SELECT * FROM goods');
      return rows as IGood[];
    } catch (error) {
      console.error('Ошибка при получении списка товаров:', error);
      throw error;
    }
  }

  /**
   * Получить товар по ID
   * @param {number} id - ID товара
   * @returns {Promise<IGood | null>} Товар или null, если не найден
   */
  async getById(id: number): Promise<IGood | null> {
    try {
      const [rows] = await this.db.query('SELECT * FROM goods WHERE GOOD_ID = ?', [id]);
      const goods = rows as IGood[];
      return goods.length ? goods[0] : null;
    } catch (error) {
      console.error(`Ошибка при получении товара с ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Получить все товары чека
   * @param {number} checkId - ID чека
   * @returns {Promise<IGood[]>} Список товаров чека
   */
  async getByCheckId(checkId: number): Promise<IGood[]> {
    try {
      const [rows] = await this.db.query('SELECT * FROM goods WHERE CHECK_ID = ?', [checkId]);
      return rows as IGood[];
    } catch (error) {
      console.error(`Ошибка при получении товаров чека с ID ${checkId}:`, error);
      throw error;
    }
  }

  /**
   * Создать новый товар
   * @param {IGood} good - Данные товара
   * @returns {Promise<IGood>} Созданный товар с ID
   */
  async create(good: IGood): Promise<IGood> {
    try {
      const [result] = await this.db.query(
        'INSERT INTO goods (CHECK_ID, NAME, PRICE, QUANTITY) VALUES (?, ?, ?, ?)',
        [good.CHECK_ID, good.NAME, good.PRICE, good.QUANTITY]
      );
      const insertId = (result as any).insertId;
      return { ...good, GOOD_ID: insertId };
    } catch (error) {
      console.error('Ошибка при создании товара:', error);
      throw error;
    }
  }

  /**
   * Обновить товар
   * @param {number} id - ID товара
   * @param {IGood} good - Новые данные товара
   * @returns {Promise<boolean>} Успешность обновления
   */
  async update(id: number, good: IGood): Promise<boolean> {
    try {
      const [result] = await this.db.query(
        'UPDATE goods SET CHECK_ID = ?, NAME = ?, PRICE = ?, QUANTITY = ? WHERE GOOD_ID = ?',
        [good.CHECK_ID, good.NAME, good.PRICE, good.QUANTITY, id]
      );
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error(`Ошибка при обновлении товара с ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Удалить товар
   * @param {number} id - ID товара
   * @returns {Promise<boolean>} Успешность удаления
   */
  async delete(id: number): Promise<boolean> {
    try {
      const [result] = await this.db.query('DELETE FROM goods WHERE GOOD_ID = ?', [id]);
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error(`Ошибка при удалении товара с ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Получить общую стоимость товаров в чеке
   * @param {number} checkId - ID чека
   * @returns {Promise<number>} Общая стоимость
   */
  async getTotalByCheck(checkId: number): Promise<number> {
    try {
      const [rows] = await this.db.query(
        'SELECT SUM(PRICE * QUANTITY) as total FROM goods WHERE CHECK_ID = ?',
        [checkId]
      );
      return rows[0].total || 0;
    } catch (error) {
      console.error(`Ошибка при получении общей стоимости товаров чека ${checkId}:`, error);
      throw error;
    }
  }

  /**
   * Массовое создание товаров
   * @param {IGood[]} goods - Массив товаров для создания
   * @returns {Promise<IGood[]>} Массив созданных товаров с ID
   */
  async bulkCreate(goods: IGood[]): Promise<IGood[]> {
    try {
      const createdGoods: IGood[] = [];
      for (const good of goods) {
        const createdGood = await this.create(good);
        createdGoods.push(createdGood);
      }
      return createdGoods;
    } catch (error) {
      console.error('Ошибка при массовом создании товаров:', error);
      throw error;
    }
  }
}

export default new Good(); 