import { Pool } from 'mysql2/promise';
import { pool as database } from '../config/database';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { SALT_ROUND } from '../config/config';

// JWT secret key - should be in environment variables in production
const JWT_SECRET = 'your-secret-key-here';
const JWT_EXPIRES_IN = '1h';

// Interface for user object
export interface IUser {
  USER_ID?: number;
  login: string;
  password: string;
  token?: string; // Used as refresh token
}

// Interface for JWT payload
export interface IJwtPayload {
  userId: number;
  login: string;
}

/**
 * Class for working with users
 */
class User {
  private db: Pool;

  constructor() {
    this.db = database;
  }

  /**
   * Generate JWT token
   * @param {number} userId - User ID
   * @param {string} login - User login
   * @returns {string} JWT token
   */
  generateJwtToken(userId: number, login: string): string {
    const payload: IJwtPayload = { userId, login };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {IJwtPayload | null} Decoded payload or null if invalid
   */
  verifyJwtToken(token: string): IJwtPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as IJwtPayload;
      return decoded;
    } catch (error) {
      console.error('Error verifying JWT token:', error);
      return null;
    }
  }

  /**
   * Static method to verify JWT token
   * @param {string} token - JWT token
   * @returns {IJwtPayload | null} Decoded payload or null if invalid
   */
  static verifyJwtToken(token: string): IJwtPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as IJwtPayload;
      return decoded;
    } catch (error) {
      console.error('Error verifying JWT token:', error);
      return null;
    }
  }

  /**
   * Get all users
   * @returns {Promise<IUser[]>} List of all users
   */
  async getAll(): Promise<IUser[]> {
    try {
      const [rows] = await this.db.query('SELECT * FROM users');
      return rows as IUser[];
    } catch (error) {
      console.error('Error getting users list:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise<IUser | null>} User or null if not found
   */
  async getById(id: number): Promise<IUser | null> {
    try {
      const [rows] = await this.db.query('SELECT * FROM users WHERE USER_ID = ?', [id]);
      const users = rows as IUser[];
      return users.length ? users[0] : null;
    } catch (error) {
      console.error(`Error getting user with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get user by login
   * @param {string} login - User login
   * @returns {Promise<IUser | null>} User or null if not found
   */
  async getByLogin(login: string): Promise<IUser | null> {
    try {
      const [rows] = await this.db.query('SELECT * FROM users WHERE login = ?', [login]);
      const users = rows as IUser[];
      return users.length ? users[0] : null;
    } catch (error) {
      console.error(`Error getting user with login ${login}:`, error);
      throw error;
    }
  }

  /**
   * Get user by refresh token
   * @param {string} token - User refresh token
   * @returns {Promise<IUser | null>} User or null if not found
   */
  async getByToken(token: string): Promise<IUser | null> {
    try {
      const [rows] = await this.db.query('SELECT * FROM users WHERE token = ?', [token]);
      const users = rows as IUser[];
      return users.length ? users[0] : null;
    } catch (error) {
      console.error(`Error getting user with refresh token ${token}:`, error);
      throw error;
    }
  }

  /**
   * Get user by JWT token
   * @param {string} jwtToken - JWT token
   * @returns {Promise<IUser | null>} User or null if not found or token invalid
   */
  async getByJwtToken(jwtToken: string): Promise<IUser | null> {
    try {
      const payload = this.verifyJwtToken(jwtToken);
      if (!payload) return null;

      return await this.getById(payload.userId);
    } catch (error) {
      console.error(`Error getting user with JWT token:`, error);
      throw error;
    }
  }

  /**
   * Check if user exists by login
   * @param {string} login - User login
   * @returns {Promise<boolean>} True if user exists
   */
  async checkIfUserExistsByLogin(login: string): Promise<boolean> {
    try {
      const user = await this.getByLogin(login);
      return !!user;
    } catch (error) {
      console.error(`Error checking if user exists with login ${login}:`, error);
      throw error;
    }
  }

  /**
   * Register a new user
   * @param {string} login - User login
   * @param {string} password - User password
   * @returns {Promise<{accessToken: string, refreshToken: string}>} JWT access token and refresh token
   */
  async register(login: string, password: string): Promise<{accessToken: string, refreshToken: string}> {
    try {
      const salt = await bcrypt.genSalt(SALT_ROUND);
      const hashedPassword = await bcrypt.hash(password, salt);
      const refreshToken = crypto.randomBytes(32).toString('hex');

      const [result] = await this.db.query(
        'INSERT INTO users (login, password, token) VALUES (?, ?, ?)',
        [login, hashedPassword, refreshToken]
      );

      const userId = (result as any).insertId;
      const accessToken = this.generateJwtToken(userId, login);

      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Error during user registration:', error);
      throw error;
    }
  }

  /**
   * Login user
   * @param {string} login - User login
   * @param {string} password - User password
   * @returns {Promise<{accessToken: string, refreshToken: string} | null>} JWT access token and refresh token or null if login failed
   */
  async login(login: string, password: string): Promise<{accessToken: string, refreshToken: string} | null> {
    try {
      const user = await this.getByLogin(login);

      if (!user) return null;

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return null;

      // Generate new JWT token
      const accessToken = this.generateJwtToken(user.USER_ID!, user.login);

      return {
        accessToken,
        refreshToken: user.token!
      };
    } catch (error) {
      console.error('Error during user login:', error);
      throw error;
    }
  }

  /**
   * Update user
   * @param {number} id - User ID
   * @param {IUser} userData - New user data
   * @returns {Promise<boolean>} Success of update
   */
  async update(id: number, userData: Partial<IUser>): Promise<boolean> {
    try {
      // Build the query dynamically based on provided fields
      const fields: string[] = [];
      const values: any[] = [];

      if (userData.login) {
        fields.push('login = ?');
        values.push(userData.login);
      }

      if (userData.password) {
        const salt = await bcrypt.genSalt(SALT_ROUND);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        fields.push('password = ?');
        values.push(hashedPassword);
      }

      if (userData.token) {
        fields.push('token = ?');
        values.push(userData.token);
      }

      if (fields.length === 0) return false;

      values.push(id);

      const [result] = await this.db.query(
        `UPDATE users SET ${fields.join(', ')} WHERE USER_ID = ?`,
        values
      );

      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise<boolean>} Success of deletion
   */
  async delete(id: number): Promise<boolean> {
    try {
      const [result] = await this.db.query('DELETE FROM users WHERE USER_ID = ?', [id]);
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      throw error;
    }
  }
}

export default new User();
