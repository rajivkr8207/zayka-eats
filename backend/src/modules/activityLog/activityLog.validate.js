import { param, query } from 'express-validator';
import { validate } from '../../config/validate.js';

export const listActivityLogsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('outcome')
    .optional()
    .isIn(['success', 'failure'])
    .withMessage("Outcome must be either 'success' or 'failure'"),

  query('actorRole')
    .optional()
    .trim(),

  query('entityType')
    .optional()
    .isIn([
      'order',
      'restaurant',
      'menu',
      'food_category',
      'address',
      'cart',
      'payment',
      'delivery',
      'coupon',
      'coupon_redemption',
      'review',
      'user',
      'notification',
      'system',
      'other',
    ])
    .withMessage('Invalid entityType filter'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid ISO 8601 date string'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid ISO 8601 date string'),

  validate,
];

export const myActivityLogsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),

  validate,
];

export const logIdParamValidation = [
  param('id')
    .notEmpty()
    .withMessage('Log ID is required')
    .isMongoId()
    .withMessage('Log ID must be a valid MongoDB ObjectId'),

  validate,
];
