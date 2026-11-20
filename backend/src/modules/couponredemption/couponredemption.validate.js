import { query, param } from 'express-validator';
import { validate } from '../../config/validate.js';

// ─────────────────────────────────────────────
// QUERY VALIDATIONS
// ─────────────────────────────────────────────
export const listRedemptionsQueryValidation = [
  query('couponId').optional().isMongoId().withMessage('couponId must be a valid Mongo ID'),

  query('userId').optional().isMongoId().withMessage('userId must be a valid Mongo ID'),

  query('orderId').optional().isMongoId().withMessage('orderId must be a valid Mongo ID'),

  query('status')
    .optional()
    .isIn(['pending', 'redeemed', 'cancelled'])
    .withMessage("status must be 'pending', 'redeemed', or 'cancelled'"),

  query('code').optional().trim().toUpperCase(),

  query('page').optional().isInt({ min: 1 }),

  query('limit').optional().isInt({ min: 1, max: 100 }),

  validate,
];

// ─────────────────────────────────────────────
// PARAMETER VALIDATIONS
// ─────────────────────────────────────────────
export const redemptionIdParamValidation = [
  param('id').isMongoId().withMessage('Valid redemption ID is required in URL parameter'),
  validate,
];
