import { body, param, query } from 'express-validator';
import { validate } from '../../config/validate.js';

// ─────────────────────────────────────────────
// CREATE RESTAURANT VALIDATION
// ─────────────────────────────────────────────
export const createRestaurantValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Restaurant name is required')
    .isLength({ min: 2, max: 120 })
    .withMessage('Restaurant name must be between 2 and 120 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('address')
    .optional()
    .trim()
    .isLength({ min: 3, max: 300 })
    .withMessage('Address must be between 3 and 300 characters'),

  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('City must be between 2 and 60 characters'),

  body('state').optional().trim().isLength({ max: 60 }),

  body('country').optional().trim().isLength({ max: 60 }),

  body('pincode')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be a 6-digit number'),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit mobile number'),

  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .toLowerCase(),

  body('latitude')
    .optional({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('longitude')
    .optional({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('priceForTwo')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Price for two must be a positive number'),

  body('fssaiLicenseNumber')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('FSSAI license number cannot exceed 30 characters'),

  body('gstNumber')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('GST number cannot exceed 30 characters'),

  body('panNumber')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('PAN number cannot exceed 20 characters'),

  validate,
];

// ─────────────────────────────────────────────
// UPDATE RESTAURANT VALIDATION
// ─────────────────────────────────────────────
export const updateRestaurantValidation = [
  param('id').isMongoId().withMessage('Valid restaurant ID is required in URL parameter'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Restaurant name must be between 2 and 120 characters'),

  body('description').optional().trim().isLength({ max: 1000 }),

  body('address').optional().trim().isLength({ min: 3, max: 300 }),

  body('city').optional().trim().isLength({ min: 2, max: 60 }),

  body('pincode')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be a 6-digit number'),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit mobile number'),

  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .toLowerCase(),

  body('latitude')
    .optional({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('longitude')
    .optional({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('priceForTwo')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Price for two must be a positive number'),

  validate,
];

// ─────────────────────────────────────────────
// RESTAURANT ID PARAMETER VALIDATION
// ─────────────────────────────────────────────
export const restaurantIdParamValidation = [
  param('id').isMongoId().withMessage('Valid restaurant ID is required'),
  validate,
];

// ─────────────────────────────────────────────
// TOGGLE RESTAURANT OPEN/CLOSED STATUS VALIDATION
// ─────────────────────────────────────────────
export const updateStatusValidation = [
  param('id').isMongoId().withMessage('Valid restaurant ID is required'),
  body('isOpen')
    .notEmpty()
    .withMessage('isOpen status (true/false) is required')
    .isBoolean()
    .withMessage('isOpen must be a boolean value'),
  validate,
];

// ─────────────────────────────────────────────
// ADMIN APPROVAL VALIDATION
// ─────────────────────────────────────────────
export const approvalValidation = [
  param('id').isMongoId().withMessage('Valid restaurant ID is required'),
  body('approvalStatus')
    .notEmpty()
    .withMessage('Approval status is required')
    .isIn(['pending', 'approved', 'rejected', 'suspended'])
    .withMessage('Approval status must be one of: pending, approved, rejected, suspended'),
  body('rejectionReason')
    .if(body('approvalStatus').equals('rejected'))
    .trim()
    .notEmpty()
    .withMessage('Rejection reason is required when status is rejected'),
  validate,
];

// ─────────────────────────────────────────────
// GET ALL RESTAURANTS QUERY VALIDATION
// ─────────────────────────────────────────────
export const getRestaurantsQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page number must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),

  query('latitude')
    .optional({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  query('longitude')
    .optional({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  query('maxDistanceKm')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0.1, max: 100 })
    .withMessage('Max distance must be between 0.1 and 100 km'),

  validate,
];
