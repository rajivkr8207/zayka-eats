import { body, param, query } from 'express-validator';
import { validate } from '../../config/validate.js';

// ─────────────────────────────────────────────
// REVERSE GEOCODE QUERY / BODY VALIDATION
// ─────────────────────────────────────────────
export const reverseGeocodeValidation = [
  query('latitude')
    .optional({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid number between -90 and 90'),

  query('longitude')
    .optional({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid number between -180 and 180'),

  body('latitude')
    .optional({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid number between -90 and 90'),

  body('longitude')
    .optional({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid number between -180 and 180'),

  validate,
];

// ─────────────────────────────────────────────
// CREATE ADDRESS VALIDATION
// ─────────────────────────────────────────────
export const createAddressValidation = [
  // ── Alias middleware: normalise frontend field names → backend names
  (req, res, next) => {
    const b = req.body;
    // pinCode → pincode
    if (!b.pincode && b.pinCode) b.pincode = b.pinCode;
    // label → addressType, normalise to lowercase
    if (!b.addressType && b.label) b.addressType = b.label;
    if (b.addressType) b.addressType = b.addressType.toLowerCase();
    // HOME/WORK → home/office/other mapping
    if (b.addressType === 'work') b.addressType = 'office';
    if (!['home', 'office', 'other'].includes(b.addressType)) b.addressType = 'home';
    next();
  },
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

  body('alternatePhone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit alternate mobile number'),

  body('addressLine1')
    .optional()
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage('Address line 1 cannot exceed 300 characters'),

  body('addressLine2').optional().trim().isLength({ max: 300 }),

  body('landmark').optional().trim().isLength({ max: 200 }),

  body('city').optional().trim().isLength({ max: 80 }),

  body('state').optional().trim().isLength({ max: 80 }),

  body('pincode')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be a 6-digit number'),

  body('latitude')
    .optional({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('longitude')
    .optional({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('addressType')
    .optional()
    .isIn(['home', 'office', 'other'])
    .withMessage("Address type must be 'home', 'office', or 'other'"),

  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean value'),

  validate,
];

// ─────────────────────────────────────────────
// UPDATE ADDRESS VALIDATION
// ─────────────────────────────────────────────
export const updateAddressValidation = [
  param('id').isMongoId().withMessage('Valid address ID is required in URL parameter'),

  // Alias middleware for update too
  (req, res, next) => {
    const b = req.body;
    if (!b.pincode && b.pinCode) b.pincode = b.pinCode;
    if (!b.addressType && b.label) b.addressType = b.label;
    if (b.addressType) b.addressType = b.addressType.toLowerCase();
    if (b.addressType === 'work') b.addressType = 'office';
    next();
  },

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

  body('pincode')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be a 6-digit number'),

  body('latitude').optional({ checkFalsy: true }).isFloat({ min: -90, max: 90 }),

  body('longitude').optional({ checkFalsy: true }).isFloat({ min: -180, max: 180 }),

  body('addressType')
    .optional()
    .isIn(['home', 'office', 'other'])
    .withMessage("Address type must be 'home', 'office', or 'other'"),

  body('isDefault').optional().isBoolean(),

  validate,
];

// ─────────────────────────────────────────────
// ADDRESS ID PARAMETER VALIDATION
// ─────────────────────────────────────────────
export const addressIdParamValidation = [
  param('id').isMongoId().withMessage('Valid address ID is required'),
  validate,
];
