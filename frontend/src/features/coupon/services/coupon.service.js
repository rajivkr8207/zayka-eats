import api from '../../../lib/axios.js';

export const couponService = {
  getAvailableCoupons: (params) => api.get('/coupons/available', { params }),
  applyCoupon: (data) => api.post('/coupons/apply', data),
  getCoupons: (params) => api.get('/coupons', { params }),
  getCouponById: (id) => api.get(`/coupons/${id}`),
  createCoupon: (data) => api.post('/coupons', data),
  updateCoupon: (id, data) => api.patch(`/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),
};
