import mongoose, { Schema, Document } from 'mongoose';
import { QualityInspectionStatus } from '../constants';

export interface IQualityInspection extends Document {
  inspectionId: string;
  type: 'incoming' | 'in_process' | 'final' | 'outgoing';
  order?: mongoose.Types.ObjectId;
  product: {
    id: mongoose.Types.ObjectId;
    name: string;
    sku: string;
  };
  quantity: number;
  sampleSize: number;
  status: QualityInspectionStatus;
  inspector: mongoose.Types.ObjectId;
  startDate: Date;
  endDate?: Date;
  criteria: Array<{
    name: string;
    specification: string;
    actualValue?: string;
    status: 'pass' | 'fail' | 'na';
    notes?: string;
  }>;
  defects: Array<{
    type: string;
    severity: 'minor' | 'major' | 'critical';
    quantity: number;
    description: string;
    location?: string;
    photo?: string;
  }>;
  overallResult: 'pass' | 'fail' | 'conditional';
  remarks?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  attachments: Array<{
    name: string;
    type: string;
    url: string;
    uploadedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const qualityInspectionSchema = new Schema<IQualityInspection>(
  {
    inspectionId: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['incoming', 'in_process', 'final', 'outgoing'],
      required: true,
      index: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'ProductionOrder',
      default: null,
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
    sampleSize: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: Object.values(QualityInspectionStatus),
      default: QualityInspectionStatus.PENDING,
      index: true,
    },
    inspector: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    criteria: [{
      name: { type: String, required: true },
      specification: { type: String, required: true },
      actualValue: { type: String },
      status: { type: String, enum: ['pass', 'fail', 'na'], default: 'na' },
      notes: { type: String },
    }],
    defects: [{
      type: { type: String, required: true },
      severity: { type: String, enum: ['minor', 'major', 'critical'], required: true },
      quantity: { type: Number, required: true, min: 1 },
      description: { type: String, required: true },
      location: { type: String },
      photo: { type: String },
    }],
    overallResult: {
      type: String,
      enum: ['pass', 'fail', 'conditional'],
      default: 'pass',
    },
    remarks: {
      type: String,
      maxlength: 1000,
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
    attachments: [{
      name: { type: String, required: true },
      type: { type: String, required: true },
      url: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

// Auto-generate inspectionId
qualityInspectionSchema.pre('save', async function (next) {
  if (this.isNew && !this.inspectionId) {
    const count = await mongoose.models.QualityInspection?.countDocuments() || 0;
    this.inspectionId = `QA-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model<IQualityInspection>('QualityInspection', qualityInspectionSchema);
