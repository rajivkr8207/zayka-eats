import { Router } from 'express';
import {
  getUserCartController,
  addItemToCartController,
  updateCartItemQuantityController,
  removeCartItemController,
  applyCouponController,
  removeCouponController,
  clearCartController,
} from './cart.controller.js';
import { verifyJWT } from '../../middlewares/auth.middleware.js';
import {
  addItemValidation,
  updateQuantityValidation,
  itemIdParamValidation,
  applyCouponValidation,
} from './cart.validate.js';

const cartRouter = Router();

// ─────────────────────────────────────────────
// PROTECTED CART ROUTES (Requires Authentication)
// ─────────────────────────────────────────────

/**
 * @route   GET /api/v1/cart
 * @desc    Get current user's active cart
 * @access  Protected
 */
cartRouter.get('/', verifyJWT, getUserCartController);

/**
 * @route   POST /api/v1/cart/items
 * @desc    Add item to cart (with Swiggy single-restaurant conflict handling)
 * @access  Protected
 */
cartRouter.post('/items', verifyJWT, addItemValidation, addItemToCartController);

/**
 * @route   PATCH /api/v1/cart/items/:itemId
 * @desc    Update quantity of an item in the cart
 * @access  Protected
 */
cartRouter.patch(
  '/items/:itemId',
  verifyJWT,
  updateQuantityValidation,
  updateCartItemQuantityController,
);

/**
 * @route   DELETE /api/v1/cart/items/:itemId
 * @desc    Remove an item from the cart
 * @access  Protected
 */
cartRouter.delete('/items/:itemId', verifyJWT, itemIdParamValidation, removeCartItemController);

/**
 * @route   POST /api/v1/cart/coupon
 * @desc    Apply discount coupon code to cart
 * @access  Protected
 */
cartRouter.post('/coupon', verifyJWT, applyCouponValidation, applyCouponController);

/**
 * @route   DELETE /api/v1/cart/coupon
 * @desc    Remove applied discount coupon
 * @access  Protected
 */
cartRouter.delete('/coupon', verifyJWT, removeCouponController);

/**
 * @route   DELETE /api/v1/cart
 * @desc    Clear all items and reset user's cart
 * @access  Protected
 */
cartRouter.delete('/', verifyJWT, clearCartController);

export default cartRouter;
