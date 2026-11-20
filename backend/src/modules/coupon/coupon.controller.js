import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
  createCoupon,
  getAvailableCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  listCoupons,
  validateAndCalculateCoupon,
} from './coupon.service.js';

// ─────────────────────────────────────────────
// POST /api/v1/coupons/apply (Public or Protected)
// ─────────────────────────────────────────────
export const applyCouponController = asyncHandler(async (req, res) => {
  const { code, subtotal, restaurantId } = req.body;
  const userId = req.user?._id || null;

  const result = await validateAndCalculateCoupon({
    code,
    subtotal: Number(subtotal),
    userId,
    restaurantId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, `Coupon '${result.coupon.code}' applied successfully`));
});

// ─────────────────────────────────────────────
// GET /api/v1/coupons/available (Public)
// ─────────────────────────────────────────────
export const getAvailableCouponsController = asyncHandler(async (req, res) => {
  const { restaurantId, subtotal } = req.query;
  const coupons = await getAvailableCoupons({ restaurantId, subtotal });

  return res
    .status(200)
    .json(new ApiResponse(200, { coupons }, 'Available coupons fetched successfully'));
});

// ─────────────────────────────────────────────
// GET /api/v1/coupons/:id (Protected)
// ─────────────────────────────────────────────
export const getCouponByIdController = asyncHandler(async (req, res) => {
  const coupon = await getCouponById(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, { coupon }, 'Coupon details fetched successfully'));
});

// ─────────────────────────────────────────────
// POST /api/v1/coupons (Protected - Admin)
// ─────────────────────────────────────────────
export const createCouponController = asyncHandler(async (req, res) => {
  const coupon = await createCoupon(req.body, req.user);
  return res
    .status(201)
    .json(new ApiResponse(201, { coupon }, `Coupon '${coupon.code}' created successfully`));
});

// ─────────────────────────────────────────────
// PATCH /api/v1/coupons/:id (Protected - Admin)
// ─────────────────────────────────────────────
export const updateCouponController = asyncHandler(async (req, res) => {
  const coupon = await updateCoupon(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, { coupon }, `Coupon '${coupon.code}' updated successfully`));
});

// ─────────────────────────────────────────────
// DELETE /api/v1/coupons/:id (Protected - Admin)
// ─────────────────────────────────────────────
export const deleteCouponController = asyncHandler(async (req, res) => {
  const result = await deleteCoupon(req.params.id);
  return res.status(200).json(new ApiResponse(200, result, 'Coupon deleted successfully'));
});

// ─────────────────────────────────────────────
// GET /api/v1/coupons (Protected - Admin)
// ─────────────────────────────────────────────
export const listCouponsAdminController = asyncHandler(async (req, res) => {
  const result = await listCoupons(req.query);
  return res.status(200).json(new ApiResponse(200, result, 'Coupons list fetched successfully'));
});
