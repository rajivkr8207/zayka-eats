import { body, param, query } from 'express-validator';
import { validate } from '../../config/validate.js';

// ─────────────────────────────────────────────
// CREATE REVIEW VALIDATION
// ─────────────────────────────────────────────
export const createReviewValidation = [
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('Valid order ID is required'),

  body('restaurantId')
    .notEmpty()
    .withMessage('Restaurant ID is required')
    .isMongoId()
    .withMessage('Valid restaurant ID is required'),

  body('reviewType')
    .notEmpty()
    .withMessage('Review type is required')
    .isIn(['restaurant', 'food', 'delivery'])
    .withMessage("Review type must be 'restaurant', 'food', or 'delivery'"),

  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5 stars'),

  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),

  body('foodId')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Valid food ID is required when reviewing a food item'),

  body('deliveryPartnerId')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Valid delivery partner ID is required when reviewing delivery'),

  validate,
];

// ─────────────────────────────────────────────
// UPDATE REVIEW VALIDATION
// ─────────────────────────────────────────────
export const updateReviewValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid review ID is required in URL parameter'),

  body('rating')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5 stars'),

  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),

  validate,
];

// ─────────────────────────────────────────────
// REPORT REVIEW VALIDATION
// ─────────────────────────────────────────────
export const reportReviewValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid review ID is required in URL parameter'),

  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Report reason is required')
    .isLength({ min: 3, max: 500 })
    .withMessage('Reason must be between 3 and 500 characters'),

  validate,
];

// ─────────────────────────────────────────────
// MODERATE REVIEW VALIDATION (Admin)
// ─────────────────────────────────────────────
export const moderateReviewValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid review ID is required in URL parameter'),

  body('isVisible')
    .notEmpty()
    .withMessage('isVisible is required')
    .isBoolean()
    .withMessage('isVisible must be a boolean'),

  validate,
];

// ─────────────────────────────────────────────
// PARAMETER & QUERY VALIDATIONS
// ─────────────────────────────────────────────
export const reviewIdParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid review ID is required in URL parameter'),
  validate,
];

export const restaurantReviewsQueryValidation = [
  param('restaurantId')
    .isMongoId()
    .withMessage('Valid restaurant ID is required in URL parameter'),

  query('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating filter must be an integer between 1 and 5'),

  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),

  validate,
];

export const deliveryReviewsQueryValidation = [
  param('partnerId')
    .isMongoId()
    .withMessage('Valid delivery partner ID is required in URL parameter'),

  query('rating')
    .optional()
    .isInt({ min: 1, max: 5 }),

  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),

  validate,
];

export const listReviewsQueryValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('isReported').optional().isBoolean(),
  query('isVisible').optional().isBoolean(),
  validate,
];
