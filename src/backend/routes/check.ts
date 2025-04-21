import express from 'express';
import checkController from '../controllers/checkController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

/**
 * @route GET /api/check
 * @desc Получить все чеки
 * @access Public
 */
router.get('/', checkController.getAll);

/**
 * @route GET /api/check/:id
 * @desc Получить чек по ID
 * @access Public
 */
router.get('/:id', checkController.getById);

/**
 * @route GET /api/check/trip/:tripId
 * @desc Получить все чеки поездки
 * @access Public
 */
router.get('/trip/:tripId', checkController.getByTripId);

/**
 * @route GET /api/check/user/:userId
 * @desc Получить все чеки пользователя
 * @access Public
 */
router.get('/user/:userId', checkController.getByUserId);

/**
 * @route POST /api/check
 * @desc Создать новый чек
 * @access Private
 */
router.post('/', authenticate, checkController.create);

/**
 * @route PUT /api/check/:id
 * @desc Обновить чек
 * @access Private
 */
router.put('/:id', authenticate, checkController.update);

/**
 * @route DELETE /api/check/:id
 * @desc Удалить чек
 * @access Private
 */
router.delete('/:id', authenticate, checkController.delete);

/**
 * @route GET /api/check/trip/:tripId/total
 * @desc Получить общую сумму чеков по поездке
 * @access Public
 */
router.get('/trip/:tripId/total', checkController.getTotalSumByTrip);

export default router;
