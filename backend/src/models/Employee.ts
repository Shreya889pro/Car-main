import mongoose, { Schema, Document } from 'mongoose';
import { EmployeeStatus, AttendanceStatus } from '../constants';

export interface IEmployee extends Document {
  employeeId: string;
  user: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  department: mongoose.Types.ObjectId;
  position: string;
  manager?: mongoose.Types.ObjectId;
  status: EmployeeStatus;
  attendance: AttendanceStatus;
  joinDate: Date;
  birthDate?: Date;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  skills: string[];
  certifications: Array<{
    name: string;
    issuer: string;
    date: Date;
    expiryDate?: Date;
    credentialId?: string;
    document?: string;
  }>;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  salary?: {
    base: number;
    currency: string;
    bonuses: number;
  };
  documents: Array<{
    name: string;
    type: string;
    url: string;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
  get fullName(): string;
}

const employeeSchema = new Schema<IEmployee>(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
      index: true,
    },
    position: {
      type: String,
      required: true,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(EmployeeStatus),
      default: EmployeeStatus.ACTIVE,
      index: true,
    },
    attendance: {
      type: String,
      enum: Object.values(AttendanceStatus),
      default: AttendanceStatus.PRESENT,
    },
    joinDate: {
      type: Date,
      required: true,
    },
    birthDate: {
      type: Date,
      default: null,
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: '' },
      zipCode: { type: String, default: '' },
    },
    skills: {
      type: [String],
      default: [],
    },
    certifications: [{
      name: { type: String, required: true },
      issuer: { type: String, required: true },
      date: { type: Date, required: true },
      expiryDate: { type: Date },
      credentialId: { type: String },
      document: { type: String },
    }],
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String },
      email: { type: String },
    },
    salary: {
      base: { type: Number, min: 0 },
      currency: { type: String, default: 'USD' },
      bonuses: { type: Number, default: 0 },
    },
    documents: [{
      name: { type: String, required: true },
      type: { type: String, required: true },
      url: { type: String, required: true },
      uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      uploadedAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

// Indexes
employeeSchema.index({ department: 1, status: 1 });
employeeSchema.index({ manager: 1 });

// Virtual for full name
employeeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure employeeId is unique
employeeSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.models.Employee?.countDocuments() || 0;
    this.employeeId = this.employeeId || `EMP${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.model<IEmployee>('Employee', employeeSchema);
