import { Request, Response } from 'express';
import { Inventory, ActivityLog, Notification } from '../models';
import { HTTP_STATUS } from '../constants';
import { sendResponse, sendErrorResponse, sendPaginatedResponse, buildPaginationMeta } from '../utils/response';

// Get all inventory items
export const getInventory = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const { search, category, status, warehouse, lowStock } = req.query;

  const filter: Record<string, any> = {};

  if (search) {
    filter.$or = [
      { sku: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) filter.category = category;
  if (status) filter.status = status;
  if (warehouse) filter.warehouse = warehouse;

  if (lowStock === 'true') {
    filter.status = { $in: ['low_stock', 'out_of_stock'] };
  }

  const [items, total] = await Promise.all([
    Inventory.find(filter)
      .populate('warehouse', 'name code')
      .populate('supplier', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Inventory.countDocuments(filter),
  ]);

  // Get summary stats
  const stats = await Inventory.aggregate([
    {
      $group: {
        _id: null,
        totalItems: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } },
        lowStock: { $sum: { $cond: [{ $eq: ['$status', 'low_stock'] }, 1, 0] } },
        outOfStock: { $sum: { $cond: [{ $eq: ['$status', 'out_of_stock'] }, 1, 0] } },
      },
    },
  ]);

  sendPaginatedResponse(res, items, {
    ...buildPaginationMeta(total, page, limit),
    stats: stats[0] || { totalItems: 0, totalValue: 0, lowStock: 0, outOfStock: 0 },
  });
};

// Get single inventory item
export const getInventoryItem = async (req: Request, res: Response): Promise<void> => {
  const item = await Inventory.findById(req.params.id)
    .populate('warehouse', 'name code location')
    .populate('supplier', 'name code email phone');

  if (!item) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Inventory item not found');
    return;
  }

  sendResponse(res, HTTP_STATUS.OK, item);
};

// Create inventory item
export const createInventoryItem = async (req: Request, res: Response): Promise<void> => {
  const {
    sku,
    name,
    description,
    category,
    quantity,
    unit,
    unitPrice,
    minStock,
    maxStock,
    reorderPoint,
    warehouse,
    supplier,
    location,
    expiryDate,
  } = req.body;

  // Check if SKU exists
  const existing = await Inventory.findOne({ sku });
  if (existing) {
    sendErrorResponse(res, HTTP_STATUS.CONFLICT, 'SKU already exists');
    return;
  }

  const item: any = await Inventory.create({
    sku,
    name,
    description,
    category,
    quantity,
    unit,
    unitPrice,
    minStock,
    maxStock,
    reorderPoint,
    warehouse,
    supplier,
    location,
    expiryDate: expiryDate ? new Date(expiryDate) : undefined,
  });

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'create',
    category: 'inventory',
    resource: 'Inventory',
    resourceId: item._id,
    description: `Created inventory item ${name} (${sku})`,
  });

  sendResponse(res, HTTP_STATUS.CREATED, await item.populate('warehouse supplier'), 'Inventory item created');
};

// Update inventory item
export const updateInventoryItem = async (req: Request, res: Response): Promise<void> => {
  const item = await Inventory.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: new Date() },
    { new: true, runValidators: true }
  )
    .populate('warehouse', 'name code')
    .populate('supplier', 'name code');

  if (!item) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Inventory item not found');
    return;
  }

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'update',
    category: 'inventory',
    resource: 'Inventory',
    resourceId: item._id,
    description: `Updated inventory item ${item.name}`,
  });

  sendResponse(res, HTTP_STATUS.OK, item, 'Inventory item updated');
};

// Stock in
export const stockIn = async (req: Request, res: Response): Promise<void> => {
  const { quantity, reason, reference } = req.body;

  const item: any = await Inventory.findById(req.params.id);
  if (!item) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Inventory item not found');
    return;
  }

  item.quantity += quantity;

  await item.save();

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'update',
    category: 'inventory',
    resource: 'Inventory',
    resourceId: item._id,
    description: `Stock in: ${quantity} ${item.unit} of ${item.name}`,
  });

  sendResponse(res, HTTP_STATUS.OK, item, 'Stock added successfully');
};

// Stock out
export const stockOut = async (req: Request, res: Response): Promise<void> => {
  const { quantity, reason, reference } = req.body;

  const item: any = await Inventory.findById(req.params.id);
  if (!item) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Inventory item not found');
    return;
  }

  if (item.quantity < quantity) {
    sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Insufficient stock');
    return;
  }

  item.quantity -= quantity;

  await item.save();

  // Notify if low stock
  if (item.status === 'low_stock' || item.status === 'out_of_stock') {
    await Notification.create({
      recipient: req.user?._id,
      type: 'inventory_alert',
      title: 'Low Stock Alert',
      message: `${item.name} (${item.sku}) is ${item.status === 'out_of_stock' ? 'out of stock' : 'running low'}`,
      priority: 'high',
      data: { itemId: item._id },
    });
  }

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'update',
    category: 'inventory',
    resource: 'Inventory',
    resourceId: item._id,
    description: `Stock out: ${quantity} ${item.unit} of ${item.name}`,
  });

  sendResponse(res, HTTP_STATUS.OK, item, 'Stock removed successfully');
};

// Transfer stock
export const transferStock = async (req: Request, res: Response): Promise<void> => {
  const { quantity, toWarehouse, reason } = req.body;

  const item: any = await Inventory.findById(req.params.id);
  if (!item) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Inventory item not found');
    return;
  }

  if (item.quantity < quantity) {
    sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Insufficient stock for transfer');
    return;
  }

  item.quantity -= quantity;

  await item.save();

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'update',
    category: 'inventory',
    resource: 'Inventory',
    resourceId: item._id,
    description: `Transferred ${quantity} ${item.unit} of ${item.name} to another warehouse`,
  });

  sendResponse(res, HTTP_STATUS.OK, item, 'Stock transferred successfully');
};

// Delete inventory item
export const deleteInventoryItem = async (req: Request, res: Response): Promise<void> => {
  const item: any = await Inventory.findByIdAndDelete(req.params.id);

  if (!item) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Inventory item not found');
    return;
  }

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'delete',
    category: 'inventory',
    resource: 'Inventory',
    resourceId: item._id,
    description: `Deleted inventory item ${item.name} (${item.sku})`,
  });

  sendResponse(res, HTTP_STATUS.OK, null, 'Inventory item deleted');
};

// Get low stock items
export const getLowStockItems = async (_req: Request, res: Response): Promise<void> => {
  const items = await Inventory.find({
    status: { $in: ['low_stock', 'out_of_stock'] },
  })
    .populate('warehouse', 'name code')
    .populate('supplier', 'name code')
    .sort({ quantity: 1 });

  sendResponse(res, HTTP_STATUS.OK, items);
};

export default {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  stockIn,
  stockOut,
  transferStock,
  deleteInventoryItem,
  getLowStockItems,
};
