import { body, param, query } from 'express-validator';
import { validate } from '../../config/validate.js';

// ─────────────────────────────────────────────
// INITIATE PAYMENT VALIDATION
// ─────────────────────────────────────────────
export const initiatePaymentValidation = [
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('A valid order ID is required'),

  body('paymentMethod')
    .optional()
    .isIn(['cod', 'upi', 'card', 'netbanking', 'wallet'])
    .withMessage("Payment method must be one of: 'cod', 'upi', 'card', 'netbanking', 'wallet'"),

  validate,
];

// ─────────────────────────────────────────────
// VERIFY PAYMENT VALIDATION
// ─────────────────────────────────────────────
export const verifyPaymentValidation = [
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('A valid order ID is required'),

  body('razorpayOrderId').trim().notEmpty().withMessage('Razorpay order ID is required'),

  body('razorpayPaymentId').trim().notEmpty().withMessage('Razorpay payment ID is required'),

  body('razorpaySignature').trim().notEmpty().withMessage('Razorpay signature is required'),

  validate,
];

// ─────────────────────────────────────────────
// ORDER ID PARAMETER VALIDATION
// ─────────────────────────────────────────────
export const orderIdParamValidation = [
  param('orderId').isMongoId().withMessage('Valid order ID is required in URL parameter'),
  validate,
];

// ─────────────────────────────────────────────
// REFUND VALIDATION (Admin)
// ─────────────────────────────────────────────
export const refundValidation = [
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('A valid order ID is required'),

  body('amount').optional().isFloat({ min: 1 }).withMessage('Refund amount must be greater than 0'),

  body('refundReason')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Refund reason cannot exceed 300 characters'),

  validate,
];

// ─────────────────────────────────────────────
// USER PAYMENTS QUERY VALIDATION
// ─────────────────────────────────────────────
export const userPaymentsQueryValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validate,
];
