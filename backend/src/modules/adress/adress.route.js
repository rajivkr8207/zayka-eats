import { Router } from 'express';
import {
  reverseGeocodeController,
  createAddressController,
  getUserAddressesController,
  getAddressByIdController,
  updateAddressController,
  setDefaultAddressController,
  deleteAddressController,
} from './adress.controller.js';
import { verifyJWT } from '../../middlewares/auth.middleware.js';
import {
  reverseGeocodeValidation,
  createAddressValidation,
  updateAddressValidation,
  addressIdParamValidation,
} from './adress.validate.js';

const addressRouter = Router();

// ─────────────────────────────────────────────
// REVERSE GEOCODE (Swiggy-style GPS / Map Pin reverse geocoding)
// ─────────────────────────────────────────────
/**
 * @route   GET /api/v1/addresses/reverse-geocode?latitude=...&longitude=...
 * @desc    Reverse geocode coordinates into auto-filled address popup details
 * @access  Public / Authenticated
 */
addressRouter.get(
  '/reverse-geocode',
  reverseGeocodeValidation,
  reverseGeocodeController,
);

// ─────────────────────────────────────────────
// PROTECTED ADDRESS MANAGEMENT ROUTES
// ─────────────────────────────────────────────

/**
 * @route   POST /api/v1/addresses
 * @desc    Create a new delivery address (supports auto-filling from GPS or map coordinates)
 * @access  Protected
 */
addressRouter.post(
  '/',
  verifyJWT,
  createAddressValidation,
  createAddressController,
);

/**
 * @route   GET /api/v1/addresses
 * @desc    Get all saved delivery addresses for the logged-in user
 * @access  Protected
 */
addressRouter.get('/', verifyJWT, getUserAddressesController);

/**
 * @route   GET /api/v1/addresses/:id
 * @desc    Get single address details by ID
 * @access  Protected
 */
addressRouter.get(
  '/:id',
  verifyJWT,
  addressIdParamValidation,
  getAddressByIdController,
);

/**
 * @route   PATCH /api/v1/addresses/:id
 * @desc    Update an existing delivery address
 * @access  Protected
 */
addressRouter.patch(
  '/:id',
  verifyJWT,
  updateAddressValidation,
  updateAddressController,
);

/**
 * @route   PATCH /api/v1/addresses/:id/set-default
 * @desc    Set an address as the primary / default delivery address
 * @access  Protected
 */
addressRouter.patch(
  '/:id/set-default',
  verifyJWT,
  addressIdParamValidation,
  setDefaultAddressController,
);

/**
 * @route   DELETE /api/v1/addresses/:id
 * @desc    Delete a delivery address
 * @access  Protected
 */
addressRouter.delete(
  '/:id',
  verifyJWT,
  addressIdParamValidation,
  deleteAddressController,
);

export default addressRouter;
