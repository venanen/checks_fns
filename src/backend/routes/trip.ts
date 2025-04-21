import express from 'express';
import tripController from '../controllers/TripController';

const router = express.Router();

/**
 * @route GET /api/trip
 * @desc Получить все поездки
 * @access Public
 */
router.get('/', tripController.getAll);

/**
 * @route GET /api/trip/:id
 * @desc Получить поездку по ID
 * @access Public
 */
router.get('/:id', tripController.getById);

/**
 * @route GET /api/trip/user/:userId
 * @desc Получить все поездки пользователя
 * @access Public
 */
router.get('/user/:userId', tripController.getByUserId);

/**
 * @route POST /api/trip
 * @desc Создать новую поездку
 * @access Private
 */
router.post('/', tripController.create);

/**
 * @route PUT /api/trip/:id
 * @desc Обновить поездку
 * @access Private
 */
router.put('/:id', tripController.update);

/**
 * @route DELETE /api/trip/:id
 * @desc Удалить поездку
 * @access Private
 */
router.delete('/:id', tripController.delete);

/**
 * @route POST /api/trip/:id/user/:userId
 * @desc Добавить пользователя в поездку
 * @access Private
 */
router.post('/:id/user/:userId', tripController.addUser);

/**
 * @route DELETE /api/trip/:id/user/:userId
 * @desc Удалить пользователя из поездки
 * @access Private
 */
router.delete('/:id/user/:userId', tripController.removeUser);

/**
 * @route GET /api/trip/:id/users
 * @desc Получить всех пользователей поездки
 * @access Public
 */
router.get('/:id/users', tripController.getUsers);

export default router;
