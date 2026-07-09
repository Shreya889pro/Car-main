import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InventoryItem, Warehouse, Supplier, Customer } from '@/types';

const categories = ['Raw Materials', 'Components', 'Semi-Finished', 'Finished Goods', 'Packaging', 'Spare Parts', 'Tools', 'Chemicals'];
const inventoryStatuses: ('in_stock' | 'low_stock' | 'out_of_stock' | 'reserved')[] = ['in_stock', 'low_stock', 'out_of_stock', 'reserved'];

const generateInventory = (): InventoryItem[] => {
  const items: InventoryItem[] = [];
  const itemNames = [
    'Steel Sheet 4x8', 'Aluminum Bar 6061', 'Copper Wire 12AWG', 'Brass Rod 1/2"', 'Stainless Steel Tube',
    'Hydraulic Hose 3/4', 'Pneumatic Cylinder', 'Servo Motor 5HP', 'Bearing SKF 6205', 'V-Belt A68',
    'Oil Filter PT-45', 'Coolant Fluid 5Gal', 'Welding Wire ER70S', 'Grinding Wheel 8"', 'Cutting Tool Carbide',
    'PLC Module S7-1200', 'HMI Panel 10"', 'Sensor Proximity', 'Encoder Rotary', 'Solenoid Valve',
    'Gasket Material', 'O-Ring Kit', 'Fastener Assortment', 'Rivet Set', 'Spring Washer',
    'Insulation Blanket', 'Safety Wire', 'Electrical Cable', 'Conduit 1"', 'Junction Box',
  ];

  for (let i = 1; i <= 100; i++) {
    const status = inventoryStatuses[Math.floor(Math.random() * inventoryStatuses.length)];
    const quantity = status === 'out_of_stock' ? 0 : Math.floor(Math.random() * 1000) + 10;
    const minStock = Math.floor(Math.random() * 50) + 20;

    items.push({
      id: String(i),
      sku: `SKU-${String(i).padStart(6, '0')}`,
      name: itemNames[i % itemNames.length],
      description: 'High quality industrial component for manufacturing operations.',
      category: categories[Math.floor(Math.random() * categories.length)],
      categoryId: String(Math.floor(Math.random() * categories.length) + 1),
      quantity,
      unit: ['pcs', 'kg', 'm', 'liters', 'sets'][Math.floor(Math.random() * 5)],
      minStock,
      maxStock: minStock * 10,
      reorderPoint: minStock * 2,
      unitPrice: Math.floor(Math.random() * 5000) + 10,
      location: `Zone-${String.fromCharCode(65 + Math.floor(i / 30))}-${Math.floor(Math.random() * 10) + 1}`,
      warehouseId: String(Math.floor(Math.random() * 3) + 1),
      supplier: ['MetalWorks Inc', 'PartsSupply Co', 'IndustrialMart', 'QualityMaterials', 'GlobalSupply'][Math.floor(Math.random() * 5)],
      supplierId: String(Math.floor(Math.random() * 20) + 1),
      status,
      lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      movements: [],
    });
  }
  return items;
};

const initialWarehouses: Warehouse[] = [
  { id: '1', name: 'Main Distribution Center', code: 'MDC-01', location: 'Detroit', capacity: 50000, usedCapacity: 38500, manager: 'Amanda Garcia', managerId: '10', zones: [{ id: 'z1', name: 'Zone A - Raw Materials', type: 'raw_materials', capacity: 20000, usedCapacity: 15000 }, { id: 'z2', name: 'Zone B - Finished Goods', type: 'finished_goods', capacity: 25000, usedCapacity: 20000 }, { id: 'z3', name: ' quarantine Zone', type: 'quarantine', capacity: 5000, usedCapacity: 3500 }], status: 'operational' },
  { id: '2', name: 'Chicago Storage Facility', code: 'CSF-02', location: 'Chicago', capacity: 30000, usedCapacity: 22000, manager: 'Kevin Parker', managerId: '30', zones: [{ id: 'z4', name: 'Main Storage', type: 'raw_materials', capacity: 20000, usedCapacity: 15000 }, { id: 'z5', name: 'Returns Area', type: 'returns', capacity: 10000, usedCapacity: 7000 }], status: 'operational' },
  { id: '3', name: 'Midwest Transit Hub', code: 'MTH-03', location: 'Milwaukee', capacity: 20000, usedCapacity: 12000, manager: 'Steve Martin', managerId: '60', zones: [{ id: 'z6', name: 'Transit Zone', type: 'finished_goods', capacity: 20000, usedCapacity: 12000 }], status: 'operational' },
];

const generateSuppliers = (): Supplier[] => {
  const suppliers: Supplier[] = [];
  const supplierNames = ['MetalWorks Inc', 'PartsSupply Co', 'IndustrialMart', 'QualityMaterials', 'GlobalSupply', 'TechParts Ltd', 'Fasteners World', 'Steel Solutions', 'Pneumatic Systems', 'Hydraulic Masters', 'Electronic Components Inc', 'Safety First Co', 'Tool Masters', 'Chemical Solutions', 'Packaging Pro'];

  for (let i = 1; i <= 20; i++) {
    suppliers.push({
      id: String(i),
      name: supplierNames[i - 1] || `Supplier ${i}`,
      code: `SUP-${String(i).padStart(4, '0')}`,
      contactPerson: `Contact ${i}`,
      email: `contact@supplier${i}.com`,
      phone: `+1-800-${String(i).padStart(3, '0')}-1234`,
      address: `${i * 100} Industrial Park`,
      city: ['Detroit', 'Chicago', 'Cleveland', 'Milwaukee'][i % 4],
      country: 'USA',
      category: categories.slice(0, Math.floor(Math.random() * 3) + 1),
      rating: Math.floor(Math.random() * 2) + 4 + Math.random(),
      status: ['active', 'inactive'][Math.floor(Math.random() * 2)] as 'active' | 'inactive',
      orders: Math.floor(Math.random() * 100) + 10,
      totalValue: Math.floor(Math.random() * 1000000) + 50000,
    });
  }
  return suppliers;
};

const generateCustomers = (): Customer[] => {
  const customers: Customer[] = [];
  const customerNames = ['AutoCorp Industries', 'Heavy Machinery Inc', 'Precision Parts LLC', 'Industrial Solutions', 'Global Manufacturing', 'TechFactories Co', 'Assembly Systems Inc', 'Quality Builders Ltd', 'Construction Pro', 'Engineering Works'];

  for (let i = 1; i <= 15; i++) {
    customers.push({
      id: String(i),
      name: customerNames[i - 1] || `Customer ${i}`,
      code: `CUS-${String(i).padStart(4, '0')}`,
      contactPerson: `Contact ${i}`,
      email: `contact@customer${i}.com`,
      phone: `+1-800-${String(i + 100).slice(-3)}-5678`,
      address: `${i * 200} Business Center`,
      city: ['Detroit', 'Chicago', 'Cleveland', 'Milwaukee', 'Indianapolis'][i % 5],
      country: 'USA',
      category: ['regular', 'vip', 'new'][i % 3] as 'regular' | 'vip' | 'new',
      orders: Math.floor(Math.random() * 50) + 5,
      totalValue: Math.floor(Math.random() * 500000) + 25000,
      status: ['active', 'inactive'][Math.floor(Math.random() * 2)] as 'active' | 'inactive',
    });
  }
  return customers;
};

interface InventoryState {
  items: InventoryItem[];
  warehouses: Warehouse[];
  suppliers: Supplier[];
  customers: Customer[];
  selectedItem: InventoryItem | null;
  loading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  items: generateInventory(),
  warehouses: initialWarehouses,
  suppliers: generateSuppliers(),
  customers: generateCustomers(),
  selectedItem: null,
  loading: false,
  error: null,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<InventoryItem[]>) => {
      state.items = action.payload;
    },
    selectItem: (state, action: PayloadAction<string>) => {
      state.selectedItem = state.items.find(item => item.id === action.payload) || null;
    },
    clearSelectedItem: (state) => {
      state.selectedItem = null;
    },
    updateItem: (state, action: PayloadAction<InventoryItem>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
  },
});

export const { setItems, selectItem, clearSelectedItem, updateItem } = inventorySlice.actions;
export default inventorySlice.reducer;
