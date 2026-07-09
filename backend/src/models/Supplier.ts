import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    country: string;
    zipCode?: string;
  };
  categories: string[];
  rating: number;
  status: 'active' | 'inactive' | 'blocked';
  orders: number;
  totalValue: number;
  paymentTerms?: string;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    routingNumber?: string;
  };
  documents: Array<{
    name: string;
    type: string;
    url: string;
    uploadedAt: Date;
  }>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String },
    },
    categories: [{
      type: String,
    }],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'blocked'],
      default: 'active',
      index: true,
    },
    orders: {
      type: Number,
      default: 0,
    },
    totalValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentTerms: {
      type: String,
    },
    bankInfo: {
      bankName: { type: String },
      accountNumber: { type: String },
      routingNumber: { type: String },
    },
    documents: [{
      name: { type: String, required: true },
      type: { type: String, required: true },
      url: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    }],
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISupplier>('Supplier', supplierSchema);
