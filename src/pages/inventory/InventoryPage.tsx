import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Plus,
  Search,
  Download,
  AlertTriangle,
  Box,
  BarChart3,
  TrendingDown,
  TrendingUp,
  Warehouse,
  Filter,
  MoreHorizontal,
  Eye,
  Edit2,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useAppSelector } from '@/redux/hooks';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import ProgressBar from '@/components/ui/ProgressBar';
import StatsCard from '@/components/ui/StatsCard';
import Select from '@/components/ui/Select';
import { InventoryItem } from '@/types';

const InventoryPage: React.FC = () => {
  const { items, warehouses, suppliers } = useAppSelector((state) => state.inventory);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !search ||
        item.sku.toLowerCase().includes(search.toLowerCase()) ||
        item.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || item.status === statusFilter;
      const matchesCategory = !categoryFilter || item.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [items, search, statusFilter, categoryFilter]);

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusData = [
    { name: 'In Stock', value: items.filter(i => i.status === 'in_stock').length, color: '#22C55E' },
    { name: 'Low Stock', value: items.filter(i => i.status === 'low_stock').length, color: '#F59E0B' },
    { name: 'Out of Stock', value: items.filter(i => i.status === 'out_of_stock').length, color: '#EF4444' },
    { name: 'Reserved', value: items.filter(i => i.status === 'reserved').length, color: '#2563EB' },
  ];

  const categoryData = [
    { name: 'Raw Materials', count: items.filter(i => i.category === 'Raw Materials').length },
    { name: 'Components', count: items.filter(i => i.category === 'Components').length },
    { name: 'Finished Goods', count: items.filter(i => i.category === 'Finished Goods').length },
    { name: 'Spare Parts', count: items.filter(i => i.category === 'Spare Parts').length },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'error' | 'primary'> = {
      in_stock: 'success',
      low_stock: 'warning',
      out_of_stock: 'error',
      reserved: 'primary',
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      key: 'item',
      title: 'Item',
      render: (item: InventoryItem) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-500/20">
            <Package className="w-4 h-4 text-primary-400" />
          </div>
          <div>
            <p className="font-medium text-text-primary">{item.name}</p>
            <p className="text-xs text-text-muted">{item.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      title: 'Category',
      render: (item: InventoryItem) => (
        <Badge variant="default">{item.category}</Badge>
      ),
    },
    {
      key: 'quantity',
      title: 'Quantity',
      render: (item: InventoryItem) => (
        <div className="text-text-secondary">
          <span className="font-medium">{item.quantity}</span> {item.unit}
        </div>
      ),
    },
    {
      key: 'stock',
      title: 'Stock Level',
      render: (item: InventoryItem) => {
        const percentage = Math.round((item.quantity / item.maxStock) * 100);
        return (
          <div className="w-24">
            <ProgressBar
              value={percentage}
              size="sm"
              color={item.quantity <= item.minStock ? 'error' : item.quantity <= item.reorderPoint ? 'warning' : 'success'}
            />
          </div>
        );
      },
    },
    {
      key: 'location',
      title: 'Location',
      render: (item: InventoryItem) => (
        <span className="text-text-muted">{item.location}</span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (item: InventoryItem) => (
        <Badge variant={getStatusColor(item.status)} dot>
          {item.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      title: '',
      render: (item: InventoryItem) => (
        <div className="flex items-center justify-end gap-1">
          <button className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const categories = [...new Set(items.map(i => i.category))];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Inventory</h1>
          <p className="text-text-muted">Manage stock levels and warehouse items</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={<Download className="w-4 h-4" />}>
            Export
          </Button>
          <Button icon={<Plus className="w-4 h-4" />}>
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Items"
          value={items.length}
          icon={<Package className="w-5 h-5" />}
          color="primary"
        />
        <StatsCard
          title="Low Stock"
          value={items.filter(i => i.status === 'low_stock').length}
          icon={<TrendingDown className="w-5 h-5" />}
          color="warning"
        />
        <StatsCard
          title="Out of Stock"
          value={items.filter(i => i.status === 'out_of_stock').length}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="error"
        />
        <StatsCard
          title="Warehouses"
          value={warehouses.length}
          icon={<Warehouse className="w-5 h-5" />}
          color="secondary"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary">Stock Status Distribution</h3>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-text-secondary">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary">Items by Category</h3>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by SKU or name..."
              icon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Select
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'in_stock', label: 'In Stock' },
                { value: 'low_stock', label: 'Low Stock' },
                { value: 'out_of_stock', label: 'Out of Stock' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-36"
            />
            <Select
              options={[
                { value: '', label: 'All Categories' },
                ...categories.map(c => ({ value: c, label: c })),
              ]}
              value={categoryFilter}
              onChange={setCategoryFilter}
              className="w-44"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Table
        columns={columns}
        data={paginatedItems}
        keyExtractor={(item) => item.id}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredItems.length / itemsPerPage)}
        onPageChange={setCurrentPage}
      />
    </motion.div>
  );
};

export default InventoryPage;
