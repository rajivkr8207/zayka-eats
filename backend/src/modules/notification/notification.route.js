import { Router } from 'express';
import {
  getUserNotificationsController,
  getUnreadCountController,
  markNotificationAsReadController,
  markAllAsReadController,
  deleteNotificationController,
  clearReadNotificationsController,
  createNotificationController,
  broadcastNotificationController,
} from './notification.controller.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';
import {
  notificationIdParamValidation,
  createNotificationValidation,
  listNotificationsQueryValidation,
} from './notification.validate.js';

const notificationRouter = Router();

// ─────────────────────────────────────────────
// USER NOTIFICATION ENDPOINTS
// ─────────────────────────────────────────────

/**
 * @route   GET /api/v1/notifications
 * @desc    Get user notifications with pagination & unread filter
 * @access  Protected (All authenticated users)
 */
notificationRouter.get(
  '/',
  verifyJWT,
  listNotificationsQueryValidation,
  getUserNotificationsController,
);

/**
 * @route   GET /api/v1/notifications/unread-count
 * @desc    Get count of unread notifications for navbar bell icon
 * @access  Protected (All authenticated users)
 */
notificationRouter.get('/unread-count', verifyJWT, getUnreadCountController);

/**
 * @route   PATCH /api/v1/notifications/mark-all-read
 * @desc    Mark all unread notifications as read
 * @access  Protected
 */
notificationRouter.patch('/mark-all-read', verifyJWT, markAllAsReadController);

/**
 * @route   PATCH /api/v1/notifications/:id/read
 * @desc    Mark a specific notification as read
 * @access  Protected
 */
notificationRouter.patch(
  '/:id/read',
  verifyJWT,
  notificationIdParamValidation,
  markNotificationAsReadController,
);

/**
 * @route   DELETE /api/v1/notifications/clear-read
 * @desc    Delete all read notifications from inbox
 * @access  Protected
 */
notificationRouter.delete('/clear-read', verifyJWT, clearReadNotificationsController);

/**
 * @route   DELETE /api/v1/notifications/:id
 * @desc    Delete a specific notification
 * @access  Protected
 */
notificationRouter.delete(
  '/:id',
  verifyJWT,
  notificationIdParamValidation,
  deleteNotificationController,
);

// ─────────────────────────────────────────────
// ADMIN BROADCAST & TARGETED ALERTS
// ─────────────────────────────────────────────

/**
 * @route   POST /api/v1/notifications/send
 * @desc    Send custom/system notification to a specific user
 * @access  Protected (Admin only)
 */
notificationRouter.post(
  '/send',
  verifyJWT,
  authorizeRoles(ROLES.ADMIN),
  createNotificationValidation,
  createNotificationController,
);

/**
 * @route   POST /api/v1/notifications/broadcast
 * @desc    Broadcast a notification to all active users
 * @access  Protected (Admin only)
 */
notificationRouter.post(
  '/broadcast',
  verifyJWT,
  authorizeRoles(ROLES.ADMIN),
  createNotificationValidation,
  broadcastNotificationController,
);

export default notificationRouter;
