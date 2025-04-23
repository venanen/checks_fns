import { Request, Response } from 'express';
import User from '../models/User';

/**
 * Контроллер аутентификации
 * Содержит методы для аутентификации и управления пользователями
 */
export default {
  /**
   * Регистрация нового пользователя
   * @param {Request} req - HTTP запрос с логином и паролем в теле
   * @param {Response} res - HTTP ответ
   */
  async register(req: Request, res: Response): Promise<void> {
    const { login, password } = req.body;

    if (!login || !password) {
      res.status(400).json({ message: 'Логин и пароль обязательны' });
      return;
    }

    try {
      const isUserExist = await User.checkIfUserExistsByLogin(login);
      if (isUserExist) {
        res.status(400).json({ message: 'Пользователь уже существует' });
        return;
      }

      const { accessToken, refreshToken } = await User.register(login, password);
      res.status(201).json({ accessToken, refreshToken });
    } catch (error) {
      console.error('Ошибка при регистрации пользователя:', error);
      res.status(500).json({ message: 'Ошибка сервера при регистрации' });
    }
  },

  /**
   * Вход пользователя
   * @param {Request} req - HTTP запрос с логином и паролем в теле
   * @param {Response} res - HTTP ответ
   */
  async login(req: Request, res: Response): Promise<void> {
    const { login, password } = req.body;

    if (!login || !password) {
      res.status(400).json({ message: 'Логин и пароль обязательны' });
      return;
    }

    try {
      const tokens = await User.login(login, password);
      if (tokens) {
        res.status(200).json({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        });
      } else {
        res.status(401).json({ message: 'Неверные учетные данные' });
      }
    } catch (error) {
      console.error('Ошибка при входе пользователя:', error);
      res.status(500).json({ message: 'Ошибка сервера при входе' });
    }
  },

  /**
   * Получить пользователя по JWT токену
   * @param {Request} req - HTTP запрос с JWT токеном в теле или заголовках
   * @param {Response} res - HTTP ответ
   */
  async getUserByToken(req: Request, res: Response): Promise<void> {
    const token = req.body.accessToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(400).json({ message: 'JWT токен обязателен' });
      return;
    }

    try {
      const user = await User.getByJwtToken(token);
      if (user) {
        // Don't send password in response
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      } else {
        res.status(404).json({ message: 'Пользователь не найден или токен недействителен' });
      }
    } catch (error) {
      console.error('Ошибка при получении пользователя по JWT токену:', error);
      res.status(500).json({ message: 'Ошибка сервера при получении пользователя' });
    }
  },

  /**
   * Получить всех пользователей
   * @param {Request} req - HTTP запрос
   * @param {Response} res - HTTP ответ
   */
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await User.getAll();
      // Don't send passwords in response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.status(200).json(usersWithoutPasswords);
    } catch (error) {
      console.error('Ошибка при получении всех пользователей:', error);
      res.status(500).json({ message: 'Ошибка сервера при получении пользователей' });
    }
  },

  /**
   * Получить пользователя по ID
   * @param {Request} req - HTTP запрос с параметром id
   * @param {Response} res - HTTP ответ
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid ID format' });
        return;
      }

      const user = await User.getById(id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Don't send password in response
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      res.status(500).json({ message: 'Server error getting user' });
    }
  },

  /**
   * Обновить пользователя
   * @param {Request} req - HTTP запрос с параметром id и данными пользователя в теле
   * @param {Response} res - HTTP ответ
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid ID format' });
        return;
      }

      const userData = req.body;
      if (Object.keys(userData).length === 0) {
        res.status(400).json({ message: 'No data provided for update' });
        return;
      }

      const success = await User.update(id, userData);
      if (success) {
        res.status(200).json({ message: 'User updated successfully' });
      } else {
        res.status(404).json({ message: 'User not found or no changes made' });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Server error updating user' });
    }
  },

  /**
   * Удалить пользователя
   * @param {Request} req - HTTP запрос с параметром id
   * @param {Response} res - HTTP ответ
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid ID format' });
        return;
      }

      const success = await User.delete(id);
      if (success) {
        res.status(200).json({ message: 'User deleted successfully' });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Server error deleting user' });
    }
  }
};
