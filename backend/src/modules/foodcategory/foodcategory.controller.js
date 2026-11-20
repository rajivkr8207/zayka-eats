import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
  createFoodCategory,
  getCategoriesByMenu,
  getCategoriesByRestaurant,
  getFoodCategoryById,
  updateFoodCategory,
  toggleFoodCategoryStatus,
  deleteFoodCategory,
} from './foodcategory.service.js';

// ─────────────────────────────────────────────
// POST /api/v1/food-categories (Protected)
// ─────────────────────────────────────────────
export const createFoodCategoryController = asyncHandler(async (req, res) => {
  const category = await createFoodCategory({
    user: req.user,
    categoryData: req.body,
    imageBuffer: req.file?.buffer,
    imageMimeType: req.file?.mimetype,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { category }, 'Food category created successfully'));
});

// ─────────────────────────────────────────────
// GET /api/v1/food-categories/menu/:menuId (Public)
// ─────────────────────────────────────────────
export const getCategoriesByMenuController = asyncHandler(async (req, res) => {
  const categories = await getCategoriesByMenu(req.params.menuId, req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, { categories }, 'Categories fetched successfully'));
});

// ─────────────────────────────────────────────
// GET /api/v1/food-categories/restaurant/:restaurantId (Public)
// ─────────────────────────────────────────────
export const getCategoriesByRestaurantController = asyncHandler(async (req, res) => {
  const categories = await getCategoriesByRestaurant(req.params.restaurantId, req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, { categories }, 'Categories fetched successfully'));
});

// ─────────────────────────────────────────────
// GET /api/v1/food-categories/:id (Public)
// ─────────────────────────────────────────────
export const getFoodCategoryByIdController = asyncHandler(async (req, res) => {
  const category = await getFoodCategoryById(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, category, 'Category details fetched successfully'));
});

// ─────────────────────────────────────────────
// PATCH /api/v1/food-categories/:id (Protected)
// ─────────────────────────────────────────────
export const updateFoodCategoryController = asyncHandler(async (req, res) => {
  const category = await updateFoodCategory({
    categoryId: req.params.id,
    user: req.user,
    updateData: req.body,
    imageBuffer: req.file?.buffer,
    imageMimeType: req.file?.mimetype,
  });

  return res.status(200).json(new ApiResponse(200, { category }, 'Category updated successfully'));
});

// ─────────────────────────────────────────────
// PATCH /api/v1/food-categories/:id/status (Protected)
// ─────────────────────────────────────────────
export const toggleFoodCategoryStatusController = asyncHandler(async (req, res) => {
  const category = await toggleFoodCategoryStatus(req.params.id, req.user, req.body.isActive);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { category },
        `Category is now ${category.isActive ? 'Active' : 'Inactive'}`,
      ),
    );
});

// ─────────────────────────────────────────────
// DELETE /api/v1/food-categories/:id (Protected)
// ─────────────────────────────────────────────
export const deleteFoodCategoryController = asyncHandler(async (req, res) => {
  const result = await deleteFoodCategory(req.params.id, req.user);
  return res.status(200).json(new ApiResponse(200, result, result.message));
});
