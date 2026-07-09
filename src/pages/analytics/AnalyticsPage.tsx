import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  ArrowRight,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart as RechartsPie, Pie, Cell, LineChart as RechartsLine, Line,
  ComposedChart, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import StatsCard from '@/components/ui/StatsCard';

const productionData = [
  { month: 'Jan', production: 4200, orders: 145, efficiency: 89 },
  { month: 'Feb', production: 4800, orders: 167, efficiency: 92 },
  { month: 'Mar', production: 4600, orders: 158, efficiency: 88 },
  { month: 'Apr', production: 5200, orders: 189, efficiency: 94 },
  { month: 'May', production: 5800, orders: 201, efficiency: 96 },
  { month: 'Jun', production: 5400, orders: 178, efficiency: 91 },
  { month: 'Jul', production: 6100, orders: 215, efficiency: 95 },
];

const departmentPerformance = [
  { name: 'Production', efficiency: 94, quality: 92, safety: 96 },
  { name: 'Quality', efficiency: 96, quality: 98, safety: 94 },
  { name: 'Maintenance', efficiency: 91, quality: 89, safety: 94 },
  { name: 'Logistics', efficiency: 89, quality: 93, safety: 95 },
  { name: 'Engineering', efficiency: 95, quality: 96, safety: 97 },
];

const qualityMetrics = [
  { name: 'Defect Rate', value: 2.1, change: -0.5, trend: 'down' },
  { name: 'First Pass Yield', value: 94.5, change: 1.2, trend: 'up' },
  { name: 'Customer Returns', value: 1.8, change: -0.3, trend: 'down' },
  { name: 'Inspection Pass Rate', value: 97.2, change: 0.8, trend: 'up' },
];

const radarData = [
  { subject: 'Productivity', A: 92, fullMark: 100 },
  { subject: 'Quality', A: 88, fullMark: 100 },
  { subject: 'Safety', A: 95, fullMark: 100 },
  { subject: 'Efficiency', A: 90, fullMark: 100 },
  { subject: 'Innovation', A: 78, fullMark: 100 },
  { subject: 'Cost', A: 85, fullMark: 100 },
];

const COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4'];

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
          <p className="text-text-muted">Comprehensive performance insights and metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={[
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
              { value: '90d', label: 'Last 90 Days' },
              { value: '1y', label: 'Last Year' },
            ]}
            value={timeRange}
            onChange={setTimeRange}
          />
          <Button variant="outline" icon={<Download className="w-4 h-4" />}>
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Production" value="36,100" icon={<BarChart3 className="w-5 h-5" />} change={12.5} color="primary" />
        <StatsCard title="Overall Efficiency" value="92.4%" icon={<TrendingUp className="w-5 h-5" />} change={3.2} color="success" />
        <StatsCard title="Avg. Order Value" value="$12,450" icon={<LineChart className="w-5 h-5" />} change={-2.1} color="warning" />
        <StatsCard title="Quality Score" value="96.8%" icon={<TrendingUp className="w-5 h-5" />} change={1.8} color="secondary" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Trend */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Production Trend</h3>
              <p className="text-sm text-text-muted">Monthly production and orders</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={productionData}>
                  <defs>
                    <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#64748B" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748B" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="production" stroke="#2563EB" fillOpacity={1} fill="url(#colorProd)" name="Production" />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#22C55E" strokeWidth={2} dot={{ fill: '#22C55E' }} name="Orders" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Efficiency Gauge */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary">Department Performance</h3>
            <p className="text-sm text-text-muted">Efficiency by department</p>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" stroke="#64748B" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={12} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Bar dataKey="efficiency" fill="#2563EB" name="Efficiency" />
                  <Bar dataKey="quality" fill="#22C55E" name="Quality" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary">Performance Radar</h3>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <Radar name="Performance" dataKey="A" stroke="#2563EB" fill="#2563EB" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quality Metrics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary">Quality Metrics</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {qualityMetrics.map((metric) => (
                <div key={metric.name} className="p-4 rounded-xl bg-background-secondary/50 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-muted">{metric.name}</span>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-error" />
                    )}
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-text-primary">{metric.value}%</span>
                    <span className={`text-sm ${metric.trend === 'up' ? 'text-success' : 'text-error'}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default AnalyticsPage;
