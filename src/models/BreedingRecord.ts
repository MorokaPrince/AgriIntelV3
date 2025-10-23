import mongoose, { Document, Schema } from 'mongoose';

export interface IBreedingRecord extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: string;
  programName: string;
  species: string;
  breed: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  totalAnimals: number;
  breedingFemales: number;
  breedingMales: number;
  expectedOffspring: number;
  actualOffspring: number;
  successRate: number;
  goals: string[];
  manager: string;
  budget: number;
  currency: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BreedingRecordSchema = new Schema<IBreedingRecord>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    programName: {
      type: String,
      required: true,
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
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function(value: Date) {
          return value >= this.startDate;
        },
        message: 'End date must be after or equal to start date',
      },
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'completed', 'cancelled'],
      default: 'planning',
    },
    totalAnimals: {
      type: Number,
      required: true,
      min: 0,
    },
    breedingFemales: {
      type: Number,
      required: true,
      min: 0,
    },
    breedingMales: {
      type: Number,
      required: true,
      min: 0,
    },
    expectedOffspring: {
      type: Number,
      required: true,
      min: 0,
    },
    actualOffspring: {
      type: Number,
      default: 0,
      min: 0,
    },
    successRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    goals: [{
      type: String,
      trim: true,
    }],
    manager: {
      type: String,
      required: true,
      trim: true,
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    createdBy: {
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
BreedingRecordSchema.index({ tenantId: 1, species: 1 });
BreedingRecordSchema.index({ tenantId: 1, status: 1 });
BreedingRecordSchema.index({ tenantId: 1, startDate: -1 });
BreedingRecordSchema.index({ tenantId: 1, endDate: -1 });

// Compound indexes for common query patterns
BreedingRecordSchema.index({ tenantId: 1, status: 1, species: 1 }); // Filter by status and species
BreedingRecordSchema.index({ tenantId: 1, startDate: -1, endDate: -1 }); // Date range queries
BreedingRecordSchema.index({ tenantId: 1, status: 1, startDate: -1 }); // Active programs by start date

// Virtual for program duration in days
BreedingRecordSchema.virtual('durationDays').get(function () {
  if (!this.startDate || !this.endDate) return 0;
  const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for offspring per female
BreedingRecordSchema.virtual('offspringPerFemale').get(function () {
  if (this.breedingFemales > 0) {
    return this.actualOffspring / this.breedingFemales;
  }
  return 0;
});

// Pre-save middleware to calculate success rate
BreedingRecordSchema.pre('save', function (next) {
  if (this.isModified('actualOffspring') || this.isModified('expectedOffspring')) {
    if (this.expectedOffspring > 0) {
      this.successRate = (this.actualOffspring / this.expectedOffspring) * 100;
    }
  }
  next();
});

// Static method to find active programs
BreedingRecordSchema.statics.findActivePrograms = function (tenantId: string) {
  return this.find({
    tenantId,
    status: 'active',
    endDate: { $gte: new Date() },
  });
};

// Static method to find completed programs
BreedingRecordSchema.statics.findCompletedPrograms = function (tenantId: string) {
  return this.find({
    tenantId,
    status: 'completed',
  });
};

export default mongoose.models.BreedingRecord || mongoose.model<IBreedingRecord>('BreedingRecord', BreedingRecordSchema);