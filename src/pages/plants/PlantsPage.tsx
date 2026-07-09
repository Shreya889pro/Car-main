import React from 'react';
import { motion } from 'framer-motion';
import { Factory, MapPin, Users, BarChart3, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import StatsCard from '@/components/ui/StatsCard';

const PlantsPage: React.FC = () => {
  const { plants } = useAppSelector((state) => state.plants);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Plants</h1>
          <p className="text-text-muted">Manage manufacturing facilities</p>
        </div>
        <Button icon={<Factory className="w-4 h-4" />}>Add Plant</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Plants" value={plants.length} icon={<Factory className="w-5 h-5" />} color="primary" />
        <StatsCard title="Total Capacity" value="140K" icon={<BarChart3 className="w-5 h-5" />} color="secondary" />
        <StatsCard title="Current Load" value="102.5K" icon={<Users className="w-5 h-5" />} color="success" />
        <StatsCard title="Avg Utilization" value="73%" icon={<CheckCircle2 className="w-5 h-5" />} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {plants.map((plant, index) => (
          <motion.div key={plant.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card hover className="overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-primary-600/20 to-secondary-600/20 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                    <Factory className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary">{plant.name}</h3>
                    <p className="text-xs text-text-muted">{plant.code}</p>
                  </div>
                </div>
                <Badge variant={plant.status === 'operational' ? 'success' : plant.status === 'maintenance' ? 'warning' : 'error'}>
                  {plant.status}
                </Badge>
              </div>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <MapPin className="w-4 h-4" /> {plant.location}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-muted">Capacity Utilization</span>
                    <span className="text-sm font-medium text-text-primary">{Math.round((plant.currentLoad / plant.capacity) * 100)}%</span>
                  </div>
                  <ProgressBar value={Math.round((plant.currentLoad / plant.capacity) * 100)} color="primary" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded-lg bg-background-secondary/50">
                    <p className="text-sm font-bold text-text-primary">{plant.shifts.length}</p>
                    <p className="text-xs text-text-muted">Shifts</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-background-secondary/50">
                    <p className="text-sm font-bold text-text-primary">{plant.departments.length}</p>
                    <p className="text-xs text-text-muted">Depts</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-background-secondary/50">
                    <p className="text-sm font-bold text-text-primary">{plant.area.toLocaleString()}</p>
                    <p className="text-xs text-text-muted">Sq ft</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/5">
                  <p className="text-xs text-text-muted mb-2">Shift Schedule</p>
                  <div className="space-y-2">
                    {plant.shifts.map((shift) => (
                      <div key={shift.id} className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">{shift.name}</span>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-text-muted" />
                          <span className="text-text-muted">{shift.startTime} - {shift.endTime}</span>
                          <Badge variant="default" size="xs">{shift.workers}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PlantsPage;
