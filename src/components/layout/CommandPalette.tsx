import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Users,
  Building2,
  Factory,
  ClipboardList,
  Package,
  Bell,
  Calendar,
  Settings,
  FileBarChart,
  LineChart,
  ArrowRight,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setCommandPaletteOpen } from '@/redux/slices/uiSlice';

const navItems = [
  { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard', category: 'Navigation' },
  { icon: <Users className="w-5 h-5" />, label: 'Employees', path: '/employees', category: 'Navigation' },
  { icon: <Building2 className="w-5 h-5" />, label: 'Departments', path: '/departments', category: 'Navigation' },
  { icon: <Factory className="w-5 h-5" />, label: 'Plants', path: '/plants', category: 'Navigation' },
  { icon: <ClipboardList className="w-5 h-5" />, label: 'Production Orders', path: '/production', category: 'Navigation' },
  { icon: <ClipboardList className="w-5 h-5" />, label: 'Workflow Board', path: '/workflow', category: 'Navigation' },
  { icon: <Package className="w-5 h-5" />, label: 'Inventory', path: '/inventory', category: 'Navigation' },
  { icon: <Bell className="w-5 h-5" />, label: 'Notifications', path: '/notifications', category: 'Navigation' },
  { icon: <Calendar className="w-5 h-5" />, label: 'Calendar', path: '/calendar', category: 'Navigation' },
  { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/settings', category: 'Navigation' },
  { icon: <FileBarChart className="w-5 h-5" />, label: 'Reports', path: '/reports', category: 'Navigation' },
  { icon: <LineChart className="w-5 h-5" />, label: 'Analytics', path: '/analytics', category: 'Navigation' },
];

const quickActions = [
  { label: 'Create Production Order', path: '/production/create', category: 'Quick Actions' },
  { label: 'Add New Employee', path: '/employees/create', category: 'Quick Actions' },
  { label: 'Generate Report', path: '/reports/generate', category: 'Quick Actions' },
  { label: 'View Dashboard', path: '/dashboard', category: 'Quick Actions' },
];

const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { commandPaletteOpen } = useAppSelector((state) => state.ui);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const allItems = useMemo(() => {
    const items = [...navItems, ...quickActions.map(a => ({ ...a, icon: <ArrowRight className="w-5 h-5" /> }))];
    if (!search) return items;
    return items.filter(item =>
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof allItems> = {};
    allItems.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [allItems]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        dispatch(setCommandPaletteOpen(!commandPaletteOpen));
      }
      if (e.key === 'Escape') {
        dispatch(setCommandPaletteOpen(false));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, commandPaletteOpen]);

  const handleSelect = (path: string) => {
    navigate(path);
    dispatch(setCommandPaletteOpen(false));
    setSearch('');
    setSelectedIndex(0);
  };

  if (!commandPaletteOpen) return null;

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(setCommandPaletteOpen(false))}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-card border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
              <Search className="w-5 h-5 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted outline-none text-lg"
                autoFocus
              />
              <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg text-text-muted">
                <span className="text-xs">ESC</span>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto py-2">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category}>
                  <p className="px-4 py-2 text-xs font-semibold text-text-muted uppercase">{category}</p>
                  {items.map((item, index) => {
                    const globalIndex = allItems.indexOf(item);
                    return (
                      <motion.button
                        key={`${item.category}-${item.label}`}
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                        onClick={() => handleSelect(item.path)}
                        className={`
                          w-full flex items-center gap-3 px-4 py-3 text-left
                          transition-colors
                          ${globalIndex === selectedIndex ? 'bg-white/5' : ''}
                        `}
                      >
                        <span className="text-text-muted">{item.icon}</span>
                        <span className="text-text-primary">{item.label}</span>
                        {item.path && (
                          <span className="ml-auto text-xs text-text-muted">{item.path}</span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-background-secondary/50">
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white/10 rounded">ESC</kbd>
                  Close
                </span>
              </div>
              <span className="text-xs text-text-muted">{allItems.length} results</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
