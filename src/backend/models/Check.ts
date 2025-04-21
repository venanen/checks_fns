import { Pool } from 'mysql2/promise';
import { pool as database } from '../config/database';

// Интерфейс для объекта чека
export interface ICheck {
  CHECK_ID?: number;
  TRIP_ID: number;
  USER_ID: number;
  CHECK_SUM: number;
}

/**
 * Класс для работы с чеками
 */
class Check {
  private db: Pool;

  constructor() {
    this.db = database;
  }

  /**
   * Получить все чеки
   * @returns {Promise<ICheck[]>} Список всех чеков
   */
  async getAll(): Promise<ICheck[]> {
    try {
      const [rows] = await this.db.query('SELECT * FROM trip_checks');
      return rows as ICheck[];
    } catch (error) {
      console.error('Ошибка при получении списка чеков:', error);
      throw error;
    }
  }

  /**
   * Получить чек по ID
   * @param {number} id - ID чека
   * @returns {Promise<ICheck | null>} Чек или null, если не найден
   */
  async getById(id: number): Promise<ICheck | null> {
    try {
      const [rows] = await this.db.query('SELECT * FROM trip_checks WHERE CHECK_ID = ?', [id]);
      const checks = rows as ICheck[];
      return checks.length ? checks[0] : null;
    } catch (error) {
      console.error(`Ошибка при получении чека с ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Получить все чеки поездки
   * @param {number} tripId - ID поездки
   * @returns {Promise<ICheck[]>} Список чеков поездки
   */
  async getByTripId(tripId: number): Promise<ICheck[]> {
    try {
      const [rows] = await this.db.query('SELECT * FROM trip_checks WHERE TRIP_ID = ?', [tripId]);
      return rows as ICheck[];
    } catch (error) {
      console.error(`Ошибка при получении чеков поездки с ID ${tripId}:`, error);
      throw error;
    }
  }

  /**
   * Получить все чеки пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<ICheck[]>} Список чеков пользователя
   */
  async getByUserId(userId: number): Promise<ICheck[]> {
    try {
      const [rows] = await this.db.query('SELECT * FROM trip_checks WHERE USER_ID = ?', [userId]);
      return rows as ICheck[];
    } catch (error) {
      console.error(`Ошибка при получении чеков пользователя с ID ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Создать новый чек
   * @param {ICheck} check - Данные чека
   * @returns {Promise<ICheck>} Созданный чек с ID
   */
  async create(check: ICheck): Promise<ICheck> {
    try {
      const [result] = await this.db.query(
        'INSERT INTO trip_checks (TRIP_ID, USER_ID, CHECK_SUM) VALUES (?, ?, ?)',
        [check.TRIP_ID, check.USER_ID, check.CHECK_SUM]
      );
      const insertId = (result as any).insertId;
      return { ...check, CHECK_ID: insertId };
    } catch (error) {
      console.error('Ошибка при создании чека:', error);
      throw error;
    }
  }

  /**
   * Обновить чек
   * @param {number} id - ID чека
   * @param {ICheck} check - Новые данные чека
   * @returns {Promise<boolean>} Успешность обновления
   */
  async update(id: number, check: ICheck): Promise<boolean> {
    try {
      const [result] = await this.db.query(
        'UPDATE trip_checks SET TRIP_ID = ?, USER_ID = ?, CHECK_SUM = ? WHERE CHECK_ID = ?',
        [check.TRIP_ID, check.USER_ID, check.CHECK_SUM, id]
      );
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error(`Ошибка при обновлении чека с ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Удалить чек
   * @param {number} id - ID чека
   * @returns {Promise<boolean>} Успешность удаления
   */
  async delete(id: number): Promise<boolean> {
    try {
      const [result] = await this.db.query('DELETE FROM trip_checks WHERE CHECK_ID = ?', [id]);
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error(`Ошибка при удалении чека с ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Получить общую сумму чеков по поездке
   * @param {number} tripId - ID поездки
   * @returns {Promise<number>} Общая сумма чеков
   */
  async getTotalSumByTrip(tripId: number): Promise<number> {
    try {
      const [rows] = await this.db.query(
        'SELECT SUM(CHECK_SUM) as total FROM trip_checks WHERE TRIP_ID = ?',
        [tripId]
      );
      return rows[0].total || 0;
    } catch (error) {
      console.error(`Ошибка при получении общей суммы чеков поездки ${tripId}:`, error);
      throw error;
    }
  }
}

export default new Check(); 