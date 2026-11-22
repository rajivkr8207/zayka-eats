import User from '../user/user.model.js';
import Restaurant from '../Restaurant/Restaurant.model.js';
import Order from '../order/order.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { listActivityLogs } from '../activityLog/activityLog.service.js';
import { getOrSetCache, deleteCache } from '../../utils/cache.js';

/** Invalidate the admin dashboard stats cache (call after restaurant/user state changes). */
export const invalidateDashboardCache = () => deleteCache('admin:dashboard:stats');

const userFields =
  'fullName username email mobile avatar role isVerified isActive isBlocked createdAt';

const getUserStatus = (user) => {
  if (user.isBlocked) return 'blocked';
  if (!user.isActive) return 'inactive';
  if (!user.isVerified) return 'unverified';
  return 'active';
};

export const listAdminUsers = () => User.find().select(userFields).sort({ createdAt: -1 }).lean();

export const getAdminActivityLogs = (filters) => listActivityLogs(filters);

export const listResturants = async () => {
  return Restaurant.find().sort({ createdAt: -1 }).lean();
};

export const listResturantsVerifications = async () => {
  return Restaurant.find({ approvalStatus: 'pending' }).sort({ createdAt: -1 }).lean();
};

export const reviewResturantVerification = async (resturantId, status = 'approved', reason = '') => {
  const resturant = await Restaurant.findById(resturantId);
  if (!resturant) {
    throw new ApiError(404, 'Restaurant not found');
  }
  resturant.approvalStatus = status;
  if (status === 'rejected') {
    resturant.rejectionReason = reason || 'Application rejected by administration';
  } else if (status === 'approved') {
    resturant.rejectionReason = null;
    resturant.isActive = true;
  }
  await resturant.save();
  await invalidateDashboardCache();
  return resturant;
};

export const rejectResturantVerification = async (resturantId, status = 'rejected', reason = '') => {
  return reviewResturantVerification(resturantId, status, reason);
};

export const getAdminDashboardStats = async () => {
  return getOrSetCache('admin:dashboard:stats', _fetchAdminDashboardStats, 60);
};

const _fetchAdminDashboardStats = async () => {
  const [
    totalUsers,
    verifiedUsers,
    blockedUsers,
    activeUsers,
    totalRestaurants,
    activeRestaurants,
    pendingApprovals,
    rejectedRestaurants,
    totalOrders,
    recentUsers,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isVerified: true }),
    User.countDocuments({ isBlocked: true }),
    User.countDocuments({ isActive: true, isBlocked: false }),
    Restaurant.countDocuments(),
    Restaurant.countDocuments({ isActive: true, approvalStatus: 'approved' }),
    Restaurant.countDocuments({ approvalStatus: 'pending' }),
    Restaurant.countDocuments({ approvalStatus: 'rejected' }),
    Order.countDocuments(),
    User.find()
      .select('fullName email mobile role isVerified isActive isBlocked createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  return {
    totalUsers,
    totalRestaurants,
    totalOrders,
    pendingApprovals,
    users: {
      total: totalUsers,
      verified: verifiedUsers,
      blocked: blockedUsers,
      active: activeUsers,
    },
    restaurants: {
      total: totalRestaurants,
      active: activeRestaurants,
      pending: pendingApprovals,
      rejected: rejectedRestaurants,
    },
    recentRegistrations: recentUsers.map((user) => ({
      id: user._id.toString(),
      name: user.fullName,
      email: user.email,
      role: user.role,
      time: user.createdAt,
      status: getUserStatus(user),
    })),
  };
};
