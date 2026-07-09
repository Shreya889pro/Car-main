import { Request, Response } from 'express';
import { Plant, Department, Employee, ActivityLog } from '../models';
import { HTTP_STATUS } from '../constants';
import { sendResponse, sendErrorResponse, sendPaginatedResponse, buildPaginationMeta } from '../utils/response';

// Get all plants
export const getPlants = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const { search, status } = req.query;

  const filter: Record<string, unknown> = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ];
  }

  if (status) filter.status = status;

  const [plants, total] = await Promise.all([
    Plant.find(filter)
      .populate('managers', 'firstName lastName email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Plant.countDocuments(filter),
  ]);

  sendPaginatedResponse(res, plants, buildPaginationMeta(total, page, limit));
};

// Get single plant
export const getPlant = async (req: Request, res: Response): Promise<void> => {
  const plant = await Plant.findById(req.params.id)
    .populate('managers', 'firstName lastName email avatar phone');

  if (!plant) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Plant not found');
    return;
  }

  // Get plant departments
  const departments = await Department.find({ plant: req.params.id })
    .select('name code status employeeCount performance')
    .populate('manager', 'firstName lastName');

  // Get plant employees count
  const departmentIds = departments.map(d => d._id);
  const employeeCount = await Employee.countDocuments({ department: { $in: departmentIds } });

  sendResponse(res, HTTP_STATUS.OK, { plant, departments, employeeCount });
};

// Create plant
export const createPlant = async (req: Request, res: Response): Promise<void> => {
  const { name, code, location, address, managers, shifts, capacity, description } = req.body;

  // Check if code exists
  const existing = await Plant.findOne({ code });
  if (existing) {
    sendErrorResponse(res, HTTP_STATUS.CONFLICT, 'Plant code already exists');
    return;
  }

  const plant = await Plant.create({
    name,
    code,
    location,
    address,
    managers: managers || [],
    shifts: shifts || [],
    capacity,
    description,
  });

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'create',
    category: 'plant',
    resource: 'Plant',
    resourceId: plant._id,
    description: `Created plant ${name} (${code})`,
  });

  sendResponse(res, HTTP_STATUS.CREATED, await plant.populate('managers', 'firstName lastName email'), 'Plant created successfully');
};

// Update plant
export const updatePlant = async (req: Request, res: Response): Promise<void> => {
  const plant = await Plant.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: new Date() },
    { new: true, runValidators: true }
  ).populate('managers', 'firstName lastName email avatar');

  if (!plant) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Plant not found');
    return;
  }

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'update',
    category: 'plant',
    resource: 'Plant',
    resourceId: plant._id,
    description: `Updated plant ${plant.name}`,
  });

  sendResponse(res, HTTP_STATUS.OK, plant, 'Plant updated successfully');
};

// Delete plant
export const deletePlant = async (req: Request, res: Response): Promise<void> => {
  const plant = await Plant.findByIdAndDelete(req.params.id);

  if (!plant) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Plant not found');
    return;
  }

  // Check for departments
  const deptCount = await Department.countDocuments({ plant: req.params.id });
  if (deptCount > 0) {
    sendErrorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Cannot delete plant with existing departments');
    return;
  }

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'delete',
    category: 'plant',
    resource: 'Plant',
    resourceId: plant._id,
    description: `Deleted plant ${plant.name}`,
  });

  sendResponse(res, HTTP_STATUS.OK, null, 'Plant deleted successfully');
};

// Get plant statistics
export const getPlantStats = async (req: Request, res: Response): Promise<void> => {
  const plant = await Plant.findById(req.params.id);

  if (!plant) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Plant not found');
    return;
  }

  // Get departments
  const departments = await Department.find({ plant: plant._id });
  const departmentIds = departments.map(d => d._id);

  // Get employee stats
  const employeeStats = await Employee.aggregate([
    { $match: { department: { $in: departmentIds } } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  // Get production order stats
  const ProductionOrder = require('../models').ProductionOrder;
  const orderStats = await ProductionOrder.aggregate([
    { $match: { plant: plant._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$estimatedCost' },
      },
    },
  ]);

  // Get inventory stats
  const Inventory = require('../models').Inventory;
  const inventoryStats = await Inventory.aggregate([
    { $match: { plant: plant._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } },
      },
    },
  ]);

  sendResponse(res, HTTP_STATUS.OK, {
    employees: employeeStats,
    orders: orderStats,
    inventory: inventoryStats,
    departments: departments.length,
    shifts: plant.shifts.length,
  });
};

export default {
  getPlants,
  getPlant,
  createPlant,
  updatePlant,
  deletePlant,
  getPlantStats,
};
