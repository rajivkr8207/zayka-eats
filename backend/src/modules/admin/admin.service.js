import { ROLES } from '../../constants/roles.js';
import User from '../user/user.model.js';
import { EmployeeModel } from '../employee/employee.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { listActivityLogs } from '../activityLog/activityLog.service.js';
import { getOrSetCache, deleteCache } from '../../utils/cache.js';
import { RestaurantModel } from '../restaurant/restaurant.model.js';

/** Invalidate the admin dashboard stats cache (call after store/user state changes). */
export const invalidateDashboardCache = () => deleteCache('admin:dashboard:stats');

const userFields =
  'fullName username email mobile avatar role isVerified isApproved approvalStatus rejectionReason isActive isBlocked createdAt';

const getUserStatus = (user) => {
  if (user.isBlocked) return 'blocked';
  if (user.approvalStatus === 'rejected') return 'rejected';
  if (!user.isApproved) return 'pending';
  if (!user.isActive) return 'inactive';
  if (!user.isVerified) return 'unverified';
  return 'active';
};

export const listAdminUsers = () => User.find().select(userFields).sort({ createdAt: -1 }).lean();

export const getAdminActivityLogs = (filters) => listActivityLogs(filters);

export const getAdminDashboardStats = async () => {
  return getOrSetCache('admin:dashboard:stats', _fetchAdminDashboardStats, 60);
};

export const listResturants = async () => {
  return RestaurantModel.find().sort({ createdAt: -1 }).lean();
};
export const listResturantsVerifications = async () => {
  return RestaurantModel.find({ verificationStatus: "pending" }).sort({ createdAt: -1 }).lean();
};

export const reviewResturantVerification = async (resturantId, status, reason = "") => {
  const resturant = RestaurantModel.findById(resturantId);
  if (!resturant) {
    throw new ApiError(404, 'Resturant not found');
  }
  resturant.verificationStatus = status;
  resturant.rejectionReason = reason;
  await resturant.save();
  return resturant;
};
export const rejectResturantVerification = async (resturantId, status, reason = "") => {
  const resturant = RestaurantModel.findById(resturantId);
  if (!resturant) {
    throw new ApiError(404, 'Resturant not found');
  }
  resturant.verificationStatus = status;
  resturant.rejectionReason = reason;
  resturant.isActive = false;
  await resturant.save();
  return resturant;
};
const _fetchAdminDashboardStats = async () => {
  const [
    totalUsers,
    verifiedUsers,
    pendingUsers,
    blockedUsers,
    activeUsers,
    totalStores,
    activeStores,
    inactiveStores,
    pendingStores,
    rejectedStores,
    totalEmployees,
    activeEmployees,
    inactiveEmployees,
    totalManagers,
    approvedManagers,
    pendingManagers,
    recentUsers,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isVerified: true }),
    User.countDocuments({
      $or: [{ approvalStatus: 'pending' }, { approvalStatus: null, isApproved: false }],
    }),
    User.countDocuments({ isBlocked: true }),
    User.countDocuments({ isActive: true, isBlocked: false }),
    StoreModel.countDocuments(),
    StoreModel.countDocuments({ status: 'active' }),
    StoreModel.countDocuments({ status: 'inactive' }),
    StoreModel.countDocuments({
      $or: [
        { verificationStatus: 'pending' },
        { verificationStatus: { $exists: false }, status: 'inactive' },
      ],
    }),
    StoreModel.countDocuments({ verificationStatus: 'rejected' }),
    EmployeeModel.countDocuments(),
    EmployeeModel.countDocuments({ status: 'active' }),
    EmployeeModel.countDocuments({ status: { $ne: 'active' } }),
    User.countDocuments({ role: ROLES.MANAGER }),
    User.countDocuments({
      role: ROLES.MANAGER,
      isApproved: true,
      isActive: true,
      isBlocked: false,
    }),
    User.countDocuments({ role: ROLES.MANAGER, isApproved: false }),
    User.find()
      .select('fullName role isVerified isApproved approvalStatus isActive isBlocked createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  return {
    users: {
      total: totalUsers,
      verified: verifiedUsers,
      pending: pendingUsers,
      blocked: blockedUsers,
      active: activeUsers,
    },
    stores: {
      total: totalStores,
      active: activeStores,
      inactive: inactiveStores,
      pending: pendingStores,
      rejected: rejectedStores,
    },
    employees: {
      total: totalEmployees,
      active: activeEmployees,
      inactive: inactiveEmployees,
    },
    managers: {
      total: totalManagers,
      approved: approvedManagers,
      pending: pendingManagers,
    },
    recentRegistrations: recentUsers.map((user) => ({
      id: user._id.toString(),
      name: user.fullName,
      role: user.role,
      time: user.createdAt,
      status: getUserStatus(user),
    })),
  };
};
