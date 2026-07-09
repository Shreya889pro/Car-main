import { Router } from 'express';
import { body, param, query } from 'express-validator';
import employeeController from '../controllers/employeeController';
import { validate } from '../middleware/validate';
import { protect, authorize, checkPermission } from '../middleware/auth';
import { UserRole } from '../constants';

const router = Router();

// All routes require authentication
router.use(protect);

const createEmployeeValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('firstName').trim().notEmpty().withMessage('First name required'),
  body('lastName').trim().notEmpty().withMessage('Last name required'),
  body('department').isMongoId().withMessage('Valid department ID required'),
  body('position').trim().notEmpty().withMessage('Position required'),
  body('phone').optional().isMobilePhone('any'),
  body('joinDate').isISO8601().withMessage('Valid join date required'),
];

const updateEmployeeValidation = [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('department').optional().isMongoId(),
  body('position').optional().trim().notEmpty(),
  body('phone').optional().isMobilePhone('any'),
];

const attendanceValidation = [
  body('status').isIn(['present', 'absent', 'on_leave', 'half_day']).withMessage('Valid status required'),
  body('checkIn').optional().isISO8601(),
  body('checkOut').optional().isISO8601(),
  body('notes').optional().trim(),
];

const leaveRequestValidation = [
  body('type').isIn(['annual', 'sick', 'personal', 'maternity', 'paternity', 'unpaid']).withMessage('Valid leave type required'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required'),
  body('reason').trim().notEmpty().withMessage('Reason required'),
];

// Routes
router.get('/', checkPermission('manage_employees'), employeeController.getEmployees);
router.get('/:id', checkPermission('view_employees'), employeeController.getEmployee);
router.post('/', authorize(UserRole.ADMIN, UserRole.HR_MANAGER), createEmployeeValidation, validate, employeeController.createEmployee);
router.put('/:id', checkPermission('manage_employees'), updateEmployeeValidation, validate, employeeController.updateEmployee);
router.delete('/:id', authorize(UserRole.ADMIN, UserRole.HR_MANAGER), employeeController.deleteEmployee);

// Attendance routes
router.put('/:id/attendance', checkPermission('manage_attendance'), attendanceValidation, validate, employeeController.updateAttendance);
router.get('/:id/attendance', checkPermission('view_employees'), employeeController.getAttendance);

// Leave request routes
router.get('/:id/leaves', checkPermission('view_employees'), employeeController.getLeaveRequests);
router.post('/:id/leaves', leaveRequestValidation, validate, employeeController.createLeaveRequest);
router.put('/:id/leaves/:leaveId/approve', checkPermission('approve_leave'), employeeController.approveLeaveRequest);

// Performance
router.get('/:id/performance', checkPermission('view_employees'), employeeController.getPerformance);

export default router;
