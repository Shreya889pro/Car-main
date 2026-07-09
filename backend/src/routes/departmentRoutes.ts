import { Router } from 'express';
import { body } from 'express-validator';
import departmentController from '../controllers/departmentController';
import { validate } from '../middleware/validate';
import { protect, authorize, checkPermission } from '../middleware/auth';
import { UserRole } from '../constants';

const router = Router();

router.use(protect);

const createDepartmentValidation = [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('code').trim().notEmpty().withMessage('Code required'),
  body('plant').isMongoId().withMessage('Valid plant ID required'),
  body('manager').optional().isMongoId(),
  body('description').optional().trim(),
  body('location').optional().trim(),
];

const updateDepartmentValidation = [
  body('name').optional().trim().notEmpty(),
  body('code').optional().trim().notEmpty(),
  body('manager').optional().isMongoId(),
  body('description').optional().trim(),
  body('location').optional().trim(),
];

router.get('/', checkPermission('view_departments'), departmentController.getDepartments);
router.get('/:id', checkPermission('view_departments'), departmentController.getDepartment);
router.get('/:id/stats', checkPermission('view_departments'), departmentController.getDepartmentStats);
router.post('/', authorize(UserRole.ADMIN, UserRole.PLANT_MANAGER), createDepartmentValidation, validate, departmentController.createDepartment);
router.put('/:id', checkPermission('manage_departments'), updateDepartmentValidation, validate, departmentController.updateDepartment);
router.delete('/:id', authorize(UserRole.ADMIN), departmentController.deleteDepartment);

export default router;
