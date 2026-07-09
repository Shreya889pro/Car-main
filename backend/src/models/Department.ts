import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code: string;
  description?: string;
  manager?: mongoose.Types.ObjectId;
  plant: mongoose.Types.ObjectId;
  employeeCount: number;
  budget: number;
  location?: string;
  status: 'active' | 'inactive';
  performance: {
    efficiency: number;
    productivity: number;
    quality: number;
    safety: number;
    target: number;
    trend: 'up' | 'down' | 'stable';
  };
  teams: Array<{
    name: string;
    leader: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
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
      trim: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    plant: {
      type: Schema.Types.ObjectId,
      ref: 'Plant',
      required: true,
      index: true,
    },
    employeeCount: {
      type: Number,
      default: 0,
    },
    budget: {
      type: Number,
      default: 0,
      min: 0,
    },
    location: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    performance: {
      efficiency: { type: Number, default: 0, min: 0, max: 100 },
      productivity: { type: Number, default: 0, min: 0, max: 100 },
      quality: { type: Number, default: 0, min: 0, max: 100 },
      safety: { type: Number, default: 0, min: 0, max: 100 },
      target: { type: Number, default: 0, min: 0, max: 100 },
      trend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
    },
    teams: [{
      name: { type: String, required: true },
      leader: { type: Schema.Types.ObjectId, ref: 'Employee' },
      members: [{ type: Schema.Types.ObjectId, ref: 'Employee' }],
    }],
  },
  { timestamps: true }
);

departmentSchema.index({ plant: 1, status: 1 });
departmentSchema.index({ plant: 1, code: 1 });

export default mongoose.model<IDepartment>('Department', departmentSchema);
