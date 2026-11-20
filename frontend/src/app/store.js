import { configureStore } from '@reduxjs/toolkit';
import themeReducer from '../features/theme/theme.slice.js';
import authReducer from '../features/auth/auth.slice.js';
import cartReducer from '../features/cart/cart.slice.js';
import notificationReducer from '../features/notification/notification.slice.js';
import { apiSlice } from '../features/api/apiSlice.js';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    cart: cartReducer,
    notifications: notificationReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(apiSlice.middleware),
});

export default store;
