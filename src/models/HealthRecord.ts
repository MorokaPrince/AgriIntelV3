import mongoose, { Document, Schema } from 'mongoose';

export interface IHealthRecord extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: string;
  animalId: mongoose.Types.ObjectId;
  animalRfid: string;
  recordType: 'checkup' | 'vaccination' | 'treatment' | 'surgery' | 'emergency' | 'quarantine';
  date: Date;
  veterinarian: string;
  veterinarianId?: mongoose.Types.ObjectId;
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: number; // in days
    instructions: string;
  }>;
  vaccinations: Array<{
    vaccine: string;
    batchNumber: string;
    manufacturer: string;
    nextDueDate: Date;
    notes: string;
  }>;
  tests: Array<{
    testType: string;
    result: string;
    normalRange: string;
    notes: string;
  }>;
  followUp: {
    required: boolean;
    date?: Date;
    instructions: string;
  };
  cost: {
    consultationFee: number;
    medicationCost: number;
    testCost: number;
    totalCost: number;
    currency: string;
  };
  notes: string;
  attachments: Array<{
    type: 'image' | 'document' | 'lab_result';
    url: string;
    filename: string;
    uploadedAt: Date;
  }>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'chronic' | 'monitoring';
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const HealthRecordSchema = new Schema<IHealthRecord>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    animalId: {
      type: Schema.Types.ObjectId,
      ref: 'Animal',
      required: true,
    },
    animalRfid: {
      type: String,
      required: true,
      index: true,
    },
    recordType: {
      type: String,
      required: true,
      enum: ['checkup', 'vaccination', 'treatment', 'surgery', 'emergency', 'quarantine'],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    veterinarian: {
      type: String,
      required: true,
    },
    veterinarianId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    diagnosis: {
      type: String,
      required: true,
    },
    symptoms: [{
      type: String,
    }],
    treatment: {
      type: String,
      required: true,
    },
    medications: [{
      name: { type: String, required: true },
      dosage: { type: String, required: true },
      frequency: { type: String, required: true },
      duration: { type: Number, required: true, min: 1 },
      instructions: { type: String },
    }],
    vaccinations: [{
      vaccine: { type: String, required: true },
      batchNumber: { type: String, required: true },
      manufacturer: { type: String, required: true },
      nextDueDate: { type: Date, required: true },
      notes: { type: String },
    }],
    tests: [{
      testType: { type: String, required: true },
      result: { type: String, required: true },
      normalRange: { type: String },
      notes: { type: String },
    }],
    followUp: {
      required: { type: Boolean, default: false },
      date: { type: Date },
      instructions: { type: String },
    },
    cost: {
      consultationFee: { type: Number, default: 0, min: 0 },
      medicationCost: { type: Number, default: 0, min: 0 },
      testCost: { type: Number, default: 0, min: 0 },
      totalCost: { type: Number, default: 0, min: 0 },
      currency: { type: String, default: 'USD' },
    },
    notes: {
      type: String,
      maxlength: 2000,
    },
    attachments: [{
      type: {
        type: String,
        enum: ['image', 'document', 'lab_result'],
        required: true,
      },
      url: { type: String, required: true },
      filename: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    }],
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'chronic', 'monitoring'],
      default: 'active',
    },
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
HealthRecordSchema.index({ tenantId: 1, animalId: 1 });
HealthRecordSchema.index({ tenantId: 1, animalRfid: 1 });
HealthRecordSchema.index({ tenantId: 1, recordType: 1 });
HealthRecordSchema.index({ tenantId: 1, date: -1 });
HealthRecordSchema.index({ tenantId: 1, severity: 1 });
HealthRecordSchema.index({ tenantId: 1, status: 1 });
HealthRecordSchema.index({ tenantId: 1, veterinarian: 1 });

// Pre-save middleware to calculate total cost
HealthRecordSchema.pre('save', function (next) {
  const record = this as IHealthRecord;

  record.cost.totalCost =
    record.cost.consultationFee +
    record.cost.medicationCost +
    record.cost.testCost;

  next();
});

// Virtual for days until follow-up
HealthRecordSchema.virtual('daysUntilFollowUp').get(function (this: IHealthRecord) {
  if (!this.followUp.required || !this.followUp.date) {
    return null;
  }

  const now = new Date();
  const followUpDate = new Date(this.followUp.date);
  const diffTime = followUpDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
});

// Static method to find records by tenant
HealthRecordSchema.statics.findByTenant = function (tenantId: string) {
  return this.find({ tenantId });
};

// Static method to find overdue follow-ups
HealthRecordSchema.statics.findOverdueFollowUps = function (tenantId: string) {
  return this.find({
    tenantId,
    'followUp.required': true,
    'followUp.date': { $lt: new Date() },
    status: { $in: ['active', 'monitoring'] },
  });
};

// Static method to find critical health issues
HealthRecordSchema.statics.findCriticalIssues = function (tenantId: string) {
  return this.find({
    tenantId,
    severity: 'critical',
    status: { $in: ['active', 'monitoring'] },
  });
};

export default mongoose.models.HealthRecord || mongoose.model<IHealthRecord>('HealthRecord', HealthRecordSchema);