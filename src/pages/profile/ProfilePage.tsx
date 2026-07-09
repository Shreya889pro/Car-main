import React from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Edit2,
  Award,
  TrendingUp,
  Clock,
  Briefcase,
  FileText,
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import ProgressBar from '@/components/ui/ProgressBar';
import { useAppSelector } from '@/redux/hooks';

const ProfilePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  const performanceData = [
    { subject: 'Productivity', value: 92, fullMark: 100 },
    { subject: 'Quality', value: 88, fullMark: 100 },
    { subject: 'Teamwork', value: 85, fullMark: 100 },
    { subject: 'Leadership', value: 78, fullMark: 100 },
    { subject: 'Communication', value: 90, fullMark: 100 },
  ];

  const activityData = [
    { month: 'Jan', tasks: 45 },
    { month: 'Feb', tasks: 52 },
    { month: 'Mar', tasks: 48 },
    { month: 'Apr', tasks: 61 },
    { month: 'May', tasks: 55 },
    { month: 'Jun', tasks: 68 },
  ];

  const recentTasks = [
    { id: 1, title: 'Completed quality audit', time: '2 hours ago', status: 'completed' },
    { id: 2, title: 'Reviewed production schedule', time: '5 hours ago', status: 'completed' },
    { id: 3, title: 'Approved leave requests', time: '1 day ago', status: 'completed' },
    { id: 4, title: 'Updated safety protocols', time: '2 days ago', status: 'completed' },
  ];

  const achievements = [
    { id: 1, title: 'Employee of the Month', date: 'Jun 2026', icon: '\uD83C\uDFC6' },
    { id: 2, title: 'Safety Excellence Award', date: 'May 2026', icon: '\uD83D\uDEE1\uFE0F' },
    { id: 3, title: 'Perfect Attendance', date: 'Apr 2026', icon: '\u2705' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div>
        <Card className="overflow-hidden">
          <div className="relative h-48 bg-gradient-to-r from-primary-600/30 via-secondary-600/20 to-accent/10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzODlCRjgiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-60" />
          </div>
          <div className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
              <Avatar
                src={user?.avatar}
                name={`${user?.firstName} ${user?.lastName}`}
                size="2xl"
                status="online"
                className="ring-4 ring-card"
              />
              <div className="flex-1 md:pb-2">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-text-primary">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  <Badge variant="primary">Administrator</Badge>
                </div>
                <p className="text-text-muted">{user?.role} | {user?.department}</p>
              </div>
              <Button icon={<Edit2 className="w-4 h-4" />}>Edit Profile</Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tasks Completed', value: '156', icon: <TrendingUp className="w-5 h-5" />, color: 'primary' },
          { label: 'Projects', value: '12', icon: <Briefcase className="w-5 h-5" />, color: 'success' },
          { label: 'Years at Company', value: '4.2', icon: <Clock className="w-5 h-5" />, color: 'warning' },
          { label: 'Achievements', value: '8', icon: <Award className="w-5 h-5" />, color: 'secondary' },
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
                  <p className="text-xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-xs text-text-muted">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Performance */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary">Performance</h3>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={performanceData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                    <Radar name="Performance" dataKey="value" stroke="#2563EB" fill="#2563EB" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Activity */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary">Activity Timeline</h3>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="tasks" stroke="#2563EB" fillOpacity={1} fill="url(#colorTasks)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary">Recent Tasks</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-background-secondary/50">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <span className="text-text-primary">{task.title}</span>
                    </div>
                    <span className="text-xs text-text-muted">{task.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary">Contact</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { icon: <Mail className="w-4 h-4" />, label: 'Email', value: user?.email },
                { icon: <Phone className="w-4 h-4" />, label: 'Phone', value: '+1-555-0101' },
                { icon: <MapPin className="w-4 h-4" />, label: 'Location', value: 'Chicago, USA' },
                { icon: <Building2 className="w-4 h-4" />, label: 'Department', value: user?.department },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background-secondary text-text-muted">{item.icon}</div>
                  <div>
                    <p className="text-xs text-text-muted">{item.label}</p>
                    <p className="text-sm text-text-primary">{item.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary">Achievements</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-xl bg-background-secondary/50">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{achievement.title}</p>
                    <p className="text-xs text-text-muted">{achievement.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary">Skills</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {['Leadership', 'Operations', 'Six Sigma', 'Lean Manufacturing', 'Team Management'].map((skill, index) => (
                <div key={skill}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-text-secondary">{skill}</span>
                    <span className="text-xs text-text-muted">{90 - index * 5}%</span>
                  </div>
                  <ProgressBar value={90 - index * 5} size="sm" color={index < 2 ? 'success' : 'primary'} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
