import { body } from 'express-validator';
import { validate } from '../../config/validate.js';
import { ROLE_VALUES } from '../../constants/roles.js';

// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────
export const registerValidation = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 120 })
    .withMessage('Full name must be between 2 and 120 characters'),

  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-z0-9]+$/)
    .withMessage('Username can only contain lowercase letters and numbers')
    .toLowerCase(),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .toLowerCase(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),

  body('mobile')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit mobile number'),

  body('role')
    .optional()
    .isIn(ROLE_VALUES)
    .withMessage(`Role must be one of: ${ROLE_VALUES.join(', ')}`),

  validate,
];

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
export const loginValidation = [
  body('identifier').trim().notEmpty().withMessage('Email, username, or mobile number is required'),

  body('password').notEmpty().withMessage('Password is required'),

  validate,
];

// ─────────────────────────────────────────────
// EDIT PROFILE (All profile fields updatable)
// ─────────────────────────────────────────────
export const editProfileValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Full name must be between 2 and 120 characters'),

  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-z0-9]+$/)
    .withMessage('Username can only contain lowercase letters and numbers')
    .toLowerCase(),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .toLowerCase(),

  body('mobile')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit mobile number'),

  body('avatar').optional().trim().isString().withMessage('Avatar must be a valid string or URL'),

  validate,
];

// ─────────────────────────────────────────────
// CHANGE PASSWORD
// ─────────────────────────────────────────────
export const changePasswordValidation = [
  body('oldPassword').notEmpty().withMessage('Old password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('New password must contain at least one number'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('New password and confirmation do not match'),

  validate,
];

// ─────────────────────────────────────────────
// OTP VERIFICATION
// ─────────────────────────────────────────────
export const verifyOtpValidation = [
  body()
    .custom((_, { req }) => {
      const email = req.body?.email || req.query?.email;
      return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    })
    .withMessage('A valid email address is required'),

  body('otp')
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('OTP must be a 6-digit number'),

  validate,
];

// ─────────────────────────────────────────────
// RESEND OTP
// ─────────────────────────────────────────────
export const resendOtpValidation = [
  body()
    .custom((_, { req }) => {
      const email = req.body?.email || req.query?.email;
      return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    })
    .withMessage('A valid email address is required'),

  validate,
];

// ─────────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────────
export const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .toLowerCase(),

  validate,
];

// ─────────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────────
export const resetPasswordValidation = [
  body('token').trim().notEmpty().withMessage('Reset token is required'),

  body('password')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),

  validate,
];
