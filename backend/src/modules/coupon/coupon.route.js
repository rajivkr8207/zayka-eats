import { Router } from 'express';
import {
  applyCouponController,
  getAvailableCouponsController,
  getCouponByIdController,
  createCouponController,
  updateCouponController,
  deleteCouponController,
  listCouponsAdminController,
} from './coupon.controller.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';
import {
  createCouponValidation,
  updateCouponValidation,
  applyCouponValidation,
  couponIdParamValidation,
  listCouponsQueryValidation,
} from './coupon.validate.js';

const couponRouter = Router();

// ─────────────────────────────────────────────
// PUBLIC / CUSTOMER ROUTES
// ─────────────────────────────────────────────

/**
 * @route   GET /api/v1/coupons/available
 * @desc    Get currently valid active coupons (filterable by restaurantId & subtotal)
 * @access  Public
 */
couponRouter.get('/available', getAvailableCouponsController);

/**
 * @route   POST /api/v1/coupons/apply
 * @desc    Validate and calculate coupon discount for an order subtotal
 * @access  Protected (Authenticated Customer)
 */
couponRouter.post('/apply', verifyJWT, applyCouponValidation, applyCouponController);

// ─────────────────────────────────────────────
// ADMIN / RESTAURANT OWNER MANAGEMENT ROUTES
// ─────────────────────────────────────────────

/**
 * @route   GET /api/v1/coupons
 * @desc    List all coupons with pagination & search (Admin / Restaurant Owner)
 * @access  Protected (Admin / Restaurant Owner)
 */
couponRouter.get(
  '/',
  verifyJWT,
  authorizeRoles(ROLES.ADMIN, ROLES.RESTAURANT_OWNER),
  listCouponsQueryValidation,
  listCouponsAdminController,
);

/**
 * @route   GET /api/v1/coupons/:id
 * @desc    Get specific coupon details by ID
 * @access  Protected (Admin / Restaurant Owner)
 */
couponRouter.get(
  '/:id',
  verifyJWT,
  authorizeRoles(ROLES.ADMIN, ROLES.RESTAURANT_OWNER),
  couponIdParamValidation,
  getCouponByIdController,
);

/**
 * @route   POST /api/v1/coupons
 * @desc    Create a new promotional discount coupon
 * @access  Protected (Admin / Restaurant Owner)
 */
couponRouter.post(
  '/',
  verifyJWT,
  authorizeRoles(ROLES.ADMIN, ROLES.RESTAURANT_OWNER),
  createCouponValidation,
  createCouponController,
);

/**
 * @route   PATCH /api/v1/coupons/:id
 * @desc    Update coupon details, discount limits, or validity
 * @access  Protected (Admin / Restaurant Owner)
 */
couponRouter.patch(
  '/:id',
  verifyJWT,
  authorizeRoles(ROLES.ADMIN, ROLES.RESTAURANT_OWNER),
  updateCouponValidation,
  updateCouponController,
);

/**
 * @route   DELETE /api/v1/coupons/:id
 * @desc    Soft-delete/deactivate coupon
 * @access  Protected (Admin only)
 */
couponRouter.delete(
  '/:id',
  verifyJWT,
  authorizeRoles(ROLES.ADMIN),
  couponIdParamValidation,
  deleteCouponController,
);

export default couponRouter;
