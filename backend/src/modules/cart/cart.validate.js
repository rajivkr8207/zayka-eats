import { body, param } from 'express-validator';
import { validate } from '../../config/validate.js';

// ─────────────────────────────────────────────
// ADD ITEM VALIDATION
// ─────────────────────────────────────────────
export const addItemValidation = [
  (req, res, next) => {
    if (!req.body.foodId && req.body.itemId) {
      req.body.foodId = req.body.itemId;
    }
    if (!req.body.restaurantId && req.body.restaurant) {
      req.body.restaurantId = req.body.restaurant;
    }
    next();
  },
  body('restaurantId')
    .notEmpty()
    .withMessage('Restaurant ID is required')
    .isMongoId()
    .withMessage('A valid restaurant ID is required'),

  body('foodId')
    .notEmpty()
    .withMessage('Food item ID is required')
    .isMongoId()
    .withMessage('A valid food item ID is required'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('Item name is required')
    .isLength({ min: 1, max: 120 })
    .withMessage('Item name cannot exceed 120 characters'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('quantity')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Quantity must be between 1 and 50'),

  body('image').optional().trim().isString(),

  body('replaceCart').optional().isBoolean().withMessage('replaceCart must be a boolean value'),

  validate,
];

// ─────────────────────────────────────────────
// UPDATE QUANTITY VALIDATION
// ─────────────────────────────────────────────
export const updateQuantityValidation = [
  param('itemId').isMongoId().withMessage('Valid cart item ID is required in URL parameter'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 0, max: 50 })
    .withMessage('Quantity must be between 0 and 50'),

  validate,
];

// ─────────────────────────────────────────────
// ITEM ID PARAMETER VALIDATION
// ─────────────────────────────────────────────
export const itemIdParamValidation = [
  param('itemId').isMongoId().withMessage('Valid cart item ID is required in URL parameter'),
  validate,
];

// ─────────────────────────────────────────────
// APPLY COUPON VALIDATION
// ─────────────────────────────────────────────
export const applyCouponValidation = [
  (req, res, next) => {
    if (!req.body.couponCode && req.body.code) {
      req.body.couponCode = req.body.code;
    }
    next();
  },
  body('couponCode')
    .trim()
    .notEmpty()
    .withMessage('Coupon code is required')
    .isLength({ min: 2, max: 30 })
    .withMessage('Coupon code must be between 2 and 30 characters')
    .toUpperCase(),

  validate,
];
