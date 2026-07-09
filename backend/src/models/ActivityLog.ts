import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  user: mongoose.Types.ObjectId;
  action: string;
  category: string;
  resource: string;
  resourceId?: mongoose.Types.ObjectId;
  description: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'login',
        'logout',
        'create',
        'update',
        'delete',
        'view',
        'export',
        'import',
        'assign',
        'unassign',
        'approve',
        'reject',
        'upload',
        'download',
        'status_change',
      ],
    },
    category: {
      type: String,
      required: true,
      enum: [
        'auth',
        'employee',
        'department',
        'plant',
        'production',
        'inventory',
        'quality',
        'document',
        'report',
        'settings',
        'notification',
      ],
    },
    resource: {
      type: String,
      required: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false }
);

// Compound indexes
activityLogSchema.index({ user: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, category: 1 });
activityLogSchema.index({ resource: 1, resourceId: 1 });

export default mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
