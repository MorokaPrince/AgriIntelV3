import mongoose, { Document, Schema } from 'mongoose';

export interface IFinancialRecord extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: string;
  recordType: 'income' | 'expense' | 'transfer' | 'loan' | 'investment';
  category: string;
  subcategory: string;
  amount: number;
  currency: string;
  exchangeRate?: number; // to USD for reporting
  date: Date;
  description: string;
  reference: string; // invoice number, receipt number, etc.
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_money' | 'check' | 'credit_card' | 'other';
  paymentDetails: {
    mobileMoneyProvider?: string;
    bankName?: string;
    accountNumber?: string;
    transactionId?: string;
    checkNumber?: string;
  };
  relatedEntities: {
    animalId?: mongoose.Types.ObjectId;
    animalRfid?: string;
    supplierId?: mongoose.Types.ObjectId;
    supplierName?: string;
    customerId?: mongoose.Types.ObjectId;
    customerName?: string;
  };
  tags: string[];
  attachments: Array<{
    type: 'receipt' | 'invoice' | 'contract' | 'other';
    url: string;
    filename: string;
    uploadedAt: Date;
  }>;
  recurring: {
    isRecurring: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    endDate?: Date;
    nextDueDate?: Date;
  };
  tax: {
    isTaxable: boolean;
    taxAmount: number;
    taxRate: number;
    taxCategory: string;
  };
  approval: {
    required: boolean;
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
    status: 'pending' | 'approved' | 'rejected';
  };
  status: 'draft' | 'pending' | 'completed' | 'cancelled' | 'refunded';
  notes: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FinancialRecordSchema = new Schema<IFinancialRecord>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    recordType: {
      type: String,
      required: true,
      enum: ['income', 'expense', 'transfer', 'loan', 'investment'],
    },
    category: {
      type: String,
      required: true,
    },
    subcategory: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    exchangeRate: {
      type: Number,
      min: [0, 'Exchange rate cannot be negative'],
      validate: {
        validator: function(value: number) {
          // If currency is not USD, exchange rate should be provided
          return this.currency === 'USD' || (value && value > 0);
        },
        message: 'Exchange rate is required for non-USD currencies',
      },
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['cash', 'bank_transfer', 'mobile_money', 'check', 'credit_card', 'other'],
    },
    paymentDetails: {
      mobileMoneyProvider: { type: String },
      bankName: { type: String },
      accountNumber: { type: String },
      transactionId: { type: String },
      checkNumber: { type: String },
    },
    relatedEntities: {
      animalId: { type: Schema.Types.ObjectId, ref: 'Animal' },
      animalRfid: { type: String },
      supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
      supplierName: { type: String },
      customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
      customerName: { type: String },
    },
    tags: [{
      type: String,
    }],
    attachments: [{
      type: {
        type: String,
        enum: ['receipt', 'invoice', 'contract', 'other'],
        required: true,
      },
      url: { type: String, required: true },
      filename: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    }],
    recurring: {
      isRecurring: { type: Boolean, default: false },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
      },
      endDate: { type: Date },
      nextDueDate: { type: Date },
    },
    tax: {
      isTaxable: { type: Boolean, default: false },
      taxAmount: { type: Number, default: 0, min: 0 },
      taxRate: { type: Number, default: 0, min: 0, max: 100 },
      taxCategory: { type: String },
    },
    approval: {
      required: { type: Boolean, default: false },
      approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      approvedAt: { type: Date },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'completed', 'cancelled', 'refunded'],
      default: 'pending',
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
FinancialRecordSchema.index({ tenantId: 1, recordType: 1 });
FinancialRecordSchema.index({ tenantId: 1, category: 1 });
FinancialRecordSchema.index({ tenantId: 1, date: -1 });
FinancialRecordSchema.index({ tenantId: 1, status: 1 });
FinancialRecordSchema.index({ tenantId: 1, reference: 1 }, { unique: true });
FinancialRecordSchema.index({ tenantId: 1, 'relatedEntities.animalId': 1 });
FinancialRecordSchema.index({ tenantId: 1, 'relatedEntities.supplierId': 1 });
FinancialRecordSchema.index({ tenantId: 1, 'relatedEntities.customerId': 1 });
FinancialRecordSchema.index({ tenantId: 1, 'recurring.isRecurring': 1 });

// Compound indexes for common query patterns
FinancialRecordSchema.index({ tenantId: 1, recordType: 1, date: -1 }); // Records by type and date
FinancialRecordSchema.index({ tenantId: 1, category: 1, subcategory: 1 }); // Category breakdowns
FinancialRecordSchema.index({ tenantId: 1, 'approval.status': 1 }); // Pending approvals
FinancialRecordSchema.index({ tenantId: 1, 'recurring.nextDueDate': 1 }); // Recurring transaction reminders

// Pre-save middleware to calculate tax amount
FinancialRecordSchema.pre('save', function (next) {
  if ((this as IFinancialRecord).tax.isTaxable && (this as IFinancialRecord).tax.taxRate > 0) {
    (this as IFinancialRecord).tax.taxAmount = ((this as IFinancialRecord).amount * (this as IFinancialRecord).tax.taxRate) / 100;
  } else {
    (this as IFinancialRecord).tax.taxAmount = 0;
  }

  // Set next due date for recurring transactions
  if ((this as IFinancialRecord).recurring.isRecurring && (this as IFinancialRecord).recurring.frequency) {
    const nextDate = new Date((this as IFinancialRecord).date);

    switch ((this as IFinancialRecord).recurring.frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    (this as IFinancialRecord).recurring.nextDueDate = nextDate;
  }

  next();
});

// Virtual for amount in USD
FinancialRecordSchema.virtual('amountInUSD').get(function (this: IFinancialRecord) {
  if (this.currency === 'USD') {
    return this.amount;
  }

  if (this.exchangeRate) {
    return this.amount * this.exchangeRate;
  }

  return this.amount; // fallback
});

// Static method to find records by tenant
FinancialRecordSchema.statics.findByTenant = function (tenantId: string) {
  return this.find({ tenantId });
};

// Static method to find pending approvals
FinancialRecordSchema.statics.findPendingApprovals = function (tenantId: string) {
  return this.find({
    tenantId,
    'approval.required': true,
    'approval.status': 'pending',
  });
};

// Static method to find overdue recurring transactions
FinancialRecordSchema.statics.findOverdueRecurring = function (tenantId: string) {
  return this.find({
    tenantId,
    'recurring.isRecurring': true,
    'recurring.nextDueDate': { $lt: new Date() },
    status: { $in: ['pending', 'completed'] },
  });
};

export default mongoose.models.FinancialRecord || mongoose.model<IFinancialRecord>('FinancialRecord', FinancialRecordSchema);