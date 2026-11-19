import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getUserById,
  editUserProfile,
  changeUserPassword,
  verifyUserByOTP,
  resendUserOtp,
  requestPasswordReset,
  resetPasswordWithToken,
} from './user.service.js';
import Config from '../../config/config.js';

const cookieOptions = {
  httpOnly: true,
  secure: Config.Node_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const cookieClearOptions = {
  httpOnly: true,
  secure: Config.Node_ENV === 'production',
  sameSite: 'strict',
};

// ─────────────────────────────────────────────
// POST /api/v1/auth/register
// ─────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { fullName, username, email, password, mobile, role } = req.body;

  const user = await registerUser({
    fullName,
    username,
    email,
    password,
    mobile,
    role,
    avatarBuffer: req.file?.buffer,
    avatarMimeType: req.file?.mimetype,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user },
        'User registered successfully. Please verify your account with the OTP sent to your email.',
      ),
    );
});

// ─────────────────────────────────────────────
// POST /api/v1/auth/verify-otp
// ─────────────────────────────────────────────
export const VerifyUserByOTPController = asyncHandler(async (req, res) => {
  const email = (req.body.email || req.query.email)?.trim().toLowerCase();
  const { otp } = req.body;

  const user = await verifyUserByOTP(email, otp);
  return res.status(200).json(new ApiResponse(200, { user }, 'User verified successfully'));
});

// ─────────────────────────────────────────────
// POST /api/v1/auth/resend-otp
// ─────────────────────────────────────────────
export const ResendUserOtpController = asyncHandler(async (req, res) => {
  const email = (req.body.email || req.query.email)?.trim().toLowerCase();
  const result = await resendUserOtp(email);
  return res.status(200).json(new ApiResponse(200, result, result.message));
});

// ─────────────────────────────────────────────
// POST /api/v1/auth/login
// ─────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  const { user, accessToken, refreshToken } = await loginUser({ identifier, password });

  return res
    .status(200)
    .cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000, // 1 hour
    })
    .cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json(new ApiResponse(200, { user, accessToken }, 'Login successful'));
});

// ─────────────────────────────────────────────
// POST /api/v1/auth/logout [Protected]
// ─────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  await logoutUser(req.user.id, req._accessToken);

  return res
    .clearCookie('accessToken', cookieClearOptions)
    .clearCookie('refreshToken', cookieClearOptions)
    .status(200)
    .json(new ApiResponse(200, {}, 'Logged out successfully'));
});

// ─────────────────────────────────────────────
// POST /api/v1/auth/refresh-token
// ─────────────────────────────────────────────
export const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  const { accessToken, refreshToken: newRefreshToken } =
    await refreshAccessToken(incomingRefreshToken);

  return res
    .status(200)
    .cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000,
    })
    .cookie('refreshToken', newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(new ApiResponse(200, { accessToken }, 'Access token refreshed successfully'));
});

// ─────────────────────────────────────────────
// GET /api/v1/auth/profile [Protected]
// ─────────────────────────────────────────────
export const getProfile = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.id);
  return res.status(200).json(new ApiResponse(200, user, 'Profile fetched successfully'));
});

// ─────────────────────────────────────────────
// PATCH /api/v1/auth/profile [Protected]
// User can update all profile fields & avatar image
// ─────────────────────────────────────────────
export const editProfile = asyncHandler(async (req, res) => {
  const { fullName, username, email, mobile, avatar } = req.body;

  const user = await editUserProfile(req.user.id, {
    fullName,
    username,
    email,
    mobile,
    avatar,
    avatarBuffer: req.file?.buffer,
    avatarMimeType: req.file?.mimetype,
  });

  return res.status(200).json(new ApiResponse(200, user, 'Profile updated successfully'));
});

// ─────────────────────────────────────────────
// PATCH /api/v1/auth/change-password [Protected]
// ─────────────────────────────────────────────
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const result = await changeUserPassword(req.user.id, { oldPassword, newPassword });

  return res.status(200).json(new ApiResponse(200, result, 'Password changed successfully'));
});

// ─────────────────────────────────────────────
// POST /api/v1/auth/forgot-password
// ─────────────────────────────────────────────
export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await requestPasswordReset(req.body.email);
  return res.status(200).json(new ApiResponse(200, result, result.message));
});

// ─────────────────────────────────────────────
// POST /api/v1/auth/reset-password
// ─────────────────────────────────────────────
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const result = await resetPasswordWithToken(token, password);
  return res.status(200).json(new ApiResponse(200, result, result.message));
});
