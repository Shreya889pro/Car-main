import { Request, Response } from 'express';
import { Notification } from '../models';
import { HTTP_STATUS } from '../constants';
import { sendResponse, sendErrorResponse, sendPaginatedResponse, buildPaginationMeta } from '../utils/response';

// Get user notifications
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const { unread, category, priority } = req.query;

  const filter: Record<string, unknown> = { recipient: req.user?._id };

  if (unread === 'true') filter.read = false;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: req.user?._id, read: false }),
  ]);

  sendPaginatedResponse(res, notifications, {
    ...buildPaginationMeta(total, page, limit),
    unreadCount,
  });
};

// Get single notification
export const getNotification = async (req: Request, res: Response): Promise<void> => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user?._id,
  });

  if (!notification) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Notification not found');
    return;
  }

  sendResponse(res, HTTP_STATUS.OK, notification);
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user?._id },
    { read: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Notification not found');
    return;
  }

  sendResponse(res, HTTP_STATUS.OK, notification, 'Marked as read');
};

// Mark all as read
export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  const result = await Notification.updateMany(
    { recipient: req.user?._id, read: false },
    { read: true, readAt: new Date() }
  );

  sendResponse(res, HTTP_STATUS.OK, { modifiedCount: result.modifiedCount }, 'All notifications marked as read');
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user?._id,
  });

  if (!notification) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Notification not found');
    return;
  }

  sendResponse(res, HTTP_STATUS.OK, null, 'Notification deleted');
};

// Delete all read notifications
export const deleteReadNotifications = async (req: Request, res: Response): Promise<void> => {
  const result = await Notification.deleteMany({
    recipient: req.user?._id,
    read: true,
  });

  sendResponse(res, HTTP_STATUS.OK, { deletedCount: result.deletedCount }, 'Read notifications deleted');
};

// Get notification counts
export const getNotificationCounts = async (req: Request, res: Response): Promise<void> => {
  const [total, unread, byPriority, byCategory] = await Promise.all([
    Notification.countDocuments({ recipient: req.user?._id }),
    Notification.countDocuments({ recipient: req.user?._id, read: false }),
    Notification.aggregate([
      { $match: { recipient: req.user?._id, read: false } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    Notification.aggregate([
      { $match: { recipient: req.user?._id } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
  ]);

  sendResponse(res, HTTP_STATUS.OK, {
    total,
    unread,
    byPriority: byPriority.reduce((acc, p) => ({ ...acc, [p._id || 'normal']: p.count }), {}),
    byCategory: byCategory.reduce((acc, c) => ({ ...acc, [c._id || 'general']: c.count }), {}),
  });
};

export default {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  getNotificationCounts,
};
