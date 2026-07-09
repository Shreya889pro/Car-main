import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Calendar,
  Clock,
  MessageSquare,
  Paperclip,
  Plus,
  MoreHorizontal,
  User,
  AlertCircle,
  CheckCircle2,
  Circle,
  Loader2,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { updateOrderStatus } from '@/redux/slices/productionSlice';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar, { AvatarGroup } from '@/components/ui/Avatar';
import { KanbanColumn, ProductionStatus } from '@/types';

const WorkflowBoardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { kanbanColumns } = useAppSelector((state) => state.production);
  const { employees } = useAppSelector((state) => state.employees);

  const [columns, setColumns] = useState(kanbanColumns);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, 'error' | 'warning' | 'primary' | 'default'> = {
      critical: 'error',
      high: 'warning',
      medium: 'primary',
      low: 'default',
    };
    return colors[priority] || 'default';
  };

  const handleDragEnd = (cardId: string, newStatus: ProductionStatus) => {
    dispatch(updateOrderStatus({ id: cardId, status: newStatus }));
  };

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Circle className="w-4 h-4" />,
    planning: <Loader2 className="w-4 h-4 animate-spin" />,
    assigned: <User className="w-4 h-4" />,
    in_progress: <Loader2 className="w-4 h-4 animate-spin" />,
    quality_check: <AlertCircle className="w-4 h-4" />,
    packaging: <Paperclip className="w-4 h-4" />,
    dispatch: <AlertCircle className="w-4 h-4" />,
    completed: <CheckCircle2 className="w-4 h-4" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[calc(100vh-120px)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Workflow Board</h1>
          <p className="text-text-muted">Track and manage production orders</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />}>
          New Order
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex-shrink-0 w-80"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-2 mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
                <h3 className="font-semibold text-text-primary">{column.title}</h3>
                <span className="text-sm text-text-muted bg-background-secondary px-2 py-0.5 rounded-full">
                  {column.cards.length}
                </span>
              </div>
              <button className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Cards */}
            <div className="space-y-3">
              <AnimatePresence>
                {column.cards.map((card) => (
                  <motion.div
                    key={card.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedCard(card.id)}
                    className="bg-card border border-white/10 rounded-xl p-4 cursor-pointer hover:border-white/20 transition-colors group"
                  >
                    {/* Priority & Order ID */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-text-muted">{card.orderId}</span>
                      <Badge variant={getPriorityColor(card.priority)} size="xs">
                        {card.priority}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h4 className="font-medium text-text-primary mb-2">{card.title}</h4>

                    {/* Description */}
                    <p className="text-xs text-text-muted mb-3">{card.description}</p>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-text-muted">Progress</span>
                        <span className="text-text-primary font-medium">{card.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-background-tertiary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${card.progress}%` }}
                          className="h-full bg-primary-500 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Tags */}
                    {card.tags && card.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {card.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded bg-secondary-500/20 text-secondary-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        {card.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{card.dueDate}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-text-muted">
                          <MessageSquare className="w-3 h-3" />
                          {card.comments}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-text-muted">
                          <Paperclip className="w-3 h-3" />
                          {card.attachments}
                        </div>
                        {card.assignees.length > 0 && (
                          <AvatarGroup
                            avatars={card.assignees.slice(0, 2).map(id => {
                              const emp = employees.find(e => e.id === id);
                              return { src: emp?.avatar, name: emp ? `${emp.firstName} ${emp.lastName}` : '' };
                            })}
                            size="xs"
                          />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add Card */}
              <button className="w-full p-3 rounded-xl border border-dashed border-white/10 text-text-muted hover:text-text-primary hover:border-white/20 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Add card
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default WorkflowBoardPage;
