import { Router } from 'express';
import dashboardController from '../controllers/dashboardController';
import { protect, checkPermission } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/production', checkPermission('view_orders'), dashboardController.getProductionAnalytics);
router.get('/employees', checkPermission('view_employees'), dashboardController.getEmployeeAnalytics);
router.get('/inventory', checkPermission('view_inventory'), dashboardController.getInventoryAnalytics);
router.get('/departments', checkPermission('view_departments'), dashboardController.getDepartmentAnalytics);
router.get('/activity', dashboardController.getRecentActivity);

export default router;
