import Notification from './notification.model.js';
import User from '../user/user.model.js';
import { sendLiveNotification, emitToUser } from '../../config/socket.js';
import { ApiError } from '../../utils/ApiError.js';
import logger from '../../config/logger.js';

// ─────────────────────────────────────────────
// CREATE & DISPATCH LIVE NOTIFICATION
// ─────────────────────────────────────────────
export const sendNotification = async ({
  recipientId,
  title,
  message,
  type = 'general',
  orderId = null,
  data = {},
  expiresDays = 30,
}) => {
  if (!recipientId) {
    throw new ApiError(400, 'Recipient ID is required to send notification');
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresDays);

  const notification = await Notification.create({
    recipient: recipientId,
    title: title.trim(),
    message: message.trim(),
    type,
    order: orderId || null,
    data: data || {},
    isRead: false,
    isSent: true,
    sentAt: new Date(),
    expiresAt,
  });

  // Real-time instant Socket.IO push to user's screen/tab
  try {
    await sendLiveNotification(recipientId, notification);
  } catch (err) {
    logger.error('[NotificationService] Socket dispatch failed:', {
      error: err.message,
      recipientId,
    });
  }

  return notification;
};

// ─────────────────────────────────────────────
// GET LOGGED-IN USER NOTIFICATIONS
// ─────────────────────────────────────────────
export const getUserNotifications = async ({ userId, isRead, page = 1, limit = 20 }) => {
  const filter = { recipient: userId };

  if (isRead !== undefined) {
    filter.isRead = String(isRead) === 'true';
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate('order', 'orderNumber orderStatus totalAmount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: userId, isRead: false }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

// ─────────────────────────────────────────────
// GET UNREAD NOTIFICATION COUNT
// ─────────────────────────────────────────────
export const getUnreadNotificationCount = async (userId) => {
  const count = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });
  return { unreadCount: count };
};

// ─────────────────────────────────────────────
// MARK SINGLE NOTIFICATION AS READ
// ─────────────────────────────────────────────
export const markNotificationAsRead = async ({ notificationId, userId }) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    // Push updated unread badge over Socket.io
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });
    emitToUser(userId, 'notification:unread_count', { unreadCount });
  }

  return notification;
};

// ─────────────────────────────────────────────
// MARK ALL USER NOTIFICATIONS AS READ
// ─────────────────────────────────────────────
export const markAllNotificationsAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } },
  );

  // Push updated unread badge (0) over Socket.io
  emitToUser(userId, 'notification:unread_count', { unreadCount: 0 });

  return {
    message: 'All notifications marked as read',
    modifiedCount: result.modifiedCount,
  };
};

// ─────────────────────────────────────────────
// DELETE NOTIFICATION
// ─────────────────────────────────────────────
export const deleteNotification = async ({ notificationId, userId }) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  // Update unread count if deleted item was unread
  if (!notification.isRead) {
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });
    emitToUser(userId, 'notification:unread_count', { unreadCount });
  }

  return { message: 'Notification deleted successfully' };
};

// ─────────────────────────────────────────────
// CLEAR ALL READ NOTIFICATIONS
// ─────────────────────────────────────────────
export const clearReadNotifications = async (userId) => {
  const result = await Notification.deleteMany({
    recipient: userId,
    isRead: true,
  });

  return {
    message: 'All read notifications cleared',
    deletedCount: result.deletedCount,
  };
};

// ─────────────────────────────────────────────
// BROADCAST NOTIFICATION (Admin Only)
// ─────────────────────────────────────────────
export const broadcastNotification = async ({ title, message, type = 'general', data = {} }) => {
  const activeUsers = await User.find({ isActive: true, isBlocked: false }).select('_id').lean();

  if (!activeUsers.length) {
    return { message: 'No active users found to broadcast to', count: 0 };
  }

  const notificationsToInsert = activeUsers.map((u) => ({
    recipient: u._id,
    title: title.trim(),
    message: message.trim(),
    type,
    data,
    isRead: false,
    isSent: true,
    sentAt: new Date(),
  }));

  await Notification.insertMany(notificationsToInsert);

  // Real-time broadcast notification event
  for (const u of activeUsers) {
    emitToUser(u._id, 'notification:new', {
      title,
      message,
      type,
      data,
      createdAt: new Date(),
    });
  }

  return {
    message: `Broadcast sent to ${activeUsers.length} users successfully`,
    count: activeUsers.length,
  };
};
