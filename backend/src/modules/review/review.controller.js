import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
  createReview,
  getRestaurantReviews,
  getDeliveryPartnerReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  reportReview,
  moderateReview,
  listReviewsForAdmin,
} from './review.service.js';

// ─────────────────────────────────────────────
// POST /api/v1/reviews (Protected - Customer)
// ─────────────────────────────────────────────
export const createReviewController = asyncHandler(async (req, res) => {
  const review = await createReview({
    user: req.user,
    reviewData: req.body,
    imageFiles: req.reviewFiles || [],
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { review }, 'Review submitted successfully'));
});

// ─────────────────────────────────────────────
// GET /api/v1/reviews/restaurant/:restaurantId (Public)
// ─────────────────────────────────────────────
export const getRestaurantReviewsController = asyncHandler(async (req, res) => {
  const result = await getRestaurantReviews({
    restaurantId: req.params.restaurantId,
    rating: req.query.rating,
    page: req.query.page,
    limit: req.query.limit,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Restaurant reviews fetched successfully'));
});

// ─────────────────────────────────────────────
// GET /api/v1/reviews/delivery/:partnerId (Public or Protected)
// ─────────────────────────────────────────────
export const getDeliveryReviewsController = asyncHandler(async (req, res) => {
  const result = await getDeliveryPartnerReviews({
    partnerId: req.params.partnerId,
    rating: req.query.rating,
    page: req.query.page,
    limit: req.query.limit,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Delivery partner reviews fetched successfully'));
});

// ─────────────────────────────────────────────
// GET /api/v1/reviews/my-reviews (Protected)
// ─────────────────────────────────────────────
export const getUserReviewsController = asyncHandler(async (req, res) => {
  const result = await getUserReviews({
    userId: req.user._id,
    page: req.query.page,
    limit: req.query.limit,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Your reviews fetched successfully'));
});

// ─────────────────────────────────────────────
// PATCH /api/v1/reviews/:id (Protected - Owner)
// ─────────────────────────────────────────────
export const updateReviewController = asyncHandler(async (req, res) => {
  const review = await updateReview({
    reviewId: req.params.id,
    user: req.user,
    updateData: req.body,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { review }, 'Review updated successfully'));
});

// ─────────────────────────────────────────────
// DELETE /api/v1/reviews/:id (Protected - Owner or Admin)
// ─────────────────────────────────────────────
export const deleteReviewController = asyncHandler(async (req, res) => {
  const result = await deleteReview({
    reviewId: req.params.id,
    user: req.user,
  });

  return res.status(200).json(new ApiResponse(200, result, 'Review deleted successfully'));
});

// ─────────────────────────────────────────────
// PATCH /api/v1/reviews/:id/report (Protected)
// ─────────────────────────────────────────────
export const reportReviewController = asyncHandler(async (req, res) => {
  const result = await reportReview({
    reviewId: req.params.id,
    reason: req.body.reason,
  });

  return res.status(200).json(new ApiResponse(200, result, 'Review reported for moderation'));
});

// ─────────────────────────────────────────────
// PATCH /api/v1/reviews/:id/moderate (Protected - Admin)
// ─────────────────────────────────────────────
export const moderateReviewController = asyncHandler(async (req, res) => {
  const review = await moderateReview({
    reviewId: req.params.id,
    isVisible: req.body.isVisible,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { review },
        `Review visibility set to ${review.isVisible ? 'VISIBLE' : 'HIDDEN'}`,
      ),
    );
});

// ─────────────────────────────────────────────
// GET /api/v1/reviews/admin (Protected - Admin)
// ─────────────────────────────────────────────
export const listReviewsAdminController = asyncHandler(async (req, res) => {
  const result = await listReviewsForAdmin(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Admin reviews list fetched successfully'));
});
