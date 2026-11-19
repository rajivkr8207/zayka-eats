import { Router } from 'express';
import {
  createMenuController,
  getMenusByRestaurantController,
  getMenuByIdController,
  updateMenuController,
  toggleMenuStatusController,
  deleteMenuController,
} from './menu.controller.js';
import { verifyJWT } from '../../middlewares/auth.middleware.js';
import { receiveOptionalImage } from '../../middlewares/imageUpload.middleware.js';
import {
  createMenuValidation,
  updateMenuValidation,
  menuIdParamValidation,
  restaurantIdParamValidation,
} from './menu.validate.js';

const menuRouter = Router();

// ─────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────

/**
 * @route   GET /api/v1/menus/restaurant/:restaurantId
 * @desc    Get all menus belonging to a restaurant
 * @access  Public
 */
menuRouter.get(
  '/restaurant/:restaurantId',
  restaurantIdParamValidation,
  getMenusByRestaurantController,
);

/**
 * @route   GET /api/v1/menus/:id
 * @desc    Get single menu by ID
 * @access  Public
 */
menuRouter.get('/:id', menuIdParamValidation, getMenuByIdController);

// ─────────────────────────────────────────────
// PROTECTED ROUTES (Owner or Admin)
// ─────────────────────────────────────────────

/**
 * @route   POST /api/v1/menus
 * @desc    Create a new menu for a restaurant (with optional image <= 5MB)
 * @access  Protected (Restaurant Owner or Admin)
 */
menuRouter.post(
  '/',
  verifyJWT,
  receiveOptionalImage,
  createMenuValidation,
  createMenuController,
);

/**
 * @route   PATCH /api/v1/menus/:id
 * @desc    Update menu details or image
 * @access  Protected (Restaurant Owner or Admin)
 */
menuRouter.patch(
  '/:id',
  verifyJWT,
  receiveOptionalImage,
  updateMenuValidation,
  updateMenuController,
);

/**
 * @route   PATCH /api/v1/menus/:id/status
 * @desc    Toggle menu active/inactive status
 * @access  Protected (Restaurant Owner or Admin)
 */
menuRouter.patch(
  '/:id/status',
  verifyJWT,
  menuIdParamValidation,
  toggleMenuStatusController,
);

/**
 * @route   DELETE /api/v1/menus/:id
 * @desc    Delete a menu and its associated food categories
 * @access  Protected (Restaurant Owner or Admin)
 */
menuRouter.delete(
  '/:id',
  verifyJWT,
  menuIdParamValidation,
  deleteMenuController,
);

export default menuRouter;
