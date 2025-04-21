import express from 'express';
import goodController from '../controllers/goodController';

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
router.post('/', goodController.create);

/**
 * @route POST /api/good/bulk
 * @desc Массовое создание товаров
 * @access Private
 */
router.post('/bulk', goodController.bulkCreate);

/**
 * @route PUT /api/good/:id
 * @desc Обновить товар
 * @access Private
 */
router.put('/:id', goodController.update);

/**
 * @route DELETE /api/good/:id
 * @desc Удалить товар
 * @access Private
 */
router.delete('/:id', goodController.delete);

/**
 * @route GET /api/good/check/:checkId/total
 * @desc Получить общую стоимость товаров в чеке
 * @access Public
 */
router.get('/check/:checkId/total', goodController.getTotalByCheck);

export default router; 