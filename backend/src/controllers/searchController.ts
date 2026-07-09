import { Request, Response } from 'express';
import { Employee, Department, ProductionOrder, Inventory, QualityInspection, Shipment } from '../models';
import { HTTP_STATUS } from '../constants';
import { sendResponse } from '../utils/response';

// Global search
export const globalSearch = async (req: Request, res: Response): Promise<void> => {
  const { q, types, limit = 5 } = req.query;

  if (!q || (q as string).length < 2) {
    sendResponse(res, HTTP_STATUS.OK, { results: [], total: 0 });
    return;
  }

  const searchRegex = { $regex: q, $options: 'i' };
  const limitNum = parseInt(limit as string);
  const searchTypes = types ? (types as string).split(',') : ['employees', 'orders', 'inventory', 'departments'];

  const results: Record<string, unknown[]> = {};
  let total = 0;

  // Search employees
  if (searchTypes.includes('employees')) {
    const employees: any[] = await Employee.find({
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex },
        { position: searchRegex },
      ],
    })
      .populate('department', 'name code')
      .select('firstName lastName email employeeId position status avatar department')
      .limit(limitNum);

    results.employees = employees.map(e => ({
      id: e._id,
      type: 'employee',
      title: `${e.firstName} ${e.lastName}`,
      subtitle: e.position,
      description: `${e.employeeId} - ${e.department ? (e.department as any).name : 'No Department'}`,
      avatar: e.avatar,
      status: e.status,
      url: `/employees/${e._id}`,
    }));
    total += employees.length;
  }

  // Search production orders
  if (searchTypes.includes('orders')) {
    const orders: any[] = await ProductionOrder.find({
      $or: [
        { orderId: searchRegex },
        { 'product.name': searchRegex },
        { 'product.sku': searchRegex },
      ],
    })
      .populate('plant', 'name code')
      .populate('department', 'name code')
      .select('orderId product.name status priority progress plant department dueDate')
      .limit(limitNum);

    results.orders = orders.map(o => ({
      id: o._id,
      type: 'order',
      title: o.product?.name || 'Unknown',
      subtitle: o.orderId,
      description: `${o.status} - ${o.plant ? (o.plant as any).name : 'No Plant'}`,
      status: o.status,
      priority: o.priority,
      progress: o.progress,
      url: `/production/${o._id}`,
    }));
    total += orders.length;
  }

  // Search inventory
  if (searchTypes.includes('inventory')) {
    const inventory: any[] = await Inventory.find({
      $or: [
        { sku: searchRegex },
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ],
    })
      .populate('warehouse', 'name code')
      .select('sku name category quantity unit status warehouse')
      .limit(limitNum);

    results.inventory = inventory.map(i => ({
      id: i._id,
      type: 'inventory',
      title: i.name,
      subtitle: i.sku,
      description: `${i.category} - ${i.quantity} ${i.unit} available`,
      status: i.status,
      url: `/inventory/${i._id}`,
    }));
    total += inventory.length;
  }

  // Search departments
  if (searchTypes.includes('departments')) {
    const departments: any[] = await Department.find({
      $or: [
        { name: searchRegex },
        { code: searchRegex },
        { description: searchRegex },
      ],
    })
      .populate('plant', 'name')
      .populate('manager', 'firstName lastName')
      .select('name code employeeCount status plant manager')
      .limit(limitNum);

    results.departments = departments.map(d => ({
      id: d._id,
      type: 'department',
      title: d.name,
      subtitle: d.code,
      description: `${d.employeeCount || 0} employees`,
      status: d.status,
      url: `/departments/${d._id}`,
    }));
    total += departments.length;
  }

  // Search quality inspections
  if (searchTypes.includes('quality')) {
    const inspections: any[] = await QualityInspection.find({
      $or: [
        { inspectionId: searchRegex },
        { productName: searchRegex },
        { batchNumber: searchRegex },
      ],
    })
      .populate('inspector', 'firstName lastName')
      .select('inspectionId productName type status result inspector createdAt')
      .limit(limitNum);

    results.quality = inspections.map(i => ({
      id: i._id,
      type: 'quality',
      title: i.productName,
      subtitle: i.inspectionId,
      description: `${i.type} - ${i.status}`,
      status: i.status,
      url: `/quality/${i._id}`,
    }));
    total += inspections.length;
  }

  // Search shipments
  if (searchTypes.includes('shipments')) {
    const shipments: any[] = await Shipment.find({
      $or: [
        { shipmentId: searchRegex },
        { 'customer.name': searchRegex },
      ],
    })
      .populate('driver', 'firstName lastName')
      .select('shipmentId type status scheduledDate customer driver')
      .limit(limitNum);

    results.shipments = shipments.map(s => ({
      id: s._id,
      type: 'shipment',
      title: s.shipmentId,
      subtitle: s.type,
      description: `${s.status} - ${s.customer?.name || 'N/A'}`,
      status: s.status,
      url: `/shipments/${s._id}`,
    }));
    total += shipments.length;
  }

  sendResponse(res, HTTP_STATUS.OK, { results, total });
};

// Quick search (for autocomplete)
export const quickSearch = async (req: Request, res: Response): Promise<void> => {
  const { q, limit = 10 } = req.query;

  if (!q || (q as string).length < 2) {
    sendResponse(res, HTTP_STATUS.OK, []);
    return;
  }

  const searchRegex = { $regex: q, $options: 'i' };
  const limitNum = parseInt(limit as string);
  const results: unknown[] = [];

  // Quick employee search
  const employees: any[] = await Employee.find({
    $or: [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { employeeId: searchRegex },
    ],
  })
    .select('firstName lastName employeeId avatar')
    .limit(3);

  employees.forEach(e => {
    results.push({
      type: 'employee',
      label: `${e.firstName} ${e.lastName}`,
      sublabel: e.employeeId,
      avatar: e.avatar,
      url: `/employees/${e._id}`,
    });
  });

  // Quick order search
  const orders: any[] = await ProductionOrder.find({
    $or: [
      { orderId: searchRegex },
      { 'product.name': searchRegex },
    ],
  })
    .select('orderId product.name status')
    .limit(3);

  orders.forEach(o => {
    results.push({
      type: 'order',
      label: o.product?.name || 'Unknown',
      sublabel: o.orderId,
      status: o.status,
      url: `/production/${o._id}`,
    });
  });

  // Quick inventory search
  const inventory: any[] = await Inventory.find({
    $or: [
      { sku: searchRegex },
      { name: searchRegex },
    ],
  })
    .select('sku name status')
    .limit(3);

  inventory.forEach(i => {
    results.push({
      type: 'inventory',
      label: i.name,
      sublabel: i.sku,
      status: i.status,
      url: `/inventory/${i._id}`,
    });
  });

  sendResponse(res, HTTP_STATUS.OK, results.slice(0, limitNum));
};

export default {
  globalSearch,
  quickSearch,
};
