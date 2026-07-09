import React from 'react';
import { motion } from 'framer-motion';
import { FileQuestion, FolderOpen, Search, Users, Package } from 'lucide-react';

type EmptyType = 'default' | 'search' | 'folder' | 'users' | 'package';

interface EmptyStateProps {
  type?: EmptyType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const iconMap: Record<EmptyType, React.ReactNode> = {
  default: <FileQuestion className="w-16 h-16" />,
  search: <Search className="w-16 h-16" />,
  folder: <FolderOpen className="w-16 h-16" />,
  users: <Users className="w-16 h-16" />,
  package: <Package className="w-16 h-16" />,
};

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'default',
  title,
  description,
  action,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="text-text-muted mb-6 opacity-50">
        {iconMap[type]}
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-text-muted mb-6 max-w-md">{description}</p>
      )}
      {action && <div>{action}</div>}
    </motion.div>
  );
};

export default EmptyState;
