import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
  createRestaurant,
  getAllRestaurants,
  getRestaurantByIdOrSlug,
  getMyRestaurants,
  updateRestaurant,
  toggleRestaurantStatus,
  updateRestaurantApproval,
  deleteRestaurant,
} from './Restaurant.service.js';

// ─────────────────────────────────────────────
// POST /api/v1/restaurants (Protected)
// ─────────────────────────────────────────────
export const createRestaurantController = asyncHandler(async (req, res) => {
  const restaurant = await createRestaurant({
    user: req.user,
    restaurantData: req.body,
    logoBuffer: req.logoFile?.buffer,
    logoMimeType: req.logoFile?.mimetype,
    coverBuffer: req.coverFile?.buffer,
    coverMimeType: req.coverFile?.mimetype,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { restaurant },
        'Restaurant registered successfully. Pending administrator verification.',
      ),
    );
});

// ─────────────────────────────────────────────
// GET /api/v1/restaurants (Public)
// ─────────────────────────────────────────────
export const getRestaurantsController = asyncHandler(async (req, res) => {
  const result = await getAllRestaurants(req.query);
  return res.status(200).json(new ApiResponse(200, result, 'Restaurants fetched successfully'));
});

// ─────────────────────────────────────────────
// GET /api/v1/restaurants/my-restaurants (Protected)
// ─────────────────────────────────────────────
export const getMyRestaurantsController = asyncHandler(async (req, res) => {
  const restaurants = await getMyRestaurants(req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, { restaurants }, 'My restaurants fetched successfully'));
});

// ─────────────────────────────────────────────
// GET /api/v1/restaurants/:idOrSlug (Public)
// ─────────────────────────────────────────────
export const getRestaurantByIdOrSlugController = asyncHandler(async (req, res) => {
  const restaurant = await getRestaurantByIdOrSlug(req.params.idOrSlug);
  return res
    .status(200)
    .json(new ApiResponse(200, restaurant, 'Restaurant details fetched successfully'));
});

// ─────────────────────────────────────────────
// PATCH /api/v1/restaurants/:id (Protected - Owner or Admin)
// ─────────────────────────────────────────────
export const updateRestaurantController = asyncHandler(async (req, res) => {
  const restaurant = await updateRestaurant({
    id: req.params.id,
    user: req.user,
    updateData: req.body,
    logoBuffer: req.logoFile?.buffer,
    logoMimeType: req.logoFile?.mimetype,
    coverBuffer: req.coverFile?.buffer,
    coverMimeType: req.coverFile?.mimetype,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { restaurant }, 'Restaurant updated successfully'));
});

// ─────────────────────────────────────────────
// PATCH /api/v1/restaurants/:id/status (Protected - Owner or Admin)
// ─────────────────────────────────────────────
export const toggleRestaurantStatusController = asyncHandler(async (req, res) => {
  const restaurant = await toggleRestaurantStatus(req.params.id, req.user, req.body.isOpen);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { restaurant },
        `Restaurant is now marked as ${restaurant.isOpen ? 'OPEN' : 'CLOSED'} for orders`,
      ),
    );
});

// ─────────────────────────────────────────────
// PATCH /api/v1/restaurants/:id/approval (Protected - Admin Only)
// ─────────────────────────────────────────────
export const updateRestaurantApprovalController = asyncHandler(async (req, res) => {
  const restaurant = await updateRestaurantApproval(req.params.id, req.body);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { restaurant },
        `Restaurant approval status changed to ${restaurant.approvalStatus}`,
      ),
    );
});

// ─────────────────────────────────────────────
// DELETE /api/v1/restaurants/:id (Protected - Owner or Admin)
// ─────────────────────────────────────────────
export const deleteRestaurantController = asyncHandler(async (req, res) => {
  const result = await deleteRestaurant(req.params.id, req.user);
  return res.status(200).json(new ApiResponse(200, result, result.message));
});
