import { Request, Response } from 'express';
import { Employee, User, Attendance, LeaveRequest, ActivityLog } from '../models';
import { HTTP_STATUS, EmployeeStatus, AttendanceStatus } from '../constants';
import { sendResponse, sendErrorResponse, sendPaginatedResponse, buildPaginationMeta } from '../utils/response';

// Get all employees with pagination, filtering, and search
export const getEmployees = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const { search, department, status } = req.query;

  const filter: Record<string, any> = {};

  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
    ];
  }

  if (department) filter.department = department;
  if (status) filter.status = status;

  const [employees, total] = await Promise.all([
    Employee.find(filter)
      .populate('department', 'name code')
      .populate('manager', 'firstName lastName employeeId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Employee.countDocuments(filter),
  ]);

  // Update attendance for demo
  const presentCount = employees.filter((e: any) => e.attendance === AttendanceStatus.PRESENT).length;
  const absentCount = employees.filter((e: any) => e.attendance === AttendanceStatus.ABSENT).length;

  sendPaginatedResponse(res, employees, {
    ...buildPaginationMeta(total, page, limit),
    presentCount,
    absentCount,
  });
};

// Get single employee by ID
export const getEmployee = async (req: Request, res: Response): Promise<void> => {
  const employee = await Employee.findById(req.params.id)
    .populate('department', 'name code location')
    .populate('manager', 'firstName lastName employeeId')
    .populate('user', 'email role isEmailVerified');

  if (!employee) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Employee not found');
    return;
  }

  sendResponse(res, HTTP_STATUS.OK, employee);
};

// Create new employee
export const createEmployee = async (req: Request, res: Response): Promise<void> => {
  const {
    email,
    firstName,
    lastName,
    phone,
    department,
    position,
    manager,
    joinDate,
    skills,
    status,
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    sendErrorResponse(res, HTTP_STATUS.CONFLICT, 'User with this email already exists');
    return;
  }

  // Generate temporary password
  const tempPassword = Math.random().toString(36).slice(-8);

  // Create user
  const user = await User.create({
    email,
    password: tempPassword,
    firstName,
    lastName,
    role: 'employee',
    department,
  });

  // Generate employee ID
  const count = await Employee.countDocuments();
  const employeeId = `EMP${String(count + 1).padStart(5, '0')}`;

  // Create employee
  const employee = await Employee.create({
    employeeId,
    user: user._id,
    firstName,
    lastName,
    email,
    phone,
    department,
    position,
    manager,
    joinDate: new Date(joinDate),
    skills: skills || [],
    status: status || EmployeeStatus.ACTIVE,
  });

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'create',
    category: 'employee',
    resource: 'Employee',
    resourceId: employee._id,
    description: `Created employee ${firstName} ${lastName} (${employeeId})`,
  });

  sendResponse(res, HTTP_STATUS.CREATED, await employee.populate('department user'), 'Employee created successfully');
};

// Update employee
export const updateEmployee = async (req: Request, res: Response): Promise<void> => {
  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: new Date() },
    { new: true, runValidators: true }
  ).populate('department', 'name code');

  if (!employee) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Employee not found');
    return;
  }

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'update',
    category: 'employee',
    resource: 'Employee',
    resourceId: employee._id,
    description: `Updated employee ${(employee as any).firstName} ${(employee as any).lastName}`,
  });

  sendResponse(res, HTTP_STATUS.OK, employee, 'Employee updated successfully');
};

// Delete employee
export const deleteEmployee = async (req: Request, res: Response): Promise<void> => {
  const employee: any = await Employee.findByIdAndDelete(req.params.id);

  if (!employee) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Employee not found');
    return;
  }

  // Also delete associated user
  await User.findByIdAndDelete(employee.user);

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'delete',
    category: 'employee',
    resource: 'Employee',
    resourceId: employee._id,
    description: `Deleted employee ${employee.firstName} ${employee.lastName}`,
  });

  sendResponse(res, HTTP_STATUS.OK, null, 'Employee deleted successfully');
};

// Update attendance
export const updateAttendance = async (req: Request, res: Response): Promise<void> => {
  const { status, checkIn, checkOut, notes } = req.body;

  const employee: any = await Employee.findById(req.params.id);
  if (!employee) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Employee not found');
    return;
  }

  employee.attendance = status;
  await employee.save();

  // Create attendance record
  const attendance = await Attendance.create({
    employee: employee._id,
    date: new Date(),
    status,
    checkIn: checkIn ? new Date(checkIn) : undefined,
    checkOut: checkOut ? new Date(checkOut) : undefined,
    notes,
    approvedBy: req.user?._id,
  });

  sendResponse(res, HTTP_STATUS.OK, { employee, attendance }, 'Attendance updated');
};

// Get employee attendance history
export const getAttendance = async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 30;

  const filter: Record<string, any> = { employee: req.params.id };

  if (startDate || endDate) {
    filter.date = {} as any;
    if (startDate) filter.date.$gte = new Date(startDate as string);
    if (endDate) filter.date.$lte = new Date(endDate as string);
  }

  const attendance = await Attendance.find(filter)
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Attendance.countDocuments(filter);

  sendPaginatedResponse(res, attendance, buildPaginationMeta(total, page, limit));
};

// Get leave requests
export const getLeaveRequests = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const filter: Record<string, any> = { employee: req.params.id };

  const leaves = await LeaveRequest.find(filter)
    .populate('approvedBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await LeaveRequest.countDocuments(filter);

  sendPaginatedResponse(res, leaves, buildPaginationMeta(total, page, limit));
};

// Create leave request
export const createLeaveRequest = async (req: Request, res: Response): Promise<void> => {
  const { type, startDate, endDate, reason } = req.body;

  const leave = await LeaveRequest.create({
    employee: req.params.id,
    type,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    reason,
  });

  // Update employee status
  await Employee.findByIdAndUpdate(req.params.id, { status: EmployeeStatus.ON_LEAVE });

  sendResponse(res, HTTP_STATUS.CREATED, leave, 'Leave request submitted');
};

// Approve leave request
export const approveLeaveRequest = async (req: Request, res: Response): Promise<void> => {
  const leave: any = await LeaveRequest.findByIdAndUpdate(
    req.params.leaveId,
    {
      status: 'approved',
      approvedBy: req.user?._id,
      approvedAt: new Date(),
    },
    { new: true }
  );

  if (!leave) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Leave request not found');
    return;
  }

  sendResponse(res, HTTP_STATUS.OK, leave, 'Leave request approved');
};

// Get employee performance
export const getPerformance = async (req: Request, res: Response): Promise<void> => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Employee not found');
    return;
  }

  // Get attendance stats
  const attendanceStats = await Attendance.aggregate([
    { $match: { employee: employee._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const performance: any = {
    attendanceStats: attendanceStats.reduce((acc: any, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {}),
    skills: (employee as any).skills || [],
  };

  sendResponse(res, HTTP_STATUS.OK, performance);
};

export default {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateAttendance,
  getAttendance,
  getLeaveRequests,
  createLeaveRequest,
  approveLeaveRequest,
  getPerformance,
};
