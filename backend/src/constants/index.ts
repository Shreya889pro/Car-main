// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// User Roles
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  PLANT_MANAGER = 'plant_manager',
  PRODUCTION_MANAGER = 'production_manager',
  HR_MANAGER = 'hr_manager',
  FOREMAN = 'foreman',
  WAREHOUSE_MANAGER = 'warehouse_manager',
  INVENTORY_MANAGER = 'inventory_manager',
  QUALITY_MANAGER = 'quality_manager',
  LOGISTICS_MANAGER = 'logistics_manager',
  DISPATCH_MANAGER = 'dispatch_manager',
  SUPERVISOR = 'supervisor',
  EMPLOYEE = 'employee',
}

// Employee Status
export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  TERMINATED = 'terminated',
}

// Attendance Status
export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  WORKING_FROM_HOME = 'working_from_home',
}

// Production Order Status
export enum ProductionOrderStatus {
  PENDING = 'pending',
  PLANNING = 'planning',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  QUALITY_CHECK = 'quality_check',
  PACKAGING = 'packaging',
  DISPATCH = 'dispatch',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
}

// Priority Levels
export enum Priority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

// Leave Types
export enum LeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  PERSONAL = 'personal',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  UNPAID = 'unpaid',
}

// Leave Request Status
export enum LeaveRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// Inventory Status
export enum InventoryStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  RESERVED = 'reserved',
}

// Shipment Status
export enum ShipmentStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  IN_TRANSIT = 'in_transit',
  CUSTOMS = 'customs',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

// Quality Inspection Status
export enum QualityInspectionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  PASSED = 'passed',
  FAILED = 'failed',
  CONDITIONAL = 'conditional',
}

// Notification Types
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

// Notification Categories
export enum NotificationCategory {
  PRODUCTION = 'production',
  QUALITY = 'quality',
  INVENTORY = 'inventory',
  HR = 'hr',
  SYSTEM = 'system',
  DISPATCH = 'dispatch',
}

// Document Types
export enum DocumentType {
  CONTRACT = 'contract',
  CERTIFICATE = 'certificate',
  ID = 'id',
  INVOICE = 'invoice',
  REPORT = 'report',
  OTHER = 'other',
}

// Sort Orders
export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Token Types
export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET_PASSWORD: 'reset_password',
  EMAIL_VERIFICATION: 'email_verification',
} as const;

// Permission Constants
export const PERMISSIONS = {
  // Employee Permissions
  manage_employees: 'manage_employees',
  view_employees: 'view_employees',

  // Department Permissions
  manage_departments: 'manage_departments',
  view_departments: 'view_departments',

  // Plant Permissions
  manage_plants: 'manage_plants',
  view_plants: 'view_plants',

  // Production Permissions
  create_orders: 'create_orders',
  manage_orders: 'manage_orders',
  view_orders: 'view_orders',

  // Inventory Permissions
  manage_inventory: 'manage_inventory',
  view_inventory: 'view_inventory',

  // Quality Permissions
  manage_quality: 'manage_quality',
  view_quality: 'view_quality',

  // Shipment Permissions
  manage_shipments: 'manage_shipments',
  view_shipments: 'view_shipments',

  // Reports Permissions
  view_reports: 'view_reports',
  export_reports: 'export_reports',

  // Attendance Permissions
  manage_attendance: 'manage_attendance',
  approve_leave: 'approve_leave',

  // Settings Permissions
  manage_settings: 'manage_settings',
  view_settings: 'view_settings',
} as const;

// Role Permissions Mapping
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [UserRole.ADMIN]: Object.values(PERMISSIONS),
  [UserRole.PLANT_MANAGER]: [
    PERMISSIONS.view_employees,
    PERMISSIONS.manage_employees,
    PERMISSIONS.view_departments,
    PERMISSIONS.manage_departments,
    PERMISSIONS.view_plants,
    PERMISSIONS.view_orders,
    PERMISSIONS.manage_orders,
    PERMISSIONS.view_inventory,
    PERMISSIONS.view_reports,
  ],
  [UserRole.PRODUCTION_MANAGER]: [
    PERMISSIONS.view_employees,
    PERMISSIONS.view_orders,
    PERMISSIONS.manage_orders,
    PERMISSIONS.create_orders,
    PERMISSIONS.view_reports,
  ],
  [UserRole.HR_MANAGER]: [
    PERMISSIONS.manage_employees,
    PERMISSIONS.view_employees,
    PERMISSIONS.view_departments,
    PERMISSIONS.manage_attendance,
    PERMISSIONS.approve_leave,
    PERMISSIONS.view_reports,
  ],
  [UserRole.INVENTORY_MANAGER]: [
    PERMISSIONS.manage_inventory,
    PERMISSIONS.view_inventory,
    PERMISSIONS.view_reports,
  ],
  [UserRole.QUALITY_MANAGER]: [
    PERMISSIONS.manage_quality,
    PERMISSIONS.view_quality,
    PERMISSIONS.view_orders,
    PERMISSIONS.view_reports,
  ],
  [UserRole.LOGISTICS_MANAGER]: [
    PERMISSIONS.manage_shipments,
    PERMISSIONS.view_shipments,
    PERMISSIONS.view_inventory,
    PERMISSIONS.view_reports,
  ],
  [UserRole.SUPERVISOR]: [
    PERMISSIONS.view_employees,
    PERMISSIONS.view_orders,
    PERMISSIONS.manage_orders,
    PERMISSIONS.manage_attendance,
  ],
  [UserRole.FOREMAN]: [
    PERMISSIONS.view_employees,
    PERMISSIONS.view_orders,
    PERMISSIONS.manage_orders,
  ],
  [UserRole.EMPLOYEE]: [
    PERMISSIONS.view_employees,
    PERMISSIONS.view_orders,
  ],
};
