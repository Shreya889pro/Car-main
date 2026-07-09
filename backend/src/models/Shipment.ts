import mongoose, { Schema, Document } from 'mongoose';
import { ShipmentStatus } from '../constants';

export interface IShipment extends Document {
  shipmentId: string;
  type: 'import' | 'export';
  status: ShipmentStatus;
  origin: string;
  destination: string;
  departureDate?: Date;
  arrivalDate?: Date;
  actualArrival?: Date;
  containerId?: string;
  transportType: 'sea' | 'air' | 'road' | 'rail';
  customsStatus: 'pending' | 'cleared' | 'held';
  customsClearanceDate?: Date;
  value: number;
  currency: string;
  customer?: mongoose.Types.ObjectId;
  supplier?: mongoose.Types.ObjectId;
  items: Array<{
    productId: mongoose.Types.ObjectId;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  documents: Array<{
    name: string;
    type: 'invoice' | 'packing_list' | 'bill_of_lading' | 'certificate' | 'customs' | 'other';
    url: string;
    status: 'pending' | 'approved' | 'rejected';
    uploadedAt: Date;
  }>;
  timeline: Array<{
    status: string;
    location: string;
    timestamp: Date;
    description: string;
  }>;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const shipmentSchema = new Schema<IShipment>(
  {
    shipmentId: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['import', 'export'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ShipmentStatus),
      default: ShipmentStatus.DRAFT,
      index: true,
    },
    origin: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    departureDate: {
      type: Date,
      default: null,
    },
    arrivalDate: {
      type: Date,
      default: null,
    },
    actualArrival: {
      type: Date,
      default: null,
    },
    containerId: {
      type: String,
    },
    transportType: {
      type: String,
      enum: ['sea', 'air', 'road', 'rail'],
      required: true,
    },
    customsStatus: {
      type: String,
      enum: ['pending', 'cleared', 'held'],
      default: 'pending',
    },
    customsClearanceDate: {
      type: Date,
      default: null,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      default: null,
    },
    items: [{
      productId: { type: Schema.Types.ObjectId, ref: 'Product' },
      productName: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      unitPrice: { type: Number, required: true, min: 0 },
      total: { type: Number, required: true, min: 0 },
    }],
    documents: [{
      name: { type: String, required: true },
      type: {
        type: String,
        enum: ['invoice', 'packing_list', 'bill_of_lading', 'certificate', 'customs', 'other'],
        required: true,
      },
      url: { type: String, required: true },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      uploadedAt: { type: Date, default: Date.now },
    }],
    timeline: [{
      status: { type: String, required: true },
      location: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      description: { type: String, required: true },
    }],
    notes: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-generate shipmentId
shipmentSchema.pre('save', async function (next) {
  if (this.isNew && !this.shipmentId) {
    const prefix = this.type === 'import' ? 'IMP' : 'EXP';
    const count = await mongoose.models.Shipment?.countDocuments({ type: this.type }) || 0;
    this.shipmentId = `${prefix}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model<IShipment>('Shipment', shipmentSchema);
