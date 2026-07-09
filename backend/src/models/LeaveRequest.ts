import mongoose, { Schema, Document } from 'mongoose';
import { LeaveType, LeaveRequestStatus } from '../constants';

export interface ILeaveRequest extends Document {
  employee: mongoose.Types.ObjectId;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  status: LeaveRequestStatus;
  reason: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectedBy?: mongoose.Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;
  documents: Array<{
    name: string;
    type: string;
    url: string;
    uploadedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const leaveRequestSchema = new Schema<ILeaveRequest>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(LeaveType),
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: Object.values(LeaveRequestStatus),
      default: LeaveRequestStatus.PENDING,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      maxlength: 500,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      maxlength: 500,
    },
    documents: [{
      name: { type: String, required: true },
      type: { type: String, required: true },
      url: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

// Calculate total days
leaveRequestSchema.pre('save', function (next) {
  if (this.startDate && this.endDate) {
    const diff = this.endDate.getTime() - this.startDate.getTime();
    this.totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }
  next();
});

export default mongoose.model<ILeaveRequest>('LeaveRequest', leaveRequestSchema);
