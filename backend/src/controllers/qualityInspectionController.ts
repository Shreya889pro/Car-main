import { Request, Response } from 'express';
import { QualityInspection, ProductionOrder, Notification, ActivityLog } from '../models';
import { HTTP_STATUS, QualityInspectionStatus } from '../constants';
import { sendResponse, sendErrorResponse, sendPaginatedResponse, buildPaginationMeta } from '../utils/response';

// Get all inspections
export const getInspections = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const { search, status, type, priority, productionOrder } = req.query;

  const filter: Record<string, any> = {};

  if (search) {
    filter.$or = [
      { inspectionId: { $regex: search, $options: 'i' } },
      { productName: { $regex: search, $options: 'i' } },
    ];
  }

  if (status) filter.status = status;
  if (type) filter.type = type;
  if (priority) filter.priority = priority;
  if (productionOrder) filter.productionOrder = productionOrder;

  const [inspections, total] = await Promise.all([
    QualityInspection.find(filter)
      .populate('productionOrder', 'orderId product.name')
      .populate('inspector', 'firstName lastName avatar')
      .populate('approvedBy', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    QualityInspection.countDocuments(filter),
  ]);

  sendPaginatedResponse(res, inspections, buildPaginationMeta(total, page, limit));
};

// Get single inspection
export const getInspection = async (req: Request, res: Response): Promise<void> => {
  const inspection = await QualityInspection.findById(req.params.id)
    .populate('productionOrder', 'orderId product.name plant')
    .populate('inspector', 'firstName lastName email avatar')
    .populate('approvedBy', 'firstName lastName email avatar');

  if (!inspection) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Inspection not found');
    return;
  }

  sendResponse(res, HTTP_STATUS.OK, inspection);
};

// Create inspection
export const createInspection = async (req: Request, res: Response): Promise<void> => {
  const {
    productionOrder,
    type,
    productName,
    batchNumber,
    sampleSize,
    criteria,
    inspector,
    priority,
    scheduledDate,
    notes,
  } = req.body;

  const inspection: any = await QualityInspection.create({
    productionOrder,
    type,
    productName,
    batchNumber,
    sampleSize,
    criteria: criteria || [],
    inspector,
    priority: priority || 'medium',
    scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
    notes,
    status: QualityInspectionStatus.PENDING,
  });

  // Notify inspector
  await Notification.create({
    recipient: inspector,
    type: 'quality_assigned',
    title: 'Quality Inspection Assigned',
    message: `You have been assigned to inspect ${productName}`,
    priority: priority === 'urgent' ? 'high' : 'medium',
    data: { inspectionId: inspection._id },
  });

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'create',
    category: 'quality',
    resource: 'QualityInspection',
    resourceId: inspection._id,
    description: `Created quality inspection ${inspection.inspectionId}`,
  });

  sendResponse(res, HTTP_STATUS.CREATED, await inspection.populate('productionOrder inspector'), 'Inspection created');
};

// Submit inspection results
export const submitInspection = async (req: Request, res: Response): Promise<void> => {
  const { criteria, defects, score, result, notes, images } = req.body;

  const inspection: any = await QualityInspection.findById(req.params.id);
  if (!inspection) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Inspection not found');
    return;
  }

  inspection.criteria = criteria;
  inspection.defects = defects || [];
  inspection.score = score;
  inspection.result = result;
  inspection.status = result === 'pass' ? QualityInspectionStatus.PASSED : QualityInspectionStatus.FAILED;
  inspection.completedAt = new Date();
  inspection.images = images || [];
  inspection.notes = notes;

  await inspection.save();

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'update',
    category: 'quality',
    resource: 'QualityInspection',
    resourceId: inspection._id,
    description: `Submitted inspection ${inspection.inspectionId}: ${result}`,
  });

  sendResponse(res, HTTP_STATUS.OK, inspection, 'Inspection submitted');
};

// Approve inspection
export const approveInspection = async (req: Request, res: Response): Promise<void> => {
  const { notes } = req.body;

  const inspection: any = await QualityInspection.findById(req.params.id);
  if (!inspection) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Inspection not found');
    return;
  }

  if (inspection.status !== QualityInspectionStatus.PASSED && inspection.status !== QualityInspectionStatus.FAILED) {
    sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Inspection must be completed before approval');
    return;
  }

  inspection.approvedBy = req.user?._id;
  inspection.approvedAt = new Date();
  if (notes) inspection.notes = notes;

  await inspection.save();

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'approve',
    category: 'quality',
    resource: 'QualityInspection',
    resourceId: inspection._id,
    description: `Approved inspection ${inspection.inspectionId}`,
  });

  sendResponse(res, HTTP_STATUS.OK, inspection, 'Inspection approved');
};

// Delete inspection
export const deleteInspection = async (req: Request, res: Response): Promise<void> => {
  const inspection: any = await QualityInspection.findByIdAndDelete(req.params.id);

  if (!inspection) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Inspection not found');
    return;
  }

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'delete',
    category: 'quality',
    resource: 'QualityInspection',
    resourceId: inspection._id,
    description: `Deleted inspection ${inspection.inspectionId}`,
  });

  sendResponse(res, HTTP_STATUS.OK, null, 'Inspection deleted');
};

// Get quality statistics
export const getQualityStats = async (_req: Request, res: Response): Promise<void> => {
  const stats = await QualityInspection.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgScore: { $avg: '$score' },
      },
    },
  ]);

  const passRate = await QualityInspection.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        passed: { $sum: { $cond: [{ $eq: ['$result', 'pass'] }, 1, 0] } },
      },
    },
  ]);

  const defectStats = await QualityInspection.aggregate([
    { $unwind: { path: '$defects', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$defects.severity',
        count: { $sum: 1 },
      },
    },
  ]);

  sendResponse(res, HTTP_STATUS.OK, {
    byStatus: stats,
    passRate: passRate[0] ? (passRate[0].passed / passRate[0].total) * 100 : 0,
    defects: defectStats,
  });
};

export default {
  getInspections,
  getInspection,
  createInspection,
  submitInspection,
  approveInspection,
  deleteInspection,
  getQualityStats,
};
