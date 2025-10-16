import mongoose, { Document, Schema } from 'mongoose';

export interface IRFIDRecord extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: string;
  tagId: string;
  animalId: mongoose.Types.ObjectId;
  animalName: string;
  species: string;
  breed: string;
  tagType: 'ear_tag' | 'bolus' | 'collar' | 'leg_band';
  frequency: string;
  installationDate: Date;
  lastScan: Date;
  batteryLevel: number;
  signalStrength: 'excellent' | 'good' | 'fair' | 'poor';
  location: string;
  status: 'active' | 'maintenance' | 'offline' | 'error';
  temperature?: number;
  healthAlerts: number;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RFIDRecordSchema = new Schema<IRFIDRecord>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    tagId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    animalId: {
      type: Schema.Types.ObjectId,
      ref: 'Animal',
      required: true,
    },
    animalName: {
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
    tagType: {
      type: String,
      required: true,
      enum: ['ear_tag', 'bolus', 'collar', 'leg_band'],
    },
    frequency: {
      type: String,
      required: true,
      default: '134.2 kHz',
    },
    installationDate: {
      type: Date,
      required: true,
    },
    lastScan: {
      type: Date,
      required: true,
      default: Date.now,
    },
    batteryLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    signalStrength: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good',
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'offline', 'error'],
      default: 'active',
    },
    temperature: {
      type: Number,
      min: 0,
    },
    healthAlerts: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      maxlength: 500,
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
RFIDRecordSchema.index({ tenantId: 1, tagId: 1 }, { unique: true });
RFIDRecordSchema.index({ tenantId: 1, animalId: 1 });
RFIDRecordSchema.index({ tenantId: 1, status: 1 });
RFIDRecordSchema.index({ tenantId: 1, lastScan: -1 });
RFIDRecordSchema.index({ tenantId: 1, batteryLevel: 1 });

// Virtual for days since last scan
RFIDRecordSchema.virtual('daysSinceLastScan').get(function () {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - this.lastScan.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for battery status
RFIDRecordSchema.virtual('batteryStatus').get(function () {
  if (this.batteryLevel >= 80) return 'good';
  if (this.batteryLevel >= 50) return 'medium';
  if (this.batteryLevel >= 20) return 'low';
  return 'critical';
});

// Pre-save middleware to update animal name if not provided
RFIDRecordSchema.pre('save', async function (next) {
  if (this.isModified('animalId') && !this.animalName) {
    try {
      const Animal = mongoose.model('Animal');
      const animal = await Animal.findById(this.animalId);
      if (animal) {
        this.animalName = animal.name || `Animal ${animal._id}`;
      }
    } catch (error) {
      console.error('Error updating animal name in RFID record:', error);
    }
  }
  next();
});

// Static method to find devices needing maintenance
RFIDRecordSchema.statics.findNeedingMaintenance = function (tenantId: string) {
  return this.find({
    tenantId,
    $or: [
      { batteryLevel: { $lt: 20 } },
      { status: 'maintenance' },
      { status: 'error' },
      { daysSinceLastScan: { $gt: 7 } }
    ]
  });
};

// Static method to find active devices
RFIDRecordSchema.statics.findActiveDevices = function (tenantId: string) {
  return this.find({
    tenantId,
    status: 'active',
  });
};

export default mongoose.models.RFIDRecord || mongoose.model<IRFIDRecord>('RFIDRecord', RFIDRecordSchema);