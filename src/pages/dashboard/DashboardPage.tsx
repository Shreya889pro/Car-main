import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Factory,
  CheckCircle2,
  Clock,
  Users,
  UserX,
  AlertTriangle,
  Package,
  Calendar,
  TrendingUp,
  ArrowRight,
  MoreHorizontal,
  Activity,
  Target,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import StatsCard from '@/components/ui/StatsCard';
import Badge from '@/components/ui/Badge';
import Avatar, { AvatarGroup } from '@/components/ui/Avatar';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import { useAppSelector } from '@/redux/hooks';

const monthlyData = [
  { month: 'Jan', production: 4200, target: 4000 },
  { month: 'Feb', production: 4800, target: 4500 },
  { month: 'Mar', production: 4600, target: 4500 },
  { month: 'Apr', production: 5200, target: 5000 },
  { month: 'May', production: 5800, target: 5500 },
  { month: 'Jun', production: 5400, target: 5500 },
  { month: 'Jul', production: 6100, target: 6000 },
];

const departmentData = [
  { name: 'Production', value: 35, color: '#2563EB' },
  { name: 'Quality', value: 12, color: '#22C55E' },
  { name: 'Maintenance', value: 10, color: '#F59E0B' },
  { name: 'Logistics', value: 12, color: '#06B6D4' },
  { name: 'HR', value: 8, color: '#8B5CF6' },
  { name: 'Others', value: 23, color: '#64748B' },
];

const weeklyTrend = [
  { day: 'Mon', completed: 45, inProgress: 32 },
  { day: 'Tue', completed: 52, inProgress: 28 },
  { day: 'Wed', completed: 48, inProgress: 35 },
  { day: 'Thu', completed: 61, inProgress: 30 },
  { day: 'Fri', completed: 55, inProgress: 25 },
  { day: 'Sat', completed: 30, inProgress: 15 },
  { day: 'Sun', completed: 20, inProgress: 10 },
];

const DashboardPage: React.FC = () => {
  const { employees } = useAppSelector((state) => state.employees);
  const { orders } = useAppSelector((state) => state.production);
  const { notifications } = useAppSelector((state) => state.notifications);

  const presentEmployees = employees.filter(e => e.attendance === 'present').length;
  const absentEmployees = employees.filter(e => e.attendance === 'absent').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'planning').length;
  const inProgressOrders = orders.filter(o => o.status === 'in_progress').length;

  const recentActivities = [
    { id: 1, user: 'Sarah Johnson', action: 'completed quality inspection', time: '5 min ago', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop' },
    { id: 2, user: 'Michael Williams', action: 'started production order PO-00145', time: '12 min ago', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop' },
    { id: 3, user: 'Amanda Garcia', action: 'received shipment from MetalWorks Inc', time: '25 min ago', avatar: 'https://images.unsplash.com/photo-1580489944769-6ec9e998f523?w=150&h=150&fit=crop' },
    { id: 4, user: 'David Lee', action: 'completed maintenance on CNC Machine #7', time: '1 hour ago', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994aab3?w=150&h=150&fit=crop' },
    { id: 5, user: 'Emily Brown', action: 'approved leave request for Joshua Thomas', time: '2 hours ago', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop' },
  ];

  const upcomingDeadlines = [
    { id: 1, title: 'Production Order PO-00123', dueDate: 'Today, 6:00 PM', priority: 'critical' },
    { id: 2, title: 'Quality Audit Report', dueDate: 'Tomorrow, 9:00 AM', priority: 'high' },
    { id: 3, title: 'Safety Training Session', dueDate: 'Jul 10, 2:00 PM', priority: 'medium' },
    { id: 4, title: 'Inventory Reconciliation', dueDate: 'Jul 12, 5:00 PM', priority: 'low' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-muted">Welcome back, John. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={<Calendar className="w-4 h-4" />}>
            Today
          </Button>
          <Button icon={<Activity className="w-4 h-4" />}>
            Live Status
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Production"
          value="5,247"
          icon={<Factory className="w-5 h-5" />}
          change={12.5}
          color="primary"
        />
        <StatsCard
          title="Completed Orders"
          value={completedOrders}
          icon={<CheckCircle2 className="w-5 h-5" />}
          change={8.3}
          color="success"
        />
        <StatsCard
          title="Pending Orders"
          value={pendingOrders}
          icon={<Clock className="w-5 h-5" />}
          change={-2.1}
          color="warning"
        />
        <StatsCard
          title="Quality Issues"
          value="3"
          icon={<AlertTriangle className="w-5 h-5" />}
          change={-15}
          color="error"
        />
      </motion.div>

      {/* Second Row Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Employees Present"
          value={presentEmployees}
          icon={<Users className="w-5 h-5" />}
          change={5}
          color="success"
        />
        <StatsCard
          title="Employees Absent"
          value={absentEmployees}
          icon={<UserX className="w-5 h-5" />}
          change={-12}
          color="error"
        />
        <StatsCard
          title="Inventory Alerts"
          value="7"
          icon={<Package className="w-5 h-5" />}
          change={-25}
          color="warning"
        />
        <StatsCard
          title="Upcoming Deadlines"
          value="4"
          icon={<Target className="w-5 h-5" />}
          color="secondary"
        />
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Production Overview</h3>
                <p className="text-sm text-text-muted">Monthly production vs target</p>
              </div>
              <Button variant="ghost" size="sm" icon={<MoreHorizontal className="w-4 h-4" />} />
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="production"
                      stroke="#2563EB"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorProduction)"
                    />
                    <Area
                      type="monotone"
                      dataKey="target"
                      stroke="#22C55E"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fillOpacity={1}
                      fill="url(#colorTarget)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Department Distribution */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Department Distribution</h3>
                <p className="text-sm text-text-muted">Employee breakdown</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {departmentData.map((entry, index) => (
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
              <div className="grid grid-cols-2 gap-2 mt-4">
                {departmentData.slice(0, 4).map((dept) => (
                  <div key={dept.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                    <span className="text-xs text-text-muted">{dept.name}</span>
                    <span className="text-xs font-medium text-text-primary ml-auto">{dept.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Weekly Performance</h3>
                <p className="text-sm text-text-muted">Order completion trend</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                View Report
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                      }}
                    />
                    <Bar dataKey="completed" fill="#2563EB" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="inProgress" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Upcoming Deadlines</h3>
              <Link to="/calendar" className="text-sm text-primary-400 hover:text-primary-300">
                View all
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-background-secondary/50 hover:bg-background-secondary transition-colors"
                >
                  <div
                    className={`mt-1 w-2 h-2 rounded-full ${
                      deadline.priority === 'critical'
                        ? 'bg-error'
                        : deadline.priority === 'high'
                        ? 'bg-warning'
                        : deadline.priority === 'medium'
                        ? 'bg-primary-500'
                        : 'bg-text-muted'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{deadline.title}</p>
                    <p className="text-xs text-text-muted">{deadline.dueDate}</p>
                  </div>
                  <Badge
                    variant={
                      deadline.priority === 'critical'
                        ? 'error'
                        : deadline.priority === 'high'
                        ? 'warning'
                        : 'default'
                    }
                    size="xs"
                  >
                    {deadline.priority}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Fourth Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Recent Activity</h3>
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <Avatar src={activity.avatar} name={activity.user} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary">
                      <span className="font-medium">{activity.user}</span>{' '}
                      <span className="text-text-muted">{activity.action}</span>
                    </p>
                    <p className="text-xs text-text-muted">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders in Progress */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Orders in Progress</h3>
              <Link to="/workflow" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
                Workflow Board
                <ArrowRight className="w-4 h-4" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {orders
                .filter((o) => o.status === 'in_progress')
                .slice(0, 5)
                .map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-background-secondary/50 hover:bg-background-secondary transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-text-primary">{order.orderId}</span>
                        <Badge
                          variant={
                            order.priority === 'critical'
                              ? 'error'
                              : order.priority === 'high'
                              ? 'warning'
                              : 'default'
                          }
                          size="xs"
                        >
                          {order.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-muted truncate">{order.product}</p>
                    </div>
                    <div className="w-24">
                      <ProgressBar value={order.progress} color="primary" size="sm" />
                      <p className="text-xs text-text-muted text-right mt-1">{order.progress}%</p>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
