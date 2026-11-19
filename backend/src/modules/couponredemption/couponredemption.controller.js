import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
  getUserRedemptions,
  getRedemptionById,
  listAllRedemptions,
  getRedemptionAnalytics,
} from './couponredemption.service.js';

// ─────────────────────────────────────────────
// GET /api/v1/coupon-redemptions/my-redemptions (Protected - Customer)
// ─────────────────────────────────────────────
export const getUserRedemptionsController = asyncHandler(async (req, res) => {
  const result = await getUserRedemptions({
    userId: req.user._id,
    page: req.query.page,
    limit: req.query.limit,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Your coupon redemptions fetched successfully'));
});

// ─────────────────────────────────────────────
// GET /api/v1/coupon-redemptions/analytics (Protected - Admin)
// ─────────────────────────────────────────────
export const getRedemptionAnalyticsController = asyncHandler(async (req, res) => {
  const result = await getRedemptionAnalytics({
    couponId: req.query.couponId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Coupon redemption analytics fetched successfully'));
});

// ─────────────────────────────────────────────
// GET /api/v1/coupon-redemptions/:id (Protected)
// ─────────────────────────────────────────────
export const getRedemptionByIdController = asyncHandler(async (req, res) => {
  const redemption = await getRedemptionById(req.params.id, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, { redemption }, 'Coupon redemption record fetched successfully'));
});

// ─────────────────────────────────────────────
// GET /api/v1/coupon-redemptions (Protected - Admin)
// ─────────────────────────────────────────────
export const listAllRedemptionsController = asyncHandler(async (req, res) => {
  const result = await listAllRedemptions(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Coupon redemptions list fetched successfully'));
});
