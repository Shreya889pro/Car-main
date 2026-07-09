import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '@/types';

const notificationTypes: ('info' | 'success' | 'warning' | 'error')[] = ['info', 'success', 'warning', 'error'];
const priorities: ('low' | 'medium' | 'high' | 'urgent')[] = ['low', 'medium', 'high', 'urgent'];
const categories: ('production' | 'quality' | 'inventory' | 'hr' | 'system')[] = ['production', 'quality', 'inventory', 'hr', 'system'];

const notificationTemplates = [
  { title: 'New Production Order', message: 'Production order PO-00123 has been created and requires approval.' },
  { title: 'Quality Alert', message: 'Quality check failed for batch BT-0456. Review required.' },
  { title: 'Low Stock Warning', message: 'SKU-000045 is below reorder point. Current stock: 15 units.' },
  { title: 'Leave Request', message: 'Sarah Johnson has requested annual leave from July 15-20.' },
  { title: 'Order Completed', message: 'Production order PO-00118 has been completed successfully.' },
  { title: 'Equipment Maintenance Due', message: 'CNC Machine #12 scheduled maintenance is overdue.' },
  { title: 'Shipment Arrived', message: 'Container CNT-789 has arrived at the dock. Processing required.' },
  { title: 'Safety Incident', message: 'Minor safety incident reported in Production Hall B.' },
  { title: 'New Employee Onboarded', message: 'Welcome John Doe to the Production team.' },
  { title: 'System Update', message: 'System maintenance scheduled for Saturday 2:00 AM.' },
  { title: 'Inventory Audit', message: 'Annual inventory audit starts next Monday. Prepare documentation.' },
  { title: 'Performance Review', message: 'Q2 performance reviews are due by end of month.' },
  { title: 'Supplier Delivery', message: 'Expected delivery from MetalWorks Inc tomorrow.' },
  { title: 'Customer Order', message: 'New rush order from AutoCorp Industries. Priority: High.' },
  { title: 'Training Session', message: 'Safety training session scheduled for all operators.' },
];

const generateNotifications = (): Notification[] => {
  const notifications: Notification[] = [];
  for (let i = 1; i <= 50; i++) {
    const template = notificationTemplates[i % notificationTemplates.length];
    const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const read = i > 15;

    notifications.push({
      id: String(i),
      type,
      title: template.title,
      message: template.message,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      read,
      priority,
      category,
      actionUrl: `/dashboard/${category}`,
      userId: '1',
    });
  }
  return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: generateNotifications(),
  unreadCount: 15,
  loading: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => n.read = true);
      state.unreadCount = 0;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        if (!notification.read) {
          state.unreadCount -= 1;
        }
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
      }
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const { setNotifications, addNotification, markAsRead, markAllAsRead, removeNotification, clearAllNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
