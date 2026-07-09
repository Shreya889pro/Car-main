import { Request, Response } from 'express';
import { Employee, Department, ProductionOrder, Inventory, QualityInspection, Attendance, ActivityLog } from '../models';
import { HTTP_STATUS } from '../constants';
import { sendResponse, sendErrorResponse } from '../utils/response';
import { generatePDFReport, generateExcelReport } from '../utils/reports';

// Employee report
export const getEmployeeReport = async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate, department, format = 'json' } = req.query;

  const filter: Record<string, any> = {};
  if (department) filter.department = department;

  if (startDate || endDate) {
    filter.joinDate = {} as any;
    if (startDate) filter.joinDate.$gte = new Date(startDate as string);
    if (endDate) filter.joinDate.$lte = new Date(endDate as string);
  }

  const employees = await Employee.find(filter)
    .populate('department', 'name code')
    .populate('manager', 'firstName lastName');

  const reportData = employees.map((emp: any) => ({
    employeeId: emp.employeeId,
    name: `${emp.firstName} ${emp.lastName}`,
    email: emp.email,
    department: emp.department ? emp.department.name : 'N/A',
    position: emp.position,
    status: emp.status,
    attendance: emp.attendance,
    joinDate: emp.joinDate,
  }));

  if (format === 'pdf') {
    const headers = ['Employee ID', 'Name', 'Email', 'Department', 'Position', 'Status'];
    const rows = reportData.map(r => [r.employeeId, r.name, r.email, r.department, r.position, r.status]);
    const pdfBuffer = await generatePDFReport('Employee Report', headers, rows);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=employee-report.pdf');
    res.send(pdfBuffer);
    return;
  }

  if (format === 'excel') {
    const headers = ['Employee ID', 'Name', 'Email', 'Department', 'Position', 'Status'];
    const rows = reportData.map(r => [r.employeeId, r.name, r.email, r.department, r.position, r.status]);
    const excelBuffer = await generateExcelReport('Employee Report', headers, rows);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=employee-report.xlsx');
    res.send(excelBuffer);
    return;
  }

  sendResponse(res, HTTP_STATUS.OK, reportData);
};

// Production report
export const getProductionReport = async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate, status, plant, format = 'json' } = req.query;

  const filter: Record<string, any> = {};
  if (status) filter.status = status;
  if (plant) filter.plant = plant;

  if (startDate || endDate) {
    filter.createdAt = {} as any;
    if (startDate) filter.createdAt.$gte = new Date(startDate as string);
    if (endDate) filter.createdAt.$lte = new Date(endDate as string);
  }

  const orders: any[] = await ProductionOrder.find(filter)
    .populate('plant', 'name code')
    .populate('department', 'name code');

  const reportData = orders.map(order => ({
    orderId: order.orderId,
    productName: order.product?.name || 'N/A',
    quantity: order.quantity,
    unit: order.unit,
    status: order.status,
    priority: order.priority,
    progress: order.progress,
    dueDate: order.dueDate,
    plant: order.plant ? (order.plant as any).name : 'N/A',
    department: order.department ? (order.department as any).name : 'N/A',
    createdAt: order.createdAt,
  }));

  if (format === 'pdf') {
    const headers = ['Order ID', 'Product', 'Quantity', 'Status', 'Progress', 'Plant', 'Due Date'];
    const rows = reportData.map(r => [r.orderId, r.productName, `${r.quantity} ${r.unit}`, r.status, `${r.progress}%`, r.plant, r.dueDate?.toLocaleDateString() || 'N/A']);
    const pdfBuffer = await generatePDFReport('Production Report', headers, rows);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=production-report.pdf');
    res.send(pdfBuffer);
    return;
  }

  if (format === 'excel') {
    const headers = ['Order ID', 'Product', 'Quantity', 'Status', 'Progress', 'Plant', 'Due Date'];
    const rows = reportData.map(r => [r.orderId, r.productName, `${r.quantity} ${r.unit}`, r.status, `${r.progress}%`, r.plant, r.dueDate?.toLocaleDateString() || 'N/A']);
    const excelBuffer = await generateExcelReport('Production Report', headers, rows);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=production-report.xlsx');
    res.send(excelBuffer);
    return;
  }

  sendResponse(res, HTTP_STATUS.OK, reportData);
};

// Inventory report
export const getInventoryReport = async (req: Request, res: Response): Promise<void> => {
  const { category, status, format = 'json' } = req.query;

  const filter: Record<string, any> = {};
  if (category) filter.category = category;
  if (status) filter.status = status;

  const items: any[] = await Inventory.find(filter)
    .populate('warehouse', 'name code')
    .populate('supplier', 'name');

  const reportData = items.map(item => ({
    sku: item.sku,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    unitPrice: item.unitPrice,
    totalValue: item.quantity * item.unitPrice,
    status: item.status,
    minStock: item.minStock,
    warehouse: item.warehouse ? item.warehouse.name : 'N/A',
    lastUpdated: item.updatedAt,
  }));

  if (format === 'pdf') {
    const headers = ['SKU', 'Name', 'Category', 'Quantity', 'Unit Price', 'Total Value', 'Status'];
    const rows = reportData.map(r => [r.sku, r.name, r.category, `${r.quantity} ${r.unit}`, `$${r.unitPrice.toFixed(2)}`, `$${r.totalValue.toFixed(2)}`, r.status]);
    const pdfBuffer = await generatePDFReport('Inventory Report', headers, rows);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory-report.pdf');
    res.send(pdfBuffer);
    return;
  }

  if (format === 'excel') {
    const headers = ['SKU', 'Name', 'Category', 'Quantity', 'Unit Price', 'Total Value', 'Status'];
    const rows = reportData.map(r => [r.sku, r.name, r.category, r.quantity, r.unitPrice, r.totalValue, r.status]);
    const excelBuffer = await generateExcelReport('Inventory Report', headers, rows);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory-report.xlsx');
    res.send(excelBuffer);
    return;
  }

  sendResponse(res, HTTP_STATUS.OK, reportData);
};

// Quality report
export const getQualityReport = async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate, format = 'json' } = req.query;

  const filter: Record<string, any> = {};
  if (startDate || endDate) {
    filter.createdAt = {} as any;
    if (startDate) filter.createdAt.$gte = new Date(startDate as string);
    if (endDate) filter.createdAt.$lte = new Date(endDate as string);
  }

  const inspections: any[] = await QualityInspection.find(filter)
    .populate('productionOrder', 'orderId product.name')
    .populate('inspector', 'firstName lastName');

  const reportData = inspections.map(insp => ({
    inspectionId: insp.inspectionId,
    productName: insp.productName,
    type: insp.type,
    result: insp.result,
    score: insp.score,
    status: insp.status,
    inspector: insp.inspector ? `${insp.inspector.firstName} ${insp.inspector.lastName}` : 'N/A',
    completedDate: insp.completedAt,
    defectCount: insp.defects?.length || 0,
  }));

  if (format === 'pdf') {
    const headers = ['Inspection ID', 'Product', 'Type', 'Result', 'Score', 'Defects', 'Status'];
    const rows = reportData.map(r => [r.inspectionId, r.productName, r.type, r.result || 'N/A', r.score || 'N/A', r.defectCount, r.status]);
    const pdfBuffer = await generatePDFReport('Quality Report', headers, rows);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=quality-report.pdf');
    res.send(pdfBuffer);
    return;
  }

  if (format === 'excel') {
    const headers = ['Inspection ID', 'Product', 'Type', 'Result', 'Score', 'Defects', 'Status'];
    const rows = reportData.map(r => [r.inspectionId, r.productName, r.type, r.result || 'N/A', r.score || 'N/A', r.defectCount, r.status]);
    const excelBuffer = await generateExcelReport('Quality Report', headers, rows);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=quality-report.xlsx');
    res.send(excelBuffer);
    return;
  }

  sendResponse(res, HTTP_STATUS.OK, reportData);
};

// Activity report
export const getActivityReport = async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate, userId, category, format = 'json' } = req.query;

  const filter: Record<string, any> = {};
  if (userId) filter.user = userId;
  if (category) filter.category = category;

  if (startDate || endDate) {
    filter.timestamp = {} as any;
    if (startDate) filter.timestamp.$gte = new Date(startDate as string);
    if (endDate) filter.timestamp.$lte = new Date(endDate as string);
  }

  const logs: any[] = await ActivityLog.find(filter)
    .populate('user', 'firstName lastName email avatar')
    .sort({ timestamp: -1 })
    .limit(1000);

  const reportData = logs.map(log => ({
    user: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System',
    action: log.action,
    category: log.category,
    resource: log.resource,
    description: log.description,
    timestamp: log.timestamp,
    ipAddress: log.ipAddress,
  }));

  if (format === 'pdf') {
    const headers = ['User', 'Action', 'Category', 'Description', 'Timestamp'];
    const rows = reportData.map(r => [r.user, r.action, r.category, r.description, r.timestamp.toLocaleString()]);
    const pdfBuffer = await generatePDFReport('Activity Report', headers, rows);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=activity-report.pdf');
    res.send(pdfBuffer);
    return;
  }

  if (format === 'excel') {
    const headers = ['User', 'Action', 'Category', 'Description', 'Timestamp'];
    const rows = reportData.map(r => [r.user, r.action, r.category, r.description, r.timestamp.toLocaleString()]);
    const excelBuffer = await generateExcelReport('Activity Report', headers, rows);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=activity-report.xlsx');
    res.send(excelBuffer);
    return;
  }

  sendResponse(res, HTTP_STATUS.OK, reportData);
};

// Summary report
export const getSummaryReport = async (req: Request, res: Response): Promise<void> => {
  const { format = 'json' } = req.query;

  const [
    totalEmployees,
    totalOrders,
    completedOrders,
    totalInventoryValue,
    lowStockCount,
    qualityPassRate,
    pendingTasks,
  ] = await Promise.all([
    Employee.countDocuments({ status: 'active' }),
    ProductionOrder.countDocuments(),
    ProductionOrder.countDocuments({ status: 'completed' }),
    Inventory.aggregate([{ $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$unitPrice'] } } } }]),
    Inventory.countDocuments({ status: { $in: ['low_stock', 'out_of_stock'] } }),
    QualityInspection.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          passed: { $sum: { $cond: [{ $eq: ['$result', 'pass'] }, 1, 0] } },
        },
      },
    ]),
    ProductionOrder.countDocuments({ status: { $in: ['pending', 'planning', 'scheduled'] } }),
  ]);

  const departments = await Department.find().populate('manager', 'firstName lastName').select('name code employeeCount performance');
  const plants = await Department.aggregate([{ $group: { _id: '$plant', employeeCount: { $sum: '$employeeCount' } } }]);

  const summary: any = {
    employees: {
      total: totalEmployees,
      byDepartment: departments.map((d: any) => ({
        name: d.name,
        code: d.code,
        count: d.employeeCount,
        performance: d.performance,
      })),
    },
    production: {
      totalOrders,
      completedOrders,
      completionRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0,
      pendingTasks,
    },
    inventory: {
      totalValue: totalInventoryValue[0]?.total || 0,
      lowStockCount,
    },
    quality: {
      passRate: qualityPassRate[0] ? ((qualityPassRate[0].passed / qualityPassRate[0].total) * 100).toFixed(1) : 0,
    },
    plants: plants.length,
    generatedAt: new Date(),
  };

  if (format === 'pdf') {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Employees', totalEmployees.toString()],
      ['Total Production Orders', totalOrders.toString()],
      ['Completed Orders', completedOrders.toString()],
      ['Total Inventory Value', `$${(totalInventoryValue[0]?.total || 0).toLocaleString()}`],
      ['Low Stock Items', lowStockCount.toString()],
      ['Number of Plants', plants.length.toString()],
    ];
    const pdfBuffer = await generatePDFReport('Summary Report', headers, rows);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=summary-report.pdf');
    res.send(pdfBuffer);
    return;
  }

  if (format === 'excel') {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Employees', totalEmployees],
      ['Total Production Orders', totalOrders],
      ['Completed Orders', completedOrders],
      ['Total Inventory Value', totalInventoryValue[0]?.total || 0],
      ['Low Stock Items', lowStockCount],
      ['Number of Plants', plants.length],
    ];
    const excelBuffer = await generateExcelReport('Summary Report', headers, rows);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=summary-report.xlsx');
    res.send(excelBuffer);
    return;
  }

  sendResponse(res, HTTP_STATUS.OK, summary);
};

export default {
  getEmployeeReport,
  getProductionReport,
  getInventoryReport,
  getQualityReport,
  getActivityReport,
  getSummaryReport,
};
