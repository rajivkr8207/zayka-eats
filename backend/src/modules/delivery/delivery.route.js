import { Router } from 'express';
import {
  registerDeliveryPartnerController,
  getMyProfileController,
  getPartnerByIdController,
  updateProfileController,
  toggleOnlineStatusController,
  updateLiveLocationController,
  findNearbyRidersController,
  acceptDeliveryTaskController,
  completeDeliveryTaskController,
  getActiveTaskController,
  getAvailableTasksController,
  reviewApplicationController,
  listPartnersController,
} from './delivery.controller.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/auth.middleware.js';
import { receiveDeliveryDocuments } from '../../middlewares/imageUpload.middleware.js';
import { ROLES } from '../../constants/roles.js';
import {
  registerPartnerValidation,
  toggleOnlineValidation,
  updateLocationValidation,
  partnerIdParamValidation,
  orderIdParamValidation,
  reviewApplicationValidation,
  nearbyRidersQueryValidation,
  listPartnersQueryValidation,
} from './delivery.validate.js';

const deliveryRouter = Router();

// ─────────────────────────────────────────────
// DELIVERY PARTNER ONBOARDING & PROFILE
// ─────────────────────────────────────────────

/**
 * @route   POST /api/v1/delivery/register
 * @desc    Submit delivery partner onboarding application with identity & vehicle docs
 * @access  Protected (Authenticated User)
 */
deliveryRouter.post(
  '/register',
  verifyJWT,
  receiveDeliveryDocuments,
  registerPartnerValidation,
  registerDeliveryPartnerController,
);

/**
 * @route   GET /api/v1/delivery/profile/me
 * @desc    Get currently logged-in delivery partner's profile
 * @access  Protected (Delivery Partner)
 */
deliveryRouter.get('/profile/me', verifyJWT, getMyProfileController);

/**
 * @route   GET /api/v1/delivery/profile/:id
 * @desc    Get delivery partner public/details profile by partner ID
 * @access  Protected (Owner, Rider, or Admin)
 */
deliveryRouter.get('/profile/:id', verifyJWT, partnerIdParamValidation, getPartnerByIdController);

/**
 * @route   PATCH /api/v1/delivery/profile
 * @desc    Update delivery partner profile (vehicle info, profile pic, bank details)
 * @access  Protected (Delivery Partner)
 */
deliveryRouter.patch('/profile', verifyJWT, receiveDeliveryDocuments, updateProfileController);

// ─────────────────────────────────────────────
// REAL-TIME DUTY & LIVE GPS
// ─────────────────────────────────────────────

/**
 * @route   PATCH /api/v1/delivery/status/online
 * @desc    Toggle online / offline duty status
 * @access  Protected (Delivery Partner)
 */
deliveryRouter.patch(
  '/status/online',
  verifyJWT,
  toggleOnlineValidation,
  toggleOnlineStatusController,
);

/**
 * @route   POST /api/v1/delivery/location
 * @desc    Rider app live GPS ping updates coordinates & updates active delivery tracks
 * @access  Protected (Delivery Partner)
 */
deliveryRouter.post('/location', verifyJWT, updateLocationValidation, updateLiveLocationController);

// ─────────────────────────────────────────────
// NEARBY RIDERS (DISPATCH / ORDER ASSIGNMENT)
// ─────────────────────────────────────────────

/**
 * @route   GET /api/v1/delivery/nearby
 * @desc    Find online, available, verified riders within radius for dispatch
 * @access  Protected (Admin or Restaurant Owner)
 */
deliveryRouter.get(
  '/nearby',
  verifyJWT,
  authorizeRoles(ROLES.ADMIN, ROLES.RESTAURANT_OWNER),
  nearbyRidersQueryValidation,
  findNearbyRidersController,
);

// ─────────────────────────────────────────────
// ORDER DELIVERY TASKS
// ─────────────────────────────────────────────

/**
 * @route   GET /api/v1/delivery/tasks/active
 * @desc    Get ongoing delivery task for logged in rider
 * @access  Protected (Delivery Partner)
 */
deliveryRouter.get(
  '/tasks/active',
  verifyJWT,
  authorizeRoles(ROLES.DELIVERY_PARTNER, ROLES.ADMIN),
  getActiveTaskController,
);

/**
 * @route   GET /api/v1/delivery/tasks/available
 * @desc    Get available orders ready for delivery pickup
 * @access  Protected (Delivery Partner)
 */
deliveryRouter.get(
  '/tasks/available',
  verifyJWT,
  authorizeRoles(ROLES.DELIVERY_PARTNER, ROLES.ADMIN),
  getAvailableTasksController,
);

/**
 * @route   POST /api/v1/delivery/tasks/:orderId/accept
 * @desc    Accept order delivery assignment
 * @access  Protected (Delivery Partner)
 */
deliveryRouter.post(
  '/tasks/:orderId/accept',
  verifyJWT,
  orderIdParamValidation,
  acceptDeliveryTaskController,
);

/**
 * @route   POST /api/v1/delivery/tasks/:orderId/complete
 * @desc    Mark order delivered at customer's doorstep (collects COD if required)
 * @access  Protected (Delivery Partner)
 */
deliveryRouter.post(
  '/tasks/:orderId/complete',
  verifyJWT,
  orderIdParamValidation,
  completeDeliveryTaskController,
);

// ─────────────────────────────────────────────
// ADMIN OPERATIONS
// ─────────────────────────────────────────────

/**
 * @route   PATCH /api/v1/delivery/partners/:id/verify
 * @desc    Approve or reject rider onboarding application
 * @access  Protected (Admin only)
 */
deliveryRouter.patch(
  '/partners/:id/verify',
  verifyJWT,
  authorizeRoles(ROLES.ADMIN),
  reviewApplicationValidation,
  reviewApplicationController,
);

/**
 * @route   GET /api/v1/delivery/partners
 * @desc    List delivery partners with filters (verification status, online, active)
 * @access  Protected (Admin only)
 */
deliveryRouter.get(
  '/partners',
  verifyJWT,
  authorizeRoles(ROLES.ADMIN),
  listPartnersQueryValidation,
  listPartnersController,
);

export default deliveryRouter;
