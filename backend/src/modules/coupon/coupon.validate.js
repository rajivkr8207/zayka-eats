import { body, param, query } from 'express-validator';
import { validate } from '../../config/validate.js';

// ─────────────────────────────────────────────
// CREATE COUPON VALIDATION
// ─────────────────────────────────────────────
export const createCouponValidation = [
  body('code')
    .notEmpty()
    .withMessage('Coupon code is required')
    .trim()
    .isLength({ min: 3, max: 25 })
    .withMessage('Coupon code must be between 3 and 25 characters')
    .matches(/^[A-Z0-9_-]+$/i)
    .withMessage('Coupon code must contain only letters, numbers, hyphens, and underscores'),

  body('name')
    .notEmpty()
    .withMessage('Coupon name/title is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Coupon name must be between 2 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('discountType')
    .notEmpty()
    .withMessage('Discount type is required')
    .isIn(['percentage', 'fixed'])
    .withMessage("Discount type must be either 'percentage' or 'fixed'"),

  body('discountValue')
    .notEmpty()
    .withMessage('Discount value is required')
    .isFloat({ min: 0.01 })
    .withMessage('Discount value must be greater than 0')
    .custom((value, { req }) => {
      if (req.body.discountType === 'percentage' && Number(value) > 100) {
        throw new Error('Percentage discount cannot exceed 100%');
      }
      return true;
    }),

  body('maxDiscount')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('maxDiscount must be a positive number'),

  body('minOrderAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('minOrderAmount must be a non-negative number'),

  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid ISO8601 date'),

  body('expiryDate')
    .notEmpty()
    .withMessage('Expiry date is required')
    .isISO8601()
    .withMessage('Expiry date must be a valid ISO8601 date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('Expiry date must be after the start date');
      }
      return true;
    }),

  body('applicableRestaurants')
    .optional()
    .isArray()
    .withMessage('applicableRestaurants must be an array of restaurant IDs'),

  body('applicableRestaurants.*')
    .optional()
    .isMongoId()
    .withMessage('Each applicable restaurant must be a valid Mongo ID'),

  body('usageLimit')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('usageLimit must be an integer >= 1'),

  body('usageLimitPerUser')
    .optional()
    .isInt({ min: 1 })
    .withMessage('usageLimitPerUser must be an integer >= 1'),

  body('newUserOnly').optional().isBoolean().withMessage('newUserOnly must be a boolean'),

  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),

  validate,
];

// ─────────────────────────────────────────────
// UPDATE COUPON VALIDATION
// ─────────────────────────────────────────────
export const updateCouponValidation = [
  param('id').isMongoId().withMessage('Valid coupon ID is required in URL parameter'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Coupon name must be between 2 and 100 characters'),

  body('discountType')
    .optional()
    .isIn(['percentage', 'fixed'])
    .withMessage("Discount type must be either 'percentage' or 'fixed'"),

  body('discountValue')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Discount value must be greater than 0'),

  body('maxDiscount')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('maxDiscount must be a positive number'),

  body('minOrderAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('minOrderAmount must be a non-negative number'),

  body('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO8601 date'),

  body('expiryDate').optional().isISO8601().withMessage('Expiry date must be a valid ISO8601 date'),

  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),

  validate,
];

// ─────────────────────────────────────────────
// APPLY COUPON VALIDATION
// ─────────────────────────────────────────────
export const applyCouponValidation = [
  body('code').notEmpty().withMessage('Coupon code is required').trim().toUpperCase(),

  body('subtotal')
    .notEmpty()
    .withMessage('Order subtotal is required')
    .isFloat({ min: 0 })
    .withMessage('Subtotal must be a positive number'),

  body('restaurantId').optional().isMongoId().withMessage('restaurantId must be a valid Mongo ID'),

  validate,
];

// ─────────────────────────────────────────────
// PARAMETER & QUERY VALIDATIONS
// ─────────────────────────────────────────────
export const couponIdParamValidation = [
  param('id').isMongoId().withMessage('Valid coupon ID is required in URL parameter'),
  validate,
];

export const listCouponsQueryValidation = [
  query('restaurantId').optional().isMongoId().withMessage('restaurantId must be a valid Mongo ID'),

  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),

  query('page').optional().isInt({ min: 1 }),

  query('limit').optional().isInt({ min: 1, max: 100 }),

  validate,
];
