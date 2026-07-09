import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config';
import { User } from '../models';
import { Notification } from '../models';

interface AuthSocket extends Socket {
  userId?: string;
  userRole?: string;
}

// Store connected users
const connectedUsers = new Map<string, Set<string>>();

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: AuthSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string; role: string };
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;

      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket: AuthSocket) => {
    const userId = socket.userId!;

    console.log(`User connected: ${userId}`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Track connected users
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set());
    }
    connectedUsers.get(userId)!.add(socket.id);

    // Send pending notifications
    const pendingNotifications = await Notification.find({
      recipient: userId,
      read: false,
    }).sort({ createdAt: -1 }).limit(10);

    socket.emit('notifications:pending', pendingNotifications);

    // Send unread count
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false,
    });
    socket.emit('notifications:unread', unreadCount);

    // Handle join room for specific resources
    socket.on('join:plant', (plantId: string) => {
      socket.join(`plant:${plantId}`);
    });

    socket.on('join:department', (departmentId: string) => {
      socket.join(`department:${departmentId}`);
    });

    socket.on('join:order', (orderId: string) => {
      socket.join(`order:${orderId}`);
    });

    // Handle leaving rooms
    socket.on('leave:plant', (plantId: string) => {
      socket.leave(`plant:${plantId}`);
    });

    socket.on('leave:department', (departmentId: string) => {
      socket.leave(`department:${departmentId}`);
    });

    socket.on('leave:order', (orderId: string) => {
      socket.leave(`order:${orderId}`);
    });

    // Handle typing indicators
    socket.on('typing:start', (data: { orderId: string }) => {
      socket.to(`order:${data.orderId}`).emit('typing:user', {
        userId,
        orderId: data.orderId,
      });
    });

    socket.on('typing:stop', (data: { orderId: string }) => {
      socket.to(`order:${data.orderId}`).emit('typing:stopped', {
        userId,
        orderId: data.orderId,
      });
    });

    // Handle mark notification as read
    socket.on('notification:read', async (notificationId: string) => {
      await Notification.findByIdAndUpdate(notificationId, {
        read: true,
        readAt: new Date(),
      });

      const unreadCount = await Notification.countDocuments({
        recipient: userId,
        read: false,
      });
      socket.emit('notifications:unread', unreadCount);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);

      if (connectedUsers.has(userId)) {
        connectedUsers.get(userId)!.delete(socket.id);

        if (connectedUsers.get(userId)!.size === 0) {
          connectedUsers.delete(userId);
        }
      }
    });
  });
};

// Helper functions for sending notifications
export const sendNotificationToUser = async (io: Server, userId: string, notification: any) => {
  io.to(`user:${userId}`).emit('notification:new', notification);
};

export const sendNotificationToPlant = async (io: Server, plantId: string, event: string, data: any) => {
  io.to(`plant:${plantId}`).emit(event, data);
};

export const sendNotificationToDepartment = async (io: Server, departmentId: string, event: string, data: any) => {
  io.to(`department:${departmentId}`).emit(event, data);
};

export const sendNotificationToAll = async (io: Server, event: string, data: any) => {
  io.emit(event, data);
};

export const isUserOnline = (userId: string): boolean => {
  return connectedUsers.has(userId);
};

export const getOnlineUsersCount = (): number => {
  return connectedUsers.size;
};

export default {
  setupSocketHandlers,
  sendNotificationToUser,
  sendNotificationToPlant,
  sendNotificationToDepartment,
  sendNotificationToAll,
  isUserOnline,
  getOnlineUsersCount,
};
