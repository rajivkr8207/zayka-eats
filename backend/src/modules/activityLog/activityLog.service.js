import ActivityLog from './activityLog.model.js';
import { ApiError } from '../../utils/ApiError.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Persist new activity log entry.
 */
export const createActivityLog = async (entry) => {
  return ActivityLog.create(entry);
};

/**
 * List activity logs with rich filtering & pagination (Admin/Superadmin).
 */
export const listActivityLogs = async ({
  page = 1,
  limit = 20,
  outcome,
  actorRole,
  actorId,
  entityType,
  entityId,
  search,
  startDate,
  endDate,
}) => {
  const filter = {};

  if (outcome && ['success', 'failure'].includes(outcome)) {
    filter.outcome = outcome;
  }

  if (actorRole) {
    filter.actorRole = actorRole;
  }

  if (actorId) {
    filter.actorId = actorId;
  }

  if (entityType) {
    filter.entityType = entityType;
  }

  if (entityId) {
    filter.entityId = entityId;
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  if (search && search.trim()) {
    const matcher = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [
      { actorName: matcher },
      { actorEmail: matcher },
      { action: matcher },
      { message: matcher },
      { route: matcher },
      { entityId: matcher },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limitNum).lean(),
    ActivityLog.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Retrieve activity logs for a specific user (My Activity).
 */
export const getUserActivityLogs = async (userId, { page = 1, limit = 20 }) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const filter = { actorId: userId };

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    ActivityLog.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Get a single activity log by ID.
 */
export const getActivityLogById = async (logId) => {
  const log = await ActivityLog.findById(logId).lean();
  if (!log) {
    throw new ApiError(404, 'Activity log not found');
  }
  return log;
};

/**
 * Get aggregated summary statistics of platform activity (Admin Dashboard).
 */
export const getActivityLogStats = async () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [totalLogs, todayLogs, successLogs, failureLogs, entityBreakdown, topActions] =
    await Promise.all([
      ActivityLog.countDocuments(),
      ActivityLog.countDocuments({ createdAt: { $gte: startOfDay } }),
      ActivityLog.countDocuments({ outcome: 'success' }),
      ActivityLog.countDocuments({ outcome: 'failure' }),
      ActivityLog.aggregate([
        { $group: { _id: '$entityType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      ActivityLog.aggregate([
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

  return {
    totalLogs,
    todayLogs,
    successLogs,
    failureLogs,
    entityBreakdown,
    topActions,
  };
};
