import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductionOrder, ProductionStatus, KanbanColumn } from '@/types';

const priorities: ('critical' | 'high' | 'medium' | 'low')[] = ['critical', 'high', 'medium', 'low'];
const statuses: ProductionStatus[] = ['pending', 'planning', 'assigned', 'in_progress', 'quality_check', 'packaging', 'dispatch', 'completed'];
const products = ['Industrial Gear Assembly', 'Hydraulic Pump Unit', 'Electric Motor Drive', 'Conveyor Belt System', 'Steel Frame Structure', 'Pneumatic Cylinder Kit', 'Control Panel Assembly', 'Heat Exchanger Unit', 'Pressure Vessel', 'Pump Housing', 'Valve Assembly', 'Bearing Housing', 'Shaft Assembly', 'Gearbox Unit', 'Compressor Part'];
const units = ['pcs', 'units', 'sets', 'kg', 'liters'];

const generateProductionOrders = (): ProductionOrder[] => {
  const orders: ProductionOrder[] = [];
  for (let i = 1; i <= 250; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(Math.random() * 500) + 10;

    orders.push({
      id: String(i),
      orderId: `PO-${String(i).padStart(5, '0')}`,
      product,
      productId: `PROD-${Math.floor(Math.random() * 100) + 1}`,
      quantity,
      unit: units[Math.floor(Math.random() * units.length)],
      priority,
      status,
      progress: status === 'completed' ? 100 : Math.floor(Math.random() * 90) + 5,
      dueDate: `2026-${String(Math.floor(Math.random() * 3) + 7).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      startDate: `2026-${String(Math.floor(Math.random() * 3) + 4).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      estimatedEndDate: `2026-${String(Math.floor(Math.random() * 3) + 7).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      assignedTeam: [String(Math.floor(Math.random() * 100) + 1), String(Math.floor(Math.random() * 100) + 1)],
      assignedDepartment: ['Production', 'Assembly', 'Machining', 'Fabrication'][Math.floor(Math.random() * 4)],
      plantId: String(Math.floor(Math.random() * 5) + 1),
      notes: 'Production order with standard specifications.',
      comments: [],
      attachments: [],
      history: [{ id: 'h1', action: 'Order created', userId: '1', userName: 'John Smith', timestamp: new Date().toISOString() }],
      qualityChecks: [],
      materials: [],
    });
  }
  return orders;
};

const initialOrders = generateProductionOrders();

interface ProductionState {
  orders: ProductionOrder[];
  selectedOrder: ProductionOrder | null;
  kanbanColumns: KanbanColumn[];
  loading: boolean;
  error: string | null;
  filters: {
    status: ProductionStatus | '';
    priority: string;
    search: string;
  };
}

const kanbanColumns: KanbanColumn[] = [
  { id: 'pending', title: 'Pending', color: '#64748B', status: 'pending', cards: [] },
  { id: 'planning', title: 'Planning', color: '#8B5CF6', status: 'planning', cards: [] },
  { id: 'assigned', title: 'Assigned', color: '#06B6D4', status: 'assigned', cards: [] },
  { id: 'in_progress', title: 'In Progress', color: '#2563EB', status: 'in_progress', cards: [] },
  { id: 'quality_check', title: 'Quality Check', color: '#F59E0B', status: 'quality_check', cards: [] },
  { id: 'packaging', title: 'Packaging', color: '#14B8A6', status: 'packaging', cards: [] },
  { id: 'dispatch', title: 'Dispatch', color: '#8B5CF6', status: 'dispatch', cards: [] },
  { id: 'completed', title: 'Completed', color: '#22C55E', status: 'completed', cards: [] },
];

const populateKanban = (orders: ProductionOrder[]): KanbanColumn[] => {
  return kanbanColumns.map(column => ({
    ...column,
    cards: orders
      .filter(order => order.status === column.status)
      .slice(0, 20)
      .map(order => ({
        id: order.id,
        orderId: order.orderId,
        title: order.product,
        description: `Quantity: ${order.quantity} ${order.unit}`,
        priority: order.priority,
        assignees: order.assignedTeam,
        dueDate: order.dueDate,
        progress: order.progress,
        tags: [order.assignedDepartment],
        comments: order.comments.length,
        attachments: order.attachments.length,
      })),
  }));
};

const initialState: ProductionState = {
  orders: initialOrders,
  selectedOrder: null,
  kanbanColumns: populateKanban(initialOrders),
  loading: false,
  error: null,
  filters: {
    status: '',
    priority: '',
    search: '',
  },
};

const productionSlice = createSlice({
  name: 'production',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<ProductionOrder[]>) => {
      state.orders = action.payload;
      state.kanbanColumns = populateKanban(action.payload);
    },
    selectOrder: (state, action: PayloadAction<string>) => {
      state.selectedOrder = state.orders.find(o => o.id === action.payload) || null;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
    updateOrder: (state, action: PayloadAction<ProductionOrder>) => {
      const index = state.orders.findIndex(o => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
        state.kanbanColumns = populateKanban(state.orders);
      }
    },
    updateOrderStatus: (state, action: PayloadAction<{ id: string; status: ProductionStatus }>) => {
      const order = state.orders.find(o => o.id === action.payload.id);
      if (order) {
        order.status = action.payload.status;
        state.kanbanColumns = populateKanban(state.orders);
      }
    },
    setFilters: (state, action: PayloadAction<Partial<ProductionState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { status: '', priority: '', search: '' };
    },
  },
});

export const { setOrders, selectOrder, clearSelectedOrder, updateOrder, updateOrderStatus, setFilters, clearFilters } = productionSlice.actions;
export default productionSlice.reducer;
