import { clearTimeout, setTimeout } from 'node:timers';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Config from './config.js';
import logger from './logger.js';
import User from '../modules/user/user.model.js';
import Notification from '../modules/notification/notification.model.js';
import { getCache } from '../utils/cache.js';

let socketServer = null;

export const userRoom = (userId) => `user:${userId}`;

const getAccessToken = (socket) => {
  // 1. Check socket.handshake.auth.token
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === 'string' && authToken.trim()) {
    return authToken.replace(/^Bearer\s+/i, '').trim();
  }

  // 2. Check authorization header
  const authorization = socket.handshake.headers.authorization;
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length).trim();
  }

  // 3. Check cookies
  const cookieHeader = socket.handshake.headers.cookie;
  if (cookieHeader) {
    const accessTokenCookie = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('accessToken='));
    if (accessTokenCookie) {
      return accessTokenCookie.slice('accessToken='.length).trim();
    }
  }

  return null;
};

const authenticateSocket = async (socket, next) => {
  const token = getAccessToken(socket);
  if (!token) {
    return next(new Error('Authentication required: Token missing'));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, Config.jwt_access_secret);
  } catch (err) {
    return next(new Error(`Invalid or expired token: ${err.message}`));
  }

  if (!decoded || typeof decoded !== 'object' || !decoded.id) {
    return next(new Error('Invalid token payload'));
  }

  try {
    const isBlacklisted = await getCache(`blacklist:token:${token}`);
    if (isBlacklisted) {
      return next(new Error('Access token has been revoked'));
    }

    const user = await User.findById(decoded.id).select('_id isActive isBlocked role fullName email').lean();
    if (!user) {
      return next(new Error('User account does not exist'));
    }
    if (!user.isActive) {
      return next(new Error('User account is deactivated'));
    }
    if (user.isBlocked) {
      return next(new Error('User account is blocked'));
    }

    socket.data.userId = user._id.toString();
    socket.data.userRole = user.role;
    socket.data.tokenExpiresAt = decoded.exp;
    return next();
  } catch (err) {
    return next(new Error(`Socket authentication failed: ${err.message}`));
  }
};

export const initializeSocket = (httpServer) => {
  if (socketServer) return socketServer;

  const allowedOrigins = [
    Config.frontend_url,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
  ].filter(Boolean);

  socketServer = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  socketServer.use(authenticateSocket);

  socketServer.on('connection', (socket) => {
    const userId = socket.data.userId;
    const room = userRoom(userId);
    socket.join(room);

    logger.info(`[Socket.IO] Client connected: user=${userId}, socket=${socket.id}`);

    // Initial sync of unread notifications & recent notifications
    void Promise.all([
      Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      Notification.countDocuments({ recipient: userId, isRead: false }),
    ])
      .then(([notifications, unreadCount]) => {
        socket.emit('notification:sync', {
          notifications,
          unreadCount,
        });
      })
      .catch((error) => {
        logger.error('[Socket.IO] Failed to sync notifications on connection', {
          error: error.message,
          userId,
        });
      });

    // Client marks a specific notification as read
    socket.on('notification:mark_read', async ({ notificationId }) => {
      try {
        if (!notificationId) return;
        await Notification.findOneAndUpdate(
          { _id: notificationId, recipient: userId },
          { isRead: true, readAt: new Date() },
        );

        const unreadCount = await Notification.countDocuments({
          recipient: userId,
          isRead: false,
        });

        socketServer.to(room).emit('notification:unread_count', { unreadCount });
      } catch (err) {
        logger.error('[Socket.IO] notification:mark_read error', { error: err.message });
      }
    });

    // Client marks all notifications as read
    socket.on('notification:mark_all_read', async () => {
      try {
        await Notification.updateMany(
          { recipient: userId, isRead: false },
          { isRead: true, readAt: new Date() },
        );

        socketServer.to(room).emit('notification:unread_count', { unreadCount: 0 });
      } catch (err) {
        logger.error('[Socket.IO] notification:mark_all_read error', { error: err.message });
      }
    });

    // Disconnect handling when token expires
    if (socket.data.tokenExpiresAt) {
      const expiresIn = Math.max(socket.data.tokenExpiresAt * 1000 - Date.now(), 0);
      const expiryTimer = setTimeout(() => {
        socket.emit('auth:expired', { message: 'Session expired' });
        socket.disconnect(true);
      }, expiresIn);
      expiryTimer.unref?.();
      socket.on('disconnect', () => clearTimeout(expiryTimer));
    }

    socket.on('disconnect', (reason) => {
      logger.info(`[Socket.IO] Client disconnected: user=${userId}, reason=${reason}`);
    });
  });

  logger.info('[Socket.IO] Real-time notification server initialized');
  return socketServer;
};

/**
 * Emit event to a specific user across all their open tabs / sockets
 */
export const emitToUser = (userId, event, payload) => {
  if (!socketServer || !userId) return false;
  socketServer.to(userRoom(userId.toString())).emit(event, payload);
  return true;
};

/**
 * Emit notification to user and update unread badge in real-time
 */
export const sendLiveNotification = async (userId, notification) => {
  if (!socketServer || !userId) return false;
  const room = userRoom(userId.toString());

  // 1. Emit live popup notification event
  socketServer.to(room).emit('notification:new', notification);

  // 2. Emit updated unread count for badge
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });
    socketServer.to(room).emit('notification:unread_count', { unreadCount });
  } catch (err) {
    logger.error('[Socket.IO] Failed to update unread count', { error: err.message });
  }

  return true;
};

export const getIO = () => socketServer;

export const closeSocketServer = async () => {
  if (!socketServer) return;
  const currentServer = socketServer;
  socketServer = null;
  await new Promise((resolve) => currentServer.close(resolve));
};
