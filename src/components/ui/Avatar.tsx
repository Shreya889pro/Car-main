import React from 'react';
import { motion } from 'framer-motion';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
}

const sizeStyles: Record<string, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl',
};

const statusSizeStyles: Record<string, string> = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
  '2xl': 'w-5 h-5',
};

const statusStyles: Record<string, string> = {
  online: 'bg-success',
  offline: 'bg-text-muted',
  away: 'bg-warning',
  busy: 'bg-error',
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  name,
  size = 'md',
  status,
  className = '',
}) => {
  const initials = name ? getInitials(name) : '?';

  return (
    <div className={`relative inline-flex ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`
          relative rounded-full overflow-hidden
          ${sizeStyles[size]}
          ${!src ? 'bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold' : ''}
        `}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </motion.div>
      {status && (
        <span
          className={`
            absolute bottom-0 right-0 rounded-full border-2 border-card
            ${statusSizeStyles[size]}
            ${statusStyles[status]}
          `}
        />
      )}
    </div>
  );
};

export const AvatarGroup: React.FC<{
  avatars: Array<{ src?: string; name?: string }>;
  max?: number;
  size?: AvatarProps['size'];
}> = ({ avatars, max = 4, size = 'md' }) => {
  const visibleAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className="flex -space-x-2">
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          size={size}
          className="ring-2 ring-card"
        />
      ))}
      {remaining > 0 && (
        <div
          className={`
            ${sizeStyles[size]}
            rounded-full bg-background-tertiary flex items-center justify-center
            text-text-secondary font-medium ring-2 ring-card
          `}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default Avatar;
