import api from '../../../lib/axios.js';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data, isMultipart = false) =>
    api.post('/auth/register', data, {
      headers: isMultipart ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resendOtp: (data) => api.post('/auth/resend-otp', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data, isMultipart = false) =>
    api.patch('/auth/profile', data, {
      headers: isMultipart ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
  changePassword: (data) => api.patch('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export default authService;
