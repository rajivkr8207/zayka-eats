import { Router } from 'express';
import {
  getUserRedemptionsController,
  getRedemptionByIdController,
  listAllRedemptionsController,
  getRedemptionAnalyticsController,
} from './couponredemption.controller.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';
import {
  listRedemptionsQueryValidation,
  redemptionIdParamValidation,
} from './couponredemption.validate.js';

const couponRedemptionRouter = Router();

// ─────────────────────────────────────────────
// CUSTOMER REDEMPTIONS
// ─────────────────────────────────────────────

/**
 * @route   GET /api/v1/coupon-redemptions/my-redemptions
 * @desc    Get user's past redeemed coupons and total money saved
 * @access  Protected (Authenticated Customer)
 */
couponRedemptionRouter.get(
  '/my-redemptions',
  verifyJWT,
  getUserRedemptionsController,
);

/**
 * @route   GET /api/v1/coupon-redemptions/analytics
 * @desc    Get overall coupon redemption metrics & financial performance
 * @access  Protected (Admin only)
 */
couponRedemptionRouter.get(
  '/analytics',
  verifyJWT,
  authorizeRoles(ROLES.ADMIN),
  getRedemptionAnalyticsController,
);

/**
 * @route   GET /api/v1/coupon-redemptions/:id
 * @desc    Get details of a specific coupon redemption
 * @access  Protected (Owner or Admin)
 */
couponRedemptionRouter.get(
  '/:id',
  verifyJWT,
  redemptionIdParamValidation,
  getRedemptionByIdController,
);

/**
 * @route   GET /api/v1/coupon-redemptions
 * @desc    List all coupon redemptions with filters (status, coupon, user, order)
 * @access  Protected (Admin / Restaurant Owner)
 */
couponRedemptionRouter.get(
  '/',
  verifyJWT,
  authorizeRoles(ROLES.ADMIN, ROLES.RESTAURANT_OWNER),
  listRedemptionsQueryValidation,
  listAllRedemptionsController,
);

export default couponRedemptionRouter;
