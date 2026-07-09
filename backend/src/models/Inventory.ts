import mongoose, { Schema, Document } from 'mongoose';
import { InventoryStatus } from '../constants';

export interface IInventory extends Document {
  sku: string;
  name: string;
  description?: string;
  category: string;
  categoryId?: mongoose.Types.ObjectId;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  unitPrice: number;
  currency: string;
  location: string;
  warehouse?: mongoose.Types.ObjectId;
  supplier?: mongoose.Types.ObjectId;
  status: InventoryStatus;
  lastRestocked?: Date;
  lastUpdated: Date;
  movements: Array<{
    type: 'in' | 'out' | 'transfer';
    quantity: number;
    reference: string;
    timestamp: Date;
    userId: mongoose.Types.ObjectId;
    notes?: string;
  }>;
  documents: Array<{
    name: string;
    type: string;
    url: string;
    uploadedAt: Date;
  }>;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'InventoryCategory',
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      enum: ['pcs', 'units', 'sets', 'kg', 'liters', 'tons', 'boxes', 'crates', 'meters'],
    },
    minStock: {
      type: Number,
      required: true,
      min: 0,
    },
    maxStock: {
      type: Number,
      required: true,
      min: 0,
    },
    reorderPoint: {
      type: Number,
      required: true,
      min: 0,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    location: {
      type: String,
      required: true,
    },
    warehouse: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
      default: null,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(InventoryStatus),
      default: InventoryStatus.IN_STOCK,
      index: true,
    },
    lastRestocked: {
      type: Date,
      default: null,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    movements: [{
      type: { type: String, enum: ['in', 'out', 'transfer'], required: true },
      quantity: { type: Number, required: true },
      reference: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      notes: { type: String },
    }],
    documents: [{
      name: { type: String, required: true },
      type: { type: String, required: true },
      url: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes
inventorySchema.index({ category: 1, status: 1 });
inventorySchema.index({ warehouse: 1 });
inventorySchema.index({ supplier: 1 });

// Update status based on quantity
inventorySchema.pre('save', function (next) {
  if (this.quantity <= 0) {
    this.status = InventoryStatus.OUT_OF_STOCK;
  } else if (this.quantity <= this.minStock) {
    this.status = InventoryStatus.LOW_STOCK;
  } else {
    this.status = InventoryStatus.IN_STOCK;
  }
  this.lastUpdated = new Date();
  next();
});

export default mongoose.model<IInventory>('Inventory', inventorySchema);
