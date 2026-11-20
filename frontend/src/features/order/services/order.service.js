import api from '../../../lib/axios.js';

export const orderService = {
  createOrder: (data) => api.post('/orders', data),
  verifyOrderPayment: (data) => api.post('/orders/verify-payment', data),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  getRestaurantOrders: (restaurantId, params) =>
    api.get(`/orders/restaurant/${restaurantId}`, { params }),
  updateOrderStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
  assignDeliveryPartner: (id, data) => api.patch(`/orders/${id}/assign-rider`, data),
  cancelOrder: (id, data) => api.patch(`/orders/${id}/cancel`, data),
};
