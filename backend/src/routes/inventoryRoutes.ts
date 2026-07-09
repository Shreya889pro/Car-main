import { Router } from 'express';
import { body } from 'express-validator';
import inventoryController from '../controllers/inventoryController';
import { validate } from '../middleware/validate';
import { protect, authorize, checkPermission } from '../middleware/auth';
import { UserRole } from '../constants';

const router = Router();

router.use(protect);

const createItemValidation = [
  body('sku').trim().notEmpty().withMessage('SKU required'),
  body('name').trim().notEmpty().withMessage('Name required'),
  body('category').trim().notEmpty().withMessage('Category required'),
  body('quantity').isInt({ min: 0 }).withMessage('Valid quantity required'),
  body('unit').trim().notEmpty().withMessage('Unit required'),
  body('unitPrice').isFloat({ min: 0 }).withMessage('Valid unit price required'),
  body('minStock').isInt({ min: 0 }).withMessage('Valid minimum stock required'),
  body('maxStock').optional().isInt({ min: 0 }),
  body('reorderPoint').optional().isInt({ min: 0 }),
  body('warehouse').isMongoId().withMessage('Valid warehouse required'),
  body('supplier').optional().isMongoId(),
  body('location').optional().trim(),
  body('expiryDate').optional().isISO8601(),
  body('description').optional().trim(),
];

const updateItemValidation = [
  body('name').optional().trim().notEmpty(),
  body('category').optional().trim().notEmpty(),
  body('unitPrice').optional().isFloat({ min: 0 }),
  body('minStock').optional().isInt({ min: 0 }),
  body('maxStock').optional().isInt({ min: 0 }),
  body('reorderPoint').optional().isInt({ min: 0 }),
  body('location').optional().trim(),
  body('description').optional().trim(),
];

const stockInValidation = [
  body('quantity').isInt({ min: 1 }).withMessage('Valid quantity required'),
  body('reason').trim().notEmpty().withMessage('Reason required'),
  body('reference').optional().trim(),
];

const stockOutValidation = [
  body('quantity').isInt({ min: 1 }).withMessage('Valid quantity required'),
  body('reason').trim().notEmpty().withMessage('Reason required'),
  body('reference').optional().trim(),
];

const transferValidation = [
  body('quantity').isInt({ min: 1 }).withMessage('Valid quantity required'),
  body('toWarehouse').isMongoId().withMessage('Valid destination warehouse required'),
  body('reason').trim().notEmpty().withMessage('Reason required'),
];

router.get('/', checkPermission('view_inventory'), inventoryController.getInventory);
router.get('/low-stock', checkPermission('view_inventory'), inventoryController.getLowStockItems);
router.get('/:id', checkPermission('view_inventory'), inventoryController.getInventoryItem);
router.post('/', checkPermission('manage_inventory'), createItemValidation, validate, inventoryController.createInventoryItem);
router.put('/:id', checkPermission('manage_inventory'), updateItemValidation, validate, inventoryController.updateInventoryItem);
router.post('/:id/stock-in', checkPermission('manage_inventory'), stockInValidation, validate, inventoryController.stockIn);
router.post('/:id/stock-out', checkPermission('manage_inventory'), stockOutValidation, validate, inventoryController.stockOut);
router.post('/:id/transfer', checkPermission('manage_inventory'), transferValidation, validate, inventoryController.transferStock);
router.delete('/:id', authorize(UserRole.ADMIN, UserRole.INVENTORY_MANAGER), inventoryController.deleteInventoryItem);

export default router;
