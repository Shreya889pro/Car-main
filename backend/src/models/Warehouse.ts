import mongoose, { Schema, Document } from 'mongoose';

export interface IWarehouse extends Document {
  name: string;
  code: string;
  location: string;
  address?: {
    street: string;
    city: string;
    country: string;
    zipCode: string;
  };
  capacity: number;
  usedCapacity: number;
  manager?: mongoose.Types.ObjectId;
  zones: Array<{
    name: string;
    type: 'raw_materials' | 'finished_goods' | 'quarantine' | 'returns';
    capacity: number;
    usedCapacity: number;
  }>;
  status: 'operational' | 'maintenance';
  contactInfo?: {
    phone: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const warehouseSchema = new Schema<IWarehouse>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
      country: { type: String, required: true },
      zipCode: { type: String, default: '' },
    },
    capacity: {
      type: Number,
      required: true,
      min: 0,
    },
    usedCapacity: {
      type: Number,
      default: 0,
      min: 0,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    zones: [{
      name: { type: String, required: true },
      type: {
        type: String,
        enum: ['raw_materials', 'finished_goods', 'quarantine', 'returns'],
        required: true,
      },
      capacity: { type: Number, required: true },
      usedCapacity: { type: Number, default: 0 },
    }],
    status: {
      type: String,
      enum: ['operational', 'maintenance'],
      default: 'operational',
    },
    contactInfo: {
      phone: { type: String },
      email: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IWarehouse>('Warehouse', warehouseSchema);
