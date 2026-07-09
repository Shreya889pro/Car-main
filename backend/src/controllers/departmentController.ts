import { Request, Response } from 'express';
import { Department, Employee, ActivityLog } from '../models';
import { HTTP_STATUS } from '../constants';
import { sendResponse, sendErrorResponse, sendPaginatedResponse, buildPaginationMeta } from '../utils/response';

// Get all departments
export const getDepartments = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const { search, plant, status } = req.query;

  const filter: Record<string, unknown> = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];
  }

  if (plant) filter.plant = plant;
  if (status) filter.status = status;

  const [departments, total] = await Promise.all([
    Department.find(filter)
      .populate('plant', 'name code')
      .populate('manager', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Department.countDocuments(filter),
  ]);

  sendPaginatedResponse(res, departments, buildPaginationMeta(total, page, limit));
};

// Get single department
export const getDepartment = async (req: Request, res: Response): Promise<void> => {
  const department = await Department.findById(req.params.id)
    .populate('plant', 'name code location')
    .populate('manager', 'firstName lastName email avatar')
    .populate('teams.members', 'firstName lastName email avatar');

  if (!department) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Department not found');
    return;
  }

  // Get department employees
  const employees = await Employee.find({ department: req.params.id })
    .select('firstName lastName email position status attendance avatar')
    .limit(50);

  sendResponse(res, HTTP_STATUS.OK, { department, employees });
};

// Create department
export const createDepartment = async (req: Request, res: Response): Promise<void> => {
  const { name, code, plant, manager, description, location, teams } = req.body;

  // Check if code exists in plant
  const existing = await Department.findOne({ code, plant });
  if (existing) {
    sendErrorResponse(res, HTTP_STATUS.CONFLICT, 'Department code already exists in this plant');
    return;
  }

  const department = await Department.create({
    name,
    code,
    plant,
    manager,
    description,
    location,
    teams: teams || [],
  });

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'create',
    category: 'department',
    resource: 'Department',
    resourceId: department._id,
    description: `Created department ${name} (${code})`,
  });

  sendResponse(res, HTTP_STATUS.CREATED, await department.populate('plant manager'), 'Department created successfully');
};

// Update department
export const updateDepartment = async (req: Request, res: Response): Promise<void> => {
  const department = await Department.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: new Date() },
    { new: true, runValidators: true }
  )
    .populate('plant', 'name code')
    .populate('manager', 'firstName lastName email');

  if (!department) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Department not found');
    return;
  }

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'update',
    category: 'department',
    resource: 'Department',
    resourceId: department._id,
    description: `Updated department ${department.name}`,
  });

  sendResponse(res, HTTP_STATUS.OK, department, 'Department updated successfully');
};

// Delete department
export const deleteDepartment = async (req: Request, res: Response): Promise<void> => {
  const department = await Department.findByIdAndDelete(req.params.id);

  if (!department) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Department not found');
    return;
  }

  // Update employees to remove department reference
  await Employee.updateMany(
    { department: req.params.id },
    { $unset: { department: 1 } }
  );

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'delete',
    category: 'department',
    resource: 'Department',
    resourceId: department._id,
    description: `Deleted department ${department.name}`,
  });

  sendResponse(res, HTTP_STATUS.OK, null, 'Department deleted successfully');
};

// Get department statistics
export const getDepartmentStats = async (req: Request, res: Response): Promise<void> => {
  const department = await Department.findById(req.params.id);

  if (!department) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Department not found');
    return;
  }

  // Get employee stats
  const employeeStats = await Employee.aggregate([
    { $match: { department: department._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        present: { $sum: { $cond: [{ $eq: ['$attendance', 'present'] }, 1, 0] } },
      },
    },
  ]);

  // Get production order stats
  const ProductionOrder = require('../models').ProductionOrder;
  const orderStats = await ProductionOrder.aggregate([
    { $match: { department: department._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  sendResponse(res, HTTP_STATUS.OK, {
    employees: employeeStats[0] || { total: 0, active: 0, present: 0 },
    orders: orderStats,
    performance: department.performance,
  });
};

export default {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats,
};
