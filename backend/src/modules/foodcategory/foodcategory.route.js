import { Router } from 'express';
import {
  createFoodCategoryController,
  getCategoriesByMenuController,
  getCategoriesByRestaurantController,
  getFoodCategoryByIdController,
  updateFoodCategoryController,
  toggleFoodCategoryStatusController,
  deleteFoodCategoryController,
  addFoodItemController,
  updateFoodItemController,
  deleteFoodItemController,
} from './foodcategory.controller.js';
import { verifyJWT } from '../../middlewares/auth.middleware.js';
import { receiveOptionalImage } from '../../middlewares/imageUpload.middleware.js';
import {
  createFoodCategoryValidation,
  updateFoodCategoryValidation,
  foodCategoryIdParamValidation,
  menuIdParamValidation,
  restaurantIdParamValidation,
} from './foodcategory.validate.js';

const foodCategoryRouter = Router();

// ─────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────

/**
 * @route   GET /api/v1/food-categories/menu/:menuId
 * @desc    Get all categories for a given menu
 * @access  Public
 */
foodCategoryRouter.get('/menu/:menuId', menuIdParamValidation, getCategoriesByMenuController);

/**
 * @route   GET /api/v1/food-categories/restaurant/:restaurantId
 * @desc    Get all categories for a given restaurant
 * @access  Public
 */
foodCategoryRouter.get(
  '/restaurant/:restaurantId',
  restaurantIdParamValidation,
  getCategoriesByRestaurantController,
);

/**
 * @route   GET /api/v1/food-categories/:id
 * @desc    Get single food category by ID
 * @access  Public
 */
foodCategoryRouter.get('/:id', foodCategoryIdParamValidation, getFoodCategoryByIdController);

// ─────────────────────────────────────────────
// PROTECTED ROUTES (Restaurant Owner or Admin)
// ─────────────────────────────────────────────

/**
 * @route   POST /api/v1/food-categories
 * @desc    Create a new food category under a menu (with optional image <= 5MB)
 * @access  Protected (Restaurant Owner or Admin)
 */
foodCategoryRouter.post(
  '/',
  verifyJWT,
  receiveOptionalImage,
  createFoodCategoryValidation,
  createFoodCategoryController,
);

/**
 * @route   PATCH /api/v1/food-categories/:id
 * @desc    Update food category details or image
 * @access  Protected (Restaurant Owner or Admin)
 */
foodCategoryRouter.patch(
  '/:id',
  verifyJWT,
  receiveOptionalImage,
  updateFoodCategoryValidation,
  updateFoodCategoryController,
);

/**
 * @route   PATCH /api/v1/food-categories/:id/status
 * @desc    Toggle category active/inactive status
 * @access  Protected (Restaurant Owner or Admin)
 */
foodCategoryRouter.patch(
  '/:id/status',
  verifyJWT,
  foodCategoryIdParamValidation,
  toggleFoodCategoryStatusController,
);

/**
 * @route   DELETE /api/v1/food-categories/:id
 * @desc    Delete a food category
 * @access  Protected (Restaurant Owner or Admin)
 */
foodCategoryRouter.delete(
  '/:id',
  verifyJWT,
  foodCategoryIdParamValidation,
  deleteFoodCategoryController,
);

// ─────────────────────────────────────────────
// FOOD ITEM / DISH ROUTES (Protected)
// ─────────────────────────────────────────────

/**
 * @route   POST /api/v1/food-categories/:id/items
 * @desc    Add a dish / food item to this category
 * @access  Protected (Restaurant Owner or Admin)
 */
foodCategoryRouter.post('/:id/items', verifyJWT, addFoodItemController);

/**
 * @route   PATCH /api/v1/food-categories/:id/items/:itemId
 * @desc    Update a dish / food item in this category
 * @access  Protected (Restaurant Owner or Admin)
 */
foodCategoryRouter.patch('/:id/items/:itemId', verifyJWT, updateFoodItemController);

/**
 * @route   DELETE /api/v1/food-categories/:id/items/:itemId
 * @desc    Delete a dish / food item from this category
 * @access  Protected (Restaurant Owner or Admin)
 */
foodCategoryRouter.delete('/:id/items/:itemId', verifyJWT, deleteFoodItemController);

export default foodCategoryRouter;
