import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'accent';
  onClick?: () => void;
}

const colorStyles: Record<string, { bg: string; icon: string; text: string }> = {
  primary: { bg: 'bg-primary-500/20', icon: 'text-primary-400', text: 'text-primary-400' },
  secondary: { bg: 'bg-secondary-500/20', icon: 'text-secondary-400', text: 'text-secondary-400' },
  success: { bg: 'bg-success/20', icon: 'text-success', text: 'text-success' },
  warning: { bg: 'bg-warning/20', icon: 'text-warning', text: 'text-warning' },
  error: { bg: 'bg-error/20', icon: 'text-error', text: 'text-error' },
  accent: { bg: 'bg-accent/20', icon: 'text-accent', text: 'text-accent' },
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  change,
  changeLabel = 'vs last month',
  color = 'primary',
  onClick,
}) => {
  const getTrendIcon = () => {
    if (!change) return <Minus className="w-4 h-4" />;
    return change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const trendColor = !change ? 'text-text-muted' : change > 0 ? 'text-success' : 'text-error';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl border border-white/10
        bg-card/80 backdrop-blur-xl p-6
        ${onClick ? 'cursor-pointer' : ''}
        transition-all duration-300 hover:border-white/20 hover:shadow-card-hover
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorStyles[color].bg}`}>
          <div className={colorStyles[color].icon}>{icon}</div>
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 ${trendColor}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-3xl font-bold text-text-primary">{value}</h3>
        <p className="text-sm text-text-muted">{title}</p>
        {change !== undefined && (
          <p className="text-xs text-text-muted mt-1">{changeLabel}</p>
        )}
      </div>
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 ${colorStyles[color].bg} opacity-50`}
      />
    </motion.div>
  );
};

export default StatsCard;
