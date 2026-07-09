import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  className = '',
}) => {
  const baseClasses = 'skeleton animate-shimmer';

  const variantClasses: Record<string, string> = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl',
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'circular' ? height : '100%'),
    height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? width : '100%'),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

export const SkeletonCard: React.FC = () => (
  <div className="bg-card rounded-2xl border border-white/10 p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton variant="circular" width={48} height={48} />
      <Skeleton variant="rectangular" width={64} height={24} />
    </div>
    <div className="space-y-2">
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="60%" />
    </div>
    <div className="flex gap-2">
      <Skeleton variant="rectangular" width={80} height={32} />
      <Skeleton variant="rectangular" width={80} height={32} />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4,
}) => (
  <div className="bg-card rounded-xl border border-white/10 overflow-hidden">
    <div className="bg-background-secondary">
      <div className="grid gap-4 px-6 py-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array(cols).fill(0).map((_, i) => (
          <Skeleton key={i} variant="text" width={80} />
        ))}
      </div>
    </div>
    <div className="divide-y divide-white/5">
      {Array(rows).fill(0).map((_, row) => (
        <div key={row} className="grid gap-4 px-6 py-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array(cols).fill(0).map((_, col) => (
            <Skeleton key={col} variant="text" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonStats: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array(count).fill(0).map((_, i) => (
      <div key={i} className="bg-card rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="rectangular" width={60} height={20} />
        </div>
        <Skeleton variant="text" width={80} height={32} />
        <Skeleton variant="text" width={120} className="mt-2" />
      </div>
    ))}
  </div>
);

export default Skeleton;
