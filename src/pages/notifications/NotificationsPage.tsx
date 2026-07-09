import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  Settings,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { markAsRead, markAllAsRead, removeNotification, clearAllNotifications } from '@/redux/slices/notificationsSlice';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Tabs from '@/components/ui/Tabs';
import Avatar from '@/components/ui/Avatar';

const NotificationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector((state) => state.notifications);
  const [activeTab, setActiveTab] = useState('all');

  const getNotificationIcon = (category: string) => {
    const icons: Record<string, string> = {
      production: '\uD83C\uDFED',
      quality: '\u2705',
      inventory: '\uD83D\uDCE6',
      hr: '\uD83D\uDC65',
      system: '\u2699\uFE0F',
    };
    return icons[category] || '\uD83D\uDCCC';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, 'error' | 'warning' | 'primary' | 'default'> = {
      urgent: 'error',
      high: 'warning',
      medium: 'primary',
      low: 'default',
    };
    return colors[priority] || 'default';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      success: 'success',
      warning: 'warning',
      error: 'error',
      info: 'info',
    };
    return colors[type] || 'info';
  };

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const tabs = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'production', label: 'Production', count: notifications.filter(n => n.category === 'production').length },
    { id: 'quality', label: 'Quality', count: notifications.filter(n => n.category === 'quality').length },
    { id: 'hr', label: 'HR', count: notifications.filter(n => n.category === 'hr').length },
  ];

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read;
    return n.category === activeTab;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
          <p className="text-text-muted">Stay updated with the latest alerts and activities</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button variant="outline" icon={<CheckCheck className="w-4 h-4" />} onClick={() => dispatch(markAllAsRead())}>
              Mark all as read
            </Button>
          )}
          <Button variant="outline" icon={<Settings className="w-4 h-4" />}>
            Settings
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: notifications.length, icon: <Bell className="w-5 h-5" />, color: 'primary' },
          { label: 'Unread', value: unreadCount, icon: <BellOff className="w-5 h-5" />, color: 'warning' },
          { label: 'Urgent', value: notifications.filter(n => n.priority === 'urgent').length, icon: <Bell className="w-5 h-5" />, color: 'error' },
          { label: 'Today', value: notifications.filter(n => new Date(n.timestamp).toDateString() === new Date().toDateString()).length, icon: <Bell className="w-5 h-5" />, color: 'success' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4" hover>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color === 'primary' ? 'bg-primary-500/20 text-primary-400' : stat.color === 'success' ? 'bg-success/20 text-success' : stat.color === 'warning' ? 'bg-warning/20 text-warning' : 'bg-error/20 text-error'}`}>
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
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center text-text-muted">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No notifications found</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`
                    flex items-start gap-4 p-4 hover:bg-white/5 transition-colors cursor-pointer
                    ${!notification.read ? 'bg-primary-500/5' : ''}
                  `}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-background-tertiary flex items-center justify-center text-xl">
                    {getNotificationIcon(notification.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getPriorityColor(notification.priority)} size="xs">
                        {notification.priority}
                      </Badge>
                      <Badge variant={getTypeColor(notification.type)} size="xs">
                        {notification.type}
                      </Badge>
                    </div>
                    <h4 className={`text-sm font-medium ${!notification.read ? 'text-text-primary' : 'text-text-secondary'}`}>
                      {notification.title}
                    </h4>
                    <p className="text-sm text-text-muted mt-1">{notification.message}</p>
                    <p className="text-xs text-text-muted mt-2">{getTimeAgo(notification.timestamp)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(markAsRead(notification.id));
                        }}
                        className="p-2 rounded-lg text-text-muted hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(removeNotification(notification.id));
                      }}
                      className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NotificationsPage;
