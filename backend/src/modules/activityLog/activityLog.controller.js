import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
  listActivityLogs,
  getUserActivityLogs,
  getActivityLogById,
  getActivityLogStats,
} from './activityLog.service.js';

/**
 * @route   GET /api/v1/activity-logs
 * @desc    Get paginated activity logs with filters (Admin only)
 * @access  Protected (Admin)
 */
export const listActivityLogsController = asyncHandler(async (req, res) => {
  const result = await listActivityLogs(req.query);
  return res.status(200).json(new ApiResponse(200, result, 'Activity logs fetched successfully'));
});

/**
 * @route   GET /api/v1/activity-logs/my-logs
 * @desc    Get activity logs for current logged-in user
 * @access  Protected
 */
export const getMyActivityLogsController = asyncHandler(async (req, res) => {
  const result = await getUserActivityLogs(req.user._id || req.user.id, req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Your activity logs fetched successfully'));
});

/**
 * @route   GET /api/v1/activity-logs/stats
 * @desc    Get platform activity summary stats (Admin only)
 * @access  Protected (Admin)
 */
export const getActivityLogStatsController = asyncHandler(async (_req, res) => {
  const stats = await getActivityLogStats();
  return res
    .status(200)
    .json(new ApiResponse(200, stats, 'Activity log statistics fetched successfully'));
});

/**
 * @route   GET /api/v1/activity-logs/:id
 * @desc    Get single activity log details by ID
 * @access  Protected (Admin)
 */
export const getActivityLogByIdController = asyncHandler(async (req, res) => {
  const log = await getActivityLogById(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, log, 'Activity log details fetched successfully'));
});
