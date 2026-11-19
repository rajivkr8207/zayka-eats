import { Router } from 'express';
import {
  listActivityLogsController,
  getMyActivityLogsController,
  getActivityLogStatsController,
  getActivityLogByIdController,
} from './activityLog.controller.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';
import {
  listActivityLogsValidation,
  myActivityLogsValidation,
  logIdParamValidation,
} from './activityLog.validate.js';

const activityLogRouter = Router();

// ─────────────────────────────────────────────
// PROTECTED ACTIVITY LOG ROUTES
// ─────────────────────────────────────────────

/**
 * @route   GET /api/v1/activity-logs/my-logs
 * @desc    Get activity logs for current logged-in user
 * @access  Protected
 */
activityLogRouter.get(
  '/my-logs',
  verifyJWT,
  myActivityLogsValidation,
  getMyActivityLogsController,
);

/**
 * @route   GET /api/v1/activity-logs/stats
 * @desc    Get platform activity summary statistics
 * @access  Protected (Admin only)
 */
activityLogRouter.get(
  '/stats',
  verifyJWT,
  authorizeRoles(ROLES.ADMIN),
  getActivityLogStatsController,
);

/**
 * @route   GET /api/v1/activity-logs
 * @desc    List all activity logs with rich search & filtering
 * @access  Protected (Admin only)
 */
activityLogRouter.get(
  '/',
  verifyJWT,
  authorizeRoles(ROLES.ADMIN),
  listActivityLogsValidation,
  listActivityLogsController,
);

/**
 * @route   GET /api/v1/activity-logs/:id
 * @desc    Get single activity log details
 * @access  Protected (Admin only)
 */
activityLogRouter.get(
  '/:id',
  verifyJWT,
  authorizeRoles(ROLES.ADMIN),
  logIdParamValidation,
  getActivityLogByIdController,
);

export default activityLogRouter;
