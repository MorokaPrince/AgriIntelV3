import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: string;
  title: string;
  description: string;
  assignedTo: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  dueDate: Date;
  completedDate?: Date;
  category: 'feeding' | 'health' | 'maintenance' | 'breeding' | 'financial' | 'general';
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  progress: number;
  dependencies?: mongoose.Types.ObjectId[];
  attachments?: string[];
  notes?: string;
  location?: string;
  animalId?: mongoose.Types.ObjectId;
  kpi?: {
    efficiency?: number;
    quality?: number;
    timeliness?: number;
    safety?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled', 'overdue'],
      default: 'pending',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    completedDate: {
      type: Date,
    },
    category: {
      type: String,
      enum: ['feeding', 'health', 'maintenance', 'breeding', 'financial', 'general'],
      required: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    estimatedHours: {
      type: Number,
      min: 0,
    },
    actualHours: {
      type: Number,
      min: 0,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    dependencies: [{
      type: Schema.Types.ObjectId,
      ref: 'Task',
    }],
    attachments: [{
      type: String,
    }],
    notes: {
      type: String,
      maxlength: 2000,
    },
    location: {
      type: String,
      trim: true,
    },
    animalId: {
      type: Schema.Types.ObjectId,
      ref: 'Animal',
    },
    kpi: {
      efficiency: { type: Number, min: 0, max: 100 },
      quality: { type: Number, min: 0, max: 100 },
      timeliness: { type: Number, min: 0, max: 100 },
      safety: { type: Number, min: 0, max: 100 },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
TaskSchema.index({ tenantId: 1, status: 1 });
TaskSchema.index({ tenantId: 1, assignedTo: 1 });
TaskSchema.index({ tenantId: 1, category: 1 });
TaskSchema.index({ tenantId: 1, dueDate: 1 });
TaskSchema.index({ tenantId: 1, priority: 1 });

// Virtual for overdue status
TaskSchema.virtual('isOverdue').get(function () {
  return this.dueDate < new Date() && this.status !== 'completed';
});

// Virtual for completion rate
TaskSchema.virtual('completionRate').get(function () {
  if (this.estimatedHours && this.actualHours) {
    return Math.min((this.actualHours / this.estimatedHours) * 100, 100);
  }
  return this.progress;
});

// Pre-save middleware to update status based on progress
TaskSchema.pre('save', function (next) {
  if (this.isModified('progress')) {
    if (this.progress === 100 && this.status === 'in_progress') {
      this.status = 'completed';
      this.completedDate = new Date();
    } else if (this.progress > 0 && this.progress < 100 && this.status === 'pending') {
      this.status = 'in_progress';
    }
  }

  // Check for overdue
  if (this.dueDate < new Date() && !['completed', 'cancelled'].includes(this.status)) {
    this.status = 'overdue';
  }

  next();
});

// Static method to find overdue tasks
TaskSchema.statics.findOverdue = function (tenantId: string) {
  return this.find({
    tenantId,
    dueDate: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] },
  });
};

// Static method to find tasks by user
TaskSchema.statics.findByUser = function (tenantId: string, userId: string) {
  return this.find({
    tenantId,
    $or: [
      { assignedTo: userId },
      { assignedBy: userId },
    ],
  }).populate('assignedTo', 'firstName lastName').populate('assignedBy', 'firstName lastName');
};

// Static method to get task statistics
TaskSchema.statics.getTaskStats = function (tenantId: string) {
  return this.aggregate([
    { $match: { tenantId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgProgress: { $avg: '$progress' },
      },
    },
  ]);
};

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);