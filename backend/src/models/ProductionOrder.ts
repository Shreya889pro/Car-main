import mongoose, { Schema, Document } from 'mongoose';
import { ProductionOrderStatus, Priority } from '../constants';

export interface IProductionOrder extends Document {
  orderId: string;
  product: {
    id: mongoose.Types.ObjectId;
    name: string;
    sku: string;
  };
  quantity: number;
  unit: string;
  priority: Priority;
  status: ProductionOrderStatus;
  progress: number;
  dueDate: Date;
  startDate?: Date;
  estimatedEndDate?: Date;
  actualEndDate?: Date;
  plant: mongoose.Types.ObjectId;
  department?: mongoose.Types.ObjectId;
  assignedTeam: mongoose.Types.ObjectId[];
  assignedManager?: mongoose.Types.ObjectId;
  assignedForeman?: mongoose.Types.ObjectId;
  notes?: string;
  comments: Array<{
    user: mongoose.Types.ObjectId;
    text: string;
    timestamp: Date;
    replies?: Array<{
      user: mongoose.Types.ObjectId;
      text: string;
      timestamp: Date;
    }>;
  }>;
  attachments: Array<{
    name: string;
    type: string;
    size: number;
    url: string;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
  }>;
  workflowHistory: Array<{
    status: ProductionOrderStatus;
    changedBy: mongoose.Types.ObjectId;
    timestamp: Date;
    notes?: string;
  }>;
  materials: Array<{
    id: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    unit: string;
    status: 'available' | 'reserved' | 'low_stock' | 'out_of_stock';
  }>;
  qualityChecks: Array<{
    id: string;
    name: string;
    status: 'pending' | 'passed' | 'failed';
    inspector?: mongoose.Types.ObjectId;
    timestamp?: Date;
    remarks?: string;
  }>;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const productionOrderSchema = new Schema<IProductionOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    product: {
      id: { type: Schema.Types.ObjectId, ref: 'Product' },
      name: { type: String, required: true },
      sku: { type: String, required: true },
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unit: {
      type: String,
      required: true,
      enum: ['pcs', 'units', 'sets', 'kg', 'liters', 'tons', 'boxes', 'crates'],
    },
    priority: {
      type: String,
      enum: Object.values(Priority),
      default: Priority.MEDIUM,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ProductionOrderStatus),
      default: ProductionOrderStatus.PENDING,
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    estimatedEndDate: {
      type: Date,
      default: null,
    },
    actualEndDate: {
      type: Date,
      default: null,
    },
    plant: {
      type: Schema.Types.ObjectId,
      ref: 'Plant',
      required: true,
      index: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    assignedTeam: [{
      type: Schema.Types.ObjectId,
      ref: 'Employee',
    }],
    assignedManager: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedForeman: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    comments: [{
      user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      replies: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        text: { type: String },
        timestamp: { type: Date, default: Date.now },
      }],
    }],
    attachments: [{
      name: { type: String, required: true },
      type: { type: String, required: true },
      size: { type: Number, required: true },
      url: { type: String, required: true },
      uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      uploadedAt: { type: Date, default: Date.now },
    }],
    workflowHistory: [{
      status: { type: String, required: true },
      changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now },
      notes: { type: String },
    }],
    materials: [{
      id: { type: Schema.Types.ObjectId, ref: 'Inventory' },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      unit: { type: String, required: true },
      status: {
        type: String,
        enum: ['available', 'reserved', 'low_stock', 'out_of_stock'],
        default: 'available',
      },
    }],
    qualityChecks: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      status: { type: String, enum: ['pending', 'passed', 'failed'], default: 'pending' },
      inspector: { type: Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date },
      remarks: { type: String },
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes
productionOrderSchema.index({ plant: 1, status: 1 });
productionOrderSchema.index({ status: 1, dueDate: 1 });
productionOrderSchema.index({ priority: 1, status: 1 });

// Auto-generate orderId
productionOrderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderId) {
    const count = await mongoose.models.ProductionOrder?.countDocuments() || 0;
    this.orderId = `PO-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model<IProductionOrder>('ProductionOrder', productionOrderSchema);
