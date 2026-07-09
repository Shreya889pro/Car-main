import { Router } from 'express';
import { body } from 'express-validator';
import plantController from '../controllers/plantController';
import { validate } from '../middleware/validate';
import { protect, authorize, checkPermission } from '../middleware/auth';
import { UserRole } from '../constants';

const router = Router();

router.use(protect);

const createPlantValidation = [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('code').trim().notEmpty().withMessage('Code required'),
  body('location').trim().notEmpty().withMessage('Location required'),
  body('address').optional().isObject(),
  body('capacity').optional().isInt({ min: 0 }),
  body('description').optional().trim(),
];

const updatePlantValidation = [
  body('name').optional().trim().notEmpty(),
  body('code').optional().trim().notEmpty(),
  body('location').optional().trim().notEmpty(),
  body('address').optional().isObject(),
  body('capacity').optional().isInt({ min: 0 }),
  body('description').optional().trim(),
];

router.get('/', checkPermission('view_plants'), plantController.getPlants);
router.get('/:id', checkPermission('view_plants'), plantController.getPlant);
router.get('/:id/stats', checkPermission('view_plants'), plantController.getPlantStats);
router.post('/', authorize(UserRole.ADMIN), createPlantValidation, validate, plantController.createPlant);
router.put('/:id', authorize(UserRole.ADMIN, UserRole.PLANT_MANAGER), updatePlantValidation, validate, plantController.updatePlant);
router.delete('/:id', authorize(UserRole.ADMIN), plantController.deletePlant);

export default router;
