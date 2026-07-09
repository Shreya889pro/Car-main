import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileBarChart,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  FileText,
  PieChart,
  TrendingUp,
  Users,
  Package,
  Factory,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Table from '@/components/ui/Table';
import Select from '@/components/ui/Select';
import Tabs from '@/components/ui/Tabs';

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');

  const reports = [
    { id: '1', name: 'Monthly Production Report', type: 'production', category: 'Production', createdAt: '2026-07-01', createdBy: 'John Smith', status: 'completed', format: 'pdf' },
    { id: '2', name: 'Q2 Employee Performance', type: 'employee', category: 'HR', createdAt: '2026-06-28', createdBy: 'Emily Brown', status: 'completed', format: 'excel' },
    { id: '3', name: 'Inventory Audit Report', type: 'inventory', category: 'Inventory', createdAt: '2026-06-25', createdBy: 'Amanda Garcia', status: 'completed', format: 'pdf' },
    { id: '4', name: 'Quality Metrics Analysis', type: 'quality', category: 'Quality', createdAt: '2026-06-22', createdBy: 'Sarah Johnson', status: 'generating', format: 'pdf' },
    { id: '5', name: 'Import/Export Summary', type: 'import', category: 'Logistics', createdAt: '2026-06-20', createdBy: 'Michael Williams', status: 'completed', format: 'csv' },
    { id: '6', name: 'Department Efficiency Report', type: 'performance', category: 'Analytics', createdAt: '2026-06-18', createdBy: 'John Smith', status: 'completed', format: 'pdf' },
  ];

  const reportTypes = [
    { id: 'all', label: 'All Reports', count: reports.length },
    { id: 'production', label: 'Production', count: reports.filter(r => r.type === 'production').length },
    { id: 'employee', label: 'Employee', count: reports.filter(r => r.type === 'employee').length },
    { id: 'inventory', label: 'Inventory', count: reports.filter(r => r.type === 'inventory').length },
    { id: 'quality', label: 'Quality', count: reports.filter(r => r.type === 'quality').length },
    { id: 'financial', label: 'Financial', count: reports.filter(r => r.type === 'financial').length },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'error'> = {
      completed: 'success',
      generating: 'warning',
      failed: 'error',
    };
    return colors[status] || 'default';
  };

  const getFormatIcon = (format: string) => {
    const icons: Record<string, string> = {
      pdf: '📄',
      excel: '📊',
      csv: '📈',
    };
    return icons[format] || '📄';
  };

  const filteredReports = activeTab === 'all' ? reports : reports.filter(r => r.type === activeTab);

  const columns = [
    {
      key: 'name',
      title: 'Report',
      render: (report: typeof reports[0]) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-500/20">
            <FileBarChart className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <p className="font-medium text-text-primary">{report.name}</p>
            <p className="text-xs text-text-muted">{report.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'created',
      title: 'Created',
      render: (report: typeof reports[0]) => (
        <div className="flex items-center gap-2 text-text-muted">
          <Calendar className="w-4 h-4" />
          <span>{report.createdAt}</span>
        </div>
      ),
    },
    {
      key: 'createdBy',
      title: 'Created By',
      render: (report: typeof reports[0]) => (
        <div className="flex items-center gap-2">
          <Avatar name={report.createdBy} size="xs" />
          <span className="text-text-secondary">{report.createdBy}</span>
        </div>
      ),
    },
    {
      key: 'format',
      title: 'Format',
      render: (report: typeof reports[0]) => (
        <Badge variant="default">{report.format.toUpperCase()}</Badge>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (report: typeof reports[0]) => (
        <Badge variant={getStatusColor(report.status)} dot>
          {report.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      title: '',
      render: (report: typeof reports[0]) => (
        <div className="flex items-center justify-end gap-2">
          {report.status === 'completed' && (
            <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4" />}>
              Download
            </Button>
          )}
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
          <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
          <p className="text-text-muted">Generate and manage reports</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />}>
          Generate Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', value: reports.length, icon: <FileBarChart className="w-5 h-5" />, color: 'primary' },
          { label: 'This Month', value: 12, icon: <Calendar className="w-5 h-5" />, color: 'secondary' },
          { label: 'Scheduled', value: 5, icon: <Clock className="w-5 h-5" />, color: 'warning' },
          { label: 'Downloads', value: 156, icon: <Download className="w-5 h-5" />, color: 'success' },
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

      {/* Tabs */}
      <Tabs tabs={reportTypes} activeTab={activeTab} onChange={setActiveTab} />

      {/* Reports Table */}
      <Table
        columns={columns}
        data={filteredReports}
        keyExtractor={(r) => r.id}
      />
    </motion.div>
  );
};

export default ReportsPage;
