import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, User, TrendingUp, Search, Plus, MoreHorizontal } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppSelector } from '@/redux/hooks';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Input from '@/components/ui/Input';
import ProgressBar from '@/components/ui/ProgressBar';
import StatsCard from '@/components/ui/StatsCard';
import Table from '@/components/ui/Table';

const DepartmentsPage: React.FC = () => {
  const { departments } = useAppSelector((state) => state.departments);
  const [search, setSearch] = useState('');

  const filteredDepts = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const deptPerformanceData = departments.slice(0, 6).map(d => ({
    name: d.code,
    efficiency: d.performance.efficiency,
    quality: d.performance.quality,
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Departments</h1>
          <p className="text-text-muted">Manage organizational structure</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />}>Add Department</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Departments" value={departments.length} icon={<Building2 className="w-5 h-5" />} color="primary" />
        <StatsCard title="Total Employees" value={departments.reduce((acc, d) => acc + d.employeeCount, 0)} icon={<Users className="w-5 h-5" />} color="secondary" />
        <StatsCard title="Avg Efficiency" value="91%" icon={<TrendingUp className="w-5 h-5" />} color="success" />
        <StatsCard title="Total Budget" value={`$${(departments.reduce((acc, d) => acc + d.budget, 0) / 1000000).toFixed(1)}M`} icon={<Building2 className="w-5 h-5" />} color="warning" />
      </div>

      <Card className="p-4">
        <Input placeholder="Search departments..." icon={<Search className="w-4 h-4" />} value={search} onChange={e => setSearch(e.target.value)} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDepts.map((dept, index) => (
              <motion.div key={dept.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card hover className="p-4 cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">{dept.name}</h3>
                        <p className="text-xs text-text-muted">{dept.code} | {dept.location}</p>
                      </div>
                    </div>
                    <Badge variant={dept.performance.trend === 'up' ? 'success' : dept.performance.trend === 'down' ? 'error' : 'default'}>
                      {dept.performance.trend}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-text-muted" />
                      <span className="text-sm text-text-secondary">{dept.employeeCount} employees</span>
                    </div>
                    <div className="text-sm text-text-muted">Manager: {dept.manager}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">Efficiency</span>
                      <span className="text-text-primary font-medium">{dept.performance.efficiency}%</span>
                    </div>
                    <ProgressBar value={dept.performance.efficiency} size="sm" color={dept.performance.efficiency >= 90 ? 'success' : 'primary'} />
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {[
                      { label: 'Eff', value: dept.performance.efficiency },
                      { label: 'Prod', value: dept.performance.productivity },
                      { label: 'Qual', value: dept.performance.quality },
                      { label: 'Safe', value: dept.performance.safety },
                    ].map(item => (
                      <div key={item.label} className="text-center p-1.5 rounded bg-background-secondary/50">
                        <p className="text-xs font-medium text-text-primary">{item.value}%</p>
                        <p className="text-[10px] text-text-muted">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary">Performance Comparison</h3>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                    <YAxis stroke="#64748B" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Bar dataKey="efficiency" fill="#2563EB" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="quality" fill="#22C55E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default DepartmentsPage;
