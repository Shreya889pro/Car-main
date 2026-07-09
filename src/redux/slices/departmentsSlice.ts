import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Department } from '@/types';

const initialDepartments: Department[] = [
  { id: '1', name: 'Operations', code: 'OPS', description: 'Overall operations management and coordination', manager: 'John Smith', managerId: '1', employeeCount: 15, budget: 2500000, location: 'Building A', plantId: '1', status: 'active', performance: { efficiency: 94, productivity: 92, quality: 91, safety: 96, target: 90, trend: 'up' }, teams: [{ id: 't1', name: 'Operations Team Alpha', leader: 'John Smith', leaderId: '1', members: ['2', '3', '4'] }] },
  { id: '2', name: 'Quality Control', code: 'QC', description: 'Quality assurance and control processes', manager: 'Sarah Johnson', managerId: '2', employeeCount: 12, budget: 850000, location: 'Building B', plantId: '1', status: 'active', performance: { efficiency: 96, productivity: 91, quality: 98, safety: 94, target: 95, trend: 'up' }, teams: [{ id: 't2', name: 'QA Team', leader: 'Sarah Johnson', leaderId: '2', members: ['6', '7'] }] },
  { id: '3', name: 'Production', code: 'PROD', description: 'Manufacturing and production processes', manager: 'Michael Williams', managerId: '3', employeeCount: 35, budget: 3200000, location: 'Production Hall', plantId: '1', status: 'active', performance: { efficiency: 88, productivity: 91, quality: 87, safety: 92, target: 88, trend: 'stable' }, teams: [{ id: 't3', name: 'Production Shift A', leader: 'Michael Williams', leaderId: '3', members: ['8', '9', '11'] }] },
  { id: '4', name: 'Human Resources', code: 'HR', description: 'Human resource management and employee relations', manager: 'Emily Brown', managerId: '4', employeeCount: 8, budget: 420000, location: 'Admin Building', plantId: '1', status: 'active', performance: { efficiency: 92, productivity: 88, quality: 94, safety: 98, target: 90, trend: 'up' }, teams: [{ id: 't4', name: 'HR Team', leader: 'Emily Brown', leaderId: '4', members: ['12', '13'] }] },
  { id: '5', name: 'Maintenance', code: 'MAINT', description: 'Equipment maintenance and facility management', manager: 'David Lee', managerId: '5', employeeCount: 10, budget: 1200000, location: 'Maintenance Bay', plantId: '1', status: 'active', performance: { efficiency: 91, productivity: 89, quality: 86, safety: 94, target: 90, trend: 'down' }, teams: [{ id: 't5', name: 'Maintenance Team', leader: 'David Lee', leaderId: '5', members: ['14', '15'] }] },
  { id: '6', name: 'Logistics', code: 'LOG', description: 'Supply chain and logistics operations', manager: 'Amanda Garcia', managerId: '10', employeeCount: 12, budget: 980000, location: 'Warehouse Zone', plantId: '1', status: 'active', performance: { efficiency: 89, productivity: 93, quality: 90, safety: 95, target: 88, trend: 'up' }, teams: [{ id: 't6', name: 'Logistics Team', leader: 'Amanda Garcia', leaderId: '10', members: [] }] },
  { id: '7', name: 'Engineering', code: 'ENG', description: 'Engineering and process improvement', manager: 'Robert Chen', managerId: '20', employeeCount: 8, budget: 1500000, location: 'Engineering Office', plantId: '1', status: 'active', performance: { efficiency: 95, productivity: 90, quality: 96, safety: 97, target: 92, trend: 'up' }, teams: [] },
  { id: '8', name: 'Finance', code: 'FIN', description: 'Financial management and accounting', manager: 'Linda Moore', managerId: '25', employeeCount: 6, budget: 380000, location: 'Admin Building', plantId: '1', status: 'active', performance: { efficiency: 97, productivity: 95, quality: 99, safety: 100, target: 95, trend: 'stable' }, teams: [] },
  { id: '9', name: 'Information Technology', code: 'IT', description: 'IT infrastructure and support', manager: 'Kevin Parker', managerId: '30', employeeCount: 7, budget: 720000, location: 'IT Center', plantId: '1', status: 'active', performance: { efficiency: 93, productivity: 91, quality: 95, safety: 98, target: 90, trend: 'up' }, teams: [] },
  { id: '10', name: 'Sales', code: 'SALES', description: 'Sales and business development', manager: 'Nancy Taylor', managerId: '35', employeeCount: 10, budget: 650000, location: 'Sales Office', plantId: '1', status: 'active', performance: { efficiency: 88, productivity: 92, quality: 87, safety: 99, target: 85, trend: 'up' }, teams: [] },
  { id: '11', name: 'Customer Service', code: 'CS', description: 'Customer support and relations', manager: 'Paul Allen', managerId: '40', employeeCount: 8, budget: 450000, location: 'Support Center', plantId: '1', status: 'active', performance: { efficiency: 90, productivity: 88, quality: 93, safety: 100, target: 88, trend: 'stable' }, teams: [] },
  { id: '12', name: 'Research & Development', code: 'R&D', description: 'Product development and innovation', manager: 'Dr. James Wilson', managerId: '45', employeeCount: 5, budget: 1800000, location: 'R&D Lab', plantId: '1', status: 'active', performance: { efficiency: 85, productivity: 78, quality: 97, safety: 96, target: 80, trend: 'up' }, teams: [] },
  { id: '13', name: 'Safety & Compliance', code: 'SAFE', description: 'Workplace safety and regulatory compliance', manager: 'Mark Thompson', managerId: '50', employeeCount: 4, budget: 280000, location: 'Safety Office', plantId: '1', status: 'active', performance: { efficiency: 98, productivity: 96, quality: 99, safety: 100, target: 98, trend: 'stable' }, teams: [] },
  { id: '14', name: 'Procurement', code: 'PROC', description: 'Purchasing and vendor management', manager: 'Karen White', managerId: '55', employeeCount: 6, budget: 520000, location: 'Procurement Office', plantId: '1', status: 'active', performance: { efficiency: 91, productivity: 94, quality: 88, safety: 98, target: 90, trend: 'up' }, teams: [] },
  { id: '15', name: 'Warehouse', code: 'WH', description: 'Warehouse operations and inventory', manager: 'Steve Martin', managerId: '60', employeeCount: 10, budget: 380000, location: 'Warehouse Zone', plantId: '1', status: 'active', performance: { efficiency: 87, productivity: 90, quality: 85, safety: 93, target: 85, trend: 'stable' }, teams: [] },
];

interface DepartmentsState {
  departments: Department[];
  selectedDepartment: Department | null;
  loading: boolean;
  error: string | null;
}

const initialState: DepartmentsState = {
  departments: initialDepartments,
  selectedDepartment: null,
  loading: false,
  error: null,
};

const departmentsSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    setDepartments: (state, action: PayloadAction<Department[]>) => {
      state.departments = action.payload;
    },
    selectDepartment: (state, action: PayloadAction<string>) => {
      state.selectedDepartment = state.departments.find(d => d.id === action.payload) || null;
    },
    clearSelectedDepartment: (state) => {
      state.selectedDepartment = null;
    },
    updateDepartment: (state, action: PayloadAction<Department>) => {
      const index = state.departments.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.departments[index] = action.payload;
      }
    },
  },
});

export const { setDepartments, selectDepartment, clearSelectedDepartment, updateDepartment } = departmentsSlice.actions;
export default departmentsSlice.reducer;
