import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
  getUserCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  applyCoupon,
  removeCoupon,
  clearCart,
} from './cart.service.js';

// ─────────────────────────────────────────────
// GET /api/v1/cart (Protected)
// ─────────────────────────────────────────────
export const getUserCartController = asyncHandler(async (req, res) => {
  const cart = await getUserCart(req.user._id);
  return res.status(200).json(new ApiResponse(200, { cart }, 'Cart fetched successfully'));
});

// ─────────────────────────────────────────────
// POST /api/v1/cart/items (Protected)
// ─────────────────────────────────────────────
export const addItemToCartController = asyncHandler(async (req, res) => {
  const result = await addItemToCart({
    userId: req.user._id,
    restaurantId: req.body.restaurantId,
    foodId: req.body.foodId,
    name: req.body.name,
    price: req.body.price,
    image: req.body.image,
    quantity: req.body.quantity,
    replaceCart: req.body.replaceCart,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        result.cartReplaced
          ? 'Previous restaurant items were replaced. New items added to cart.'
          : 'Item added to cart successfully',
      ),
    );
});

// ─────────────────────────────────────────────
// PATCH /api/v1/cart/items/:itemId (Protected)
// ─────────────────────────────────────────────
export const updateCartItemQuantityController = asyncHandler(async (req, res) => {
  const cart = await updateCartItemQuantity({
    userId: req.user._id,
    itemId: req.params.itemId,
    quantity: req.body.quantity,
  });

  return res.status(200).json(new ApiResponse(200, { cart }, 'Cart item quantity updated'));
});

// ─────────────────────────────────────────────
// DELETE /api/v1/cart/items/:itemId (Protected)
// ─────────────────────────────────────────────
export const removeCartItemController = asyncHandler(async (req, res) => {
  const cart = await removeCartItem({
    userId: req.user._id,
    itemId: req.params.itemId,
  });

  return res.status(200).json(new ApiResponse(200, { cart }, 'Item removed from cart'));
});

// ─────────────────────────────────────────────
// POST /api/v1/cart/coupon (Protected)
// ─────────────────────────────────────────────
export const applyCouponController = asyncHandler(async (req, res) => {
  const cart = await applyCoupon({
    userId: req.user._id,
    couponCode: req.body.couponCode,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { cart }, `Coupon '${cart.couponCode}' applied successfully`));
});

// ─────────────────────────────────────────────
// DELETE /api/v1/cart/coupon (Protected)
// ─────────────────────────────────────────────
export const removeCouponController = asyncHandler(async (req, res) => {
  const cart = await removeCoupon({
    userId: req.user._id,
  });

  return res.status(200).json(new ApiResponse(200, { cart }, 'Coupon removed from cart'));
});

// ─────────────────────────────────────────────
// DELETE /api/v1/cart (Protected)
// ─────────────────────────────────────────────
export const clearCartController = asyncHandler(async (req, res) => {
  const cart = await clearCart({
    userId: req.user._id,
  });

  return res.status(200).json(new ApiResponse(200, { cart }, 'Cart cleared successfully'));
});
