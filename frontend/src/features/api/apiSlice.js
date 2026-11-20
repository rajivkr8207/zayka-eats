import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../../config/config.js';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: config.apiBaseUrl,
    credentials: 'include',
  }),
  tagTypes: [
    'User',
    'Restaurant',
    'Menu',
    'FoodCategory',
    'Address',
    'Cart',
    'Order',
    'Payment',
    'Delivery',
    'Coupon',
    'Review',
    'Notification',
    'ActivityLog',
  ],
  endpoints: () => ({}),
});
