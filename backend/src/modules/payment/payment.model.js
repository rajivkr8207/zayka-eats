import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    // User Reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Order Reference
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },

    // Payment Number
    paymentNumber: {
      type: String,
      required: true,
      unique: true,
    },

    // Amount
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: 'INR',
    },

    // Payment Method
    paymentMethod: {
      type: String,
      enum: ['cod', 'upi', 'card', 'netbanking', 'wallet'],
      required: true,
    },

    // Payment Gateway
    paymentGateway: {
      type: String,
      enum: ['razorpay', 'stripe', 'cash', 'other'],
      default: 'razorpay',
    },

    gatewayOrderId: {
      type: String,
      default: null,
    },

    gatewayPaymentId: {
      type: String,
      default: null,
    },

    gatewaySignature: {
      type: String,
      default: null,
      select: false,
    },

    // Payment Status
    paymentStatus: {
      type: String,
      enum: [
        'pending',
        'processing',
        'success',
        'failed',
        'cancelled',
        'refunded',
        'partially_refunded',
      ],
      default: 'pending',
    },

    // Refund Information
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundId: {
      type: String,
      default: null,
    },

    refundReason: {
      type: String,
      default: '',
    },

    refundStatus: {
      type: String,
      enum: ['not_requested', 'pending', 'processing', 'success', 'failed'],
      default: 'not_requested',
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    // Payment Dates
    paidAt: {
      type: Date,
      default: null,
    },

    failedAt: {
      type: Date,
      default: null,
    },

    // Failure Information
    failureReason: {
      type: String,
      default: '',
    },

    // Gateway Response
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ order: 1, createdAt: -1 });
paymentSchema.index({ gatewayPaymentId: 1 }, { sparse: true });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
