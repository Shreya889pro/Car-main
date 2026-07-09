import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  name: string;
  originalName: string;
  type: string;
  size: number;
  url: string;
  publicId?: string;
  category: string;
  folder?: mongoose.Types.ObjectId;
  tags: string[];
  description?: string;
  version: number;
  versions?: Array<{
    version: number;
    url: string;
    uploadedAt: Date;
    uploadedBy: mongoose.Types.ObjectId;
    changes?: string;
  }>;
  uploadedBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  sharedWith: mongoose.Types.ObjectId[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    folder: {
      type: Schema.Types.ObjectId,
      ref: 'DocumentFolder',
      default: null,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    description: {
      type: String,
      maxlength: 500,
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
    versions: [{
      version: { type: Number, required: true },
      url: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
      uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      changes: { type: String },
    }],
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    sharedWith: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Indexes
documentSchema.index({ category: 1, folder: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ tags: 1 });

export default mongoose.model<IDocument>('Document', documentSchema);
