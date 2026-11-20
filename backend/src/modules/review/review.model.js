import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    // Reviewer
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Verified Order
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },

    // Review Target
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },

    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      default: null,
    },

    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryPartner',
      default: null,
    },

    // Review Type
    reviewType: {
      type: String,
      enum: ['restaurant', 'food', 'delivery'],
      required: true,
    },

    // Rating
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // Written Review
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },

    // Review Images
    images: {
      type: [String],
      default: [],
    },

    // Moderation
    isVisible: {
      type: Boolean,
      default: true,
    },

    isReported: {
      type: Boolean,
      default: false,
    },

    reportReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for queries
reviewSchema.index({ restaurant: 1, createdAt: -1 });
reviewSchema.index({ food: 1, createdAt: -1 });
reviewSchema.index({ deliveryPartner: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });

// Prevent duplicate restaurant review for same order/user
reviewSchema.index({ user: 1, order: 1, reviewType: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
