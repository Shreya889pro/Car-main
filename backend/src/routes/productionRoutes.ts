import { Router } from 'express';
import { body } from 'express-validator';
import productionOrderController from '../controllers/productionOrderController';
import { validate } from '../middleware/validate';
import { protect, authorize, checkPermission } from '../middleware/auth';
import { UserRole } from '../constants';

const router = Router();

router.use(protect);

const createOrderValidation = [
  body('productName').trim().notEmpty().withMessage('Product name required'),
  body('productCode').optional().trim(),
  body('quantity').isInt({ min: 1 }).withMessage('Valid quantity required'),
  body('unit').trim().notEmpty().withMessage('Unit required'),
  body('plant').isMongoId().withMessage('Valid plant ID required'),
  body('department').isMongoId().withMessage('Valid department ID required'),
  body('dueDate').optional().isISO8601(),
  body('estimatedCost').optional().isFloat({ min: 0 }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('customerName').optional().trim(),
  body('customerEmail').optional().isEmail(),
  body('materials').optional().isArray(),
  body('notes').optional().trim(),
];

const updateOrderValidation = [
  body('productName').optional().trim().notEmpty(),
  body('quantity').optional().isInt({ min: 1 }),
  body('unit').optional().trim().notEmpty(),
  body('dueDate').optional().isISO8601(),
  body('estimatedCost').optional().isFloat({ min: 0 }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('notes').optional().trim(),
];

const statusValidation = [
  body('status').isIn(['pending', 'planning', 'scheduled', 'in_progress', 'quality_check', 'on_hold', 'completed', 'cancelled', 'rejected']).withMessage('Valid status required'),
  body('notes').optional().trim(),
];

const progressValidation = [
  body('progress').isInt({ min: 0, max: 100 }).withMessage('Progress must be 0-100'),
  body('notes').optional().trim(),
];

const assignTeamValidation = [
  body('teamMembers').isArray({ min: 1 }).withMessage('At least one team member required'),
];

router.get('/', checkPermission('view_orders'), productionOrderController.getProductionOrders);
router.get('/kanban', checkPermission('view_orders'), productionOrderController.getOrdersByStatus);
router.get('/:id', checkPermission('view_orders'), productionOrderController.getProductionOrder);
router.post('/', checkPermission('create_orders'), createOrderValidation, validate, productionOrderController.createProductionOrder);
router.put('/:id', checkPermission('manage_orders'), updateOrderValidation, validate, productionOrderController.updateProductionOrder);
router.put('/:id/status', checkPermission('manage_orders'), statusValidation, validate, productionOrderController.updateOrderStatus);
router.put('/:id/progress', checkPermission('manage_orders'), progressValidation, validate, productionOrderController.updateOrderProgress);
router.put('/:id/assign', checkPermission('manage_orders'), assignTeamValidation, validate, productionOrderController.assignTeam);
router.delete('/:id', authorize(UserRole.ADMIN, UserRole.PLANT_MANAGER), productionOrderController.deleteProductionOrder);

export default router;
