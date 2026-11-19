import mongoose from 'mongoose';
import CouponRedemption from './couponredemption.model.js';
import Coupon from '../coupon/coupon.model.js';
import { ApiError } from '../../utils/ApiError.js';
import logger from '../../config/logger.js';

// ─────────────────────────────────────────────
// RECORD COUPON REDEMPTION (Called on Order Placement)
// ─────────────────────────────────────────────
export const recordRedemption = async ({
  couponId = null,
  code,
  userId,
  orderId,
  discountAmount,
  orderAmount,
}) => {
  if (!code || !userId || !orderId) {
    throw new ApiError(400, 'code, userId, and orderId are required to record redemption');
  }

  const cleanCode = code.toUpperCase().trim();

  // Find coupon in DB if couponId not provided
  let couponDoc;
  if (couponId) {
    couponDoc = await Coupon.findById(couponId);
  } else {
    couponDoc = await Coupon.findOne({ code: cleanCode, isDeleted: false });
  }

  // Ensure no duplicate redemption on the same order
  const existing = await CouponRedemption.findOne({
    order: orderId,
    code: cleanCode,
  });
  if (existing) {
    return existing;
  }

  const redemption = await CouponRedemption.create({
    coupon: couponDoc?._id || new mongoose.Types.ObjectId(),
    user: userId,
    order: orderId,
    code: cleanCode,
    discountAmount: Number(discountAmount) || 0,
    orderAmount: Number(orderAmount) || 0,
    status: 'redeemed',
    redeemedAt: new Date(),
  });

  // Increment coupon used count if coupon exists in DB
  if (couponDoc) {
    await Coupon.findByIdAndUpdate(couponDoc._id, { $inc: { usedCount: 1 } });
  }

  return redemption;
};

// ─────────────────────────────────────────────
// CANCEL REDEMPTION (Called on Order Cancellation)
// ─────────────────────────────────────────────
export const cancelRedemption = async ({ orderId, reason = 'Order cancelled' }) => {
  const redemption = await CouponRedemption.findOne({ order: orderId });
  if (!redemption) {
    return null;
  }

  if (redemption.status === 'redeemed') {
    redemption.status = 'cancelled';
    redemption.cancelledAt = new Date();
    redemption.cancellationReason = reason;
    await redemption.save();

    // Roll back used count on the coupon so user can use it again
    if (redemption.coupon) {
      await Coupon.findByIdAndUpdate(redemption.coupon, {
        $inc: { usedCount: -1 },
      }).catch((err) =>
        logger.error('[CouponRedemption] Failed to decrement usedCount:', {
          error: err.message,
        }),
      );
    }
  }

  return redemption;
};

// ─────────────────────────────────────────────
// GET LOGGED-IN USER'S REDEMPTIONS & SAVINGS
// ─────────────────────────────────────────────
export const getUserRedemptions = async ({ userId, page = 1, limit = 20 }) => {
  const skip = (Number(page) - 1) * Number(limit);

  const [redemptions, total, savingsResult] = await Promise.all([
    CouponRedemption.find({ user: userId })
      .populate('coupon', 'name code discountType discountValue maxDiscount')
      .populate('order', 'orderNumber orderStatus totalAmount createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    CouponRedemption.countDocuments({ user: userId }),
    CouponRedemption.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          status: 'redeemed',
        },
      },
      {
        $group: {
          _id: null,
          totalSavings: { $sum: '$discountAmount' },
          totalRedeemed: { $sum: 1 },
        },
      },
    ]),
  ]);

  const totalSavings = savingsResult[0]?.totalSavings || 0;
  const totalRedeemedCount = savingsResult[0]?.totalRedeemed || 0;

  return {
    redemptions,
    summary: {
      totalSavings: Math.round(totalSavings * 100) / 100,
      totalRedeemed: totalRedeemedCount,
    },
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

// ─────────────────────────────────────────────
// GET REDEMPTION BY ID
// ─────────────────────────────────────────────
export const getRedemptionById = async (redemptionId, user) => {
  const redemption = await CouponRedemption.findById(redemptionId)
    .populate('coupon')
    .populate('user', 'fullName email mobile')
    .populate('order');

  if (!redemption) {
    throw new ApiError(404, 'Coupon redemption record not found');
  }

  // Author check: only the owner or an admin can view
  if (redemption.user._id.toString() !== user._id.toString() && user.role !== 'admin') {
    throw new ApiError(403, 'You do not have access to this redemption record');
  }

  return redemption;
};

// ─────────────────────────────────────────────
// LIST REDEMPTIONS (Admin / Restaurant Owner)
// ─────────────────────────────────────────────
export const listAllRedemptions = async ({
  couponId,
  userId,
  orderId,
  status,
  code,
  page = 1,
  limit = 20,
}) => {
  const filter = {};

  if (couponId) filter.coupon = couponId;
  if (userId) filter.user = userId;
  if (orderId) filter.order = orderId;
  if (status) filter.status = status;
  if (code) filter.code = code.toUpperCase().trim();

  const skip = (Number(page) - 1) * Number(limit);

  const [redemptions, total] = await Promise.all([
    CouponRedemption.find(filter)
      .populate('user', 'fullName email mobile')
      .populate('coupon', 'name code discountType discountValue')
      .populate('order', 'orderNumber orderStatus totalAmount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    CouponRedemption.countDocuments(filter),
  ]);

  return {
    redemptions,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

// ─────────────────────────────────────────────
// REDEMPTION ANALYTICS (Admin)
// ─────────────────────────────────────────────
export const getRedemptionAnalytics = async ({ couponId = null }) => {
  const match = {};
  if (couponId) {
    match.coupon = new mongoose.Types.ObjectId(couponId);
  }

  const [stats, statusBreakdown] = await Promise.all([
    CouponRedemption.aggregate([
      { $match: { ...match, status: 'redeemed' } },
      {
        $group: {
          _id: null,
          totalDiscountDisbursed: { $sum: '$discountAmount' },
          totalOrderValueGenerated: { $sum: '$orderAmount' },
          totalRedeemedCount: { $sum: 1 },
          averageDiscount: { $avg: '$discountAmount' },
        },
      },
    ]),
    CouponRedemption.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const summary = stats[0] || {
    totalDiscountDisbursed: 0,
    totalOrderValueGenerated: 0,
    totalRedeemedCount: 0,
    averageDiscount: 0,
  };

  const countsByStatus = { redeemed: 0, cancelled: 0, pending: 0 };
  statusBreakdown.forEach((s) => {
    countsByStatus[s._id] = s.count;
  });

  return {
    analytics: {
      totalDiscountDisbursed: Math.round(summary.totalDiscountDisbursed * 100) / 100,
      totalOrderValueGenerated: Math.round(summary.totalOrderValueGenerated * 100) / 100,
      totalRedeemedCount: summary.totalRedeemedCount,
      averageDiscount: Math.round(summary.averageDiscount * 100) / 100,
      countsByStatus,
    },
  };
};
