import { Request, Response } from 'express';
import User from '../models/User';

/**
 * Authentication controller
 * Contains methods for user authentication and management
 */
export default {
  /**
   * Register a new user
   * @param {Request} req - HTTP request with login and password in body
   * @param {Response} res - HTTP response
   */
  async register(req: Request, res: Response): Promise<void> {
    const { login, password } = req.body;

    if (!login || !password) {
      res.status(400).json({ message: 'Login and password are required' });
      return;
    }

    try {
      const isUserExist = await User.checkIfUserExistsByLogin(login);
      if (isUserExist) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }

      const { accessToken, refreshToken } = await User.register(login, password);
      res.status(201).json({ accessToken, refreshToken });
    } catch (error) {
      console.error('Error during user registration:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  },

  /**
   * Login user
   * @param {Request} req - HTTP request with login and password in body
   * @param {Response} res - HTTP response
   */
  async login(req: Request, res: Response): Promise<void> {
    const { login, password } = req.body;

    if (!login || !password) {
      res.status(400).json({ message: 'Login and password are required' });
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
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Error during user login:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  },

  /**
   * Get user by JWT token
   * @param {Request} req - HTTP request with JWT token in body or headers
   * @param {Response} res - HTTP response
   */
  async getUserByToken(req: Request, res: Response): Promise<void> {
    const token = req.body.accessToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(400).json({ message: 'JWT token is required' });
      return;
    }

    try {
      const user = await User.getByJwtToken(token);
      if (user) {
        // Don't send password in response
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      } else {
        res.status(404).json({ message: 'User not found or token invalid' });
      }
    } catch (error) {
      console.error('Error getting user by JWT token:', error);
      res.status(500).json({ message: 'Server error getting user' });
    }
  },

  /**
   * Get all users
   * @param {Request} req - HTTP request
   * @param {Response} res - HTTP response
   */
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await User.getAll();
      // Don't send passwords in response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.status(200).json(usersWithoutPasswords);
    } catch (error) {
      console.error('Error getting all users:', error);
      res.status(500).json({ message: 'Server error getting users' });
    }
  },

  /**
   * Get user by ID
   * @param {Request} req - HTTP request with id parameter
   * @param {Response} res - HTTP response
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
   * Update user
   * @param {Request} req - HTTP request with id parameter and user data in body
   * @param {Response} res - HTTP response
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
   * Delete user
   * @param {Request} req - HTTP request with id parameter
   * @param {Response} res - HTTP response
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
