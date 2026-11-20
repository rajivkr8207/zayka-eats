import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
  initiateOrderPayment,
  verifyPayment,
  processWebhook,
  getPaymentByOrderId,
  getUserPayments,
  processRefund,
} from './payment.service.js';

// ─────────────────────────────────────────────
// POST /api/v1/payments/initiate (Protected)
// ─────────────────────────────────────────────
export const initiatePaymentController = asyncHandler(async (req, res) => {
  const result = await initiateOrderPayment({
    user: req.user,
    orderId: req.body.orderId,
    paymentMethod: req.body.paymentMethod,
  });

  return res.status(200).json(new ApiResponse(200, result, 'Payment initiated successfully'));
});

// ─────────────────────────────────────────────
// POST /api/v1/payments/verify (Protected)
// ─────────────────────────────────────────────
export const verifyPaymentController = asyncHandler(async (req, res) => {
  const result = await verifyPayment({
    user: req.user,
    orderId: req.body.orderId,
    razorpayOrderId: req.body.razorpayOrderId,
    razorpayPaymentId: req.body.razorpayPaymentId,
    razorpaySignature: req.body.razorpaySignature,
  });

  return res.status(200).json(new ApiResponse(200, result, 'Payment verified successfully'));
});

// ─────────────────────────────────────────────
// POST /api/v1/payments/webhook (Public - Gateway Hook)
// ─────────────────────────────────────────────
export const webhookController = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.rawBody || JSON.stringify(req.body);

  const result = await processWebhook({ rawBody, signature });
  return res.status(200).json(result);
});

// ─────────────────────────────────────────────
// GET /api/v1/payments/order/:orderId (Protected)
// ─────────────────────────────────────────────
export const getPaymentByOrderController = asyncHandler(async (req, res) => {
  const payment = await getPaymentByOrderId(req.params.orderId, req.user);
  return res.status(200).json(new ApiResponse(200, payment, 'Payment record fetched successfully'));
});

// ─────────────────────────────────────────────
// GET /api/v1/payments/my-payments (Protected)
// ─────────────────────────────────────────────
export const getUserPaymentsController = asyncHandler(async (req, res) => {
  const result = await getUserPayments(req.user._id, req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Payment transactions fetched successfully'));
});

// ─────────────────────────────────────────────
// POST /api/v1/payments/refund (Protected - Admin Only)
// ─────────────────────────────────────────────
export const processRefundController = asyncHandler(async (req, res) => {
  const result = await processRefund({
    orderId: req.body.orderId,
    adminUser: req.user,
    refundReason: req.body.refundReason,
    amount: req.body.amount,
  });

  return res.status(200).json(new ApiResponse(200, result, 'Refund processed successfully'));
});
