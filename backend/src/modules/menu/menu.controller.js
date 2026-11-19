import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
  createMenu,
  getMenusByRestaurant,
  getMenuById,
  updateMenu,
  deleteMenu,
  toggleMenuStatus,
} from './menu.service.js';

// ─────────────────────────────────────────────
// POST /api/v1/menus (Protected - Owner or Admin)
// ─────────────────────────────────────────────
export const createMenuController = asyncHandler(async (req, res) => {
  const restaurantId = req.body.restaurantId;
  const menu = await createMenu({
    user: req.user,
    restaurantId,
    menuData: req.body,
    imageBuffer: req.file?.buffer,
    imageMimeType: req.file?.mimetype,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { menu }, 'Menu created successfully'));
});

// ─────────────────────────────────────────────
// GET /api/v1/menus/restaurant/:restaurantId (Public / Owner)
// ─────────────────────────────────────────────
export const getMenusByRestaurantController = asyncHandler(async (req, res) => {
  const menus = await getMenusByRestaurant(req.params.restaurantId, req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, { menus }, 'Menus fetched successfully'));
});

// ─────────────────────────────────────────────
// GET /api/v1/menus/:id (Public)
// ─────────────────────────────────────────────
export const getMenuByIdController = asyncHandler(async (req, res) => {
  const menu = await getMenuById(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, menu, 'Menu details fetched successfully'));
});

// ─────────────────────────────────────────────
// PATCH /api/v1/menus/:id (Protected - Owner or Admin)
// ─────────────────────────────────────────────
export const updateMenuController = asyncHandler(async (req, res) => {
  const menu = await updateMenu({
    menuId: req.params.id,
    user: req.user,
    updateData: req.body,
    imageBuffer: req.file?.buffer,
    imageMimeType: req.file?.mimetype,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { menu }, 'Menu updated successfully'));
});

// ─────────────────────────────────────────────
// PATCH /api/v1/menus/:id/status (Protected - Owner or Admin)
// ─────────────────────────────────────────────
export const toggleMenuStatusController = asyncHandler(async (req, res) => {
  const menu = await toggleMenuStatus(
    req.params.id,
    req.user,
    req.body.isActive,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { menu },
        `Menu is now ${menu.isActive ? 'Active' : 'Inactive'}`,
      ),
    );
});

// ─────────────────────────────────────────────
// DELETE /api/v1/menus/:id (Protected - Owner or Admin)
// ─────────────────────────────────────────────
export const deleteMenuController = asyncHandler(async (req, res) => {
  const result = await deleteMenu(req.params.id, req.user);
  return res.status(200).json(new ApiResponse(200, result, result.message));
});
