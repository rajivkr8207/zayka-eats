import api from '../../../lib/axios.js';

export const adminService = {
  // Dashboard & Stats
  getDashboardStats: () => api.get('/admin/dashboard/stats'),

  // Restaurants & Approvals
  getRestaurants: (params) => api.get('/admin/restaurants', { params }),
  getPendingRestaurants: () => api.get('/admin/restaurant-verifications'),
  updateRestaurantStatus: (id, status, reason) =>
    api.patch(`/restaurants/${id}/approval`, { approvalStatus: status, rejectionReason: reason }),
  approveRestaurant: (id) =>
    api.patch(`/restaurants/${id}/approval`, { approvalStatus: 'approved' }),
  rejectRestaurant: (id, reason) =>
    api.patch(`/restaurants/${id}/approval`, {
      approvalStatus: 'rejected',
      rejectionReason: reason,
    }),
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
