import jwt from 'jsonwebtoken';
import Config from '../config/config.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const verifyJWT = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.accessToken

  if (!token) {
    throw new ApiError(401, 'Unauthorized request: Access token is missing');
  }

  // // Check Redis blacklist if token was invalidated on logout
  // const isBlacklisted = await getCache(`blacklist:token:${token}`);
  // if (isBlacklisted) {
  //   throw new ApiError(401, 'Access token has been revoked. Please log in again.');
  // }

  let decoded;
  try {
    decoded = jwt.verify(token, Config.jwt_access_secret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token has expired');
    }
    throw new ApiError(401, 'Invalid access token');
  }
  decoded._id = decoded._id || decoded.id;
  decoded.id = decoded.id || decoded._id;
  req.user = decoded;
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
