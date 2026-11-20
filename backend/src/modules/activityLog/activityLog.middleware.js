import { createActivityLog } from './activityLog.service.js';
import logger from '../../config/logger.js';

const writeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Determine human-readable action and entity type based on Zayka Eats routes.
 */
const getActionAndEntity = (req, body) => {
  const route = req.originalUrl.split('?')[0].replace(/^\/api\/v\d+/, '');
  const lowerRoute = route.toLowerCase();
  const method = req.method;

  // 1. Auth routes
  if (lowerRoute.startsWith('/auth')) {
    if (lowerRoute.endsWith('/register'))
      return { action: 'Registered new user account', entityType: 'user' };
    if (lowerRoute.endsWith('/login')) return { action: 'User logged in', entityType: 'user' };
    if (lowerRoute.endsWith('/logout')) return { action: 'User logged out', entityType: 'user' };
    if (lowerRoute.endsWith('/verify-otp'))
      return { action: 'Verified user account via OTP', entityType: 'user' };
    if (lowerRoute.endsWith('/resend-otp'))
      return { action: 'Requested OTP resend', entityType: 'user' };
    if (lowerRoute.endsWith('/forgot-password'))
      return { action: 'Requested password reset link', entityType: 'user' };
    if (lowerRoute.endsWith('/reset-password'))
      return { action: 'Reset account password', entityType: 'user' };
    if (lowerRoute.endsWith('/change-password'))
      return { action: 'Changed account password', entityType: 'user' };
    if (lowerRoute.endsWith('/profile'))
      return { action: 'Updated user profile', entityType: 'user' };
    return { action: `User auth operation (${method})`, entityType: 'user' };
  }

  // 2. Orders
  if (lowerRoute.startsWith('/orders')) {
    if (lowerRoute.endsWith('/verify-payment'))
      return { action: 'Verified online payment for order', entityType: 'order' };
    if (/\/orders\/[^/]+\/status$/.test(lowerRoute)) {
      const newStatus = req.body?.status || req.body?.newStatus || 'updated';
      return { action: `Updated order status to '${newStatus}'`, entityType: 'order' };
    }
    if (/\/orders\/[^/]+\/assign-rider$/.test(lowerRoute))
      return { action: 'Assigned delivery partner to order', entityType: 'order' };
    if (/\/orders\/[^/]+\/cancel$/.test(lowerRoute))
      return { action: 'Cancelled order', entityType: 'order' };
    if (method === 'POST') {
      const orderNum = body?.data?.orderNumber ? ` (${body.data.orderNumber})` : '';
      return { action: `Placed food order${orderNum}`, entityType: 'order' };
    }
    return { action: `Order ${method.toLowerCase()}d`, entityType: 'order' };
  }

  // 3. Restaurants
  if (lowerRoute.startsWith('/restaurants')) {
    if (/\/restaurants\/[^/]+\/approval$/.test(lowerRoute)) {
      const status = req.body?.isApproved ? 'approved' : 'rejected';
      return { action: `Admin ${status} restaurant`, entityType: 'restaurant' };
    }
    if (/\/restaurants\/[^/]+\/status$/.test(lowerRoute)) {
      const state = req.body?.isOpen ? 'Open' : req.body?.isOpen === false ? 'Closed' : 'updated';
      return { action: `Toggled restaurant status to '${state}'`, entityType: 'restaurant' };
    }
    if (method === 'POST') return { action: 'Registered new restaurant', entityType: 'restaurant' };
    if (method === 'PATCH' || method === 'PUT')
      return { action: 'Updated restaurant details', entityType: 'restaurant' };
    if (method === 'DELETE') return { action: 'Deleted restaurant', entityType: 'restaurant' };
    return { action: `Restaurant ${method.toLowerCase()}d`, entityType: 'restaurant' };
  }

  // 4. Menus
  if (lowerRoute.startsWith('/menus')) {
    if (/\/menus\/[^/]+\/status$/.test(lowerRoute))
      return { action: 'Toggled menu status', entityType: 'menu' };
    if (method === 'POST') return { action: 'Created restaurant menu', entityType: 'menu' };
    if (method === 'PATCH' || method === 'PUT')
      return { action: 'Updated restaurant menu', entityType: 'menu' };
    if (method === 'DELETE') return { action: 'Deleted restaurant menu', entityType: 'menu' };
    return { action: `Menu ${method.toLowerCase()}d`, entityType: 'menu' };
  }

  // 5. Food Categories
  if (lowerRoute.startsWith('/food-categories')) {
    if (/\/food-categories\/[^/]+\/status$/.test(lowerRoute))
      return { action: 'Toggled food category status', entityType: 'food_category' };
    if (method === 'POST') return { action: 'Created food category', entityType: 'food_category' };
    if (method === 'PATCH' || method === 'PUT')
      return { action: 'Updated food category', entityType: 'food_category' };
    if (method === 'DELETE')
      return { action: 'Deleted food category', entityType: 'food_category' };
    return { action: `Food category ${method.toLowerCase()}d`, entityType: 'food_category' };
  }

  // 6. Cart
  if (lowerRoute.startsWith('/cart')) {
    if (lowerRoute.endsWith('/coupon')) {
      return {
        action:
          method === 'DELETE'
            ? 'Removed coupon from cart'
            : `Applied coupon to cart (${req.body?.code || ''})`.trim(),
        entityType: 'cart',
      };
    }
    if (/\/cart\/items\/[^/]+$/.test(lowerRoute)) {
      return {
        action: method === 'DELETE' ? 'Removed item from cart' : 'Updated cart item quantity',
        entityType: 'cart',
      };
    }
    if (lowerRoute.endsWith('/items') && method === 'POST')
      return { action: 'Added item to cart', entityType: 'cart' };
    if (method === 'DELETE') return { action: 'Cleared cart', entityType: 'cart' };
    return { action: `Cart ${method.toLowerCase()}d`, entityType: 'cart' };
  }

  // 7. Delivery
  if (lowerRoute.startsWith('/delivery')) {
    if (lowerRoute.endsWith('/onboard'))
      return { action: 'Submitted delivery partner KYC onboarding', entityType: 'delivery' };
    if (lowerRoute.endsWith('/status/online')) {
      const state = req.body?.isOnline ? 'Online' : 'Offline';
      return { action: `Delivery partner duty set to '${state}'`, entityType: 'delivery' };
    }
    if (lowerRoute.endsWith('/profile'))
      return { action: 'Updated delivery profile', entityType: 'delivery' };
    if (/\/delivery\/tasks\/[^/]+\/accept$/.test(lowerRoute))
      return { action: 'Accepted delivery task', entityType: 'order' };
    if (/\/delivery\/tasks\/[^/]+\/complete$/.test(lowerRoute))
      return { action: 'Delivered order (Completed task)', entityType: 'order' };
    if (/\/delivery\/partners\/[^/]+\/verify$/.test(lowerRoute)) {
      const status = req.body?.status || 'reviewed';
      return {
        action: `Admin reviewed delivery partner verification (${status})`,
        entityType: 'delivery',
      };
    }
    return { action: `Delivery ${method.toLowerCase()}d`, entityType: 'delivery' };
  }

  // 8. Payments
  if (lowerRoute.startsWith('/payments')) {
    if (lowerRoute.endsWith('/initiate'))
      return { action: 'Initiated online payment', entityType: 'payment' };
    if (lowerRoute.endsWith('/verify'))
      return { action: 'Verified payment transaction', entityType: 'payment' };
    if (lowerRoute.endsWith('/webhook'))
      return { action: 'Processed Razorpay webhook', entityType: 'payment' };
    if (/\/payments\/[^/]+\/refund$/.test(lowerRoute))
      return { action: 'Processed payment refund', entityType: 'payment' };
    return { action: `Payment ${method.toLowerCase()}d`, entityType: 'payment' };
  }

  // 9. Coupons
  if (lowerRoute.startsWith('/coupons')) {
    if (lowerRoute.endsWith('/apply'))
      return { action: `Validated coupon (${req.body?.code || ''})`.trim(), entityType: 'coupon' };
    if (method === 'POST')
      return { action: `Created coupon '${req.body?.code || ''}'`.trim(), entityType: 'coupon' };
    if (method === 'PATCH' || method === 'PUT')
      return { action: 'Updated coupon details', entityType: 'coupon' };
    if (method === 'DELETE') return { action: 'Deleted coupon', entityType: 'coupon' };
    return { action: `Coupon ${method.toLowerCase()}d`, entityType: 'coupon' };
  }

  // 10. Reviews
  if (lowerRoute.startsWith('/reviews')) {
    if (method === 'POST')
      return {
        action: `Submitted rating & review (${req.body?.rating || 5}★)`,
        entityType: 'review',
      };
    if (method === 'PATCH' || method === 'PUT')
      return { action: 'Updated review', entityType: 'review' };
    if (method === 'DELETE') return { action: 'Deleted review', entityType: 'review' };
    return { action: `Review ${method.toLowerCase()}d`, entityType: 'review' };
  }

  // 11. Addresses
  if (lowerRoute.startsWith('/addresses')) {
    if (/\/addresses\/[^/]+\/set-default$/.test(lowerRoute))
      return { action: 'Set primary delivery address', entityType: 'address' };
    if (method === 'POST') return { action: 'Added delivery address', entityType: 'address' };
    if (method === 'PATCH' || method === 'PUT')
      return { action: 'Updated delivery address', entityType: 'address' };
    if (method === 'DELETE') return { action: 'Deleted delivery address', entityType: 'address' };
    return { action: `Address ${method.toLowerCase()}d`, entityType: 'address' };
  }

  // 12. Notifications
  if (lowerRoute.startsWith('/notifications')) {
    if (lowerRoute.endsWith('/read-all'))
      return { action: 'Marked all notifications as read', entityType: 'notification' };
    if (lowerRoute.endsWith('/clear-all'))
      return { action: 'Cleared all notifications', entityType: 'notification' };
    if (/\/notifications\/[^/]+\/read$/.test(lowerRoute))
      return { action: 'Marked notification as read', entityType: 'notification' };
    if (method === 'DELETE') return { action: 'Deleted notification', entityType: 'notification' };
    return { action: `Notification ${method.toLowerCase()}d`, entityType: 'notification' };
  }

  // Fallback generic
  const actionByMethod = {
    POST: 'Created',
    PUT: 'Updated',
    PATCH: 'Updated',
    DELETE: 'Deleted',
  };
  return {
    action: `${actionByMethod[method] || 'Performed action on'} ${lowerRoute.slice(1)}`,
    entityType: 'other',
  };
};

/**
 * Extract entity ID from params, URL, or response body.
 */
const getEntityId = (req, body) => {
  if (req.params?.id) return String(req.params.id);
  if (req.params?.orderId) return String(req.params.orderId);
  if (req.params?.itemId) return String(req.params.itemId);
  if (req.params?.paymentId) return String(req.params.paymentId);

  // Check URL match for IDs (e.g., /api/v1/orders/6735e0c.../cancel)
  const segments = req.originalUrl.split('?')[0].split('/');
  for (const seg of segments) {
    if (/^[0-9a-fA-F]{24}$/.test(seg)) {
      return seg;
    }
  }

  // Check response body
  if (body?.data?._id) return String(body.data._id);
  if (body?.data?.order?._id) return String(body.data.order._id);
  if (body?.data?.orderNumber) return String(body.data.orderNumber);

  return null;
};

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'refreshtoken',
  'secret',
  'authorization',
  'cookie',
  'otp',
  'razorpay_key_secret',
  'gatewaySignature',
]);

/**
 * Sanitize objects to protect user credentials & secrets.
 */
const sanitize = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);

  const clean = {};
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(k.toLowerCase())) continue;
    if (typeof v === 'object' && v !== null) {
      clean[k] = sanitize(v);
    } else {
      clean[k] = v;
    }
  }
  return clean;
};

const getMessage = (body, outcome) => {
  const parts = [];
  const base = typeof body?.message === 'string' ? body.message.trim() : '';
  if (base) parts.push(base);

  if (Array.isArray(body?.errors) && body.errors.length > 0) {
    const errMsgs = body.errors
      .map((e) => (typeof e === 'string' ? e : e?.msg || e?.message || JSON.stringify(e)))
      .filter(Boolean)
      .join('; ');
    if (errMsgs) parts.push(`Errors: ${errMsgs}`);
  }

  if (typeof body?.error === 'string' && body.error.trim()) {
    parts.push(body.error.trim());
  }

  const combined = parts
    .join(' | ')
    .replace(/[\r\n\t]+/g, ' ')
    .slice(0, 1000);

  return (
    combined || (outcome === 'success' ? 'Operation completed successfully' : 'Operation failed')
  );
};

const getDetails = (req, body, outcome) => {
  const details = {};

  if (outcome === 'failure') {
    if (body?.errors) details.errors = sanitize(body.errors);
    if (body?.data) details.data = sanitize(body.data);
  }

  // For key actions, capture light sanitized payload details
  if (req.body && Object.keys(req.body).length > 0) {
    const cleanBody = sanitize(req.body);
    // Don't store oversized base64 or documents
    delete cleanBody.drivingLicense;
    delete cleanBody.aadhaarCard;
    delete cleanBody.panCard;
    delete cleanBody.vehicleRc;
    delete cleanBody.image;
    delete cleanBody.avatar;
    details.requestPayload = cleanBody;
  }

  return Object.keys(details).length > 0 ? details : null;
};

/**
 * Express middleware for automatic activity logging.
 */
export const auditActivity = (req, res, next) => {
  // Only audit state-modifying requests
  if (!writeMethods.has(req.method)) return next();

  // Skip high-frequency GPS ping route to avoid flooding database
  if (req.originalUrl.includes('/delivery/location')) return next();

  const sendJson = res.json.bind(res);
  let responseHandled = false;

  res.json = (body) => {
    if (responseHandled) return sendJson(body);
    responseHandled = true;

    // Resolve Actor
    let actorId = null;
    let actorName = 'Guest / System';
    let actorEmail = 'guest@zaykaeats.com';
    let actorRole = 'guest';

    if (req.user) {
      actorId = req.user._id || req.user.id || null;
      actorName = req.user.fullName || req.user.name || req.user.username || req.user.email;
      actorEmail = req.user.email || 'user@zaykaeats.com';
      actorRole = req.user.role || 'customer';
    } else if (body?.data?.user) {
      // Login or register success
      const u = body.data.user;
      actorId = u._id || u.id || null;
      actorName = u.fullName || u.username || u.email;
      actorEmail = u.email || 'user@zaykaeats.com';
      actorRole = u.role || 'customer';
    } else if (req.body?.email || req.body?.identifier) {
      actorEmail = String(req.body.email || req.body.identifier).toLowerCase();
      actorName = actorEmail;
    }

    const outcome = res.statusCode >= 400 ? 'failure' : 'success';
    const { action, entityType } = getActionAndEntity(req, body);
    const entityId = getEntityId(req, body);

    const clientIp =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      null;

    const entry = {
      actorId,
      actorName: actorName.slice(0, 120),
      actorEmail: actorEmail.slice(0, 254),
      actorRole: actorRole.slice(0, 40),
      action: action.slice(0, 200),
      entityType,
      entityId,
      method: req.method,
      route: req.originalUrl
        .split('?')[0]
        .replace(/^\/api\/v\d+/, '')
        .slice(0, 240),
      ipAddress: clientIp ? String(clientIp).slice(0, 45) : null,
      userAgent: req.headers['user-agent'] ? String(req.headers['user-agent']).slice(0, 500) : null,
      outcome,
      statusCode: res.statusCode,
      message: getMessage(body, outcome),
      details: getDetails(req, body, outcome),
    };

    createActivityLog(entry)
      .catch((error) => {
        logger.error('[ActivityLog] Failed to persist activity log', {
          error: error.message,
          action: entry.action,
          route: entry.route,
        });
      })
      .finally(() => sendJson(body));

    return res;
  };

  return next();
};
