import { Request, Response } from 'express';
import { Employee, ProductionOrder, Inventory, Department, Notification, ActivityLog } from '../models';
import { HTTP_STATUS } from '../constants';
import { sendResponse } from '../utils/response';

// Get dashboard statistics
export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  const [
    totalEmployees,
    presentEmployees,
    absentEmployees,
    pendingOrders,
    inProgressOrders,
    completedOrders,
    lowStockItems,
    totalNotifications,
    recentActivities,
  ] = await Promise.all([
    Employee.countDocuments({ status: 'active' }),
    Employee.countDocuments({ status: 'active', attendance: 'present' }),
    Employee.countDocuments({ status: 'active', attendance: 'absent' }),
    ProductionOrder.countDocuments({ status: { $in: ['pending', 'planning'] } }),
    ProductionOrder.countDocuments({ status: 'in_progress' }),
    ProductionOrder.countDocuments({ status: 'completed' }),
    Inventory.countDocuments({ status: 'low_stock' }),
    Notification.countDocuments({ read: false }),
    ActivityLog.find().sort({ timestamp: -1 }).limit(10).populate('user', 'firstName lastName avatar'),
  ]);

  sendResponse(res, HTTP_STATUS.OK, {
    employees: {
      total: totalEmployees,
      present: presentEmployees,
      absent: absentEmployees,
    },
    orders: {
      pending: pendingOrders,
      inProgress: inProgressOrders,
      completed: completedOrders,
    },
    inventory: {
      lowStock: lowStockItems,
    },
    notifications: {
      unread: totalNotifications,
    },
    recentActivities,
  });
};

// Get production analytics
export const getProductionAnalytics = async (req: Request, res: Response): Promise<void> => {
  const { period = 'month' } = req.query;

  // Get orders grouped by month
  const ordersByMonth = await ProductionOrder.aggregate([
    {
      $group: {
        _id: { $month: '$createdAt' },
        count: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Get orders by status
  const ordersByStatus = await ProductionOrder.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  // Get orders by priority
  const ordersByPriority = await ProductionOrder.aggregate([
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 },
      },
    },
  ]);

  // Get orders by plant
  const ordersByPlant = await ProductionOrder.aggregate([
    {
      $group: {
        _id: '$plant',
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'plants',
        localField: '_id',
        foreignField: '_id',
        as: 'plant',
      },
    },
  ]);

  sendResponse(res, HTTP_STATUS.OK, {
    ordersByMonth,
    ordersByStatus,
    ordersByPriority,
    ordersByPlant,
  });
};

// Get employee analytics
export const getEmployeeAnalytics = async (_req: Request, res: Response): Promise<void> => {
  // Employees by department
  const byDepartment = await Employee.aggregate([
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'departments',
        localField: '_id',
        foreignField: '_id',
        as: 'department',
      },
    },
  ]);

  // Employees by status
  const byStatus = await Employee.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  // Employees by attendance
  const byAttendance = await Employee.aggregate([
    {
      $group: {
        _id: '$attendance',
        count: { $sum: 1 },
      },
    },
  ]);

  sendResponse(res, HTTP_STATUS.OK, {
    byDepartment,
    byStatus,
    byAttendance,
  });
};

// Get inventory analytics
export const getInventoryAnalytics = async (_req: Request, res: Response): Promise<void> => {
  // Inventory by category
  const byCategory = await Inventory.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } },
      },
    },
  ]);

  // Inventory by status
  const byStatus = await Inventory.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  // Low stock items
  const lowStockItems = await Inventory.find({ status: 'low_stock' })
    .sort({ quantity: 1 })
    .limit(10);

  // Out of stock items
  const outOfStockItems = await Inventory.find({ status: 'out_of_stock' }).limit(10);

  sendResponse(res, HTTP_STATUS.OK, {
    byCategory,
    byStatus,
    lowStockItems,
    outOfStockItems,
  });
};

// Get recent activity
export const getRecentActivity = async (req: Request, res: Response): Promise<void> => {
  const limit = parseInt(req.query.limit as string) || 20;

  const activities = await ActivityLog.find()
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('user', 'firstName lastName email avatar');

  sendResponse(res, HTTP_STATUS.OK, activities);
};

// Get department analytics
export const getDepartmentAnalytics = async (_req: Request, res: Response): Promise<void> => {
  const departments = await Department.find()
    .populate('manager', 'firstName lastName')
    .select('name code employeeCount performance');

  const departmentStats = departments.map((dept) => ({
    id: dept._id,
    name: dept.name,
    code: dept.code,
    employeeCount: dept.employeeCount,
    performance: dept.performance,
    manager: dept.manager,
  }));

  sendResponse(res, HTTP_STATUS.OK, departmentStats);
};

export default {
  getDashboardStats,
  getProductionAnalytics,
  getEmployeeAnalytics,
  getInventoryAnalytics,
  getRecentActivity,
  getDepartmentAnalytics,
};
