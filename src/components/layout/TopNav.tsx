import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Moon,
  Sun,
  Command,
  Settings,
  User,
  LogOut,
  HelpCircle,
  ChevronDown,
  Menu,
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { toggleDarkMode, toggleSidebar, setCommandPaletteOpen } from '@/redux/slices/uiSlice';
import { markAllAsRead } from '@/redux/slices/notificationsSlice';

interface TopNavProps {
  onNotificationClick: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ onNotificationClick }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { unreadCount, notifications } = useAppSelector((state) => state.notifications);
  const { darkMode } = useAppSelector((state) => state.ui);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const recentNotifications = notifications.slice(0, 3);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        dispatch(setCommandPaletteOpen(true));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5"
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => dispatch(setCommandPaletteOpen(true))}
            className="hidden md:flex items-center gap-3 px-4 py-2 bg-background-secondary border border-white/10 rounded-xl text-text-muted hover:border-white/20 transition-all duration-200 min-w-[320px]"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm">Search anything...</span>
            <div className="ml-auto flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded-lg">
              <Command className="w-3 h-3" />
              <span className="text-xs">K</span>
            </div>
          </motion.button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Mobile Search */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 md:hidden"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(toggleDarkMode())}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10"
          >
            <AnimatePresence mode="wait">
              {darkMode ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                >
                  <Sun className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                >
                  <Moon className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNotificationClick}
            className="relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-error text-white text-xs flex items-center justify-center font-medium"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </motion.button>

          {/* Help */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/help')}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10"
          >
            <HelpCircle className="w-5 h-5" />
          </motion.button>

          {/* Profile */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Avatar
                src={user?.avatar}
                name={`${user?.firstName} ${user?.lastName}`}
                size="sm"
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-text-primary">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-text-muted">{user?.role}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-64 py-2 bg-card border border-white/10 rounded-xl shadow-xl z-50"
                  >
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-sm font-medium text-text-primary">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-text-muted">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      {[
                        { icon: <User className="w-4 h-4" />, label: 'Profile', onClick: () => navigate('/profile') },
                        { icon: <Settings className="w-4 h-4" />, label: 'Settings', onClick: () => navigate('/settings') },
                      ].map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            item.onClick();
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                        >
                          {item.icon}
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-white/5">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default TopNav;
