import mongoose, { Document, Schema } from 'mongoose';

export interface IAnimal extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: string;
  rfidTag: string;
  name?: string;
  species: 'cattle' | 'sheep' | 'goats' | 'poultry' | 'pigs' | 'other';
  breed: string;
  dateOfBirth: Date;
  gender: 'male' | 'female';
  color: string;
  weight: number;
  height?: number;
  status: 'active' | 'sold' | 'deceased' | 'quarantined' | 'breeding';
  location: {
    latitude: number;
    longitude: number;
    address: string;
    farmSection: string;
  };
  parentage: {
    sireId?: mongoose.Types.ObjectId;
    damId?: mongoose.Types.ObjectId;
    sireName?: string;
    damName?: string;
  };
  purchaseInfo?: {
    purchaseDate: Date;
    purchasePrice: number;
    currency: string;
    supplier: string;
  };
  saleInfo?: {
    saleDate: Date;
    salePrice: number;
    currency: string;
    buyer: string;
  };
  health: {
    overallCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    lastCheckup: Date;
    nextCheckup: Date;
    vaccinations: Array<{
      vaccine: string;
      date: Date;
      nextDue: Date;
      veterinarian: string;
    }>;
    diseases: Array<{
      disease: string;
      diagnosisDate: Date;
      treatment: string;
      status: 'active' | 'recovered' | 'chronic';
    }>;
  };
  breeding: {
    isBreedingStock: boolean;
    fertilityStatus: 'fertile' | 'subfertile' | 'infertile';
    lastBreedingDate?: Date;
    expectedCalvingDate?: Date;
    offspring: mongoose.Types.ObjectId[];
  };
  nutrition: {
    dailyFeedIntake: number;
    feedType: string;
    supplements: string[];
    feedingSchedule: string;
  };
  productivity: {
    milkProduction?: number;
    eggProduction?: number;
    weightGain: number;
    lastMeasurement: Date;
  };
  images: Array<{
    url: string;
    caption: string;
    uploadedAt: Date;
  }>;
  notes: string;
  alerts: Array<{
    type: 'health' | 'breeding' | 'nutrition' | 'maintenance';
    message: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    createdAt: Date;
    resolved: boolean;
    resolvedAt?: Date;
  }>;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  // Virtual properties
  age: number;
  currentValue: number;
}

const AnimalSchema = new Schema<IAnimal>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    rfidTag: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    name: {
      type: String,
      trim: true,
    },
    species: {
      type: String,
      required: true,
      enum: ['cattle', 'sheep', 'goats', 'poultry', 'pigs', 'other'],
    },
    breed: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female'],
    },
    color: {
      type: String,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    height: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'sold', 'deceased', 'quarantined', 'breeding'],
      default: 'active',
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String, required: true },
      farmSection: { type: String, required: true },
    },
    parentage: {
      sireId: { type: Schema.Types.ObjectId, ref: 'Animal' },
      damId: { type: Schema.Types.ObjectId, ref: 'Animal' },
      sireName: { type: String },
      damName: { type: String },
    },
    purchaseInfo: {
      purchaseDate: { type: Date },
      purchasePrice: { type: Number, min: 0 },
      currency: { type: String, default: 'USD' },
      supplier: { type: String },
    },
    saleInfo: {
      saleDate: { type: Date },
      salePrice: { type: Number, min: 0 },
      currency: { type: String, default: 'USD' },
      buyer: { type: String },
    },
    health: {
      overallCondition: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor', 'critical'],
        default: 'good',
      },
      lastCheckup: { type: Date, default: Date.now },
      nextCheckup: { type: Date, default: Date.now },
      vaccinations: [{
        vaccine: { type: String, required: true },
        date: { type: Date, required: true },
        nextDue: { type: Date, required: true },
        veterinarian: { type: String, required: true },
      }],
      diseases: [{
        disease: { type: String, required: true },
        diagnosisDate: { type: Date, required: true },
        treatment: { type: String, required: true },
        status: {
          type: String,
          enum: ['active', 'recovered', 'chronic'],
          default: 'active',
        },
      }],
    },
    breeding: {
      isBreedingStock: { type: Boolean, default: false },
      fertilityStatus: {
        type: String,
        enum: ['fertile', 'subfertile', 'infertile'],
        default: 'fertile',
      },
      lastBreedingDate: { type: Date },
      expectedCalvingDate: { type: Date },
      offspring: [{ type: Schema.Types.ObjectId, ref: 'Animal' }],
    },
    nutrition: {
      dailyFeedIntake: { type: Number, required: true, min: 0 },
      feedType: { type: String, required: true },
      supplements: [{ type: String }],
      feedingSchedule: { type: String, required: true },
    },
    productivity: {
      milkProduction: { type: Number, min: 0 },
      eggProduction: { type: Number, min: 0 },
      weightGain: { type: Number, default: 0 },
      lastMeasurement: { type: Date, default: Date.now },
    },
    images: [{
      url: { type: String, required: true },
      caption: { type: String },
      uploadedAt: { type: Date, default: Date.now },
    }],
    notes: {
      type: String,
      maxlength: 2000,
    },
    alerts: [{
      type: {
        type: String,
        enum: ['health', 'breeding', 'nutrition', 'maintenance'],
        required: true,
      },
      message: { type: String, required: true },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
      },
      createdAt: { type: Date, default: Date.now },
      resolved: { type: Boolean, default: false },
      resolvedAt: { type: Date },
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
AnimalSchema.index({ tenantId: 1, rfidTag: 1 }, { unique: true });
AnimalSchema.index({ tenantId: 1, species: 1 });
AnimalSchema.index({ tenantId: 1, status: 1 });
AnimalSchema.index({ tenantId: 1, 'location.farmSection': 1 });
AnimalSchema.index({ tenantId: 1, 'health.overallCondition': 1 });
AnimalSchema.index({ tenantId: 1, dateOfBirth: -1 });
AnimalSchema.index({ tenantId: 1, createdAt: -1 });

// Virtual for age calculation
AnimalSchema.virtual('age').get(function () {
  const now = new Date();
  const birth = new Date(this.dateOfBirth);
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }

  return age;
});

// Virtual for current value
AnimalSchema.virtual('currentValue').get(function (this: IAnimal) {
  if (this.purchaseInfo && this.purchaseInfo.purchasePrice) {
    // Simple depreciation calculation - can be enhanced
    const now = new Date();
    const birth = new Date(this.dateOfBirth);
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }

    const depreciationRate = 0.1; // 10% per year
    return Math.max(0, this.purchaseInfo.purchasePrice * Math.pow(1 - depreciationRate, age));
  }
  return 0;
});

// Pre-save middleware to update next checkup date
AnimalSchema.pre('save', function (next) {
  if (this.isModified('health.lastCheckup')) {
    // Set next checkup to 30 days from last checkup
    const nextCheckup = new Date(this.health.lastCheckup);
    nextCheckup.setDate(nextCheckup.getDate() + 30);
    this.health.nextCheckup = nextCheckup;
  }
  next();
});

// Static method to find animals by tenant
AnimalSchema.statics.findByTenant = function (tenantId: string) {
  return this.find({ tenantId });
};

// Static method to find animals needing checkup
AnimalSchema.statics.findNeedingCheckup = function (tenantId: string) {
  return this.find({
    tenantId,
    'health.nextCheckup': { $lte: new Date() },
    status: { $in: ['active', 'breeding'] },
  });
};

export default mongoose.models.Animal || mongoose.model<IAnimal>('Animal', AnimalSchema);