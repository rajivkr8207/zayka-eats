import api from '../../../lib/axios.js';

export const cartService = {
  getCart: () => api.get('/cart'),
  addItem: (payload) => api.post('/cart/items', payload),
  updateQuantity: (itemId, quantity) => api.patch(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
  applyCoupon: (code) => api.post('/cart/coupon', { code }),
  removeCoupon: () => api.delete('/cart/coupon'),
  clearCart: () => api.delete('/cart'),
};

export default cartService;
