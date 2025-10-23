import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'admin' | 'manager' | 'veterinarian' | 'worker' | 'viewer';
  country: string;
  region: string;
  farmName: string;
  farmSize: number;
  livestockTypes: string[];
  isActive: boolean;
  lastLogin?: Date;
  preferences: {
    language: string;
    currency: string;
    timezone: string;
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^\+?[\d\s\-\(\)]{10,}$/, 'Please provide a valid phone number'],
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'veterinarian', 'worker', 'viewer'],
      default: 'viewer',
    },
    country: {
      type: String,
      required: true,
      uppercase: true,
    },
    region: {
      type: String,
      required: true,
    },
    farmName: {
      type: String,
      required: true,
      trim: true,
    },
    farmSize: {
      type: Number,
      required: true,
      min: 0,
    },
    livestockTypes: [{
      type: String,
      enum: ['cattle', 'sheep', 'goats', 'poultry', 'pigs', 'other'],
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    preferences: {
      language: {
        type: String,
        default: 'en',
      },
      currency: {
        type: String,
        default: 'USD',
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'auto',
      },
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
      },
    },
    permissions: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });
UserSchema.index({ tenantId: 1, role: 1 });
UserSchema.index({ tenantId: 1, country: 1 });
UserSchema.index({ tenantId: 1, isActive: 1 });
UserSchema.index({ email: 1, isActive: 1 }); // For authentication queries
UserSchema.index({ tenantId: 1, lastLogin: -1 }); // For recent activity queries

// Pre-save middleware to hash password
UserSchema.pre('save', async function (next) {
  const user = this as IUser;

  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to find user by tenant
UserSchema.statics.findByTenant = function (tenantId: string) {
  return this.find({ tenantId });
};

// Static method to find active users by tenant
UserSchema.statics.findActiveByTenant = function (tenantId: string) {
  return this.find({ tenantId, isActive: true });
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);