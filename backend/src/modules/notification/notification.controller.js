import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearReadNotifications,
  sendNotification,
  broadcastNotification,
} from './notification.service.js';

// ─────────────────────────────────────────────
// GET /api/v1/notifications (Protected - Customer/Owner/Rider)
// ─────────────────────────────────────────────
export const getUserNotificationsController = asyncHandler(async (req, res) => {
  const result = await getUserNotifications({
    userId: req.user._id,
    isRead: req.query.isRead,
    page: req.query.page,
    limit: req.query.limit,
  });

  return res.status(200).json(new ApiResponse(200, result, 'Notifications fetched successfully'));
});

// ─────────────────────────────────────────────
// GET /api/v1/notifications/unread-count (Protected)
// ─────────────────────────────────────────────
export const getUnreadCountController = asyncHandler(async (req, res) => {
  const result = await getUnreadNotificationCount(req.user._id);
  return res.status(200).json(new ApiResponse(200, result, 'Unread count fetched successfully'));
});

// ─────────────────────────────────────────────
// PATCH /api/v1/notifications/:id/read (Protected)
// ─────────────────────────────────────────────
export const markNotificationAsReadController = asyncHandler(async (req, res) => {
  const notification = await markNotificationAsRead({
    notificationId: req.params.id,
    userId: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { notification }, 'Notification marked as read'));
});

// ─────────────────────────────────────────────
// PATCH /api/v1/notifications/mark-all-read (Protected)
// ─────────────────────────────────────────────
export const markAllAsReadController = asyncHandler(async (req, res) => {
  const result = await markAllNotificationsAsRead(req.user._id);
  return res.status(200).json(new ApiResponse(200, result, 'All notifications marked as read'));
});

// ─────────────────────────────────────────────
// DELETE /api/v1/notifications/:id (Protected)
// ─────────────────────────────────────────────
export const deleteNotificationController = asyncHandler(async (req, res) => {
  const result = await deleteNotification({
    notificationId: req.params.id,
    userId: req.user._id,
  });

  return res.status(200).json(new ApiResponse(200, result, 'Notification deleted successfully'));
});

// ─────────────────────────────────────────────
// DELETE /api/v1/notifications/clear-read (Protected)
// ─────────────────────────────────────────────
export const clearReadNotificationsController = asyncHandler(async (req, res) => {
  const result = await clearReadNotifications(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'All read notifications cleared successfully'));
});

// ─────────────────────────────────────────────
// POST /api/v1/notifications/send (Protected - Admin)
// ─────────────────────────────────────────────
export const createNotificationController = asyncHandler(async (req, res) => {
  const { recipientId, title, message, type, orderId, data } = req.body;

  const notification = await sendNotification({
    recipientId,
    title,
    message,
    type,
    orderId,
    data,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { notification }, 'Notification sent successfully'));
});

// ─────────────────────────────────────────────
// POST /api/v1/notifications/broadcast (Protected - Admin)
// ─────────────────────────────────────────────
export const broadcastNotificationController = asyncHandler(async (req, res) => {
  const { title, message, type, data } = req.body;

  const result = await broadcastNotification({
    title,
    message,
    type,
    data,
  });

  return res.status(200).json(new ApiResponse(200, result, 'Broadcast notification completed'));
});
