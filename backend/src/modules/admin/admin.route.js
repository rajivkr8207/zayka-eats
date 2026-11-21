import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { verifyJWT, authorizeRoles } from '../../middlewares/auth.middleware.js';
import { validate } from '../../config/validate.js';

import {
  getDashboardStats,
  getUsers,
  getActivityLogs,
  getResturants,
  getResturantsVerifications,
  approveResturant,
  rejectResturant,
} from './admin.controller.js';

const adminRouter = Router();

// Admin authentication & authorization
adminRouter.use(verifyJWT, authorizeRoles('admin'));

// Activity logs
adminRouter.get(
  '/activity-logs',
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('outcome')
    .optional()
    .isIn(['success', 'failure'])
    .withMessage('Outcome must be success or failure'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search cannot exceed 100 characters'),
  validate,
  getActivityLogs,
);

// Dashboard stats
adminRouter.get('/dashboard/stats', getDashboardStats);

// Users
adminRouter.get('/users', getUsers);

// Restaurants
adminRouter.get('/restaurants', getResturants);

// Restaurant verification applications
adminRouter.get(
  '/restaurant-verifications',
  getResturantsVerifications,
);

// Approve restaurant
adminRouter.patch(
  '/restaurant-verifications/:ResturantId/approve',
  param('ResturantId')
    .isMongoId()
    .withMessage('A valid restaurant ID is required'),
  validate,
  approveResturant,
);

// Reject restaurant
adminRouter.patch(
  '/restaurant-verifications/:ResturantId/reject',
  param('ResturantId')
    .isMongoId()
    .withMessage('A valid restaurant ID is required'),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('A rejection reason is required')
    .isLength({ max: 500 })
    .withMessage('Rejection reason cannot exceed 500 characters'),
  validate,
  rejectResturant,
);

export default adminRouter;