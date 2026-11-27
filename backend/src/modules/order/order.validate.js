import { body, param, query } from 'express-validator';
import { validate } from '../../config/validate.js';

const ORDER_STATUS_ENUM = [
  'pending',
  'confirmed',
  'preparing',
  'ready_for_pickup',
  'picked_up',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

// ─────────────────────────────────────────────
// CREATE ORDER VALIDATION
// ─────────────────────────────────────────────
export const createOrderValidation = [
  (req, res, next) => {
    if (!req.body.addressId && req.body.deliveryAddressId) {
      req.body.addressId = req.body.deliveryAddressId;
    }
    if (req.body.paymentMethod === 'cash_on_delivery') {
      req.body.paymentMethod = 'cod';
    }
    next();
  },
  body('addressId')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('A valid address ID is required'),

  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['cod', 'online', 'cash_on_delivery'])
    .withMessage("Payment method must be 'cod' or 'online'"),

  body('customerNote')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Customer note cannot exceed 500 characters'),

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

  body('paymentId').optional().trim(),

  validate,
];

// ─────────────────────────────────────────────
// ORDER ID PARAMETER VALIDATION
// ─────────────────────────────────────────────
export const orderIdParamValidation = [
  param('id').isMongoId().withMessage('Valid order ID is required in URL parameter'),
  validate,
];

// ─────────────────────────────────────────────
// RESTAURANT ORDERS QUERY VALIDATION
// ─────────────────────────────────────────────
export const restaurantOrdersQueryValidation = [
  param('restaurantId').isMongoId().withMessage('Valid restaurant ID is required in URL parameter'),

  query('status')
    .optional()
    .isIn(ORDER_STATUS_ENUM)
    .withMessage(`Status must be one of: ${ORDER_STATUS_ENUM.join(', ')}`),

  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),

  validate,
];

// ─────────────────────────────────────────────
// UPDATE STATUS VALIDATION
// ─────────────────────────────────────────────
export const updateStatusValidation = [
  (req, res, next) => {
    if (!req.body.newStatus && req.body.status) {
      req.body.newStatus = req.body.status;
    }
    next();
  },
  param('id').isMongoId().withMessage('Valid order ID is required in URL parameter'),

  body('newStatus')
    .notEmpty()
    .withMessage('New order status is required')
    .isIn(ORDER_STATUS_ENUM)
    .withMessage(`New status must be one of: ${ORDER_STATUS_ENUM.join(', ')}`),

  body('note').optional().trim().isLength({ max: 300 }),

  validate,
];

// ─────────────────────────────────────────────
// ASSIGN RIDER VALIDATION
// ─────────────────────────────────────────────
export const assignRiderValidation = [
  param('id').isMongoId().withMessage('Valid order ID is required in URL parameter'),

  body('riderId')
    .notEmpty()
    .withMessage('Delivery partner (rider) ID is required')
    .isMongoId()
    .withMessage('A valid delivery partner ID is required'),

  validate,
];

// ─────────────────────────────────────────────
// CANCEL ORDER VALIDATION
// ─────────────────────────────────────────────
export const cancelOrderValidation = [
  param('id').isMongoId().withMessage('Valid order ID is required in URL parameter'),

  body('reason')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Cancellation reason cannot exceed 300 characters'),

  validate,
];
