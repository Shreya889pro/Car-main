import { Router } from 'express';
import notificationController from '../controllers/notificationController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', notificationController.getNotifications);
router.get('/counts', notificationController.getNotificationCounts);
router.get('/:id', notificationController.getNotification);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);
router.delete('/read', notificationController.deleteReadNotifications);

export default router;
