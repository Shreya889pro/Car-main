import mongoose, { Schema, Document } from 'mongoose';

export interface IPlant extends Document {
  name: string;
  code: string;
  location: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  capacity: number;
  currentLoad: number;
  departments: mongoose.Types.ObjectId[];
  managers: mongoose.Types.ObjectId[];
  status: 'operational' | 'maintenance' | 'shutdown';
  establishedDate: Date;
  area: number;
  shifts: Array<{
    name: string;
    startTime: string;
    endTime: string;
    workers: number;
  }>;
  contactInfo?: {
    phone: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const plantSchema = new Schema<IPlant>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    location: {
      type: String,
      required: true,
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String, default: '' },
    },
    capacity: {
      type: Number,
      required: true,
      min: 0,
    },
    currentLoad: {
      type: Number,
      default: 0,
      min: 0,
    },
    departments: [{
      type: Schema.Types.ObjectId,
      ref: 'Department',
    }],
    managers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    status: {
      type: String,
      enum: ['operational', 'maintenance', 'shutdown'],
      default: 'operational',
      index: true,
    },
    establishedDate: {
      type: Date,
      required: true,
    },
    area: {
      type: Number,
      min: 0,
    },
    shifts: [{
      name: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      workers: { type: Number, default: 0 },
    }],
    contactInfo: {
      phone: { type: String },
      email: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPlant>('Plant', plantSchema);
