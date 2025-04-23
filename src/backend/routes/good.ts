import express from 'express';
import goodController from '../controllers/GoodController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

/**
 * @route GET /api/good
 * @desc Получить все товары
 * @access Public
 */
router.get('/', goodController.getAll);

/**
 * @route GET /api/good/:id
 * @desc Получить товар по ID
 * @access Public
 */
router.get('/:id', goodController.getById);

/**
 * @route GET /api/good/check/:checkId
 * @desc Получить все товары чека
 * @access Public
 */
router.get('/check/:checkId', goodController.getByCheckId);

/**
 * @route POST /api/good
 * @desc Создать новый товар
 * @access Private
 */
router.post('/', authenticate, goodController.create);

/**
 * @route POST /api/good/bulk
 * @desc Массовое создание товаров
 * @access Private
 */
router.post('/bulk', authenticate, goodController.bulkCreate);

/**
 * @route PUT /api/good/:id
 * @desc Обновить товар
 * @access Private
 */
router.put('/:id', authenticate, goodController.update);

/**
 * @route DELETE /api/good/:id
 * @desc Удалить товар
 * @access Private
 */
router.delete('/:id', authenticate, goodController.delete);

/**
 * @route GET /api/good/check/:checkId/total
 * @desc Получить общую стоимость товаров в чеке
 * @access Public
 */
router.get('/check/:checkId/total', goodController.getTotalByCheck);

/**
 * @route GET /api/good/trip/:tripId
 * @desc Получить все товары поездки
 * @access Public
 */
router.get('/trip/:tripId', goodController.getByTripId);

export default router;
