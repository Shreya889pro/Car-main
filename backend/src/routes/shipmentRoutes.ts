import { Router } from 'express';
import { body } from 'express-validator';
import shipmentController from '../controllers/shipmentController';
import { validate } from '../middleware/validate';
import { protect, authorize, checkPermission } from '../middleware/auth';
import { UserRole } from '../constants';

const router = Router();

router.use(protect);

const createShipmentValidation = [
  body('type').isIn(['import', 'export', 'transfer']).withMessage('Valid type required'),
  body('origin').isMongoId().withMessage('Valid origin required'),
  body('destination').isMongoId().withMessage('Valid destination required'),
  body('orders').optional().isArray(),
  body('driver').optional().isMongoId(),
  body('scheduledDate').optional().isISO8601(),
  body('estimatedArrival').optional().isISO8601(),
  body('customer').optional().isObject(),
  body('notes').optional().trim(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
];

const statusUpdateValidation = [
  body('status').isIn(['pending', 'in_transit', 'delivered', 'cancelled', 'delayed']).withMessage('Valid status required'),
  body('location').optional().trim(),
  body('notes').optional().trim(),
];

const documentValidation = [
  body('name').trim().notEmpty().withMessage('Document name required'),
  body('type').trim().notEmpty().withMessage('Document type required'),
  body('url').trim().notEmpty().withMessage('Document URL required'),
  body('description').optional().trim(),
];

router.get('/', checkPermission('view_shipments'), shipmentController.getShipments);
router.get('/by-status', checkPermission('view_shipments'), shipmentController.getShipmentsByStatus);
router.get('/:id', checkPermission('view_shipments'), shipmentController.getShipment);
router.post('/', checkPermission('manage_shipments'), createShipmentValidation, validate, shipmentController.createShipment);
router.put('/:id', checkPermission('manage_shipments'), shipmentController.updateShipment);
router.put('/:id/status', checkPermission('manage_shipments'), statusUpdateValidation, validate, shipmentController.updateShipmentStatus);
router.delete('/:id', authorize(UserRole.ADMIN, UserRole.LOGISTICS_MANAGER), shipmentController.deleteShipment);

export default router;
