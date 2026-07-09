import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  Users,
  Package,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Circle,
  Loader2,
} from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Select from '@/components/ui/Select';
import Tabs from '@/components/ui/Tabs';
import ProgressBar from '@/components/ui/ProgressBar';
import { ProductionOrder, ProductionStatus } from '@/types';

const ProductionOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders } = useAppSelector((state) => state.production);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        !search ||
        order.orderId.toLowerCase().includes(search.toLowerCase()) ||
        order.product.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || order.status === statusFilter;
      const matchesPriority = !priorityFilter || order.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [orders, search, statusFilter, priorityFilter]);

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: ProductionStatus) => {
    const colors: Record<ProductionStatus, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
      pending: 'default',
      planning: 'primary',
      assigned: 'info',
      in_progress: 'warning',
      quality_check: 'secondary',
      packaging: 'primary',
      dispatch: 'secondary',
      completed: 'success',
      on_hold: 'error',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, 'error' | 'warning' | 'primary' | 'default'> = {
      critical: 'error',
      high: 'warning',
      medium: 'primary',
      low: 'default',
    };
    return colors[priority] || 'default';
  };

  const columns = [
    {
      key: 'orderId',
      title: 'Order ID',
      render: (order: ProductionOrder) => (
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${order.status === 'completed' ? 'bg-success/20 text-success' : order.status === 'in_progress' ? 'bg-warning/20 text-warning' : 'bg-background-secondary text-text-muted'}`}>
            <ClipboardList className="w-4 h-4" />
          </div>
          <span className="font-mono font-medium text-text-primary">{order.orderId}</span>
        </div>
      ),
    },
    {
      key: 'product',
      title: 'Product',
      render: (order: ProductionOrder) => (
        <div>
          <p className="text-text-primary">{order.product}</p>
          <p className="text-xs text-text-muted">Qty: {order.quantity} {order.unit}</p>
        </div>
      ),
    },
    {
      key: 'priority',
      title: 'Priority',
      render: (order: ProductionOrder) => (
        <Badge variant={getPriorityColor(order.priority)}>{order.priority}</Badge>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (order: ProductionOrder) => (
        <Badge variant={getStatusColor(order.status)}>{order.status.replace('_', ' ')}</Badge>
      ),
    },
    {
      key: 'progress',
      title: 'Progress',
      render: (order: ProductionOrder) => (
        <div className="w-32">
          <ProgressBar value={order.progress} size="sm" color={order.status === 'completed' ? 'success' : 'primary'} />
          <span className="text-xs text-text-muted mt-1 block">{order.progress}%</span>
        </div>
      ),
    },
    {
      key: 'dueDate',
      title: 'Due Date',
      render: (order: ProductionOrder) => (
        <div className="flex items-center gap-2 text-text-muted">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{order.dueDate}</span>
        </div>
      ),
    },
    {
      key: 'department',
      title: 'Department',
      render: (order: ProductionOrder) => (
        <Badge variant="default">{order.assignedDepartment}</Badge>
      ),
    },
    {
      key: 'actions',
      title: '',
      render: (order: ProductionOrder) => (
        <div className="flex items-center justify-end gap-1">
          <button className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10">
            <Edit2 className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-error/10">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const statusTabs = [
    { id: '', label: 'All', count: orders.length },
    { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
    { id: 'in_progress', label: 'In Progress', count: orders.filter(o => o.status === 'in_progress').length },
    { id: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'completed').length },
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
          <h1 className="text-2xl font-bold text-text-primary">Production Orders</h1>
          <p className="text-text-muted">Manage and track production orders</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={<Download className="w-4 h-4" />}>
            Export
          </Button>
          <Button icon={<Plus className="w-4 h-4" />}>
            Create Order
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: orders.length, icon: <ClipboardList className="w-5 h-5" />, color: 'primary' },
          { label: 'In Progress', value: orders.filter(o => o.status === 'in_progress').length, icon: <Loader2 className="w-5 h-5" />, color: 'warning' },
          { label: 'Completed', value: orders.filter(o => o.status === 'completed').length, icon: <CheckCircle2 className="w-5 h-5" />, color: 'success' },
          { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, icon: <Circle className="w-5 h-5" />, color: 'secondary' },
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
              placeholder="Search orders..."
              icon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Select
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-40"
            />
            <Select
              options={[
                { value: '', label: 'All Priorities' },
                { value: 'critical', label: 'Critical' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
              value={priorityFilter}
              onChange={setPriorityFilter}
              className="w-40"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Table
        columns={columns}
        data={paginatedOrders}
        keyExtractor={(order) => order.id}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredOrders.length / itemsPerPage)}
        onPageChange={setCurrentPage}
      />
    </motion.div>
  );
};

export default ProductionOrdersPage;
