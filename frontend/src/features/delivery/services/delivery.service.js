import api from '../../../lib/axios.js';

export const deliveryService = {
  onboard: (data) => api.post('/delivery/register', data),
  getProfile: () => api.get('/delivery/profile/me'),
  updateProfile: (data) => api.patch('/delivery/profile', data),
  toggleOnline: (isOnline) => api.patch('/delivery/status/online', { isOnline }),
  updateLocation: (latitude, longitude) =>
    api.post('/delivery/location', { latitude, longitude }),
  getNearbyRiders: (params) => api.get('/delivery/nearby', { params }),
  acceptTask: (orderId) => api.post(`/delivery/tasks/${orderId}/accept`),
  completeTask: (orderId, data) => api.post(`/delivery/tasks/${orderId}/complete`, data),
  verifyPartner: (id, data) => api.patch(`/delivery/partners/${id}/verify`, data),
  getPartners: (params) => api.get('/delivery/partners', { params }),
};
