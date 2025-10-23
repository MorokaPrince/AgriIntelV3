import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedRecord extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: string;
  feedName: string;
  type: 'concentrate' | 'roughage' | 'supplement' | 'silage';
  currentStock: number;
  unit: string;
  minStock: number;
  maxStock: number;
  costPerUnit: number;
  supplier: string;
  expiryDate: Date;
  quality: 'premium' | 'standard' | 'basic';
  nutritionalValue: {
    protein: number;
    energy: number;
    fiber: number;
    fat: number;
    [key: string]: number | string;
  };
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FeedRecordSchema = new Schema<IFeedRecord>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    feedName: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['concentrate', 'roughage', 'supplement', 'silage'],
    },
    currentStock: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      enum: ['kg', 'tons', 'bags', 'liters'],
      default: 'kg',
    },
    minStock: {
      type: Number,
      required: [true, 'Minimum stock level is required'],
      min: [0, 'Minimum stock cannot be negative'],
    },
    maxStock: {
      type: Number,
      required: [true, 'Maximum stock level is required'],
      min: [0, 'Maximum stock cannot be negative'],
      validate: {
        validator: function(value: number) {
          return value >= this.minStock;
        },
        message: 'Maximum stock must be greater than or equal to minimum stock',
      },
    },
    costPerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    supplier: {
      type: String,
      required: true,
      trim: true,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
      validate: {
        validator: function(value: Date) {
          return value >= new Date();
        },
        message: 'Expiry date cannot be in the past',
      },
    },
    quality: {
      type: String,
      enum: ['premium', 'standard', 'basic'],
      default: 'standard',
    },
    nutritionalValue: {
      protein: { type: Number, min: 0 },
      energy: { type: Number, min: 0 },
      fiber: { type: Number, min: 0 },
      fat: { type: Number, min: 0 },
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
FeedRecordSchema.index({ tenantId: 1, type: 1 });
FeedRecordSchema.index({ tenantId: 1, currentStock: 1 });
FeedRecordSchema.index({ tenantId: 1, expiryDate: 1 });
FeedRecordSchema.index({ tenantId: 1, supplier: 1 });

// Compound indexes for common query patterns
FeedRecordSchema.index({ tenantId: 1, type: 1, currentStock: 1 }); // Stock levels by type
FeedRecordSchema.index({ tenantId: 1, expiryDate: 1, currentStock: 1 }); // Expiring items with stock
FeedRecordSchema.index({ tenantId: 1, currentStock: 1, minStock: 1 }); // Low stock alerts

// Virtual for stock status
FeedRecordSchema.virtual('stockStatus').get(function () {
  if (this.currentStock <= this.minStock) return 'low';
  if (this.currentStock >= this.maxStock) return 'full';
  return 'normal';
});

// Virtual for total value
FeedRecordSchema.virtual('totalValue').get(function () {
  return this.currentStock * this.costPerUnit;
});

// Static method to find low stock items
FeedRecordSchema.statics.findLowStock = function (tenantId: string) {
  return this.find({
    tenantId,
    currentStock: { $lte: '$minStock' },
  });
};

// Static method to find expiring soon items
FeedRecordSchema.statics.findExpiringSoon = function (tenantId: string, days: number = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    tenantId,
    expiryDate: { $lte: futureDate },
  });
};

export default mongoose.models.FeedRecord || mongoose.model<IFeedRecord>('FeedRecord', FeedRecordSchema);