import { useState, useEffect, useCallback } from 'react';
import { ownerService } from '../services/owner.service.js';

export const useOwnerRestaurant = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMyRestaurants = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ownerService.getMyRestaurants();
      const list = res.data?.data?.restaurants || res.data?.data || [];
      setRestaurants(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your restaurants');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyRestaurants();
  }, [fetchMyRestaurants]);

  return {
    restaurants,
    isLoading,
    error,
    refetch: fetchMyRestaurants,
  };
};

export default useOwnerRestaurant;
