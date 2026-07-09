import { Request, Response } from 'express';
import { ProductionOrder, Notification, ActivityLog } from '../models';
import { HTTP_STATUS, ProductionOrderStatus } from '../constants';
import { sendResponse, sendErrorResponse, sendPaginatedResponse, buildPaginationMeta } from '../utils/response';

// Get all production orders
export const getProductionOrders = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const { search, status, priority, plant, department, startDate, endDate } = req.query;

  const filter: Record<string, any> = {};

  if (search) {
    filter.$or = [
      { orderId: { $regex: search, $options: 'i' } },
      { 'product.name': { $regex: search, $options: 'i' } },
    ];
  }

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (plant) filter.plant = plant;
  if (department) filter.department = department;

  if (startDate || endDate) {
    filter.createdAt = {} as any;
    if (startDate) filter.createdAt.$gte = new Date(startDate as string);
    if (endDate) filter.createdAt.$lte = new Date(endDate as string);
  }

  const [orders, total] = await Promise.all([
    ProductionOrder.find(filter)
      .populate('plant', 'name code')
      .populate('department', 'name code')
      .populate('assignedTeam', 'firstName lastName avatar')
      .populate('assignedManager', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ProductionOrder.countDocuments(filter),
  ]);

  // Get status counts
  const statusCounts = await ProductionOrder.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  sendPaginatedResponse(res, orders, {
    ...buildPaginationMeta(total, page, limit),
    statusCounts: statusCounts.reduce((acc: any, s) => ({ ...acc, [s._id]: s.count }), {}),
  });
};

// Get single production order
export const getProductionOrder = async (req: Request, res: Response): Promise<void> => {
  const order = await ProductionOrder.findById(req.params.id)
    .populate('plant', 'name code location')
    .populate('department', 'name code')
    .populate('assignedTeam', 'firstName lastName email avatar position')
    .populate('assignedManager', 'firstName lastName email avatar')
    .populate('workflowHistory.changedBy', 'firstName lastName avatar');

  if (!order) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Production order not found');
    return;
  }

  sendResponse(res, HTTP_STATUS.OK, order);
};

// Create production order
export const createProductionOrder = async (req: Request, res: Response): Promise<void> => {
  const {
    productName,
    productSku,
    quantity,
    unit,
    plant,
    department,
    priority,
    dueDate,
    customerName,
    materials,
    notes,
    assignedTeam,
    assignedManager,
  } = req.body;

  const order: any = await ProductionOrder.create({
    product: {
      name: productName,
      sku: productSku || `SKU-${Date.now()}`,
    },
    quantity,
    unit,
    plant,
    department,
    priority: priority || 'medium',
    dueDate: dueDate ? new Date(dueDate) : undefined,
    customerName,
    materials: materials || [],
    notes,
    assignedTeam,
    assignedManager,
    workflowHistory: [{
      status: 'pending',
      changedBy: req.user?._id,
      notes: 'Order created',
    }],
    createdBy: req.user?._id,
  });

  // Notify assigned team
  if (assignedTeam && assignedTeam.length > 0) {
    await Notification.create({
      recipient: { $in: assignedTeam },
      type: 'order_assigned',
      title: 'New Production Order Assigned',
      message: `You have been assigned to production order ${order.orderId}`,
      priority: priority === 'urgent' ? 'high' : 'medium',
      data: { orderId: order._id },
    });
  }

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'create',
    category: 'production',
    resource: 'ProductionOrder',
    resourceId: order._id,
    description: `Created production order ${order.orderId} for ${productName}`,
  });

  sendResponse(res, HTTP_STATUS.CREATED, order, 'Production order created successfully');
};

// Update production order
export const updateProductionOrder = async (req: Request, res: Response): Promise<void> => {
  const order = await ProductionOrder.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedBy: req.user?._id, updatedAt: new Date() },
    { new: true, runValidators: true }
  )
    .populate('plant', 'name code')
    .populate('department', 'name code');

  if (!order) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Production order not found');
    return;
  }

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'update',
    category: 'production',
    resource: 'ProductionOrder',
    resourceId: order._id,
    description: `Updated production order ${order.orderId}`,
  });

  sendResponse(res, HTTP_STATUS.OK, order, 'Production order updated successfully');
};

// Update order status (workflow)
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const { status, notes } = req.body;

  const order: any = await ProductionOrder.findById(req.params.id);
  if (!order) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Production order not found');
    return;
  }

  // Update status
  order.status = status;
  order.workflowHistory.push({
    status,
    changedBy: req.user?._id,
    notes,
    timestamp: new Date(),
  });

  // Update timestamps
  if (status === 'in_progress' && !order.startDate) {
    order.startDate = new Date();
  }
  if (status === 'completed') {
    order.actualEndDate = new Date();
    order.progress = 100;
  }

  await order.save();

  // Notify assigned manager
  if (order.assignedManager) {
    await Notification.create({
      recipient: order.assignedManager,
      type: status === 'completed' ? 'order_completed' : 'order_updated',
      title: status === 'completed' ? 'Production Order Completed' : 'Order Status Updated',
      message: `Production order ${order.orderId} status: ${status}`,
      priority: 'medium',
      data: { orderId: order._id },
    });
  }

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'update',
    category: 'production',
    resource: 'ProductionOrder',
    resourceId: order._id,
    description: `Updated order ${order.orderId} status to ${status}`,
  });

  sendResponse(res, HTTP_STATUS.OK, order, 'Order status updated');
};

// Update order progress
export const updateOrderProgress = async (req: Request, res: Response): Promise<void> => {
  const { progress, notes } = req.body;

  const existingOrder = await ProductionOrder.findById(req.params.id);
  if (!existingOrder) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Production order not found');
    return;
  }

  const order: any = await ProductionOrder.findByIdAndUpdate(
    req.params.id,
    {
      progress,
      $push: {
        workflowHistory: {
          status: existingOrder.status,
          changedBy: req.user?._id,
          notes: notes || `Progress updated to ${progress}%`,
          timestamp: new Date(),
        },
      },
      updatedAt: new Date(),
    },
    { new: true }
  );

  if (!order) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Production order not found');
    return;
  }

  sendResponse(res, HTTP_STATUS.OK, order, 'Progress updated');
};

// Delete production order
export const deleteProductionOrder = async (req: Request, res: Response): Promise<void> => {
  const order: any = await ProductionOrder.findByIdAndDelete(req.params.id);

  if (!order) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Production order not found');
    return;
  }

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'delete',
    category: 'production',
    resource: 'ProductionOrder',
    resourceId: order._id,
    description: `Deleted production order ${order.orderId}`,
  });

  sendResponse(res, HTTP_STATUS.OK, null, 'Production order deleted');
};

// Get orders by status (for Kanban)
export const getOrdersByStatus = async (_req: Request, res: Response): Promise<void> => {
  const orders: any[] = await ProductionOrder.find({
    status: { $nin: ['completed', 'cancelled'] },
  })
    .populate('plant', 'name code')
    .populate('department', 'name code')
    .populate('assignedTeam', 'firstName lastName avatar')
    .select('orderId product.name priority dueDate progress status assignedTeam');

  const grouped = orders.reduce((acc: any, order) => {
    const status = order.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(order);
    return acc;
  }, {});

  sendResponse(res, HTTP_STATUS.OK, grouped);
};

// Assign team to order
export const assignTeam = async (req: Request, res: Response): Promise<void> => {
  const { teamMembers } = req.body;

  const order: any = await ProductionOrder.findByIdAndUpdate(
    req.params.id,
    { assignedTeam: teamMembers, updatedBy: req.user?._id, updatedAt: new Date() },
    { new: true }
  ).populate('assignedTeam', 'firstName lastName avatar email');

  if (!order) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Production order not found');
    return;
  }

  // Notify assigned team members
  if (teamMembers.length > 0) {
    await Notification.insertMany(
      teamMembers.map((memberId: string) => ({
        recipient: memberId,
        type: 'order_assigned',
        title: 'Assigned to Production Order',
        message: `You have been assigned to production order ${order.orderId}`,
        priority: 'medium',
        data: { orderId: order._id },
      }))
    );
  }

  sendResponse(res, HTTP_STATUS.OK, order, 'Team assigned successfully');
};

export default {
  getProductionOrders,
  getProductionOrder,
  createProductionOrder,
  updateProductionOrder,
  updateOrderStatus,
  updateOrderProgress,
  deleteProductionOrder,
  getOrdersByStatus,
  assignTeam,
};
