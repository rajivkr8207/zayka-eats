import { createSlice } from '@reduxjs/toolkit';
import {
  fetchCart,
  addToCart,
  updateItemQuantity,
  removeItem,
  applyCoupon,
  removeCoupon,
  clearCart,
} from './cart.thunk.js';

const initialState = {
  cart: null,
  totalItems: 0,
  isLoading: false,
  error: null,
  conflictModal: {
    isOpen: false,
    pendingItem: null,
    currentRestaurant: null,
    newRestaurant: null,
    message: '',
  },
};

const calculateTotalItems = (items = []) => {
  return items.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    closeConflictModal: (state) => {
      state.conflictModal.isOpen = false;
      state.conflictModal.pendingItem = null;
    },
    resetCartState: (state) => {
      state.cart = null;
      state.totalItems = 0;
      state.error = null;
      state.conflictModal = {
        isOpen: false,
        pendingItem: null,
        currentRestaurant: null,
        newRestaurant: null,
        message: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
        state.totalItems = calculateTotalItems(action.payload?.items);
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
        state.totalItems = calculateTotalItems(action.payload?.items);
        state.error = null;
        state.conflictModal.isOpen = false;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        if (action.payload?.isConflict) {
          state.conflictModal = {
            isOpen: true,
            pendingItem: action.payload.pendingPayload,
            currentRestaurant: action.payload.conflictData?.currentRestaurant,
            newRestaurant: action.payload.conflictData?.newRestaurant,
            message: action.payload.message,
          };
        } else {
          state.error = action.payload?.message || 'Failed to add item to cart';
        }
      })
      // Update quantity
      .addCase(updateItemQuantity.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.totalItems = calculateTotalItems(action.payload?.items);
      })
      // Remove item
      .addCase(removeItem.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.totalItems = calculateTotalItems(action.payload?.items);
      })
      // Apply coupon
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      // Remove coupon
      .addCase(removeCoupon.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      // Clear cart
      .addCase(clearCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.totalItems = 0;
      });
  },
});

export const { closeConflictModal, resetCartState } = cartSlice.actions;

// Re-export thunks for convenience
export {
  fetchCart,
  addToCart,
  updateItemQuantity,
  removeItem,
  applyCoupon,
  removeCoupon,
  clearCart,
};

export default cartSlice.reducer;
