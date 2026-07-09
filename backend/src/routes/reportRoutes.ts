import { Router } from 'express';
import { query } from 'express-validator';
import reportController from '../controllers/reportController';
import { validate } from '../middleware/validate';
import { protect, authorize, checkPermission } from '../middleware/auth';
import { UserRole } from '../constants';

const router = Router();

router.use(protect);

const reportQueryValidation = [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('format').optional().isIn(['json', 'pdf', 'excel']),
];

router.get('/employees', checkPermission('view_reports'), reportQueryValidation, validate, reportController.getEmployeeReport);
router.get('/production', checkPermission('view_reports'), reportQueryValidation, validate, reportController.getProductionReport);
router.get('/inventory', checkPermission('view_reports'), reportQueryValidation, validate, reportController.getInventoryReport);
router.get('/quality', checkPermission('view_reports'), reportQueryValidation, validate, reportController.getQualityReport);
router.get('/activity', authorize(UserRole.ADMIN, UserRole.HR_MANAGER), reportQueryValidation, validate, reportController.getActivityReport);
router.get('/summary', checkPermission('view_reports'), reportController.getSummaryReport);

export default router;
