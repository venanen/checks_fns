import { Pool } from 'mysql2/promise';
import { pool as database } from '../config/database';

// Интерфейс для объекта поездки
export interface ITrip {
  TRIP_ID?: number;
  USER_ID: number;
  NAME: string;
}

// Интерфейс для объекта участника поездки
export interface ITripUser {
  id?: number;
  TRIP_ID: number;
  USER_ID: number;
}

/**
 * Класс для работы с поездками
 */
class Trip {
  private db: Pool;

  constructor() {
    this.db = database;
  }

  /**
   * Получить все поездки
   * @returns {Promise<ITrip[]>} Список всех поездок
   */
  async getAll(): Promise<ITrip[]> {
    try {
      const [rows] = await this.db.query('SELECT * FROM trips');
      return rows as ITrip[];
    } catch (error) {
      console.error('Ошибка при получении списка поездок:', error);
      throw error;
    }
  }

  /**
   * Получить поездку по ID
   * @param {number} id - ID поездки
   * @returns {Promise<ITrip | null>} Поездка или null, если не найдена
   */
  async getById(id: number): Promise<ITrip | null> {
    try {
      const [rows] = await this.db.query('SELECT * FROM trips WHERE TRIP_ID = ?', [id]);
      const trips = rows as ITrip[];
      return trips.length ? trips[0] : null;
    } catch (error) {
      console.error(`Ошибка при получении поездки с ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Получить все поездки пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<ITrip[]>} Список поездок пользователя
   */
  async getByUserId(userId: number): Promise<ITrip[]> {
    try {
      const [rows] = await this.db.query('SELECT * FROM trips WHERE USER_ID = ?', [userId]);
      return rows as ITrip[];
    } catch (error) {
      console.error(`Ошибка при получении поездок пользователя с ID ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Создать новую поездку
   * @param {ITrip} trip - Данные поездки
   * @returns {Promise<ITrip>} Созданная поездка с ID
   */
  async create(trip: ITrip): Promise<ITrip> {
    try {
      const [result] = await this.db.query(
        'INSERT INTO trips (USER_ID, NAME) VALUES (?, ?)',
        [trip.USER_ID, trip.NAME]
      );
      const insertId = (result as any).insertId;
      return { ...trip, TRIP_ID: insertId };
    } catch (error) {
      console.error('Ошибка при создании поездки:', error);
      throw error;
    }
  }

  /**
   * Обновить поездку
   * @param {number} id - ID поездки
   * @param {ITrip} trip - Новые данные поездки
   * @returns {Promise<boolean>} Успешность обновления
   */
  async update(id: number, trip: ITrip): Promise<boolean> {
    try {
      const [result] = await this.db.query(
        'UPDATE trips SET USER_ID = ?, NAME = ? WHERE TRIP_ID = ?',
        [trip.USER_ID, trip.NAME, id]
      );
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error(`Ошибка при обновлении поездки с ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Удалить поездку
   * @param {number} id - ID поездки
   * @returns {Promise<boolean>} Успешность удаления
   */
  async delete(id: number): Promise<boolean> {
    try {
      const [result] = await this.db.query('DELETE FROM trips WHERE TRIP_ID = ?', [id]);
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error(`Ошибка при удалении поездки с ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Добавить пользователя в поездку
   * @param {number} tripId - ID поездки
   * @param {number} userId - ID пользователя
   * @returns {Promise<ITripUser>} Созданная связь
   */
  async addUser(tripId: number, userId: number): Promise<ITripUser> {
    try {
      const [result] = await this.db.query(
        'INSERT INTO trips_users (TRIP_ID, USER_ID) VALUES (?, ?)',
        [tripId, userId]
      );
      const insertId = (result as any).insertId;
      return { id: insertId, TRIP_ID: tripId, USER_ID: userId };
    } catch (error) {
      console.error(`Ошибка при добавлении пользователя ${userId} в поездку ${tripId}:`, error);
      throw error;
    }
  }

  /**
   * Удалить пользователя из поездки
   * @param {number} tripId - ID поездки
   * @param {number} userId - ID пользователя
   * @returns {Promise<boolean>} Успешность удаления
   */
  async removeUser(tripId: number, userId: number): Promise<boolean> {
    try {
      const [result] = await this.db.query(
        'DELETE FROM trips_users WHERE TRIP_ID = ? AND USER_ID = ?',
        [tripId, userId]
      );
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error(`Ошибка при удалении пользователя ${userId} из поездки ${tripId}:`, error);
      throw error;
    }
  }

  /**
   * Получить всех пользователей поездки
   * @param {number} tripId - ID поездки
   * @returns {Promise<number[]>} Список ID пользователей
   */
  async getUsers(tripId: number): Promise<number[]> {
    try {
      const [rows] = await this.db.query(
        'SELECT USER_ID FROM trips_users WHERE TRIP_ID = ?',
        [tripId]
      );
      return (rows as any[]).map(row => row.USER_ID);
    } catch (error) {
      console.error(`Ошибка при получении пользователей поездки ${tripId}:`, error);
      throw error;
    }
  }
}

export default new Trip(); 