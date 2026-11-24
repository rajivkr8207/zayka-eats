import { useState, useEffect, useCallback } from 'react';
import { restaurantService } from '../services/restaurant.service.js';

export const useRestaurant = (initialParams = {}) => {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRestaurants = useCallback(async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const queryParams = { ...initialParams, ...params };
      const res = await restaurantService.getRestaurants(queryParams);
      const data = res.data?.data?.restaurants || res.data?.data || [];
      setRestaurants(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch restaurants');
    } finally {
      setIsLoading(false);
    }
  }, [initialParams]);

  return {
    restaurants,
    isLoading,
    error,
    fetchRestaurants,
  };
};

export const useRestaurantDetail = (idOrSlug) => {
  const [restaurant, setRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetail = useCallback(async () => {
    if (!idOrSlug) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await restaurantService.getRestaurantByIdOrSlug(idOrSlug);
      const resData = res.data?.data?.restaurant || res.data?.data;
      setRestaurant(resData);

      const resId = resData?._id;
      if (resId) {
        // Fetch menus and categories concurrently
        try {
          const [menusRes, catsRes] = await Promise.all([
            restaurantService.getMenusByRestaurant(resId),
            restaurantService.getCategoriesByRestaurant(resId),
          ]);
          setMenus(menusRes || []);
          setCategories(catsRes.data?.data?.categories || catsRes.data?.data || []);
        } catch {
          // If menu/category sub-fetch fails, continue with restaurant details
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load restaurant details');
    } finally {
      setIsLoading(false);
    }
  }, [idOrSlug]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    restaurant,
    menus,
    categories,
    isLoading,
    error,
    refetch: fetchDetail,
  };
};

export default useRestaurant;
