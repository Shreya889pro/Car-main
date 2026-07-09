import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Bell, Check, Trash2, Filter, CheckCheck } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { markAsRead, markAllAsRead, removeNotification } from '@/redux/slices/notificationsSlice';
import { setNotificationPanelOpen } from '@/redux/slices/uiSlice';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

const getNotificationIcon = (type: string) => {
  const icons: Record<string, string> = {
    production: '🏭',
    quality: '✅',
    inventory: '📦',
    hr: '👥',
    system: '⚙️',
  };
  return icons[type] || '📌';
};

const NotificationPanel: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector((state) => state.notifications);
  const { notificationPanelOpen } = useAppSelector((state) => state.ui);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        dispatch(setNotificationPanelOpen(false));
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dispatch]);

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    dispatch(markAsRead(notification.id));
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    dispatch(setNotificationPanelOpen(false));
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

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!notificationPanelOpen) return null;

  return (
    <AnimatePresence>
      {notificationPanelOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="fixed top-20 right-6 w-96 max-h-[70vh] bg-card border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-text-muted" />
              <h3 className="text-lg font-semibold text-text-primary">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="primary" size="xs">{unreadCount} new</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(markAllAsRead())}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
              <button
                onClick={() => dispatch(setNotificationPanelOpen(false))}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-background-secondary/50">
            {['All', 'Unread', 'Production', 'Quality', 'HR'].map((filter) => (
              <button
                key={filter}
                className="px-3 py-1 text-xs rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-[50vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                <Bell className="w-12 h-12 opacity-50 mb-3" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => handleNotificationClick(notification)}
                  className={`
                    flex items-start gap-3 px-4 py-3 cursor-pointer
                    transition-colors hover:bg-white/5
                    ${!notification.read ? 'bg-primary-500/5' : ''}
                    border-l-2 ${!notification.read ? 'border-primary-500' : 'border-transparent'}
                  `}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-background-tertiary flex items-center justify-center text-lg">
                    {getNotificationIcon(notification.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-sm font-medium ${!notification.read ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {notification.title}
                      </p>
                      <Badge variant={getPriorityColor(notification.priority)} size="xs">
                        {notification.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-muted line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-text-muted mt-1">{getTimeAgo(notification.timestamp)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(markAsRead(notification.id));
                        }}
                        className="p-1 rounded text-text-muted hover:text-primary-400 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(removeNotification(notification.id));
                      }}
                      className="p-1 rounded text-text-muted hover:text-error transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-white/5 bg-background-secondary/50">
            <button
              onClick={() => {
                navigate('/notifications');
                dispatch(setNotificationPanelOpen(false));
              }}
              className="w-full py-2 text-sm text-center text-primary-400 hover:text-primary-300 transition-colors"
            >
              View all notifications
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
