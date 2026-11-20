import { body, param, query } from 'express-validator';
import { validate } from '../../config/validate.js';

// ─────────────────────────────────────────────
// CREATE FOOD CATEGORY VALIDATION
// ─────────────────────────────────────────────
export const createFoodCategoryValidation = [
  body('restaurantId')
    .notEmpty()
    .withMessage('Restaurant ID is required')
    .isMongoId()
    .withMessage('A valid restaurant ID is required'),

  body('menuId')
    .notEmpty()
    .withMessage('Menu ID is required')
    .isMongoId()
    .withMessage('A valid menu ID is required'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 80 })
    .withMessage('Category name must be between 2 and 80 characters'),

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
// UPDATE FOOD CATEGORY VALIDATION
// ─────────────────────────────────────────────
export const updateFoodCategoryValidation = [
  param('id').isMongoId().withMessage('Valid food category ID is required in URL parameter'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Category name must be between 2 and 80 characters'),

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
// PARAMETER VALIDATIONS
// ─────────────────────────────────────────────
export const foodCategoryIdParamValidation = [
  param('id').isMongoId().withMessage('Valid food category ID is required'),
  validate,
];

export const menuIdParamValidation = [
  param('menuId').isMongoId().withMessage('Valid menu ID is required'),
  query('isActive').optional().isBoolean().withMessage('isActive filter must be true or false'),
  validate,
];

export const restaurantIdParamValidation = [
  param('restaurantId').isMongoId().withMessage('Valid restaurant ID is required'),
  query('isActive').optional().isBoolean().withMessage('isActive filter must be true or false'),
  validate,
];
