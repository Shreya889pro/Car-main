import mongoose, { Schema, Document } from 'mongoose';
import { NotificationType, NotificationCategory } from '../constants';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  read: boolean;
  readAt?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  data?: Record<string, unknown>;
  sender?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(NotificationCategory),
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    actionUrl: {
      type: String,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for querying
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ category: 1 });

export default mongoose.model<INotification>('Notification', notificationSchema);
