import api from '../../../lib/axios.js';

export const adminService = {
  // Restaurants
  getRestaurants: (params) => api.get('/restaurants', { params }),
  updateRestaurantStatus: (id, status) => api.patch(`/restaurants/${id}/status`, { status }),
  deleteRestaurant: (id) => api.delete(`/restaurants/${id}`),

  // Delivery Partners
  getPartners: (params) => api.get('/delivery/partners', { params }),
  verifyPartner: (id, data) => api.patch(`/delivery/partners/${id}/verify`, data),

  // Coupons
  getCoupons: (params) => api.get('/coupons', { params }),
  createCoupon: (data) => api.post('/coupons', data),
  updateCoupon: (id, data) => api.patch(`/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),

  // Activity Logs
  getActivityLogs: (params) => api.get('/activity-logs', { params }),
  getActivityStats: () => api.get('/activity-logs/stats'),
};

export default adminService;
