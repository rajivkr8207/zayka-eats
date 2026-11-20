import { Router } from 'express';
import {
  createRestaurantController,
  getRestaurantsController,
  getMyRestaurantsController,
  getRestaurantByIdOrSlugController,
  updateRestaurantController,
  toggleRestaurantStatusController,
  updateRestaurantApprovalController,
  deleteRestaurantController,
} from './Restaurant.controller.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/auth.middleware.js';
import { receiveRestaurantImages } from '../../middlewares/imageUpload.middleware.js';
import { ROLES } from '../../constants/roles.js';
import {
  createRestaurantValidation,
  updateRestaurantValidation,
  restaurantIdParamValidation,
  updateStatusValidation,
  approvalValidation,
  getRestaurantsQueryValidation,
} from './Restaurant.validate.js';

const restaurantRouter = Router();

// ─────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────

/**
 * @route   GET /api/v1/restaurants
 * @desc    Get all active & approved restaurants with search, filters & geo-near support
 * @access  Public
 */
restaurantRouter.get('/', getRestaurantsQueryValidation, getRestaurantsController);

/**
 * @route   GET /api/v1/restaurants/my-restaurants
 * @desc    Get all restaurants owned by the currently authenticated user
 * @access  Protected
 */
restaurantRouter.get('/my-restaurants', verifyJWT, getMyRestaurantsController);

/**
 * @route   GET /api/v1/restaurants/:idOrSlug
 * @desc    Get single restaurant profile by MongoDB _id or unique slug
 * @access  Public
 */
restaurantRouter.get('/:idOrSlug', getRestaurantByIdOrSlugController);

// ─────────────────────────────────────────────
// PROTECTED ROUTES
// ─────────────────────────────────────────────

/**
 * @route   POST /api/v1/restaurants
 * @desc    Register a new restaurant (with logo upload to ImageKit 'zayka' folder)
 * @access  Protected (Authenticated Users)
 */
restaurantRouter.post(
  '/',
  verifyJWT,
  receiveRestaurantImages,
  createRestaurantValidation,
  createRestaurantController,
);

/**
 * @route   PATCH /api/v1/restaurants/:id
 * @desc    Update restaurant details or images
 * @access  Protected (Owner or Admin)
 */
restaurantRouter.patch(
  '/:id',
  verifyJWT,
  receiveRestaurantImages,
  updateRestaurantValidation,
  updateRestaurantController,
);

/**
 * @route   PATCH /api/v1/restaurants/:id/status
 * @desc    Toggle restaurant isOpen (Online/Offline for orders)
 * @access  Protected (Owner or Admin)
 */
restaurantRouter.patch(
  '/:id/status',
  verifyJWT,
  updateStatusValidation,
  toggleRestaurantStatusController,
);

/**
 * @route   PATCH /api/v1/restaurants/:id/approval
 * @desc    Approve or reject restaurant onboarding application
 * @access  Protected (Admin only)
 */
restaurantRouter.patch(
  '/:id/approval',
  verifyJWT,
  authorizeRoles(ROLES.ADMIN),
  approvalValidation,
  updateRestaurantApprovalController,
);

/**
 * @route   DELETE /api/v1/restaurants/:id
 * @desc    Deactivate restaurant
 * @access  Protected (Owner or Admin)
 */
restaurantRouter.delete('/:id', verifyJWT, restaurantIdParamValidation, deleteRestaurantController);

export default restaurantRouter;
