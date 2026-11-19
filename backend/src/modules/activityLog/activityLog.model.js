import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    actorName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    actorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      index: true,
    },
    actorRole: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    entityType: {
      type: String,
      enum: [
        'order',
        'restaurant',
        'menu',
        'food_category',
        'address',
        'cart',
        'payment',
        'delivery',
        'coupon',
        'coupon_redemption',
        'review',
        'user',
        'notification',
        'system',
        'other',
      ],
      default: 'other',
      index: true,
    },
    entityId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    method: {
      type: String,
      required: true,
      enum: ['POST', 'PUT', 'PATCH', 'DELETE'],
    },
    route: {
      type: String,
      required: true,
      trim: true,
      maxlength: 240,
    },
    ipAddress: {
      type: String,
      trim: true,
      default: null,
    },
    userAgent: {
      type: String,
      trim: true,
      default: null,
      maxlength: 500,
    },
    outcome: {
      type: String,
      required: true,
      enum: ['success', 'failure'],
      index: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ actorId: 1, createdAt: -1 });
activityLogSchema.index({ actorEmail: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });
activityLogSchema.index({ outcome: 1, createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
