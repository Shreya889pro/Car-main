// Employee Types
export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  department: string;
  departmentId: string;
  role: string;
  roleId: string;
  position: string;
  salary: number;
  status: 'active' | 'inactive' | 'on_leave';
  attendance: 'present' | 'absent' | 'late' | 'working_from_home';
  joinDate: string;
  birthDate: string;
  address: string;
  city: string;
  country: string;
  skills: string[];
  certifications: Certification[];
  achievements: Achievement[];
  manager: string;
  managerId: string;
  teamMembers: string[];
  performance: Performance;
  documents: Document[];
  leaves: LeaveRequest[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'award' | 'milestone' | 'recognition';
}

export interface Performance {
  overall: number;
  productivity: number;
  quality: number;
  teamwork: number;
  communication: number;
  leadership: number;
}

export interface LeaveRequest {
  id: string;
  type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'unpaid';
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  approvedBy?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'contract' | 'certificate' | 'id' | 'other';
  url: string;
  uploadedAt: string;
  size: number;
}

// Department Types
export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  manager: string;
  managerId: string;
  employeeCount: number;
  budget: number;
  location: string;
  plantId: string;
  status: 'active' | 'inactive';
  performance: DepartmentPerformance;
  teams: Team[];
}

export interface DepartmentPerformance {
  efficiency: number;
  productivity: number;
  quality: number;
  safety: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
}

export interface Team {
  id: string;
  name: string;
  leader: string;
  leaderId: string;
  members: string[];
}

// Role Types
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  level: number;
  department?: string;
}

// Plant Types
export interface Plant {
  id: string;
  name: string;
  code: string;
  location: string;
  address: string;
  capacity: number;
  currentLoad: number;
  departments: string[];
  managers: string[];
  status: 'operational' | 'maintenance' | 'shutdown';
  establishedDate: string;
  area: number;
  shifts: Shift[];
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  workers: number;
}

// Production Order Types
export interface ProductionOrder {
  id: string;
  orderId: string;
  product: string;
  productId: string;
  quantity: number;
  unit: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: ProductionStatus;
  progress: number;
  dueDate: string;
  startDate: string;
  estimatedEndDate: string;
  assignedTeam: string[];
  assignedDepartment: string;
  plantId: string;
  notes: string;
  comments: Comment[];
  attachments: Attachment[];
  history: HistoryEntry[];
  qualityChecks: QualityCheck[];
  materials: Material[];
}

export type ProductionStatus =
  | 'pending'
  | 'planning'
  | 'assigned'
  | 'in_progress'
  | 'quality_check'
  | 'packaging'
  | 'dispatch'
  | 'completed'
  | 'on_hold'
  | 'cancelled';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: string;
  replies?: Comment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface HistoryEntry {
  id: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: string;
  details?: string;
}

export interface QualityCheck {
  id: string;
  name: string;
  status: 'pending' | 'passed' | 'failed';
  inspector: string;
  timestamp?: string;
  remarks?: string;
}

export interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: 'available' | 'reserved' | 'low_stock';
}

// Kanban Types
export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  status: ProductionStatus;
  cards: KanbanCard[];
}

export interface KanbanCard {
  id: string;
  orderId: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignees: string[];
  dueDate: string;
  progress: number;
  tags: string[];
  comments: number;
  attachments: number;
}

// Inventory Types
export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  categoryId: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  unitPrice: number;
  location: string;
  warehouseId: string;
  supplier: string;
  supplierId: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'reserved';
  lastUpdated: string;
  movements: StockMovement[];
}

export interface StockMovement {
  id: string;
  type: 'in' | 'out' | 'transfer';
  quantity: number;
  reference: string;
  timestamp: string;
  userId: string;
  userName: string;
  notes?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
  capacity: number;
  usedCapacity: number;
  manager: string;
  managerId: string;
  zones: WarehouseZone[];
  status: 'operational' | 'maintenance';
}

export interface WarehouseZone {
  id: string;
  name: string;
  type: 'raw_materials' | 'finished_goods' | 'quarantine' | 'returns';
  capacity: number;
  usedCapacity: number;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  category: string[];
  rating: number;
  status: 'active' | 'inactive' | 'blocked';
  orders: number;
  totalValue: number;
}

export interface Customer {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  category: 'regular' | 'vip' | 'new';
  orders: number;
  totalValue: number;
  status: 'active' | 'inactive';
}

// Import/Export Types
export interface Shipment {
  id: string;
  shipmentId: string;
  type: 'import' | 'export';
  status: ShipmentStatus;
  origin: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  actualArrival?: string;
  containerId: string;
  transportType: 'sea' | 'air' | 'road' | 'rail';
  customsStatus: 'pending' | 'cleared' | 'held';
  value: number;
  items: ShipmentItem[];
  documents: ShipmentDocument[];
  timeline: ShipmentEvent[];
}

export type ShipmentStatus =
  | 'draft'
  | 'confirmed'
  | 'in_transit'
  | 'customs'
  | 'delivered'
  | 'cancelled';

export interface ShipmentItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ShipmentDocument {
  id: string;
  name: string;
  type: 'invoice' | 'packing_list' | 'bill_of_lading' | 'certificate' | 'customs';
  url: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ShipmentEvent {
  id: string;
  type: string;
  location: string;
  timestamp: string;
  description: string;
}

// Quality Control Types
export interface QualityInspection {
  id: string;
  inspectionId: string;
  type: 'incoming' | 'in_process' | 'final' | 'outgoing';
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  sampleSize: number;
  status: 'pending' | 'in_progress' | 'passed' | 'failed' | 'conditional';
  inspector: string;
  inspectorId: string;
  startDate: string;
  endDate?: string;
  criteria: InspectionCriteria[];
  defects: Defect[];
  remarks: string;
  approvedBy?: string;
}

export interface InspectionCriteria {
  id: string;
  name: string;
  specification: string;
  actualValue?: string;
  status: 'pass' | 'fail' | 'na';
}

export interface Defect {
  id: string;
  type: string;
  severity: 'minor' | 'major' | 'critical';
  quantity: number;
  description: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'production' | 'quality' | 'inventory' | 'hr' | 'system';
  actionUrl?: string;
  userId: string;
}

// Calendar Types
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  type: 'meeting' | 'production' | 'deadline' | 'leave' | 'event';
  startDateTime: string;
  endDateTime: string;
  allDay: boolean;
  location?: string;
  attendees: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  recurring?: RecurringPattern;
  reminders?: string[];
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: string;
  count?: number;
}

// Report Types
export interface Report {
  id: string;
  name: string;
  type: ReportType;
  category: string;
  description: string;
  createdAt: string;
  createdBy: string;
  period: string;
  format: 'pdf' | 'excel' | 'csv';
  status: 'generating' | 'completed' | 'failed';
  downloadUrl?: string;
}

export type ReportType =
  | 'production'
  | 'employee'
  | 'inventory'
  | 'quality'
  | 'import'
  | 'export'
  | 'dispatch'
  | 'financial'
  | 'performance';

// Analytics Types
export interface AnalyticsData {
  period: string;
  value: number;
  previousValue?: number;
  trend?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  fill?: boolean;
}

// Dashboard Stats
export interface DashboardStats {
  totalProduction: number;
  completedOrders: number;
  pendingOrders: number;
  employeesPresent: number;
  employeesAbsent: number;
  qualityIssues: number;
  inventoryAlerts: number;
  upcomingDeadlines: number;
  notifications: number;
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  metadata?: Record<string, unknown>;
}

// Settings Types
export interface UserSettings {
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
  dateFormat: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  categories: Record<string, boolean>;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'team';
  showActivity: boolean;
  showAchievements: boolean;
}

// User Profile
export interface UserProfile {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  role: string;
  department: string;
  bio: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  languages: string[];
  socialLinks: SocialLink[];
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface SocialLink {
  platform: string;
  url: string;
}

// File Management
export interface FileFolder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: string;
  createdBy: string;
  files: FileItem[];
  subFolders: FileFolder[];
}

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail?: string;
  createdAt: string;
  createdBy: string;
  modifiedAt: string;
  version: number;
  tags: string[];
}

// Global Search
export interface SearchResult {
  id: string;
  type: 'employee' | 'order' | 'inventory' | 'department' | 'document' | 'report' | 'supplier' | 'customer';
  title: string;
  subtitle: string;
  url: string;
  icon: string;
}
