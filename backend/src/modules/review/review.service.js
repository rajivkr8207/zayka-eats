import mongoose from 'mongoose';
import Review from './review.model.js';
import Order from '../order/order.model.js';
import Restaurant from '../Restaurant/Restaurant.model.js';
import DeliveryPartner from '../delivery/delivery.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { ROLES } from '../../constants/roles.js';
import { UploadImageToImageKit } from '../../services/image.service.js';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// ─────────────────────────────────────────────
// RE-CALCULATE AGGREGATE RATINGS HELPER
// ─────────────────────────────────────────────
export const recalculateEntityRatings = async ({ restaurantId, deliveryPartnerId }) => {
  if (restaurantId) {
    const stats = await Review.aggregate([
      {
        $match: {
          restaurant: new mongoose.Types.ObjectId(restaurantId),
          reviewType: 'restaurant',
          isVisible: true,
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          total: { $sum: 1 },
        },
      },
    ]);

    const avg = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
    const total = stats.length > 0 ? stats[0].total : 0;

    await Restaurant.findByIdAndUpdate(restaurantId, {
      averageRating: avg,
      totalReviews: total,
    });
  }

  if (deliveryPartnerId) {
    const stats = await Review.aggregate([
      {
        $match: {
          deliveryPartner: new mongoose.Types.ObjectId(deliveryPartnerId),
          reviewType: 'delivery',
          isVisible: true,
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          total: { $sum: 1 },
        },
      },
    ]);

    const avg = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
    const total = stats.length > 0 ? stats[0].total : 0;

    await DeliveryPartner.findByIdAndUpdate(deliveryPartnerId, {
      averageRating: avg,
      totalReviews: total,
    });
  }
};

// ─────────────────────────────────────────────
// CREATE REVIEW
// ─────────────────────────────────────────────
export const createReview = async ({ user, reviewData, imageFiles = [] }) => {
  const {
    orderId,
    restaurantId,
    reviewType,
    rating,
    comment,
    foodId,
    deliveryPartnerId,
  } = reviewData;

  // 1. Verify Order exists and belongs to this user
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.user.toString() !== user._id.toString()) {
    throw new ApiError(403, 'You can only review orders placed by your account');
  }

  // 2. Reviews are only permitted after successful delivery
  if (order.orderStatus !== 'delivered') {
    throw new ApiError(
      400,
      `Reviews can only be submitted after the order has been delivered. Current status: '${order.orderStatus}'`,
    );
  }

  // 3. Verify Restaurant belongs to this order
  if (order.restaurant.toString() !== restaurantId.toString()) {
    throw new ApiError(400, 'Restaurant does not match the order');
  }

  // 4. Check for duplicate review by same user for same order and review type
  const existingReview = await Review.findOne({
    user: user._id,
    order: orderId,
    reviewType,
  });
  if (existingReview) {
    throw new ApiError(
      409,
      `You have already submitted a ${reviewType} review for this order`,
    );
  }

  // 5. Handle delivery partner binding
  let partnerToReview = null;
  if (reviewType === 'delivery') {
    if (deliveryPartnerId) {
      partnerToReview = deliveryPartnerId;
    } else if (order.deliveryPartner) {
      // Find delivery partner document
      const dp = await DeliveryPartner.findOne({ user: order.deliveryPartner });
      partnerToReview = dp?._id || null;
    }
    if (!partnerToReview) {
      throw new ApiError(400, 'No delivery partner associated with this order to review');
    }
  }

  // 6. Upload review images to ImageKit if provided
  const uploadedImageUrls = [];
  if (imageFiles && imageFiles.length > 0) {
    for (const file of imageFiles) {
      if (file.size > MAX_IMAGE_SIZE) {
        throw new ApiError(400, 'Each review image must be less than 5MB');
      }
      const ext = file.mimetype === 'image/png' ? 'png' : 'jpg';
      const upload = await UploadImageToImageKit({
        buffer: file.buffer,
        fileName: `review-${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`,
        folderPath: 'zayka/reviews',
      });
      if (upload?.url) {
        uploadedImageUrls.push(upload.url);
      }
    }
  }

  // 7. Create Review record
  const review = await Review.create({
    user: user._id,
    order: orderId,
    restaurant: restaurantId,
    food: reviewType === 'food' && foodId ? foodId : null,
    deliveryPartner: partnerToReview,
    reviewType,
    rating: Number(rating),
    comment: comment ? comment.trim() : '',
    images: uploadedImageUrls,
    isVisible: true,
  });

  // 8. Re-calculate live entity ratings in background
  recalculateEntityRatings({
    restaurantId,
    deliveryPartnerId: partnerToReview,
  }).catch((err) => console.error('Rating recalculation failed:', err));

  return review;
};

// ─────────────────────────────────────────────
// GET RESTAURANT REVIEWS & RATING BREAKDOWN
// ─────────────────────────────────────────────
export const getRestaurantReviews = async ({
  restaurantId,
  rating,
  page = 1,
  limit = 10,
}) => {
  const filter = {
    restaurant: new mongoose.Types.ObjectId(restaurantId),
    reviewType: 'restaurant',
    isVisible: true,
  };

  if (rating) {
    filter.rating = Number(rating);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [reviews, total, ratingBreakdown] = await Promise.all([
    Review.find(filter)
      .populate('user', 'fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Review.countDocuments(filter),
    Review.aggregate([
      {
        $match: {
          restaurant: new mongoose.Types.ObjectId(restaurantId),
          reviewType: 'restaurant',
          isVisible: true,
        },
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingBreakdown.forEach((item) => {
    breakdown[item._id] = item.count;
  });

  return {
    reviews,
    breakdown,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

// ─────────────────────────────────────────────
// GET DELIVERY PARTNER REVIEWS
// ─────────────────────────────────────────────
export const getDeliveryPartnerReviews = async ({
  partnerId,
  rating,
  page = 1,
  limit = 10,
}) => {
  const filter = {
    deliveryPartner: new mongoose.Types.ObjectId(partnerId),
    reviewType: 'delivery',
    isVisible: true,
  };

  if (rating) {
    filter.rating = Number(rating);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('user', 'fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Review.countDocuments(filter),
  ]);

  return {
    reviews,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

// ─────────────────────────────────────────────
// GET LOGGED-IN USER REVIEWS
// ─────────────────────────────────────────────
export const getUserReviews = async ({ userId, page = 1, limit = 10 }) => {
  const skip = (Number(page) - 1) * Number(limit);

  const [reviews, total] = await Promise.all([
    Review.find({ user: userId })
      .populate('restaurant', 'name slug logo')
      .populate('order', 'orderNumber orderStatus totalAmount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Review.countDocuments({ user: userId }),
  ]);

  return {
    reviews,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

// ─────────────────────────────────────────────
// UPDATE REVIEW (Owner Only)
// ─────────────────────────────────────────────
export const updateReview = async ({ reviewId, user, updateData }) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  if (review.user.toString() !== user._id.toString() && user.role !== ROLES.ADMIN) {
    throw new ApiError(403, 'You are not authorized to update this review');
  }

  if (updateData.rating != null) {
    review.rating = Number(updateData.rating);
  }
  if (updateData.comment !== undefined) {
    review.comment = updateData.comment.trim();
  }

  await review.save();

  // Re-calculate live entity ratings
  recalculateEntityRatings({
    restaurantId: review.restaurant,
    deliveryPartnerId: review.deliveryPartner,
  }).catch((err) => console.error('Rating recalculation failed:', err));

  return review;
};

// ─────────────────────────────────────────────
// DELETE REVIEW (Owner or Admin)
// ─────────────────────────────────────────────
export const deleteReview = async ({ reviewId, user }) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  if (review.user.toString() !== user._id.toString() && user.role !== ROLES.ADMIN) {
    throw new ApiError(403, 'You are not authorized to delete this review');
  }

  const restaurantId = review.restaurant;
  const deliveryPartnerId = review.deliveryPartner;

  await review.deleteOne();

  // Re-calculate live entity ratings
  recalculateEntityRatings({
    restaurantId,
    deliveryPartnerId,
  }).catch((err) => console.error('Rating recalculation failed:', err));

  return { message: 'Review deleted successfully' };
};

// ─────────────────────────────────────────────
// REPORT REVIEW
// ─────────────────────────────────────────────
export const reportReview = async ({ reviewId, reason }) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  review.isReported = true;
  review.reportReason = reason.trim();
  await review.save();

  return { message: 'Review reported for moderation' };
};

// ─────────────────────────────────────────────
// MODERATE REVIEW (Admin)
// ─────────────────────────────────────────────
export const moderateReview = async ({ reviewId, isVisible }) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  review.isVisible = Boolean(isVisible);
  await review.save();

  // Re-calculate live entity ratings
  recalculateEntityRatings({
    restaurantId: review.restaurant,
    deliveryPartnerId: review.deliveryPartner,
  }).catch((err) => console.error('Rating recalculation failed:', err));

  return review;
};

// ─────────────────────────────────────────────
// LIST ALL REVIEWS (Admin Moderation)
// ─────────────────────────────────────────────
export const listReviewsForAdmin = async ({
  page = 1,
  limit = 20,
  isReported,
  isVisible,
}) => {
  const filter = {};

  if (isReported !== undefined) {
    filter.isReported = String(isReported) === 'true';
  }
  if (isVisible !== undefined) {
    filter.isVisible = String(isVisible) === 'true';
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('user', 'fullName email mobile')
      .populate('restaurant', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Review.countDocuments(filter),
  ]);

  return {
    reviews,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};
