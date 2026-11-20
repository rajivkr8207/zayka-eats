import mongoose from 'mongoose';

const couponRedemptionSchema = new mongoose.Schema(
  {
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },

    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    orderAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ['pending', 'redeemed', 'cancelled'],
      default: 'pending',
      index: true,
    },

    redeemedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent the same coupon being applied twice to the same order
couponRedemptionSchema.index({ coupon: 1, order: 1 }, { unique: true });

// User's coupon redemption history
couponRedemptionSchema.index({ user: 1, createdAt: -1 });

// Coupon usage statistics
couponRedemptionSchema.index({ coupon: 1, status: 1 });

const CouponRedemption = mongoose.model('CouponRedemption', couponRedemptionSchema);

export default CouponRedemption;
