import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Employee, Department, Plant, ProductionOrder, Inventory, QualityInspection, Shipment, Notification, Attendance, ActivityLog } from '../models';
import { UserRole, EmployeeStatus, ProductionOrderStatus, Priority, InventoryStatus } from '../constants';
import config from '../config';

// Sample data generators
const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jennifer', 'Robert', 'Jessica', 'William', 'Ashley', 'James', 'Amanda', 'Christopher', 'Melissa', 'Daniel', 'Nicole', 'Matthew', 'Stephanie', 'Anthony', 'Elizabeth', 'Andrew', 'Michelle', 'Joshua', 'Kimberly', 'Kevin', 'Laura', 'Brian', 'Rebecca', 'Steven', 'Rachel'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];
const departments = ['Production', 'Quality Control', 'Maintenance', 'Logistics', 'Engineering', 'Research & Development', 'Human Resources', 'Finance', 'IT', 'Safety', 'Procurement', 'Sales', 'Marketing', 'Customer Service', 'Operations'];
const positions = ['Manager', 'Senior Engineer', 'Engineer', 'Technician', 'Supervisor', 'Specialist', 'Coordinator', 'Director', 'Analyst', 'Administrator'];
const inventoryCategories = ['Raw Materials', 'Components', 'Tools', 'Packaging', 'Safety Equipment', 'Office Supplies', 'Maintenance Parts', 'Electronics', 'Chemicals', 'Lubricants'];
const productNames = ['Industrial Motor X500', 'Control Panel CP-2000', 'Hydraulic Pump HP-350', 'Gear Assembly GA-100', 'Electric Transformer ET-75', 'Pressure Valve PV-40', 'Cooling Fan CF-20', 'Bearing Set BS-500', 'Conveyor Belt CB-150', 'Sensor Module SM-300', 'Power Supply PS-800', 'Actuator Unit AU-450', 'Filter Unit FU-200', 'Circuit Board CB-100', 'Heat Exchanger HE-600'];
const locations = ['Building A', 'Building B', 'Building C', 'Warehouse 1', 'Warehouse 2', 'Main Office', 'Production Floor 1', 'Production Floor 2', 'Quality Lab', 'Loading Dock'];
const shifts = ['Morning Shift', 'Afternoon Shift', 'Night Shift', 'Day Shift', 'Weekend Shift'];

const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const generatePastDate = (daysAgo: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

const generateFutureDate = (daysAhead: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date;
};

// Clear all data
const clearDatabase = async () => {
  if (config.NODE_ENV === 'production') {
    throw new Error('Cannot seed in production environment');
  }

  const collections = [User, Employee, Department, Plant, ProductionOrder, Inventory, QualityInspection, Shipment, Notification, Attendance, ActivityLog];

  for (const collection of collections) {
    await (collection.deleteMany as any)({});
  }

  console.log('Database cleared');
};

// Seed users
const seedUsers = async () => {
  const users = [];
  const password = await bcrypt.hash('password123', 12);

  // Admin user
  users.push({
    email: 'admin@flowcore.com',
    password,
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    isEmailVerified: true,
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
  });

  // Department managers
  const managerRoles = [UserRole.HR_MANAGER, UserRole.PLANT_MANAGER, UserRole.PRODUCTION_MANAGER, UserRole.QUALITY_MANAGER, UserRole.INVENTORY_MANAGER, UserRole.LOGISTICS_MANAGER];

  for (let i = 0; i < managerRoles.length; i++) {
    users.push({
      email: `manager${i + 1}@flowcore.com`,
      password,
      firstName: firstNames[i + 10],
      lastName: lastNames[i + 10],
      role: managerRoles[i],
      isEmailVerified: true,
      isActive: true,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + i * 100000}?w=150&h=150&fit=crop`,
    });
  }

  // Regular supervisors
  for (let i = 0; i < 10; i++) {
    users.push({
      email: `supervisor${i + 1}@flowcore.com`,
      password,
      firstName: firstNames[i + 20],
      lastName: lastNames[i],
      role: UserRole.SUPERVISOR,
      isEmailVerified: true,
      isActive: true,
      avatar: `https://images.unsplash.com/photo-${1510000000000 + i * 100000}?w=150&h=150&fit=crop`,
    });
  }

  // Regular employees
  for (let i = 0; i < 85; i++) {
    users.push({
      email: `employee${i + 1}@flowcore.com`,
      password,
      firstName: firstNames[i % 30],
      lastName: lastNames[i % 30],
      role: UserRole.EMPLOYEE,
      isEmailVerified: true,
      isActive: true,
      avatar: `https://images.unsplash.com/photo-${1520000000000 + i * 100000}?w=150&h=150&fit=crop`,
    });
  }

  const createdUsers = await User.insertMany(users);
  console.log(`Created ${createdUsers.length} users`);
  return createdUsers;
};

// Seed plants
const seedPlants = async () => {
  const plantsData = [
    { name: 'North Manufacturing Plant', code: 'PLT-NTH', location: 'Chicago, IL' },
    { name: 'South Production Facility', code: 'PLT-STH', location: 'Dallas, TX' },
    { name: 'East Assembly Plant', code: 'PLT-EST', location: 'New York, NY' },
    { name: 'West Manufacturing Hub', code: 'PLT-WST', location: 'Los Angeles, CA' },
    { name: 'Central Processing Center', code: 'PLT-CNT', location: 'Denver, CO' },
  ];

  const plants = [];

  for (const plantData of plantsData) {
    const plant = await Plant.create({
      ...plantData,
      address: {
        street: `${randomBetween(100, 999)} Industrial Blvd`,
        city: plantData.location.split(',')[0].trim(),
        state: plantData.location.split(',')[1]?.trim() || 'USA',
        zipCode: String(randomBetween(10000, 99999)),
        country: 'USA',
      },
      capacity: randomBetween(500, 2000),
      status: 'active',
      shifts: shifts.slice(0, 3).map((name, idx) => ({
        name,
        startTime: `${6 + idx * 8}:00`,
        endTime: `${14 + idx * 8}:00`,
        workers: randomBetween(50, 150),
      })),
      description: `${plantData.name} - A state-of-the-art manufacturing facility`,
    });
    plants.push(plant);
  }

  console.log(`Created ${plants.length} plants`);
  return plants;
};

// Seed departments
const seedDepartments = async (plants: any[], users: any[]) => {
  const departmentsData = [];

  for (let i = 0; i < departments.length; i++) {
    const plantIndex = i % plants.length;
    const managerUser = users.find(u => u.role !== UserRole.EMPLOYEE && u.role !== UserRole.ADMIN) || users[i + 1];

    departmentsData.push({
      name: departments[i],
      code: `DEPT-${String(i + 1).padStart(3, '0')}`,
      plant: plants[plantIndex]._id,
      manager: managerUser._id,
      description: `${departments[i]} department responsible for departmental operations`,
      location: randomElement(locations),
      employeeCount: randomBetween(10, 50),
      status: 'active',
      performance: {
        efficiency: randomBetween(70, 100),
        quality: randomBetween(80, 100),
        safety: randomBetween(90, 100),
      },
    });
  }

  const createdDepartments = await Department.insertMany(departmentsData);
  console.log(`Created ${createdDepartments.length} departments`);
  return createdDepartments;
};

// Seed employees
const seedEmployees = async (users: any[], departments: any[]) => {
  const employeesData = [];

  // Skip admin user (first one)
  for (let i = 1; i < users.length; i++) {
    const user = users[i];
    const department = randomElement(departments);

    employeesData.push({
      employeeId: `EMP${String(i).padStart(5, '0')}`,
      user: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: `+1-${randomBetween(200, 999)}-${randomBetween(100, 999)}-${randomBetween(1000, 9999)}`,
      department: department._id,
      position: user.role === UserRole.EMPLOYEE ? randomElement(positions.slice(3)) : randomElement(positions.slice(0, 4)),
      status: EmployeeStatus.ACTIVE,
      attendance: Math.random() > 0.15 ? 'present' : 'absent',
      joinDate: generatePastDate(randomBetween(90, 365 * 3)),
      avatar: user.avatar,
      salary: {
        base: randomBetween(40000, 120000),
        currency: 'USD',
      },
      skills: positions.slice(0, randomBetween(2, 5)),
      certifications: [],
      address: {
        street: `${randomBetween(100, 999)} Oak Street`,
        city: 'Chicago',
        state: 'IL',
        zipCode: String(randomBetween(10000, 99999)),
        country: 'USA',
      },
    });
  }

  const createdEmployees = await Employee.insertMany(employeesData);
  console.log(`Created ${createdEmployees.length} employees`);
  return createdEmployees;
};

// Seed production orders
const seedProductionOrders = async (plants: any[], departments: any[], employees: any[]) => {
  const statuses = Object.values(ProductionOrderStatus);
  const ordersData = [];

  for (let i = 0; i < 250; i++) {
    const status = i < 50 ? ProductionOrderStatus.COMPLETED : randomElement(statuses);
    const plant = randomElement(plants);
    const department = departments.find(d => d.plant.equals(plant._id)) || randomElement(departments);
    const supervisor = randomElement(employees.filter(e => e.position?.includes('Manager') || e.position?.includes('Supervisor')));
    const teamLead = randomElement(employees);

    ordersData.push({
      productName: randomElement(productNames),
      productCode: `PRD-${String(randomBetween(1, 1000)).padStart(4, '0')}`,
      quantity: randomBetween(10, 1000),
      unit: randomElement(['units', 'kg', 'liters', 'sets', 'pieces']),
      plant: plant._id,
      department: department._id,
      status,
      priority: randomElement(Object.values(Priority)),
      progress: status === ProductionOrderStatus.COMPLETED ? 100 : randomBetween(0, 99),
      dueDate: generateFutureDate(randomBetween(-30, 60)),
      estimatedCost: randomBetween(5000, 100000),
      customerName: `Customer ${randomBetween(1, 100)}`,
      customerEmail: `customer${randomBetween(1, 100)}@example.com`,
      supervisor: supervisor?._id,
      assignedTeam: [teamLead?._id].filter(Boolean),
      materials: [],
      workflowHistory: [],
    });
  }

  const createdOrders = await ProductionOrder.insertMany(ordersData);
  console.log(`Created ${createdOrders.length} production orders`);
  return createdOrders;
};

// Seed inventory
const seedInventory = async (plants: any[]) => {
  const inventoryData = [];
  const statuses = [InventoryStatus.IN_STOCK, InventoryStatus.IN_STOCK, InventoryStatus.IN_STOCK, InventoryStatus.LOW_STOCK, InventoryStatus.OUT_OF_STOCK];

  for (let i = 0; i < 150; i++) {
    const quantity = randomBetween(0, 500);
    const minStock = randomBetween(10, 100);
    let status = InventoryStatus.IN_STOCK;

    if (quantity === 0) {
      status = InventoryStatus.OUT_OF_STOCK;
    } else if (quantity <= minStock) {
      status = InventoryStatus.LOW_STOCK;
    }

    inventoryData.push({
      sku: `SKU-${String(i + 1).padStart(5, '0')}`,
      name: `${randomElement(['Industrial', 'Commercial', 'Standard', 'Premium'])} ${randomElement(['Component', 'Material', 'Tool', 'Part', 'Assembly'])} ${i + 1}`,
      description: 'Industrial grade material for manufacturing processes',
      category: randomElement(inventoryCategories),
      quantity,
      unit: randomElement(['pieces', 'kg', 'liters', 'meters', 'sets']),
      unitPrice: randomBetween(10, 5000),
      minStock,
      maxStock: minStock * 10,
      reorderPoint: minStock * 2,
      status,
      warehouse: randomElement(plants)._id,
      location: `Shelf ${String.fromCharCode(65 + randomBetween(0, 25))}-${randomBetween(1, 50)}`,
      movements: [],
    });
  }

  const createdInventory = await Inventory.insertMany(inventoryData);
  console.log(`Created ${createdInventory.length} inventory items`);
  return createdInventory;
};

// Seed quality inspections
const seedQualityInspections = async (orders: any[], employees: any[]) => {
  const inspectionsData = [];
  const types = ['incoming', 'in_process', 'final', 'outgoing'];
  const results = ['pass', 'fail', 'conditional'];

  for (let i = 0; i < 75; i++) {
    const order = randomElement(orders);
    const result = i < 50 ? 'pass' : randomElement(results);

    inspectionsData.push({
      type: randomElement(types),
      productName: order?.productName || randomElement(productNames),
      batchNumber: `BATCH-${String(randomBetween(1, 1000)).padStart(4, '0')}`,
      sampleSize: randomBetween(10, 100),
      productionOrder: order?._id,
      inspector: randomElement(employees)._id,
      status: i < 50 ? 'approved' : randomElement(['pending', 'in_progress', 'completed', 'rejected']),
      result,
      overallScore: result === 'pass' ? randomBetween(85, 100) : (result === 'fail' ? randomBetween(0, 50) : randomBetween(60, 84)),
      priority: randomElement(Object.values(Priority)),
      scheduledDate: generatePastDate(randomBetween(0, 30)),
      criteria: [],
      defects: [],
    });
  }

  const createdInspections = await QualityInspection.insertMany(inspectionsData);
  console.log(`Created ${createdInspections.length} quality inspections`);
  return createdInspections;
};

// Seed shipments
const seedShipments = async (orders: any[], plants: any[], employees: any[]) => {
  const shipmentsData = [];
  const statuses = ['pending', 'in_transit', 'delivered', 'delayed'];
  const types = ['import', 'export', 'transfer'];

  for (let i = 0; i < 50; i++) {
    const status = i < 30 ? randomElement(['delivered', 'in_transit']) : randomElement(statuses);

    shipmentsData.push({
      type: randomElement(types),
      origin: randomElement(plants)._id,
      destination: randomElement(plants)._id,
      driver: randomElement(employees)._id,
      status,
      scheduledDate: generatePastDate(randomBetween(-30, 0)),
      estimatedArrival: generateFutureDate(randomBetween(0, 14)),
      trackingNumber: `TRK${randomBetween(100000000, 999999999)}`,
      customer: {
        name: `Customer ${randomBetween(1, 100)}`,
        email: `customer${randomBetween(1, 100)}@example.com`,
        phone: `+1-555-${randomBetween(100, 999)}-${randomBetween(1000, 9999)}`,
      },
      orders: [randomElement(orders)?._id].filter(Boolean),
      priority: randomElement(Object.values(Priority)),
      timeline: [],
      documents: [],
    });
  }

  const createdShipments = await Shipment.insertMany(shipmentsData);
  console.log(`Created ${createdShipments.length} shipments`);
  return createdShipments;
};

// Seed notifications
const seedNotifications = async (users: any[]) => {
  const notificationsData = [];
  const types = ['order_assigned', 'order_completed', 'inventory_alert', 'quality_failed', 'shipment_updated', 'daily_summary'];
  const priorities = ['low', 'medium', 'high'];

  for (let i = 0; i < 200; i++) {
    notificationsData.push({
      recipient: randomElement(users)._id,
      type: randomElement(types),
      title: `Notification ${i + 1}`,
      message: 'This is a sample notification message for testing purposes',
      priority: randomElement(priorities),
      read: i < 150,
      readAt: i < 150 ? generatePastDate(randomBetween(0, 30)) : undefined,
      createdAt: generatePastDate(randomBetween(0, 30)),
    });
  }

  const createdNotifications = await Notification.insertMany(notificationsData);
  console.log(`Created ${createdNotifications.length} notifications`);
  return createdNotifications;
};

// Seed attendance
const seedAttendance = async (employees: any[]) => {
  const attendanceData = [];
  const statuses = ['present', 'absent', 'half_day', 'on_leave'];

  // Generate attendance for last 30 days
  for (let day = 0; day < 30; day++) {
    const date = generatePastDate(day);

    for (const employee of employees.slice(0, 50)) { // Limit to 50 employees for performance
      const status = Math.random() > 0.15 ? 'present' : randomElement(statuses);

      attendanceData.push({
        employee: employee._id,
        date,
        status,
        checkIn: status === 'present' ? new Date(date.setHours(8, randomBetween(0, 59), 0)) : undefined,
        checkOut: status === 'present' ? new Date(date.setHours(17, randomBetween(0, 59), 0)) : undefined,
        totalHours: status === 'present' ? 8 : (status === 'half_day' ? 4 : 0),
        notes: status !== 'present' ? 'Sample note' : undefined,
      });
    }
  }

  const createdAttendance = await Attendance.insertMany(attendanceData);
  console.log(`Created ${createdAttendance.length} attendance records`);
  return createdAttendance;
};

// Main seed function
export const seedDatabase = async () => {
  try {
    if (config.NODE_ENV === 'production') {
      throw new Error('Cannot seed in production environment');
    }

    console.log('Starting database seeding...');

    await clearDatabase();

    const users = await seedUsers();
    const plants = await seedPlants();
    const departments = await seedDepartments(plants, users);
    const employees = await seedEmployees(users, departments);
    const orders = await seedProductionOrders(plants, departments, employees);
    const inventory = await seedInventory(plants);
    const inspections = await seedQualityInspections(orders, employees);
    const shipments = await seedShipments(orders, plants, employees);
    await seedNotifications(users);
    await seedAttendance(employees);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nDefault admin credentials:');
    console.log('  Email: admin@flowcore.com');
    console.log('  Password: password123\n');

    return {
      users: users.length,
      plants: plants.length,
      departments: departments.length,
      employees: employees.length,
      orders: orders.length,
      inventory: inventory.length,
      inspections: inspections.length,
      shipments: shipments.length,
    };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

export default seedDatabase;
