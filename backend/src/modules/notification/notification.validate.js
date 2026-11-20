import { body, param, query } from 'express-validator';
import { validate } from '../../config/validate.js';

// ─────────────────────────────────────────────
// CREATE NOTIFICATION VALIDATION (Admin / Custom trigger)
// ─────────────────────────────────────────────
export const createNotificationValidation = [
  body('recipientId').optional().isMongoId().withMessage('Valid recipient user ID is required'),

  body('title')
    .notEmpty()
    .withMessage('Notification title is required')
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Title must be between 2 and 150 characters'),

  body('message')
    .notEmpty()
    .withMessage('Notification message is required')
    .trim()
    .isLength({ min: 2, max: 1000 })
    .withMessage('Message must be between 2 and 1000 characters'),

  body('type')
    .optional()
    .isIn([
      'order_placed',
      'order_confirmed',
      'order_rejected',
      'order_preparing',
      'order_ready',
      'order_picked_up',
      'order_out_for_delivery',
      'order_delivered',
      'order_cancelled',
      'payment_success',
      'payment_failed',
      'refund_processed',
      'coupon_offer',
      'delivery_assigned',
      'general',
    ])
    .withMessage('Invalid notification type'),

  body('orderId')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('orderId must be a valid Mongo ID'),

  validate,
];

// ─────────────────────────────────────────────
// PARAMETER VALIDATIONS
// ─────────────────────────────────────────────
export const notificationIdParamValidation = [
  param('id').isMongoId().withMessage('Valid notification ID is required in URL parameter'),
  validate,
];

// ─────────────────────────────────────────────
// QUERY VALIDATIONS
// ─────────────────────────────────────────────
export const listNotificationsQueryValidation = [
  query('isRead').optional().isBoolean().withMessage('isRead must be a boolean (true or false)'),

  query('page').optional().isInt({ min: 1 }),

  query('limit').optional().isInt({ min: 1, max: 50 }),

  validate,
];
