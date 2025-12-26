import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: string;
  userId: mongoose.Types.ObjectId;
  type: 'vaccination' | 'task_deadline' | 'health_alert' | 'breeding_cycle' | 'feed_inventory' | 'general';
  title: string;
  message: string;
  relatedEntityType?: 'animal' | 'task' | 'health_record' | 'breeding_record' | 'feed_record';
  relatedEntityId?: mongoose.Types.ObjectId;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['vaccination', 'task_deadline', 'health_alert', 'breeding_cycle', 'feed_inventory', 'general'],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    relatedEntityType: {
      type: String,
      enum: ['animal', 'task', 'health_record', 'breeding_record', 'feed_record'],
    },
    relatedEntityId: {
      type: Schema.Types.ObjectId,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    actionUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
NotificationSchema.index({ tenantId: 1, userId: 1, isRead: 1 });
NotificationSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });
NotificationSchema.index({ tenantId: 1, type: 1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

