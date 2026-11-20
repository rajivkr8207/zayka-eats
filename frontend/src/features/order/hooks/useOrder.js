import { useState, useCallback } from 'react';
import { orderService } from '../services/order.service.js';

export const useOrder = () => {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMyOrders = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await orderService.getMyOrders(params);
      setOrders(response.data.data.orders || []);
      return response.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch orders';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchOrderById = useCallback(async (orderId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await orderService.getOrderById(orderId);
      setCurrentOrder(response.data.data.order);
      return response.data.data.order;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch order details';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkout = useCallback(async (checkoutData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await orderService.createOrder(checkoutData);
      return response.data.data.order;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place order';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancel = useCallback(async (orderId, reason) => {
    try {
      const response = await orderService.cancelOrder(orderId, { reason });
      return response.data.data.order;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel order';
      setError(msg);
      throw err;
    }
  }, []);

  return {
    orders,
    currentOrder,
    isLoading,
    error,
    fetchMyOrders,
    fetchOrderById,
    checkout,
    cancel,
  };
};

export default useOrder;
