import api from '../../../lib/axios.js';

export const addressService = {
  reverseGeocode: (latitude, longitude) =>
    api.get('/addresses/reverse-geocode', { params: { latitude, longitude } }),
  getAddresses: () => api.get('/addresses'),
  getAddressById: (id) => api.get(`/addresses/${id}`),
  createAddress: (data) => api.post('/addresses', data),
  updateAddress: (id, data) => api.patch(`/addresses/${id}`, data),
  setDefaultAddress: (id) => api.patch(`/addresses/${id}/set-default`),
  deleteAddress: (id) => api.delete(`/addresses/${id}`),
};

export default addressService;
