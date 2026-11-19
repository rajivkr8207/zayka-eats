import { body, param, query } from 'express-validator';
import { validate } from '../../config/validate.js';

// ─────────────────────────────────────────────
// REGISTER DELIVERY PARTNER VALIDATION
// ─────────────────────────────────────────────
export const registerPartnerValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Full name must be between 2 and 120 characters'),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit mobile number'),

  body('vehicleType')
    .notEmpty()
    .withMessage('Vehicle type is required')
    .isIn(['bike', 'scooter', 'cycle', 'electric_bike', 'other'])
    .withMessage("Vehicle type must be one of: 'bike', 'scooter', 'cycle', 'electric_bike', 'other'"),

  body('vehicleNumber')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Vehicle number cannot exceed 20 characters'),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage("Gender must be 'male', 'female', 'other', or 'prefer_not_to_say'"),

  validate,
];

// ─────────────────────────────────────────────
// TOGGLE ONLINE STATUS VALIDATION
// ─────────────────────────────────────────────
export const toggleOnlineValidation = [
  body('isOnline')
    .notEmpty()
    .withMessage('isOnline is required')
    .isBoolean()
    .withMessage('isOnline must be a boolean value'),

  body('latitude')
    .optional({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('longitude')
    .optional({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  validate,
];

// ─────────────────────────────────────────────
// UPDATE LIVE LOCATION VALIDATION
// ─────────────────────────────────────────────
export const updateLocationValidation = [
  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  validate,
];

// ─────────────────────────────────────────────
// PARAMETER VALIDATIONS
// ─────────────────────────────────────────────
export const partnerIdParamValidation = [
  param('id').isMongoId().withMessage('Valid delivery partner ID is required in URL parameter'),
  validate,
];

export const orderIdParamValidation = [
  param('orderId').isMongoId().withMessage('Valid order ID is required in URL parameter'),
  validate,
];

// ─────────────────────────────────────────────
// ADMIN APPLICATION REVIEW VALIDATION
// ─────────────────────────────────────────────
export const reviewApplicationValidation = [
  param('id').isMongoId().withMessage('Valid delivery partner ID is required in URL parameter'),

  body('verificationStatus')
    .notEmpty()
    .withMessage('Verification status is required')
    .isIn(['approved', 'rejected'])
    .withMessage("Verification status must be 'approved' or 'rejected'"),

  body('rejectionReason')
    .if(body('verificationStatus').equals('rejected'))
    .trim()
    .notEmpty()
    .withMessage('Rejection reason is required when status is rejected'),

  validate,
];

// ─────────────────────────────────────────────
// NEARBY RIDERS QUERY VALIDATION
// ─────────────────────────────────────────────
export const nearbyRidersQueryValidation = [
  query('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  query('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  query('maxDistanceKm')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0.5, max: 50 })
    .withMessage('maxDistanceKm must be between 0.5 and 50 km'),

  validate,
];

// ─────────────────────────────────────────────
// LIST PARTNERS QUERY VALIDATION
// ─────────────────────────────────────────────
export const listPartnersQueryValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validate,
];
