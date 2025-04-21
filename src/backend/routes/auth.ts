import express from 'express';
import authController from '../controllers/AuthController';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route GET /api/auth/user
 * @desc Get user by token
 * @access Private
 */
router.get('/user', authController.getUserByToken);

/**
 * @route GET /api/auth/users
 * @desc Get all users
 * @access Private
 */
router.get('/users', authController.getAllUsers);

/**
 * @route GET /api/auth/users/:id
 * @desc Get user by ID
 * @access Private
 */
router.get('/users/:id', authController.getUserById);

/**
 * @route PUT /api/auth/users/:id
 * @desc Update user
 * @access Private
 */
router.put('/users/:id', authController.updateUser);

/**
 * @route DELETE /api/auth/users/:id
 * @desc Delete user
 * @access Private
 */
router.delete('/users/:id', authController.deleteUser);

export default router;
