import { Request, Response } from 'express';
import { Shipment, ProductionOrder, ActivityLog, Notification } from '../models';
import { HTTP_STATUS } from '../constants';
import { sendResponse, sendErrorResponse, sendPaginatedResponse, buildPaginationMeta } from '../utils/response';

// Get all shipments
export const getShipments = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const { search, status, type, origin, destination, startDate, endDate } = req.query;

  const filter: Record<string, any> = {};

  if (search) {
    filter.$or = [
      { shipmentId: { $regex: search, $options: 'i' } },
      { 'customer.name': { $regex: search, $options: 'i' } },
    ];
  }

  if (status) filter.status = status;
  if (type) filter.type = type;
  if (origin) filter.origin = origin;
  if (destination) filter.destination = destination;

  if (startDate || endDate) {
    filter.scheduledDate = {} as any;
    if (startDate) filter.scheduledDate.$gte = new Date(startDate as string);
    if (endDate) filter.scheduledDate.$lte = new Date(endDate as string);
  }

  const [shipments, total] = await Promise.all([
    Shipment.find(filter)
      .populate('origin', 'name code location')
      .populate('destination', 'name code location')
      .populate('driver', 'firstName lastName phone avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Shipment.countDocuments(filter),
  ]);

  sendPaginatedResponse(res, shipments, buildPaginationMeta(total, page, limit));
};

// Get single shipment
export const getShipment = async (req: Request, res: Response): Promise<void> => {
  const shipment = await Shipment.findById(req.params.id)
    .populate('origin', 'name code location address')
    .populate('destination', 'name code location address')
    .populate('driver', 'firstName lastName phone email avatar');

  if (!shipment) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Shipment not found');
    return;
  }

  sendResponse(res, HTTP_STATUS.OK, shipment);
};

// Create shipment
export const createShipment = async (req: Request, res: Response): Promise<void> => {
  const {
    type,
    origin,
    destination,
    orders,
    driver,
    scheduledDate,
    estimatedArrival,
    customer,
    notes,
    priority,
  } = req.body;

  const shipment: any = await Shipment.create({
    type,
    origin,
    destination,
    driver,
    scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
    estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : undefined,
    customer,
    notes,
    priority: priority || 'medium',
  });

  // Notify driver
  if (driver) {
    await Notification.create({
      recipient: driver,
      type: 'shipment_assigned',
      title: 'New Shipment Assigned',
      message: `You have been assigned to shipment ${shipment.shipmentId}`,
      priority: priority === 'urgent' ? 'high' : 'medium',
      data: { shipmentId: shipment._id },
    });
  }

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'create',
    category: 'shipment',
    resource: 'Shipment',
    resourceId: shipment._id,
    description: `Created shipment ${shipment.shipmentId}`,
  });

  sendResponse(res, HTTP_STATUS.CREATED, await shipment.populate('origin destination driver'), 'Shipment created');
};

// Update shipment
export const updateShipment = async (req: Request, res: Response): Promise<void> => {
  const shipment = await Shipment.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: new Date() },
    { new: true, runValidators: true }
  )
    .populate('origin', 'name code')
    .populate('destination', 'name code')
    .populate('driver', 'firstName lastName');

  if (!shipment) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Shipment not found');
    return;
  }

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'update',
    category: 'shipment',
    resource: 'Shipment',
    resourceId: shipment._id,
    description: `Updated shipment ${(shipment as any).shipmentId}`,
  });

  sendResponse(res, HTTP_STATUS.OK, shipment, 'Shipment updated');
};

// Update shipment status
export const updateShipmentStatus = async (req: Request, res: Response): Promise<void> => {
  const { status, location, notes } = req.body;

  const shipment: any = await Shipment.findById(req.params.id);
  if (!shipment) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Shipment not found');
    return;
  }

  shipment.status = status;

  // Update timestamps
  if (status === 'in_transit') {
    shipment.departedAt = new Date();
  }
  if (status === 'delivered') {
    shipment.deliveredAt = new Date();
  }

  await shipment.save();

  // Notify driver
  if (shipment.driver) {
    await Notification.create({
      recipient: shipment.driver,
      type: 'shipment_updated',
      title: 'Shipment Status Updated',
      message: `Shipment ${shipment.shipmentId} status: ${status}`,
      priority: 'medium',
      data: { shipmentId: shipment._id, status },
    });
  }

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'update',
    category: 'shipment',
    resource: 'Shipment',
    resourceId: shipment._id,
    description: `Updated shipment ${shipment.shipmentId} status to ${status}`,
  });

  sendResponse(res, HTTP_STATUS.OK, shipment, 'Status updated');
};

// Delete shipment
export const deleteShipment = async (req: Request, res: Response): Promise<void> => {
  const shipment: any = await Shipment.findByIdAndDelete(req.params.id);

  if (!shipment) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Shipment not found');
    return;
  }

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'delete',
    category: 'shipment',
    resource: 'Shipment',
    resourceId: shipment._id,
    description: `Deleted shipment ${shipment.shipmentId}`,
  });

  sendResponse(res, HTTP_STATUS.OK, null, 'Shipment deleted');
};

// Get shipments by status
export const getShipmentsByStatus = async (_req: Request, res: Response): Promise<void> => {
  const shipments: any[] = await Shipment.find({
    status: { $nin: ['delivered', 'cancelled'] },
  })
    .populate('origin', 'name code')
    .populate('destination', 'name code')
    .sort({ scheduledDate: 1 });

  const grouped = shipments.reduce((acc, shipment) => {
    const status = shipment.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(shipment);
    return acc;
  }, {} as Record<string, typeof shipments>);

  sendResponse(res, HTTP_STATUS.OK, grouped);
};

export default {
  getShipments,
  getShipment,
  createShipment,
  updateShipment,
  updateShipmentStatus,
  deleteShipment,
  getShipmentsByStatus,
};
