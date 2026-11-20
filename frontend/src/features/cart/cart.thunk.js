import { createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from './services/cart.service.js';

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const response = await cartService.getCart();
    return response.data.data.cart;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await cartService.addItem(payload);
      return response.data.data.cart;
    } catch (error) {
      if (error.response?.status === 409) {
        // Single-restaurant conflict
        return rejectWithValue({
          isConflict: true,
          conflictData: error.response.data.data,
          pendingPayload: payload,
          message: error.response.data.message,
        });
      }
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to add item to cart',
      });
    }
  },
);

export const updateItemQuantity = createAsyncThunk(
  'cart/updateItemQuantity',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartService.updateQuantity(itemId, quantity);
      return response.data.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update item quantity');
    }
  },
);

export const removeItem = createAsyncThunk(
  'cart/removeItem',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await cartService.removeItem(itemId);
      return response.data.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item');
    }
  },
);

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (code, { rejectWithValue }) => {
    try {
      const response = await cartService.applyCoupon(code);
      return response.data.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to apply coupon');
    }
  },
);

export const removeCoupon = createAsyncThunk(
  'cart/removeCoupon',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.removeCoupon();
      return response.data.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove coupon');
    }
  },
);

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { rejectWithValue }) => {
  try {
    const response = await cartService.clearCart();
    return response.data.data.cart;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
  }
});
