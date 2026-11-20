import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
  reverseGeocodeCoordinates,
  createAddress,
  getUserAddresses,
  getAddressById,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} from './adress.service.js';

// ─────────────────────────────────────────────
// GET /api/v1/addresses/reverse-geocode (Public / Authenticated)
// Swiggy style: map pin / GPS coordinates -> auto-fill address popup
// ─────────────────────────────────────────────
export const reverseGeocodeController = asyncHandler(async (req, res) => {
  const latitude = req.query.latitude || req.query.lat || req.body.latitude || req.body.lat;
  const longitude = req.query.longitude || req.query.lng || req.body.longitude || req.body.lng;

  const result = await reverseGeocodeCoordinates(latitude, longitude);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Location details fetched successfully'));
});

// ─────────────────────────────────────────────
// POST /api/v1/addresses (Protected)
// ─────────────────────────────────────────────
export const createAddressController = asyncHandler(async (req, res) => {
  const address = await createAddress({
    user: req.user,
    addressData: req.body,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { address }, 'Delivery address saved successfully'));
});

// ─────────────────────────────────────────────
// GET /api/v1/addresses (Protected)
// ─────────────────────────────────────────────
export const getUserAddressesController = asyncHandler(async (req, res) => {
  const addresses = await getUserAddresses(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, { addresses }, 'Saved delivery addresses fetched successfully'));
});

// ─────────────────────────────────────────────
// GET /api/v1/addresses/:id (Protected)
// ─────────────────────────────────────────────
export const getAddressByIdController = asyncHandler(async (req, res) => {
  const address = await getAddressById(req.params.id, req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, address, 'Address details fetched successfully'));
});

// ─────────────────────────────────────────────
// PATCH /api/v1/addresses/:id (Protected)
// ─────────────────────────────────────────────
export const updateAddressController = asyncHandler(async (req, res) => {
  const address = await updateAddress({
    addressId: req.params.id,
    userId: req.user._id,
    updateData: req.body,
  });

  return res.status(200).json(new ApiResponse(200, { address }, 'Address updated successfully'));
});

// ─────────────────────────────────────────────
// PATCH /api/v1/addresses/:id/set-default (Protected)
// ─────────────────────────────────────────────
export const setDefaultAddressController = asyncHandler(async (req, res) => {
  const address = await setDefaultAddress(req.params.id, req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, { address }, 'Default delivery address updated'));
});

// ─────────────────────────────────────────────
// DELETE /api/v1/addresses/:id (Protected)
// ─────────────────────────────────────────────
export const deleteAddressController = asyncHandler(async (req, res) => {
  const result = await deleteAddress(req.params.id, req.user._id);
  return res.status(200).json(new ApiResponse(200, result, result.message));
});
