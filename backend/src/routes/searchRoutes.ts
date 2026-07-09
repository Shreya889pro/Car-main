import { Router } from 'express';
import { query } from 'express-validator';
import searchController from '../controllers/searchController';
import { validate } from '../middleware/validate';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

const searchValidation = [
  query('q').trim().isLength({ min: 2 }).withMessage('Search query must be at least 2 characters'),
  query('types').optional().trim(),
  query('limit').optional().isInt({ min: 1, max: 20 }),
];

router.get('/', searchValidation, validate, searchController.globalSearch);
router.get('/quick', query('q').trim().isLength({ min: 2 }), validate, searchController.quickSearch);

export default router;
