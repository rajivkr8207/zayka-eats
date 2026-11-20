import api from '../../../lib/axios.js';

export const paymentService = {
  initiatePayment: (data) => api.post('/payments/initiate', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
  getPaymentByOrder: (orderId) => api.get(`/payments/order/${orderId}`),
  getMyPayments: (params) => api.get('/payments/my-payments', { params }),
  processRefund: (paymentId, data) => api.post(`/payments/${paymentId}/refund`, data),
};
