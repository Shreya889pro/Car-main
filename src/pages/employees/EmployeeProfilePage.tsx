import React from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Briefcase,
  Award,
  FileText,
  TrendingUp,
  Users,
  Clock,
  Star,
  Edit2,
  MessageSquare,
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useAppSelector } from '@/redux/hooks';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import ProgressBar from '@/components/ui/ProgressBar';
import Breadcrumb from '@/components/ui/Breadcrumb';

const performanceData = [
  { subject: 'Productivity', value: 92, fullMark: 100 },
  { subject: 'Quality', value: 88, fullMark: 100 },
  { subject: 'Teamwork', value: 85, fullMark: 100 },
  { subject: 'Leadership', value: 78, fullMark: 100 },
  { subject: 'Communication', value: 90, fullMark: 100 },
  { subject: 'Initiative', value: 82, fullMark: 100 },
];

const activityData = [
  { month: 'Jan', tasks: 45, hours: 168 },
  { month: 'Feb', tasks: 52, hours: 176 },
  { month: 'Mar', tasks: 48, hours: 160 },
  { month: 'Apr', tasks: 61, hours: 184 },
  { month: 'May', tasks: 55, hours: 172 },
  { month: 'Jun', tasks: 68, hours: 180 },
];

const EmployeeProfilePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { employees } = useAppSelector((state) => state.employees);
  const employee = employees.find(e => e.id === id);

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-text-muted">Employee not found</p>
      </div>
    );
  }

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
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Employees', path: '/employees' },
          { label: `${employee.firstName} ${employee.lastName}` },
        ]}
      />

      {/* Header */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <div className="relative h-40 bg-gradient-to-r from-primary-600/30 via-secondary-600/20 to-accent/10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzODlCRjgiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-60" />
          </div>
          <div className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12">
              <Avatar
                src={employee.avatar}
                name={`${employee.firstName} ${employee.lastName}`}
                size="2xl"
                status={employee.attendance === 'present' ? 'online' : 'offline'}
                className="ring-4 ring-card"
              />
              <div className="flex-1 md:pb-2">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-text-primary">
                    {employee.firstName} {employee.lastName}
                  </h1>
                  <Badge variant="primary">{employee.role}</Badge>
                </div>
                <p className="text-text-muted">{employee.position} | {employee.department}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" icon={<MessageSquare className="w-4 h-4" />}>
                  Message
                </Button>
                <Button icon={<Edit2 className="w-4 h-4" />}>
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Overall Rating', value: `${employee.performance.overall}%`, icon: <Star className="w-5 h-5" />, color: 'warning' },
          { label: 'Projects', value: '12', icon: <Briefcase className="w-5 h-5" />, color: 'primary' },
          { label: 'Team Size', value: employee.teamMembers.length || 4, icon: <Users className="w-5 h-5" />, color: 'success' },
          { label: 'Years at Company', value: '4.2', icon: <Clock className="w-5 h-5" />, color: 'secondary' },
        ].map((stat) => (
          <Card key={stat.label} className="p-4" hover>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color === 'warning' ? 'bg-warning/20 text-warning' : stat.color === 'primary' ? 'bg-primary-500/20 text-primary-400' : stat.color === 'success' ? 'bg-success/20 text-success' : 'bg-secondary-500/20 text-secondary-400'}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xl font-bold text-text-primary">{stat.value}</p>
                <p className="text-xs text-text-muted">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Chart */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">Performance Overview</h3>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={performanceData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                      <Radar
                        name="Performance"
                        dataKey="value"
                        stroke="#2563EB"
                        fill="#2563EB"
                        fillOpacity={0.4}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {performanceData.slice(0, 3).map((item) => (
                    <div key={item.subject} className="text-center">
                      <p className="text-2xl font-bold text-text-primary">{item.value}%</p>
                      <p className="text-xs text-text-muted">{item.subject}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Trend */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">Activity Trend</h3>
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
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1E293B',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="tasks"
                        stroke="#2563EB"
                        fillOpacity={1}
                        fill="url(#colorTasks)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Skills */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">Skills & Expertise</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {employee.skills.map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">{skill}</span>
                        <span className="text-xs text-text-muted">
                          {index < 2 ? 'Expert' : index < 4 ? 'Advanced' : 'Intermediate'}
                        </span>
                      </div>
                      <ProgressBar
                        value={100 - index * 10}
                        color={index < 2 ? 'success' : index < 4 ? 'primary' : 'secondary'}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">Contact Information</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: <Mail className="w-4 h-4" />, label: 'Email', value: employee.email },
                  { icon: <Phone className="w-4 h-4" />, label: 'Phone', value: employee.phone },
                  { icon: <MapPin className="w-4 h-4" />, label: 'Location', value: `${employee.city}, ${employee.country}` },
                  { icon: <Calendar className="w-4 h-4" />, label: 'Join Date', value: employee.joinDate },
                  { icon: <Building2 className="w-4 h-4" />, label: 'Department', value: employee.department },
                  { icon: <Briefcase className="w-4 h-4" />, label: 'Manager', value: employee.manager },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-background-secondary text-text-muted">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">{item.label}</p>
                      <p className="text-sm text-text-primary">{item.value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Certifications */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">Certifications</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {employee.certifications.length > 0 ? (
                  employee.certifications.map((cert) => (
                    <div key={cert.id} className="flex items-start gap-3 p-3 rounded-xl bg-background-secondary/50">
                      <div className="p-2 rounded-lg bg-warning/20 text-warning">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{cert.name}</p>
                        <p className="text-xs text-text-muted">{cert.issuer} | {cert.date}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-text-muted text-sm">No certifications added</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">Achievements</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {employee.achievements.length > 0 ? (
                  employee.achievements.map((achievement) => (
                    <div key={achievement.id} className="p-3 rounded-xl bg-background-secondary/50 border-l-2 border-primary-500">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-primary-400" />
                        <span className="text-sm font-medium text-text-primary">{achievement.title}</span>
                      </div>
                      <p className="text-xs text-text-muted">{achievement.description}</p>
                      <p className="text-xs text-text-muted mt-1">{achievement.date}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-text-muted text-sm">No achievements yet</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmployeeProfilePage;
