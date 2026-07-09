import mongoose, { Schema, Document } from 'mongoose';
import { AttendanceStatus } from '../constants';

export interface IAttendance extends Document {
  employee: mongoose.Types.ObjectId;
  date: Date;
  status: AttendanceStatus;
  checkIn?: Date;
  checkOut?: Date;
  totalHours?: number;
  overtimeHours?: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  notes?: string;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      default: AttendanceStatus.PRESENT,
    },
    checkIn: {
      type: Date,
      default: null,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    totalHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    overtimeHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String },
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index for unique attendance per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

// Calculate total hours before saving
attendanceSchema.pre('save', function (next) {
  if (this.checkIn && this.checkOut) {
    const diff = this.checkOut.getTime() - this.checkIn.getTime();
    this.totalHours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
  }
  next();
});

export default mongoose.model<IAttendance>('Attendance', attendanceSchema);
