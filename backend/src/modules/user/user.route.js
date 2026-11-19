import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  editProfile,
  changePassword,
  VerifyUserByOTPController,
  ResendUserOtpController,
  forgotPassword,
  resetPassword,
} from './user.controller.js';
import { verifyJWT } from '../../middlewares/auth.middleware.js';
import { receiveOptionalImage } from '../../middlewares/imageUpload.middleware.js';
import {
  loginValidation,
  registerValidation,
  editProfileValidation,
  changePasswordValidation,
  verifyOtpValidation,
  resendOtpValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from './user.validate.js';

const authRouter = Router();

// ─────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user account with optional profile image (max 5MB)
 * @access  Public
 */
authRouter.post('/register', receiveOptionalImage, registerValidation, register);

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Verify user account using 6-digit OTP
 * @access  Public
 */
authRouter.post('/verify-otp', verifyOtpValidation, VerifyUserByOTPController);

/**
 * @route   POST /api/v1/auth/resend-otp
 * @desc    Resend verification OTP to user's email
 * @access  Public
 */
authRouter.post('/resend-otp', resendOtpValidation, ResendUserOtpController);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login with identifier (email/username/mobile) and password
 * @access  Public
 */
authRouter.post('/login', loginValidation, login);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh access token using httpOnly refreshToken cookie
 * @access  Public
 */
authRouter.post('/refresh-token', refreshToken);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send password reset link to user's email
 * @access  Public
 */
authRouter.post('/forgot-password', forgotPasswordValidation, forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password using reset token
 * @access  Public
 */
authRouter.post('/reset-password', resetPasswordValidation, resetPassword);

// ─────────────────────────────────────────────
// PROTECTED ROUTES (Requires valid JWT access token)
// ─────────────────────────────────────────────

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user and clear authentication cookies
 * @access  Protected
 */
authRouter.post('/logout', verifyJWT, logout);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user profile
 * @access  Protected
 */
authRouter.get('/profile', verifyJWT, getProfile);

/**
 * @route   PATCH /api/v1/auth/profile
 * @desc    Update user profile fields (fullName, username, email, mobile, avatar image <= 5MB)
 * @access  Protected
 */
authRouter.patch(
  '/profile',
  verifyJWT,
  receiveOptionalImage,
  editProfileValidation,
  editProfile,
);

/**
 * @route   PATCH /api/v1/auth/change-password
 * @desc    Change current user password
 * @access  Protected
 */
authRouter.patch(
  '/change-password',
  verifyJWT,
  changePasswordValidation,
  changePassword,
);

export default authRouter;
