import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  glow = false,
  gradient = false,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.01 } : undefined}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl border border-white/10
        ${gradient
          ? 'bg-gradient-to-br from-card via-background-secondary to-card'
          : 'bg-card/80 backdrop-blur-xl'
        }
        ${hover ? 'cursor-pointer transition-all duration-300 hover:border-white/20 hover:shadow-card-hover' : ''}
        ${glow ? 'shadow-glow' : 'shadow-card'}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`px-6 py-4 border-b border-white/5 ${className}`}>
    {children}
  </div>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`px-6 py-4 border-t border-white/5 ${className}`}>
    {children}
  </div>
);

export default Card;
