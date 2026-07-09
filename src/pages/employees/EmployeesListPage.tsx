import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Download,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  Grid,
  List,
  ChevronRight,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { selectEmployee, setFilters } from '@/redux/slices/employeesSlice';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Avatar, { AvatarGroup } from '@/components/ui/Avatar';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Tabs from '@/components/ui/Tabs';
import Select from '@/components/ui/Select';
import { Employee } from '@/types';

const EmployeesListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { employees, filters } = useAppSelector((state) => state.employees);
  const { departments } = useAppSelector((state) => state.departments);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const itemsPerPage = 12;

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        !search ||
        emp.firstName.toLowerCase().includes(search.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || emp.status === statusFilter;
      const matchesDept = !departmentFilter || emp.department === departmentFilter;
      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [employees, search, statusFilter, departmentFilter]);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, currentPage]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'error' | 'warning'> = {
      active: 'success',
      inactive: 'error',
      on_leave: 'warning',
    };
    return colors[status] || 'default';
  };

  const getAttendanceColor = (attendance: string) => {
    const colors: Record<string, 'success' | 'error' | 'warning' | 'primary'> = {
      present: 'success',
      absent: 'error',
      late: 'warning',
      working_from_home: 'primary',
    };
    return colors[attendance] || 'default';
  };

  const handleViewEmployee = (employee: Employee) => {
    dispatch(selectEmployee(employee.id));
    navigate(`/employees/${employee.id}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const columns = [
    {
      key: 'name',
      title: 'Employee',
      render: (emp: Employee) => (
        <div className="flex items-center gap-3">
          <Avatar src={emp.avatar} name={`${emp.firstName} ${emp.lastName}`} size="sm" />
          <div>
            <p className="font-medium text-text-primary">{emp.firstName} {emp.lastName}</p>
            <p className="text-xs text-text-muted">{emp.employeeId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      title: 'Email',
      render: (emp: Employee) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-text-muted" />
          <span className="text-text-secondary">{emp.email}</span>
        </div>
      ),
    },
    {
      key: 'department',
      title: 'Department',
      render: (emp: Employee) => (
        <Badge variant="default">{emp.department}</Badge>
      ),
    },
    {
      key: 'position',
      title: 'Position',
      render: (emp: Employee) => (
        <span className="text-text-secondary">{emp.position}</span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (emp: Employee) => (
        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor(emp.status)} dot>
            {emp.status.replace('_', ' ')}
          </Badge>
        </div>
      ),
    },
    {
      key: 'attendance',
      title: 'Attendance',
      render: (emp: Employee) => (
        <Badge variant={getAttendanceColor(emp.attendance)} size="sm">
          {emp.attendance.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      title: '',
      render: (emp: Employee) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleViewEmployee(emp)}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Employees</h1>
          <p className="text-text-muted">Manage your workforce and track attendance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={<Download className="w-4 h-4" />}>
            Export
          </Button>
          <Button icon={<UserPlus className="w-4 h-4" />}>
            Add Employee
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Employees', value: employees.length, icon: <Users className="w-5 h-5" />, color: 'primary' },
          { label: 'Present Today', value: employees.filter(e => e.attendance === 'present').length, icon: <Users className="w-5 h-5" />, color: 'success' },
          { label: 'On Leave', value: employees.filter(e => e.status === 'on_leave').length, icon: <Calendar className="w-5 h-5" />, color: 'warning' },
          { label: 'Departments', value: departments.length, icon: <Building2 className="w-5 h-5" />, color: 'secondary' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4" hover>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color === 'primary' ? 'bg-primary-500/20 text-primary-400' : stat.color === 'success' ? 'bg-success/20 text-success' : stat.color === 'warning' ? 'bg-warning/20 text-warning' : 'bg-secondary-500/20 text-secondary-400'}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-xs text-text-muted">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search employees by name, email, or ID..."
              icon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'on_leave', label: 'On Leave' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-40"
            />
            <Select
              options={[
                { value: '', label: 'All Departments' },
                ...departments.map(d => ({ value: d.name, label: d.name })),
              ]}
              value={departmentFilter}
              onChange={setDepartmentFilter}
              className="w-48"
            />
            <div className="flex items-center gap-1 p-1 bg-background-secondary rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-card text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-card text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Employees Grid/List */}
      {viewMode === 'grid' ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence>
            {paginatedEmployees.map((employee) => (
              <motion.div
                key={employee.id}
                variants={cardVariants}
                layout
                onClick={() => handleViewEmployee(employee)}
                className="cursor-pointer"
              >
                <Card hover className="overflow-hidden">
                  <div className="relative h-20 bg-gradient-to-r from-primary-600/20 to-secondary-600/20">
                    <div className="absolute -bottom-6 left-4">
                      <Avatar
                        src={employee.avatar}
                        name={`${employee.firstName} ${employee.lastName}`}
                        size="xl"
                        status={employee.attendance === 'present' ? 'online' : employee.attendance === 'absent' ? 'offline' : 'away'}
                        className="ring-4 ring-card"
                      />
                    </div>
                  </div>
                  <CardContent className="pt-10 pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-text-primary">
                          {employee.firstName} {employee.lastName}
                        </h3>
                        <p className="text-xs text-text-muted">{employee.position}</p>
                      </div>
                      <Badge variant={getStatusColor(employee.status)} size="xs">
                        {employee.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Building2 className="w-3 h-3" />
                        {employee.department}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{employee.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Phone className="w-3 h-3" />
                        {employee.phone}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      fullWidth
                      className="mt-4"
                      icon={<ChevronRight className="w-4 h-4" />}
                      iconPosition="right"
                    >
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <Table
          columns={columns}
          data={paginatedEmployees}
          keyExtractor={(emp) => emp.id}
          onRowClick={handleViewEmployee}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </motion.div>
  );
};

export default EmployeesListPage;
