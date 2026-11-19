import { Router } from 'express';
import {
  initiatePaymentController,
  verifyPaymentController,
  webhookController,
  getPaymentByOrderController,
  getUserPaymentsController,
  processRefundController,
} from './payment.controller.js';
import { verifyJWT } from '../../middlewares/auth.middleware.js';
import {
  initiatePaymentValidation,
  verifyPaymentValidation,
  orderIdParamValidation,
  refundValidation,
  userPaymentsQueryValidation,
} from './payment.validate.js';

const paymentRouter = Router();

// ─────────────────────────────────────────────
// WEBHOOK ROUTE (Public - Called by Payment Gateway)
// ─────────────────────────────────────────────
/**
 * @route   POST /api/v1/payments/webhook
 * @desc    Receive asynchronous webhook event updates from Razorpay
 * @access  Public (Signature-verified)
 */
paymentRouter.post('/webhook', webhookController);

// ─────────────────────────────────────────────
// PROTECTED PAYMENT ROUTES
// ─────────────────────────────────────────────

/**
 * @route   POST /api/v1/payments/initiate
 * @desc    Create/initiate gateway order (Razorpay or COD)
 * @access  Protected (Customer)
 */
paymentRouter.post(
  '/initiate',
  verifyJWT,
  initiatePaymentValidation,
  initiatePaymentController,
);

/**
 * @route   POST /api/v1/payments/verify
 * @desc    Verify Razorpay payment signature and mark order paid
 * @access  Protected (Customer)
 */
paymentRouter.post(
  '/verify',
  verifyJWT,
  verifyPaymentValidation,
  verifyPaymentController,
);

/**
 * @route   GET /api/v1/payments/order/:orderId
 * @desc    Get payment details for a specific order
 * @access  Protected (Customer, Restaurant Owner, or Admin)
 */
paymentRouter.get(
  '/order/:orderId',
  verifyJWT,
  orderIdParamValidation,
  getPaymentByOrderController,
);

/**
 * @route   GET /api/v1/payments/my-payments
 * @desc    Get all payment history of the authenticated user
 * @access  Protected (Customer)
 */
paymentRouter.get(
  '/my-payments',
  verifyJWT,
  userPaymentsQueryValidation,
  getUserPaymentsController,
);

/**
 * @route   POST /api/v1/payments/refund
 * @desc    Process refund for an order
 * @access  Protected (Admin only)
 */
paymentRouter.post(
  '/refund',
  verifyJWT,
  refundValidation,
  processRefundController,
);

export default paymentRouter;
