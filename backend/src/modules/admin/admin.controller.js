import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  getAdminDashboardStats,
  listAdminUsers,
  reviewResturantVerification,
  getAdminActivityLogs,
  listResturants,
  listResturantsVerifications,
  rejectResturantVerification,
} from './admin.service.js';

export const getActivityLogs = asyncHandler(async (req, res) => {
  const result = await getAdminActivityLogs({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    outcome: req.query.outcome || undefined,
    search: req.query.search?.trim() || undefined,
  });
  return res.status(200).json(new ApiResponse(200, result, 'Activity logs fetched'));
});

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const stats = await getAdminDashboardStats();
  return res.status(200).json(new ApiResponse(200, stats, 'Admin dashboard stats fetched'));
});

export const getUsers = asyncHandler(async (_req, res) => {
  const users = await listAdminUsers();
  return res.status(200).json(new ApiResponse(200, { users }, 'Users fetched successfully'));
});

export const getResturants = asyncHandler(async (_req, res) => {
  const Resturants = await listResturants();
  return res.status(200).json(new ApiResponse(200, { Resturants }, 'Resturants fetched successfully'));
});

export const getResturantsVerifications = asyncHandler(async (_req, res) => {
  const Resturants = await listResturantsVerifications();
  return res
    .status(200)
    .json(new ApiResponse(200, { Resturants }, 'Resturant verifications fetched successfully'));
});

export const approveResturant = asyncHandler(async (req, res) => {
  const Resturant = await reviewResturantVerification(req.params.ResturantId, 'approved');
  return res.status(200).json(new ApiResponse(200, { Resturant }, 'Resturant approved and activated'));
});

export const rejectResturant = asyncHandler(async (req, res) => {
  const Resturant = await rejectResturantVerification(
    req.params.ResturantId,
    'rejected',
    req.body.reason,
  );
  return res.status(200).json(new ApiResponse(200, { Resturant }, 'Resturant application rejected'));
});
