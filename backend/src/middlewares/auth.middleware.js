import jwt from 'jsonwebtoken';
import Config from '../config/config.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../modules/user/user.model.js';
import { getCache, setCache } from '../utils/cache.js';

export const verifyJWT = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.accessToken || req.header('Authorization')?.replace(/^Bearer\s+/i, '');

  if (!token) {
    throw new ApiError(401, 'Unauthorized request: Access token is missing');
  }

  // Check Redis blacklist if token was invalidated on logout
  const isBlacklisted = await getCache(`blacklist:token:${token}`);
  if (isBlacklisted) {
    throw new ApiError(401, 'Access token has been revoked. Please log in again.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, Config.jwt_access_secret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token has expired');
    }
    throw new ApiError(401, 'Invalid access token');
  }

  // Check cache first for user profile, fallback to DB
  let user = await getCache(`auth:user:${decoded.id}`);
  if (!user) {
    user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, 'User account no longer exists');
    }
    await setCache(`auth:user:${decoded.id}`, user, 300);
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated. Please contact support.');
  }

  if (user.isBlocked) {
    throw new ApiError(403, 'Account has been blocked. Please contact support.');
  }

  req.user = user;
  req._accessToken = token;
  next();
});

export const authorizeRoles = (...roles) => {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Access denied: Role '${req.user?.role}' is not authorized to access this resource`,
      );
    }
    next();
  };
};
