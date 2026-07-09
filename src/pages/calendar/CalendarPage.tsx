import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Filter,
} from 'lucide-react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 7));
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2026, 6, 7));

  const events = [
    { id: '1', title: 'Production Meeting', time: '09:00 AM', duration: '1h', type: 'meeting', attendees: ['John', 'Sarah', 'Michael'] },
    { id: '2', title: 'Quality Audit Review', time: '11:00 AM', duration: '2h', type: 'quality', attendees: ['Sarah', 'David'] },
    { id: '3', title: 'Safety Training', time: '02:00 PM', duration: '3h', type: 'event', attendees: ['Team'] },
    { id: '4', title: 'Production Order Deadline', time: '05:00 PM', duration: '', type: 'deadline', attendees: [] },
  ];

  const upcomingEvents = [
    { id: '5', title: 'Supplier Meeting', date: 'Jul 8', type: 'meeting' },
    { id: '6', title: 'Monthly Review', date: 'Jul 10', type: 'meeting' },
    { id: '7', title: 'Equipment Inspection', date: 'Jul 12', type: 'production' },
    { id: '8', title: 'Team Building Event', date: 'Jul 15', type: 'event' },
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      meeting: 'bg-primary-500',
      production: 'bg-warning',
      quality: 'bg-success',
      deadline: 'bg-error',
      event: 'bg-secondary-500',
      leave: 'bg-purple-500',
    };
    return colors[type] || 'bg-text-muted';
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const renderCalendar = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isSelected = selectedDate?.getDate() === day && selectedDate.getMonth() === currentDate.getMonth();
      const isToday = day === 7;
      const hasEvent = [7, 10, 15, 20, 25].includes(day);
      days.push(
        <motion.button
          key={day}
          whileHover={{ scale: 1.1 }}
          onClick={() => setSelectedDate(date)}
          className={`
            relative p-2 rounded-xl text-sm font-medium transition-all
            ${isSelected ? 'bg-primary-500 text-white' : 'text-text-secondary hover:bg-white/10'}
            ${isToday && !isSelected ? 'ring-2 ring-primary-500' : ''}
          `}
        >
          {day}
          {hasEvent && (
            <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-primary-500'}`} />
          )}
        </motion.button>
      );
    }
    return days;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Calendar</h1>
          <p className="text-text-muted">Manage your schedule and events</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />}>
          Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-primary">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-1 text-sm rounded-lg text-text-secondary hover:bg-white/10 transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-text-muted py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Events */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary">
                {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Events'}
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-xl bg-background-secondary/50 border-l-2"
                  style={{ borderLeftColor: event.type === 'meeting' ? '#2563EB' : event.type === 'quality' ? '#22C55E' : event.type === 'deadline' ? '#EF4444' : '#8B5CF6' }}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-text-primary">{event.title}</p>
                    <span className={`w-2 h-2 rounded-full ${getEventTypeColor(event.type)}`} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Clock className="w-3 h-3" />
                    {event.time}
                    {event.duration && ` (${event.duration})`}
                  </div>
                  {event.attendees.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Users className="w-3 h-3 text-text-muted" />
                      <span className="text-xs text-text-muted">{event.attendees.join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary">Upcoming Events</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                  <div className={`w-2 h-2 rounded-full ${getEventTypeColor(event.type)}`} />
                  <div className="flex-1">
                    <p className="text-sm text-text-primary">{event.title}</p>
                    <p className="text-xs text-text-muted">{event.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default CalendarPage;
