import { Router } from 'express';
import {
  createReviewController,
  getRestaurantReviewsController,
  getDeliveryReviewsController,
  getUserReviewsController,
  updateReviewController,
  deleteReviewController,
  reportReviewController,
  moderateReviewController,
  listReviewsAdminController,
} from './review.controller.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/auth.middleware.js';
import { receiveReviewImages } from '../../middlewares/imageUpload.middleware.js';
import { ROLES } from '../../constants/roles.js';
import {
  createReviewValidation,
  updateReviewValidation,
  reportReviewValidation,
  moderateReviewValidation,
  reviewIdParamValidation,
  restaurantReviewsQueryValidation,
  deliveryReviewsQueryValidation,
  listReviewsQueryValidation,
} from './review.validate.js';

const reviewRouter = Router();

// ─────────────────────────────────────────────
// PUBLIC REVIEW ENDPOINTS
// ─────────────────────────────────────────────

/**
 * @route   GET /api/v1/reviews/restaurant/:restaurantId
 * @desc    Get reviews and star rating breakdown for a specific restaurant
 * @access  Public
 */
reviewRouter.get(
  '/restaurant/:restaurantId',
  restaurantReviewsQueryValidation,
  getRestaurantReviewsController,
);

/**
 * @route   GET /api/v1/reviews/delivery/:partnerId
 * @desc    Get customer reviews for a delivery partner
 * @access  Public
 */
reviewRouter.get(
  '/delivery/:partnerId',
  deliveryReviewsQueryValidation,
  getDeliveryReviewsController,
);

// ─────────────────────────────────────────────
// PROTECTED USER REVIEW ACTIONS
// ─────────────────────────────────────────────

/**
 * @route   GET /api/v1/reviews/my-reviews
 * @desc    Get all reviews authored by the authenticated user
 * @access  Protected (Customer)
 */
reviewRouter.get('/my-reviews', verifyJWT, getUserReviewsController);

/**
 * @route   POST /api/v1/reviews
 * @desc    Submit a review with rating and optional photos for delivered order
 * @access  Protected (Customer who completed order)
 */
reviewRouter.post(
  '/',
  verifyJWT,
  receiveReviewImages,
  createReviewValidation,
  createReviewController,
);

/**
 * @route   PATCH /api/v1/reviews/:id
 * @desc    Edit existing review comment or rating
 * @access  Protected (Review Author)
 */
reviewRouter.patch(
  '/:id',
  verifyJWT,
  updateReviewValidation,
  updateReviewController,
);

/**
 * @route   DELETE /api/v1/reviews/:id
 * @desc    Delete review
 * @access  Protected (Review Author or Admin)
 */
reviewRouter.delete(
  '/:id',
  verifyJWT,
  reviewIdParamValidation,
  deleteReviewController,
);

/**
 * @route   PATCH /api/v1/reviews/:id/report
 * @desc    Flag/report abusive or spam review for moderator review
 * @access  Protected (Authenticated User)
 */
reviewRouter.patch(
  '/:id/report',
  verifyJWT,
  reportReviewValidation,
  reportReviewController,
);

// ─────────────────────────────────────────────
// ADMIN MODERATION ENDPOINTS
// ─────────────────────────────────────────────

/**
 * @route   PATCH /api/v1/reviews/:id/moderate
 * @desc    Hide or approve review visibility
 * @access  Protected (Admin only)
 */
reviewRouter.patch(
  '/:id/moderate',
  verifyJWT,
  authorizeRoles(ROLES.ADMIN),
  moderateReviewValidation,
  moderateReviewController,
);

/**
 * @route   GET /api/v1/reviews/admin/all
 * @desc    List all reviews with moderation filters (reported, hidden, etc.)
 * @access  Protected (Admin only)
 */
reviewRouter.get(
  '/admin/all',
  verifyJWT,
  authorizeRoles(ROLES.ADMIN),
  listReviewsQueryValidation,
  listReviewsAdminController,
);

export default reviewRouter;
