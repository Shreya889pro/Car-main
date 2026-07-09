import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Employee } from '@/types';

const initialEmployees: Employee[] = [
  { id: '1', employeeId: 'EMP001', firstName: 'John', lastName: 'Smith', email: 'john.smith@factoryflow.com', phone: '+1-555-0101', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop', department: 'Operations', departmentId: '1', role: 'Administrator', roleId: '1', position: 'Operations Director', salary: 145000, status: 'active', attendance: 'present', joinDate: '2018-03-15', birthDate: '1982-07-22', address: '1234 Industrial Ave', city: 'Chicago', country: 'USA', skills: ['Leadership', 'Operations Management', 'Lean Manufacturing', 'Six Sigma'], certifications: [{ id: 'c1', name: 'Six Sigma Black Belt', issuer: 'ASQ', date: '2019-06-10' }], achievements: [{ id: 'a1', title: 'Employee of the Year', description: 'Outstanding performance in operations management', date: '2023-01-15', type: 'award' }], manager: 'Robert Wilson', managerId: '10', teamMembers: ['2', '3', '4', '5'], performance: { overall: 95, productivity: 98, quality: 94, teamwork: 92, communication: 95, leadership: 96 }, documents: [], leaves: [] },
  { id: '2', employeeId: 'EMP002', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@factoryflow.com', phone: '+1-555-0102', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', department: 'Quality Control', departmentId: '2', role: 'Quality Manager', roleId: '2', position: 'Quality Assurance Manager', salary: 98000, status: 'active', attendance: 'present', joinDate: '2019-08-20', birthDate: '1988-02-14', address: '567 Quality Blvd', city: 'Chicago', country: 'USA', skills: ['Quality Control', 'ISO Standards', 'Auditing', 'Process Improvement'], certifications: [{ id: 'c2', name: 'ISO 9001 Lead Auditor', issuer: 'ISO', date: '2020-03-15' }], achievements: [{ id: 'a2', title: 'Zero Defect Month', description: 'Led team to achieve zero defects for 30 consecutive days', date: '2023-06-01', type: 'milestone' }], manager: 'John Smith', managerId: '1', teamMembers: ['6', '7'], performance: { overall: 92, productivity: 90, quality: 98, teamwork: 91, communication: 90, leadership: 88 }, documents: [], leaves: [] },
  { id: '3', employeeId: 'EMP003', firstName: 'Michael', lastName: 'Williams', email: 'michael.williams@factoryflow.com', phone: '+1-555-0103', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', department: 'Production', departmentId: '3', role: 'Production Supervisor', roleId: '3', position: 'Senior Production Supervisor', salary: 78000, status: 'active', attendance: 'present', joinDate: '2020-01-10', birthDate: '1990-08-30', address: '890 Production Rd', city: 'Detroit', country: 'USA', skills: ['Production Planning', 'Team Leadership', 'CNC Operations', 'Safety Compliance'], certifications: [{ id: 'c3', name: 'OSHA Safety Certification', issuer: 'OSHA', date: '2021-07-20' }], achievements: [{ id: 'a3', title: 'Safety Excellence Award', description: 'Achieved 365 days without safety incidents', date: '2023-03-15', type: 'award' }], manager: 'John Smith', managerId: '1', teamMembers: ['8', '9', '11'], performance: { overall: 88, productivity: 92, quality: 86, teamwork: 89, communication: 87, leadership: 85 }, documents: [], leaves: [] },
  { id: '4', employeeId: 'EMP004', firstName: 'Emily', lastName: 'Brown', email: 'emily.brown@factoryflow.com', phone: '+1-555-0104', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop', department: 'Human Resources', departmentId: '4', role: 'HR Manager', roleId: '4', position: 'Human Resources Manager', salary: 88000, status: 'active', attendance: 'present', joinDate: '2019-02-28', birthDate: '1985-12-05', address: '234 HR Lane', city: 'Chicago', country: 'USA', skills: ['Recruitment', 'Employee Relations', 'Performance Management', 'Training & Development'], certifications: [{ id: 'c4', name: 'SHRM-CP', issuer: 'SHRM', date: '2019-11-15' }], achievements: [{ id: 'a4', title: 'Best Workplace Award', description: 'Led initiative that earned company recognition', date: '2022-09-20', type: 'award' }], manager: 'John Smith', managerId: '1', teamMembers: ['12', '13'], performance: { overall: 91, productivity: 88, quality: 93, teamwork: 94, communication: 92, leadership: 89 }, documents: [], leaves: [] },
  { id: '5', employeeId: 'EMP005', firstName: 'David', lastName: 'Lee', email: 'david.lee@factoryflow.com', phone: '+1-555-0105', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994aab3?w=150&h=150&fit=crop', department: 'Maintenance', departmentId: '5', role: 'Maintenance Supervisor', roleId: '5', position: 'Chief Maintenance Engineer', salary: 82000, status: 'active', attendance: 'late', joinDate: '2018-06-12', birthDate: '1980-04-18', address: '456 Maintenance Way', city: 'Detroit', country: 'USA', skills: ['Machine Repair', 'Preventive Maintenance', 'PLC Programming', 'Electrical Systems'], certifications: [{ id: 'c5', name: 'Certified Maintenance Manager', issuer: 'AAMI', date: '2020-02-28' }], achievements: [], manager: 'John Smith', managerId: '1', teamMembers: ['14', '15', '16'], performance: { overall: 87, productivity: 90, quality: 85, teamwork: 86, communication: 84, leadership: 83 }, documents: [], leaves: [] },
  { id: '6', employeeId: 'EMP006', firstName: 'Jessica', lastName: 'Miller', email: 'jessica.miller@factoryflow.com', phone: '+1-555-0106', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop', department: 'Quality Control', departmentId: '2', role: 'Quality Inspector', roleId: '6', position: 'Senior Quality Inspector', salary: 65000, status: 'active', attendance: 'present', joinDate: '2021-03-01', birthDate: '1992-09-25', address: '678 Inspector Ave', city: 'Chicago', country: 'USA', skills: ['Measurement Tools', 'Statistical Analysis', 'Documentation', 'Root Cause Analysis'], certifications: [], achievements: [], manager: 'Sarah Johnson', managerId: '2', teamMembers: [], performance: { overall: 85, productivity: 88, quality: 92, teamwork: 84, communication: 80, leadership: 78 }, documents: [], leaves: [] },
  { id: '7', employeeId: 'EMP007', firstName: 'Robert', lastName: 'Davis', email: 'robert.davis@factoryflow.com', phone: '+1-555-0107', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop', department: 'Quality Control', departmentId: '2', role: 'Quality Analyst', roleId: '7', position: 'Quality Data Analyst', salary: 72000, status: 'active', attendance: 'working_from_home', joinDate: '2020-11-15', birthDate: '1987-01-08', address: '901 Data St', city: 'Detroit', country: 'USA', skills: ['Data Analysis', 'SPC', 'Minitab', 'Report Generation'], certifications: [], achievements: [], manager: 'Sarah Johnson', managerId: '2', teamMembers: [], performance: { overall: 86, productivity: 90, quality: 88, teamwork: 82, communication: 85, leadership: 79 }, documents: [], leaves: [] },
  { id: '8', employeeId: 'EMP008', firstName: 'Jennifer', lastName: 'Wilson', email: 'jennifer.wilson@factoryflow.com', phone: '+1-555-0108', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop', department: 'Production', departmentId: '3', role: 'CNC Operator', roleId: '8', position: 'Senior CNC Operator', salary: 58000, status: 'active', attendance: 'present', joinDate: '2019-05-20', birthDate: '1991-06-12', address: '234 CNC Blvd', city: 'Detroit', country: 'USA', skills: ['CNC Programming', 'Lathe Operation', 'Mill Operation', 'Blueprint Reading'], certifications: [], achievements: [], manager: 'Michael Williams', managerId: '3', teamMembers: [], performance: { overall: 82, productivity: 88, quality: 80, teamwork: 84, communication: 76, leadership: 72 }, documents: [], leaves: [] },
  { id: '9', employeeId: 'EMP009', firstName: 'William', lastName: 'Martinez', email: 'william.martinez@factoryflow.com', phone: '+1-555-0109', avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c47205?w=150&h=150&fit=crop', department: 'Production', departmentId: '3', role: 'Assembly Technician', roleId: '9', position: 'Lead Assembly Technician', salary: 52000, status: 'active', attendance: 'present', joinDate: '2020-09-10', birthDate: '1989-11-28', address: '567 Assembly Rd', city: 'Detroit', country: 'USA', skills: ['Assembly', 'Soldering', 'Component Testing', 'ESD Handling'], certifications: [], achievements: [], manager: 'Michael Williams', managerId: '3', teamMembers: [], performance: { overall: 80, productivity: 85, quality: 82, teamwork: 81, communication: 73, leadership: 70 }, documents: [], leaves: [] },
  { id: '10', employeeId: 'EMP010', firstName: 'Amanda', lastName: 'Garcia', email: 'amanda.garcia@factoryflow.com', phone: '+1-555-0110', avatar: 'https://images.unsplash.com/photo-1580489944769-6ec9e998f523?w=150&h=150&fit=crop', department: 'Logistics', departmentId: '6', role: 'Logistics Manager', roleId: '10', position: 'Supply Chain Manager', salary: 92000, status: 'active', attendance: 'present', joinDate: '2018-09-05', birthDate: '1983-05-17', address: '890 Logistics Ave', city: 'Chicago', country: 'USA', skills: ['Supply Chain Management', 'Inventory Control', 'Vendor Management', 'Logistics Planning'], certifications: [{ id: 'c6', name: 'CSCP', issuer: 'APICS', date: '2019-04-20' }], achievements: [], manager: 'John Smith', managerId: '1', teamMembers: ['17', '18', '19', '20'], performance: { overall: 90, productivity: 92, quality: 88, teamwork: 90, communication: 91, leadership: 87 }, documents: [], leaves: [] },
  { id: '11', employeeId: 'EMP011', firstName: 'Christopher', lastName: 'Rodriguez', email: 'christopher.rodriguez@factoryflow.com', phone: '+1-555-0111', avatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&h=150&fit=crop', department: 'Production', departmentId: '3', role: 'Welding Specialist', roleId: '11', position: 'Senior Welder', salary: 62000, status: 'active', attendance: 'present', joinDate: '2017-12-01', birthDate: '1984-08-05', address: '123 Weld Way', city: 'Detroit', country: 'USA', skills: ['MIG Welding', 'TIG Welding', 'Blueprint Reading', 'Metal Fabrication'], certifications: [{ id: 'c7', name: 'Certified Welder', issuer: 'AWS', date: '2018-05-15' }], achievements: [], manager: 'Michael Williams', managerId: '3', teamMembers: [], performance: { overall: 88, productivity: 90, quality: 92, teamwork: 85, communication: 80, leadership: 76 }, documents: [], leaves: [] },
  { id: '12', employeeId: 'EMP012', firstName: 'Ashley', lastName: 'Anderson', email: 'ashley.anderson@factoryflow.com', phone: '+1-555-0112', avatar: 'https://images.unsplash.com/photo-1534528741773-5394a4f3c0b3?w=150&h=150&fit=crop', department: 'Human Resources', departmentId: '4', role: 'HR Specialist', roleId: '12', position: 'HR Generalist', salary: 55000, status: 'active', attendance: 'present', joinDate: '2021-06-15', birthDate: '1993-03-22', address: '456 HR Circle', city: 'Chicago', country: 'USA', skills: ['Onboarding', 'Benefits Administration', 'HRIS', 'Employee Engagement'], certifications: [], achievements: [], manager: 'Emily Brown', managerId: '4', teamMembers: [], performance: { overall: 83, productivity: 85, quality: 84, teamwork: 86, communication: 82, leadership: 75 }, documents: [], leaves: [] },
  { id: '13', employeeId: 'EMP013', firstName: 'Joshua', lastName: 'Thomas', email: 'joshua.thomas@factoryflow.com', phone: '+1-555-0113', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db77bfbbd?w=150&h=150&fit=crop', department: 'Human Resources', departmentId: '4', role: 'Recruiter', roleId: '13', position: 'Technical Recruiter', salary: 58000, status: 'active', attendance: 'absent', joinDate: '2020-04-20', birthDate: '1990-10-10', address: '789 Talent Ave', city: 'Chicago', country: 'USA', skills: ['Technical Recruiting', 'Sourcing', 'Interviewing', 'Applicant Tracking Systems'], certifications: [], achievements: [], manager: 'Emily Brown', managerId: '4', teamMembers: [], performance: { overall: 84, productivity: 88, quality: 82, teamwork: 85, communication: 86, leadership: 74 }, documents: [], leaves: [] },
  { id: '14', employeeId: 'EMP014', firstName: 'Daniel', lastName: 'Jackson', email: 'daniel.jackson@factoryflow.com', phone: '+1-555-0114', avatar: 'https://images.unsplash.com/photo-1463453083872-31d9c99b9a5f?w=150&h=150&fit=crop', department: 'Maintenance', departmentId: '5', role: 'Maintenance Technician', roleId: '14', position: 'Electrical Technician', salary: 56000, status: 'active', attendance: 'present', joinDate: '2019-07-08', birthDate: '1988-02-14', address: '234 Electric Lane', city: 'Detroit', country: 'USA', skills: ['Electrical Troubleshooting', 'Motor Controls', 'PLC', 'Instrumentation'], certifications: [], achievements: [], manager: 'David Lee', managerId: '5', teamMembers: [], performance: { overall: 85, productivity: 90, quality: 84, teamwork: 82, communication: 78, leadership: 72 }, documents: [], leaves: [] },
  { id: '15', employeeId: 'EMP015', firstName: 'Matthew', lastName: 'White', email: 'matthew.white@factoryflow.com', phone: '+1-555-0115', avatar: 'https://images.unsplash.com/photo-1504956058800-6e4b90f9d9a8?w=150&h=150&fit=crop', department: 'Maintenance', departmentId: '5', role: 'Maintenance Technician', roleId: '15', position: 'Mechanical Technician', salary: 54000, status: 'active', attendance: 'present', joinDate: '2020-02-17', birthDate: '1991-07-30', address: '567 Mechanical Way', city: 'Detroit', country: 'USA', skills: ['Mechanical Repair', 'Hydraulics', 'Pneumatics', 'Conveyor Systems'], certifications: [], achievements: [], manager: 'David Lee', managerId: '5', teamMembers: [], performance: { overall: 83, productivity: 87, quality: 82, teamwork: 84, communication: 76, leadership: 70 }, documents: [], leaves: [] },
];

// Generate more employees to reach 100
const generateMoreEmployees = (): Employee[] => {
  const additionalEmployees: Employee[] = [];
  const departments = ['Operations', 'Quality Control', 'Production', 'Human Resources', 'Maintenance', 'Logistics', 'Engineering', 'Finance', 'IT', 'Sales', 'Customer Service', 'R&D', 'Safety', 'Procurement', 'Warehouse'];
  const roles: Record<string, { title: string; salary: number }[]> = {
    'Operations': [{ title: 'Operations Manager', salary: 95000 }, { title: 'Operations Coordinator', salary: 55000 }, { title: 'Process Analyst', salary: 70000 }],
    'Quality Control': [{ title: 'Quality Inspector', salary: 50000 }, { title: 'Quality Engineer', salary: 75000 }, { title: 'Quality Technician', salary: 45000 }],
    'Production': [{ title: 'Production Operator', salary: 45000 }, { title: 'Machine Operator', salary: 48000 }, { title: 'Assembly Worker', salary: 42000 }],
    'Human Resources': [{ title: 'HR Coordinator', salary: 48000 }, { title: 'HR Assistant', salary: 42000 }],
    'Maintenance': [{ title: 'Maintenance Tech', salary: 52000 }, { title: 'Facility Tech', salary: 48000 }],
    'Logistics': [{ title: 'Logistics Coordinator', salary: 55000 }, { title: 'Shipping Clerk', salary: 42000 }, { title: 'Warehouse Worker', salary: 40000 }],
    'Engineering': [{ title: 'Mechanical Engineer', salary: 85000 }, { title: 'Process Engineer', salary: 80000 }, { title: 'Design Engineer', salary: 78000 }],
    'Finance': [{ title: 'Accountant', salary: 65000 }, { title: 'Accounts Payable', salary: 48000 }],
    'IT': [{ title: 'IT Support', salary: 55000 }, { title: 'Network Admin', salary: 70000 }],
    'Sales': [{ title: 'Sales Rep', salary: 60000 }, { title: 'Account Manager', salary: 75000 }],
    'Customer Service': [{ title: 'CSR', salary: 40000 }, { title: 'CS Manager', salary: 55000 }],
    'R&D': [{ title: 'Research Analyst', salary: 65000 }, { title: 'Lab Technician', salary: 48000 }],
    'Safety': [{ title: 'Safety Officer', salary: 60000 }, { title: 'Safety Coordinator', salary: 52000 }],
    'Procurement': [{ title: 'Buyer', salary: 55000 }, { title: 'Purchasing Agent', salary: 50000 }],
    'Warehouse': [{ title: 'Warehouse Clerk', salary: 38000 }, { title: 'Inventory Clerk', salary: 42000 }],
  };
  const statuses: ('active' | 'inactive' | 'on_leave')[] = ['active', 'active', 'active', 'active', 'active', 'inactive', 'on_leave'];
  const attendances: ('present' | 'absent' | 'late' | 'working_from_home')[] = ['present', 'present', 'present', 'absent', 'late', 'working_from_home'];

  for (let i = initialEmployees.length + 1; i <= 100; i++) {
    const dept = departments[Math.floor(Math.random() * departments.length)];
    const roleInfo = roles[dept]?.[Math.floor(Math.random() * roles[dept]?.length)] || { title: 'Staff', salary: 45000 };
    const attendance = attendances[Math.floor(Math.random() * attendances.length)];

    additionalEmployees.push({
      id: String(i),
      employeeId: `EMP${String(i).padStart(3, '0')}`,
      firstName: `Employee${i}`,
      lastName: `Last${i}`,
      email: `employee${i}@factoryflow.com`,
      phone: `+1-555-${String(100 + i).slice(-4)}`,
      department: dept,
      departmentId: String(departments.indexOf(dept) + 1),
      role: roleInfo.title,
      roleId: String(i),
      position: roleInfo.title,
      salary: roleInfo.salary,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      attendance,
      joinDate: `${2018 + Math.floor(Math.random() * 6)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      birthDate: `${1975 + Math.floor(Math.random() * 30)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      address: `${Math.floor(Math.random() * 9999) + 100} Main St`,
      city: ['Chicago', 'Detroit', 'Milwaukee', 'Cleveland'][Math.floor(Math.random() * 4)],
      country: 'USA',
      skills: ['General Manufacturing', 'Teamwork', 'Safety Awareness'],
      certifications: [],
      achievements: [],
      manager: 'Department Manager',
      managerId: '1',
      teamMembers: [],
      performance: {
        overall: 70 + Math.floor(Math.random() * 25),
        productivity: 70 + Math.floor(Math.random() * 25),
        quality: 70 + Math.floor(Math.random() * 25),
        teamwork: 70 + Math.floor(Math.random() * 25),
        communication: 70 + Math.floor(Math.random() * 25),
        leadership: 60 + Math.floor(Math.random() * 30),
      },
      documents: [],
      leaves: [],
    });
  }
  return additionalEmployees;
};

const allEmployees = [...initialEmployees, ...generateMoreEmployees()];

interface EmployeesState {
  employees: Employee[];
  selectedEmployee: Employee | null;
  loading: boolean;
  error: string | null;
  filters: {
    department: string;
    status: string;
    search: string;
  };
}

const initialState: EmployeesState = {
  employees: allEmployees,
  selectedEmployee: null,
  loading: false,
  error: null,
  filters: {
    department: '',
    status: '',
    search: '',
  },
};

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setEmployees: (state, action: PayloadAction<Employee[]>) => {
      state.employees = action.payload;
    },
    selectEmployee: (state, action: PayloadAction<string>) => {
      state.selectedEmployee = state.employees.find(e => e.id === action.payload) || null;
    },
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null;
    },
    updateEmployee: (state, action: PayloadAction<Employee>) => {
      const index = state.employees.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        state.employees[index] = action.payload;
      }
    },
    setFilters: (state, action: PayloadAction<Partial<EmployeesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { department: '', status: '', search: '' };
    },
  },
});

export const { setEmployees, selectEmployee, clearSelectedEmployee, updateEmployee, setFilters, clearFilters } = employeesSlice.actions;
export default employeesSlice.reducer;
