import { body, param, query } from 'express-validator';
import { validate } from '../../config/validate.js';

// ─────────────────────────────────────────────
// CREATE MENU VALIDATION
// ─────────────────────────────────────────────
export const createMenuValidation = [
  (req, _res, next) => {
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

  body('name')
    .trim()
    .notEmpty()
    .withMessage('Menu name is required')
    .isLength({ min: 2, max: 80 })
    .withMessage('Menu name must be between 2 and 80 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('sortOrder')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),

  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean value'),

  validate,
];

// ─────────────────────────────────────────────
// UPDATE MENU VALIDATION
// ─────────────────────────────────────────────
export const updateMenuValidation = [
  param('id').isMongoId().withMessage('Valid menu ID is required in URL parameter'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Menu name must be between 2 and 80 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('sortOrder')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),

  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean value'),

  validate,
];

// ─────────────────────────────────────────────
// MENU ID PARAMETER VALIDATION
// ─────────────────────────────────────────────
export const menuIdParamValidation = [
  param('id').isMongoId().withMessage('Valid menu ID is required'),
  validate,
];

// ─────────────────────────────────────────────
// RESTAURANT ID PARAMETER VALIDATION
// ─────────────────────────────────────────────
export const restaurantIdParamValidation = [
  param('restaurantId').isMongoId().withMessage('Valid restaurant ID is required'),
  query('isActive').optional().isBoolean().withMessage('isActive filter must be true or false'),
  validate,
];
