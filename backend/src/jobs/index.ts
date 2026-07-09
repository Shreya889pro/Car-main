import cron from 'node-cron';
import { Inventory, Notification, ProductionOrder, User } from '../models';
import { InventoryStatus } from '../constants';
import config from '../config';

// Check for low stock items and send alerts
const checkLowStock = async () => {
  try {
    const lowStockItems = await Inventory.find({
      status: { $in: ['low_stock', 'out_of_stock'] },
    }).populate('warehouse', 'name');

    if (lowStockItems.length > 0) {
      // Get inventory managers
      const managers = await User.find({ role: 'inventory_manager' });

      if (managers.length > 0) {
        for (const manager of managers) {
          await Notification.create({
            recipient: manager._id,
            type: 'inventory_alert',
            title: 'Daily Low Stock Report',
            message: `${lowStockItems.length} items require attention`,
            priority: 'high',
            category: 'inventory',
            data: {
              itemCount: lowStockItems.length,
              items: lowStockItems.slice(0, 10).map(item => ({
                id: item._id,
                name: item.name,
                sku: item.sku,
                quantity: item.quantity,
                status: item.status,
              })),
            },
          });
        }
      }
    }

    console.log(`[Cron] Low stock check complete: ${lowStockItems.length} items found`);
  } catch (error) {
    console.error('[Cron] Error in low stock check:', error);
  }
};

// Check for overdue production orders
const checkOverdueOrders = async () => {
  try {
    const now = new Date();
    const overdueOrders = await ProductionOrder.find({
      dueDate: { $lt: now },
      status: { $nin: ['completed', 'cancelled'] },
    }).populate('supervisor', 'firstName lastName');

    const upcomingOrders = await ProductionOrder.find({
      dueDate: {
        $gte: now,
        $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Next 24 hours
      },
      status: { $nin: ['completed', 'cancelled'] },
    }).populate('supervisor', 'firstName lastName');

    // Notify supervisors about overdue orders
    for (const order of overdueOrders) {
      if ((order as any).assignedManager) {
        await Notification.create({
          recipient: (order as any).assignedManager,
          type: 'order_overdue',
          title: 'Production Order Overdue',
          message: `Order ${(order as any).orderId} is overdue`,
          priority: 'high',
          category: 'production',
          data: { orderId: order._id },
        });
      }
    }

    console.log(`[Cron] Overdue check: ${overdueOrders.length} overdue, ${upcomingOrders.length} upcoming`);
  } catch (error) {
    console.error('[Cron] Error in overdue check:', error);
  }
};

// Cleanup old notifications
const cleanupOldNotifications = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Notification.deleteMany({
      read: true,
      readAt: { $lt: thirtyDaysAgo },
    });

    console.log(`[Cron] Cleaned up ${result.deletedCount} old notifications`);
  } catch (error) {
    console.error('[Cron] Error in notification cleanup:', error);
  }
};

// Update inventory status based on quantities
const updateInventoryStatus = async () => {
  try {
    const items = await Inventory.find({
      $or: [
        { quantity: { $lte: 0 }, status: { $ne: 'out_of_stock' } },
        { quantity: { $gt: 0, $lte: '$minStock' }, status: { $ne: 'low_stock' } },
      ],
    });

    for (const item of items) {
      const itemAny = item as any;
      if (itemAny.quantity <= 0) {
        itemAny.status = InventoryStatus.OUT_OF_STOCK;
      } else if (itemAny.quantity <= itemAny.minStock) {
        itemAny.status = InventoryStatus.LOW_STOCK;
      } else {
        itemAny.status = InventoryStatus.IN_STOCK;
      }
      await itemAny.save();
    }

    console.log(`[Cron] Updated ${items.length} inventory statuses`);
  } catch (error) {
    console.error('[Cron] Error in inventory status update:', error);
  }
};

// Generate daily summary report
const generateDailySummary = async () => {
  try {
    const admins = await User.find({ role: 'admin' });

    const [
      totalOrders,
      completedOrders,
      lowStockCount,
      pendingQualityChecks,
    ] = await Promise.all([
      ProductionOrder.countDocuments({ status: { $ne: 'cancelled' } }),
      ProductionOrder.countDocuments({ status: 'completed' }),
      Inventory.countDocuments({ status: { $in: ['low_stock', 'out_of_stock'] } }),
      ProductionOrder.countDocuments({ status: 'quality_check' }),
    ]);

    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        type: 'daily_summary',
        title: 'Daily Summary',
        message: `Orders: ${completedOrders}/${totalOrders} completed | Low Stock: ${lowStockCount} | Quality Pending: ${pendingQualityChecks}`,
        priority: 'normal',
        category: 'system',
      });
    }

    console.log('[Cron] Daily summary sent');
  } catch (error) {
    console.error('[Cron] Error in daily summary:', error);
  }
};

export const setupScheduledJobs = () => {
  // Low stock check - every 6 hours
  cron.schedule('0 */6 * * *', checkLowStock, {
    timezone: 'UTC',
  });

  // Overdue orders check - every hour
  cron.schedule('0 * * * *', checkOverdueOrders, {
    timezone: 'UTC',
  });

  // Notification cleanup - daily at 2 AM
  cron.schedule('0 2 * * *', cleanupOldNotifications, {
    timezone: 'UTC',
  });

  // Inventory status update - every 15 minutes
  cron.schedule('*/15 * * * *', updateInventoryStatus, {
    timezone: 'UTC',
  });

  // Daily summary - every day at 9 AM
  cron.schedule('0 9 * * *', generateDailySummary, {
    timezone: 'UTC',
  });

  if (config.NODE_ENV !== 'test') {
    console.log('[Cron] Scheduled jobs initialized');
  }
};

export default {
  setupScheduledJobs,
  checkLowStock,
  checkOverdueOrders,
  cleanupOldNotifications,
  updateInventoryStatus,
  generateDailySummary,
};
