import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Building2,
  Shield,
  Factory,
  ClipboardList,
  Kanban,
  Package,
  Warehouse,
  Truck,
  Ship,
  Send,
  CheckCircle2,
  Wrench,
  FileBarChart,
  LineChart,
  FileText,
  Bell,
  Calendar,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  collapsed?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, badge, collapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <NavLink to={to}>
      <motion.div
        whileHover={{ x: 4 }}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer
          transition-all duration-200 group relative
          ${isActive
            ? 'bg-primary-500/10 text-primary-400 border-l-2 border-primary-500'
            : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
          }
          ${collapsed ? 'justify-center px-3' : ''}
        `}
      >
        <div className={`flex-shrink-0 ${isActive ? 'text-primary-400' : 'text-text-muted group-hover:text-text-secondary'}`}>
          {icon}
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-sm font-medium whitespace-nowrap"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
        {!collapsed && badge !== undefined && badge > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-primary-500 text-white"
          >
            {badge}
          </motion.span>
        )}
        {collapsed && badge !== undefined && badge > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-500" />
        )}
      </motion.div>
    </NavLink>
  );
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  notificationCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, notificationCount = 0 }) => {
  const menuItems = [
    { to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { to: '/employees', icon: <Users className="w-5 h-5" />, label: 'Employees' },
    { to: '/departments', icon: <Building2 className="w-5 h-5" />, label: 'Departments' },
    { to: '/roles', icon: <Shield className="w-5 h-5" />, label: 'Roles' },
    { to: '/plants', icon: <Factory className="w-5 h-5" />, label: 'Plants' },
    { to: '/production', icon: <ClipboardList className="w-5 h-5" />, label: 'Production Orders' },
    { to: '/workflow', icon: <Kanban className="w-5 h-5" />, label: 'Workflow Board' },
    { to: '/inventory', icon: <Package className="w-5 h-5" />, label: 'Inventory' },
    { to: '/warehouse', icon: <Warehouse className="w-5 h-5" />, label: 'Warehouse' },
    { to: '/suppliers', icon: <Truck className="w-5 h-5" />, label: 'Suppliers' },
    { to: '/customers', icon: <Users className="w-5 h-5" />, label: 'Customers' },
    { to: '/imports', icon: <Ship className="w-5 h-5" />, label: 'Import' },
    { to: '/exports', icon: <Send className="w-5 h-5" />, label: 'Export' },
    { to: '/dispatch', icon: <Truck className="w-5 h-5" />, label: 'Dispatch' },
    { to: '/quality', icon: <CheckCircle2 className="w-5 h-5" />, label: 'Quality Control' },
    { to: '/maintenance', icon: <Wrench className="w-5 h-5" />, label: 'Maintenance' },
    { to: '/reports', icon: <FileBarChart className="w-5 h-5" />, label: 'Reports' },
    { to: '/analytics', icon: <LineChart className="w-5 h-5" />, label: 'Analytics' },
    { to: '/documents', icon: <FileText className="w-5 h-5" />, label: 'Documents' },
    { to: '/notifications', icon: <Bell className="w-5 h-5" />, label: 'Notifications', badge: notificationCount },
    { to: '/calendar', icon: <Calendar className="w-5 h-5" />, label: 'Calendar' },
    { to: '/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
    { to: '/help', icon: <HelpCircle className="w-5 h-5" />, label: 'Help Center' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 bottom-0 z-40 bg-card/80 backdrop-blur-xl border-r border-white/10"
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-white/5 ${collapsed ? 'justify-center' : ''}`}>
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
              <Factory className="w-6 h-6 text-white" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap"
                >
                  <h1 className="text-lg font-bold text-text-primary">FactoryFlow</h1>
                  <p className="text-xs text-text-muted -mt-0.5">Enterprise Suite</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <nav className="px-3 space-y-1">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                badge={item.badge}
                collapsed={collapsed}
              />
            ))}
          </nav>
        </div>

        {/* Toggle Button */}
        <div className="p-4 border-t border-white/5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggle}
            className={`
              w-full flex items-center justify-center gap-2 p-3 rounded-xl
              bg-background-secondary border border-white/10
              text-text-muted hover:text-text-primary hover:border-white/20
              transition-all duration-200
              ${collapsed ? '' : 'justify-between'}
            `}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <span className="text-sm">Collapse</span>
                <ChevronLeft className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
