import { useState, useCallback } from 'react';
import { restaurantService } from '../services/restaurant.service.js';

export const useRestaurant = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRestaurants = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await restaurantService.getRestaurants(params);
      setRestaurants(response.data.data.restaurants || []);
      return response.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch restaurants';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRestaurantDetail = useCallback(async (idOrSlug) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await restaurantService.getRestaurantByIdOrSlug(idOrSlug);
      setCurrentRestaurant(response.data.data.restaurant);
      return response.data.data.restaurant;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch restaurant details';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMenus = useCallback(async (restaurantId) => {
    try {
      const response = await restaurantService.getMenusByRestaurant(restaurantId);
      setMenus(response.data.data.menus || []);
      return response.data.data.menus;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch menus';
      setError(msg);
      return [];
    }
  }, []);

  const fetchCategories = useCallback(async (restaurantId) => {
    try {
      const response = await restaurantService.getCategoriesByRestaurant(restaurantId);
      setCategories(response.data.data.categories || []);
      return response.data.data.categories;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch categories';
      setError(msg);
      return [];
    }
  }, []);

  return {
    restaurants,
    currentRestaurant,
    menus,
    categories,
    isLoading,
    error,
    fetchRestaurants,
    fetchRestaurantDetail,
    fetchMenus,
    fetchCategories,
  };
};

export default useRestaurant;
