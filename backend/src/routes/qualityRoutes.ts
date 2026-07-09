import { Router } from 'express';
import { body } from 'express-validator';
import qualityInspectionController from '../controllers/qualityInspectionController';
import { validate } from '../middleware/validate';
import { protect, authorize, checkPermission } from '../middleware/auth';
import { UserRole } from '../constants';

const router = Router();

router.use(protect);

const createInspectionValidation = [
  body('productionOrder').optional().isMongoId(),
  body('type').isIn(['incoming', 'in_process', 'final', 'outgoing']).withMessage('Valid type required'),
  body('productName').trim().notEmpty().withMessage('Product name required'),
  body('batchNumber').optional().trim(),
  body('sampleSize').isInt({ min: 1 }).withMessage('Valid sample size required'),
  body('inspector').isMongoId().withMessage('Valid inspector required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('scheduledDate').optional().isISO8601(),
  body('notes').optional().trim(),
];

const submitInspectionValidation = [
  body('criteria').isArray().withMessage('Criteria required'),
  body('overallScore').isFloat({ min: 0, max: 100 }).withMessage('Score must be 0-100'),
  body('result').isIn(['pass', 'fail', 'conditional']).withMessage('Valid result required'),
  body('defects').optional().isArray(),
  body('notes').optional().trim(),
  body('images').optional().isArray(),
];

router.get('/', checkPermission('view_quality'), qualityInspectionController.getInspections);
router.get('/stats', checkPermission('view_quality'), qualityInspectionController.getQualityStats);
router.get('/:id', checkPermission('view_quality'), qualityInspectionController.getInspection);
router.post('/', checkPermission('manage_quality'), createInspectionValidation, validate, qualityInspectionController.createInspection);
router.put('/:id/submit', checkPermission('manage_quality'), submitInspectionValidation, validate, qualityInspectionController.submitInspection);
router.put('/:id/approve', authorize(UserRole.ADMIN, UserRole.QUALITY_MANAGER), qualityInspectionController.approveInspection);
router.delete('/:id', authorize(UserRole.ADMIN, UserRole.QUALITY_MANAGER), qualityInspectionController.deleteInspection);

export default router;
