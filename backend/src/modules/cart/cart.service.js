import Cart from './cart.model.js';
import Restaurant from '../Restaurant/Restaurant.model.js';
import { ApiError } from '../../utils/ApiError.js';

// ─────────────────────────────────────────────
// RE-CALCULATE CART TOTALS (Pricing Engine)
// ─────────────────────────────────────────────
export const calculateCartTotals = (cart) => {
  if (!cart.items || cart.items.length === 0) {
    cart.restaurant = null;
    cart.items = [];
    cart.subtotal = 0;
    cart.discount = 0;
    cart.deliveryFee = 0;
    cart.tax = 0;
    cart.totalAmount = 0;
    cart.couponCode = null;
    return cart;
  }

  // Calculate items subtotals and overall cart subtotal
  let subtotal = 0;
  for (const item of cart.items) {
    item.subtotal = Math.round(item.price * item.quantity * 100) / 100;
    subtotal += item.subtotal;
  }
  cart.subtotal = Math.round(subtotal * 100) / 100;

  // Delivery fee: Free delivery on orders >= ₹500, otherwise ₹40
  cart.deliveryFee = cart.subtotal >= 500 ? 0 : 40;

  // Tax: 5% GST on food subtotal
  cart.tax = Math.round(cart.subtotal * 0.05 * 100) / 100;

  // Coupon discount calculation
  let discount = 0;
  if (cart.couponCode) {
    const code = cart.couponCode.toUpperCase().trim();
    if (code === 'WELCOME50') {
      // 50% discount up to ₹100
      discount = Math.min(100, Math.round(cart.subtotal * 0.5));
    } else if (code === 'FLAT50') {
      // ₹50 off on orders >= ₹200
      discount = cart.subtotal >= 200 ? 50 : 0;
    } else if (code === 'ZAYKA100') {
      // ₹100 off on orders >= ₹400
      discount = cart.subtotal >= 400 ? 100 : 0;
    } else {
      // Remove invalid code
      discount = 0;
      cart.couponCode = null;
    }
  }
  cart.discount = discount;

  // Final total amount
  cart.totalAmount = Math.max(
    0,
    Math.round((cart.subtotal - cart.discount + cart.deliveryFee + cart.tax) * 100) / 100,
  );

  return cart;
};

// ─────────────────────────────────────────────
// GET OR CREATE USER CART
// ─────────────────────────────────────────────
export const getUserCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate(
    'restaurant',
    'name slug logo address city isOpen isActive',
  );

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      restaurant: null,
      items: [],
      subtotal: 0,
      discount: 0,
      deliveryFee: 0,
      tax: 0,
      totalAmount: 0,
      couponCode: null,
    });
  }

  return cart;
};

// ─────────────────────────────────────────────
// ADD ITEM TO CART (Swiggy Single-Restaurant Check)
// ─────────────────────────────────────────────
export const addItemToCart = async ({
  userId,
  restaurantId,
  foodId,
  name,
  price,
  image = '',
  quantity = 1,
  replaceCart = false,
}) => {
  const restaurant = await Restaurant.findById(restaurantId).select(
    '_id name isOpen isActive',
  );
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }
  if (!restaurant.isActive) {
    throw new ApiError(400, 'This restaurant is currently inactive');
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({
      user: userId,
      restaurant: restaurantId,
      items: [],
    });
  }

  let cartReplaced = false;

  // Single-Restaurant Enforcement (Swiggy style conflict alert)
  if (
    cart.restaurant &&
    cart.items.length > 0 &&
    cart.restaurant.toString() !== restaurantId.toString()
  ) {
    if (!replaceCart) {
      const currentRestaurant = await Restaurant.findById(cart.restaurant).select('name');
      throw new ApiError(
        409,
        `Your cart already contains items from "${currentRestaurant?.name || 'another restaurant'}". Would you like to discard them and add items from "${restaurant.name}"?`,
        [
          {
            conflict: true,
            currentRestaurantId: cart.restaurant,
            currentRestaurantName: currentRestaurant?.name || 'Another Restaurant',
            newRestaurantId: restaurant._id,
            newRestaurantName: restaurant.name,
          },
        ],
      );
    }

    // User confirmed to replace/reset cart with the new restaurant's items
    cart.restaurant = restaurantId;
    cart.items = [];
    cart.couponCode = null;
    cartReplaced = true;
  }

  // Set restaurant if cart was empty
  if (!cart.restaurant) {
    cart.restaurant = restaurantId;
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.food.toString() === foodId.toString(),
  );

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += Number(quantity);
    cart.items[existingItemIndex].price = Number(price);
  } else {
    cart.items.push({
      food: foodId,
      name: name.trim(),
      price: Number(price),
      image: image ? image.trim() : '',
      quantity: Number(quantity),
      subtotal: Math.round(Number(price) * Number(quantity) * 100) / 100,
    });
  }

  calculateCartTotals(cart);
  await cart.save();
  await cart.populate('restaurant', 'name slug logo address city isOpen isActive');

  return { cart, cartReplaced };
};

// ─────────────────────────────────────────────
// UPDATE CART ITEM QUANTITY
// ─────────────────────────────────────────────
export const updateCartItemQuantity = async ({ userId, itemId, quantity }) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId.toString());
  if (itemIndex === -1) {
    throw new ApiError(404, 'Item not found in cart');
  }

  const newQty = Number(quantity);
  if (newQty <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = newQty;
  }

  calculateCartTotals(cart);
  await cart.save();
  await cart.populate('restaurant', 'name slug logo address city isOpen isActive');

  return cart;
};

// ─────────────────────────────────────────────
// REMOVE CART ITEM
// ─────────────────────────────────────────────
export const removeCartItem = async ({ userId, itemId }) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  cart.items = cart.items.filter((item) => item._id.toString() !== itemId.toString());

  calculateCartTotals(cart);
  await cart.save();
  await cart.populate('restaurant', 'name slug logo address city isOpen isActive');

  return cart;
};

// ─────────────────────────────────────────────
// APPLY COUPON CODE
// ─────────────────────────────────────────────
export const applyCoupon = async ({ userId, couponCode }) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  if (cart.items.length === 0) {
    throw new ApiError(400, 'Cannot apply coupon to an empty cart');
  }

  const code = couponCode.toUpperCase().trim();
  const validCoupons = ['WELCOME50', 'FLAT50', 'ZAYKA100'];

  if (!validCoupons.includes(code)) {
    throw new ApiError(400, `Coupon '${code}' is invalid or expired`);
  }

  // Minimum order value validation
  if (code === 'FLAT50' && cart.subtotal < 200) {
    throw new ApiError(400, "Coupon 'FLAT50' requires a minimum order subtotal of ₹200");
  }
  if (code === 'ZAYKA100' && cart.subtotal < 400) {
    throw new ApiError(400, "Coupon 'ZAYKA100' requires a minimum order subtotal of ₹400");
  }

  cart.couponCode = code;
  calculateCartTotals(cart);
  await cart.save();
  await cart.populate('restaurant', 'name slug logo address city isOpen isActive');

  return cart;
};

// ─────────────────────────────────────────────
// REMOVE COUPON
// ─────────────────────────────────────────────
export const removeCoupon = async ({ userId }) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  cart.couponCode = null;
  cart.discount = 0;
  calculateCartTotals(cart);
  await cart.save();
  await cart.populate('restaurant', 'name slug logo address city isOpen isActive');

  return cart;
};

// ─────────────────────────────────────────────
// CLEAR CART
// ─────────────────────────────────────────────
export const clearCart = async ({ userId }) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  cart.items = [];
  cart.restaurant = null;
  calculateCartTotals(cart);
  await cart.save();

  return cart;
};
