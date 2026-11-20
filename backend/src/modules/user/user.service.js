import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from './user.model.js';
import { ApiError } from '../../utils/ApiError.js';
import Config from '../../config/config.js';
import { ROLES, ROLE_VALUES } from '../../constants/roles.js';
import { deleteCache, setCache } from '../../utils/cache.js';
import logger from '../../config/logger.js';
import { UploadImageToImageKit } from '../../services/image.service.js';
import { MailService } from '../../services/mail.service.js';

const mailService = new MailService();
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// ─────────────────────────────────────────────
// REGISTER USER
// ─────────────────────────────────────────────
export const registerUser = async ({
  fullName,
  username,
  email,
  password,
  mobile,
  role = ROLES.CUSTOMER,
  avatarBuffer,
  avatarMimeType,
}) => {
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedUsername = username?.trim().toLowerCase();

  // Validate unique email
  const existingEmail = await User.findOne({ email: normalizedEmail });
  if (existingEmail) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  // Validate unique username
  const existingUsername = await User.findOne({ username: normalizedUsername });
  if (existingUsername) {
    throw new ApiError(409, 'An account with this username already exists');
  }

  // Validate unique mobile if provided
  if (mobile) {
    const existingMobile = await User.findOne({ mobile: mobile.trim() });
    if (existingMobile) {
      throw new ApiError(409, 'An account with this mobile number already exists');
    }
  }

  // Upload avatar if provided
  let avatarUrl = null;
  if (avatarBuffer) {
    if (avatarBuffer.length > MAX_IMAGE_SIZE) {
      throw new ApiError(400, 'Profile image size must not exceed 5MB');
    }
    const extension =
      {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
      }[avatarMimeType] || 'jpg';

    const upload = await UploadImageToImageKit({
      buffer: avatarBuffer,
      fileName: `avatar-${normalizedUsername}-${Date.now()}.${extension}`,
      folderPath: 'food-delivery/users',
    });

    if (!upload?.url) {
      throw new ApiError(502, 'Failed to upload profile image to image hosting');
    }
    avatarUrl = upload.url;
  }

  // Generate 6-digit verification OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Ensure role is valid
  const assignedRole = ROLE_VALUES.includes(role) ? role : ROLES.CUSTOMER;

  const user = await User.create({
    fullName: fullName.trim(),
    username: normalizedUsername,
    email: normalizedEmail,
    password,
    ...(mobile ? { mobile: mobile.trim() } : {}),
    ...(avatarUrl ? { avatar: avatarUrl } : {}),
    role: assignedRole,
    provider: 'local',
    otp,
    otpExpire,
    isVerified: false,
    isActive: true,
    isBlocked: false,
  });

  // Attempt to send verification email (non-blocking in dev/test)
  try {
    await mailService.SendRegisterMail(normalizedEmail, otp, user.fullName);
  } catch (err) {
    logger.warn(`Failed to send registration OTP email to ${normalizedEmail}: ${err.message}`);
  }

  return user;
};

// ─────────────────────────────────────────────
// LOGIN USER
// ─────────────────────────────────────────────
export const loginUser = async ({ identifier, password }) => {
  const normalizedIdentifier = identifier?.trim().toLowerCase();

  const user = await User.findOne({
    $or: [
      { email: normalizedIdentifier },
      { username: normalizedIdentifier },
      { mobile: identifier?.trim() },
    ],
  }).select('+password');

  if (!user) {
    throw new ApiError(404, 'User account not found');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated. Please contact support.');
  }

  if (user.isBlocked) {
    throw new ApiError(403, 'Account has been blocked. Please contact support.');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Generate tokens - refreshToken is saved ONLY in httpOnly cookie, NOT in user model
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.lastLoginAt = new Date();
  await user.save();

  return { user, accessToken, refreshToken };
};

// ─────────────────────────────────────────────
// LOGOUT USER
// ─────────────────────────────────────────────
export const logoutUser = async (id, accessToken) => {
  if (accessToken) {
    try {
      const decoded = jwt.decode(accessToken);
      const remainingSeconds = decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 3600;
      if (remainingSeconds > 0) {
        await setCache(`blacklist:token:${accessToken}`, '1', remainingSeconds);
      }
    } catch (err) {
      logger.warn(`Failed to blacklist access token: ${err.message}`);
    }
  }

  // Invalidate cached user profile
  await deleteCache(`auth:user:${id}`);
  return { message: 'Logged out successfully' };
};

// ─────────────────────────────────────────────
// REFRESH ACCESS TOKEN
// ─────────────────────────────────────────────
export const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token is required');
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, Config.jwt_refresh_secret);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(404, 'User account not found');
  }

  if (!user.isActive || user.isBlocked) {
    throw new ApiError(403, 'Account is deactivated or blocked');
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  return { accessToken, refreshToken };
};

// ─────────────────────────────────────────────
// GET USER PROFILE BY ID
// ─────────────────────────────────────────────
export const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

// ─────────────────────────────────────────────
// EDIT USER PROFILE (Can update all profile fields & image)
// ─────────────────────────────────────────────
export const editUserProfile = async (
  id,
  { fullName, username, email, mobile, avatar, avatarBuffer, avatarMimeType },
) => {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const updates = {};

  if (fullName !== undefined) {
    updates.fullName = fullName.trim();
  }

  if (username !== undefined) {
    const normalizedUsername = username.trim().toLowerCase();
    if (normalizedUsername !== user.username) {
      const existing = await User.findOne({
        username: normalizedUsername,
        _id: { $ne: id },
      });
      if (existing) {
        throw new ApiError(409, 'Username is already taken by another account');
      }
      updates.username = normalizedUsername;
    }
  }

  if (email !== undefined) {
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== user.email) {
      const existing = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: id },
      });
      if (existing) {
        throw new ApiError(409, 'Email is already registered by another account');
      }
      updates.email = normalizedEmail;
    }
  }

  if (mobile !== undefined) {
    const trimmedMobile = mobile ? mobile.trim() : null;
    if (trimmedMobile && trimmedMobile !== user.mobile) {
      const existing = await User.findOne({
        mobile: trimmedMobile,
        _id: { $ne: id },
      });
      if (existing) {
        throw new ApiError(409, 'Mobile number is already registered by another account');
      }
      updates.mobile = trimmedMobile;
    } else if (trimmedMobile === null || trimmedMobile === '') {
      updates.mobile = undefined;
    }
  }

  // Handle image upload with 5MB validation
  if (avatarBuffer) {
    if (avatarBuffer.length > MAX_IMAGE_SIZE) {
      throw new ApiError(400, 'Profile image size must not exceed 5MB');
    }

    const extension =
      {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
      }[avatarMimeType] || 'jpg';

    const upload = await UploadImageToImageKit({
      buffer: avatarBuffer,
      fileName: `avatar-${user.username}-${Date.now()}.${extension}`,
      folderPath: 'food-delivery/users',
    });

    if (!upload?.url) {
      throw new ApiError(502, 'Image hosting service did not return an image URL');
    }
    updates.avatar = upload.url;
  } else if (typeof avatar === 'string' && avatar.trim().length > 0) {
    updates.avatar = avatar.trim();
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: updates },
    {
      new: true,
      runValidators: true,
    },
  );

  await deleteCache(`auth:user:${id}`);
  return updatedUser;
};

// ─────────────────────────────────────────────
// CHANGE PASSWORD
// ─────────────────────────────────────────────
export const changeUserPassword = async (id, { oldPassword, newPassword }) => {
  const user = await User.findById(id).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isOldPasswordValid = await user.comparePassword(oldPassword);
  if (!isOldPasswordValid) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  await deleteCache(`auth:user:${id}`);
  return { message: 'Password changed successfully' };
};

// ─────────────────────────────────────────────
// VERIFY USER BY OTP
// ─────────────────────────────────────────────
export const verifyUserByOTP = async (email, otp) => {
  const normalizedEmail = email?.trim().toLowerCase();
  const user = await User.findOne({
    email: normalizedEmail,
    otp,
  }).select('+otp +otpExpire');

  if (!user || !user.otpExpire || user.otpExpire <= new Date()) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpire = null;
  await user.save();

  await deleteCache(`auth:user:${user._id}`);
  return user;
};

// ─────────────────────────────────────────────
// RESEND USER OTP
// ─────────────────────────────────────────────
export const resendUserOtp = async (email) => {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new ApiError(400, 'A valid email address is required');
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new ApiError(404, 'Account with this email was not found');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  try {
    await mailService.SendRegisterMail(normalizedEmail, otp, user.fullName);
  } catch (err) {
    logger.warn(`Failed to send resend OTP mail: ${err.message}`);
  }

  return { message: 'Verification OTP has been resent successfully' };
};

// ─────────────────────────────────────────────
// FORGOT PASSWORD (REQUEST RESET LINK)
// ─────────────────────────────────────────────
export const requestPasswordReset = async (email) => {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new ApiError(400, 'A valid email address is required');
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    // Return success to avoid email enumeration
    return { message: 'If an account exists with this email, a reset link has been sent.' };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  const frontendBase = Config.frontend_url || 'http://localhost:5173';
  const resetUrl = `${frontendBase}/reset-password?token=${resetToken}`;

  try {
    await mailService.SendPasswordResetMail(normalizedEmail, resetUrl, user.fullName);
  } catch (err) {
    logger.warn(`Failed to send password reset email: ${err.message}`);
  }

  return { message: 'If an account exists with this email, a reset link has been sent.' };
};

// ─────────────────────────────────────────────
// RESET PASSWORD WITH TOKEN
// ─────────────────────────────────────────────
export const resetPasswordWithToken = async (token, newPassword) => {
  if (!token) {
    throw new ApiError(400, 'Reset token is required');
  }
  if (!newPassword || newPassword.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+password +passwordResetToken +passwordResetExpires');

  if (!user) {
    throw new ApiError(400, 'Reset token is invalid or has expired');
  }

  user.password = newPassword;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  await deleteCache(`auth:user:${user._id}`);
  return { message: 'Password has been successfully reset. You can now log in.' };
};
