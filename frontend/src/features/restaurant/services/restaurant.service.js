import api from '../../../lib/axios.js';

export const restaurantService = {
  getRestaurants: (params) => api.get('/restaurants', { params }),
  getRestaurantByIdOrSlug: (idOrSlug) => api.get(`/restaurants/${idOrSlug}`),
  getMyRestaurants: () => api.get('/restaurants/my-restaurants'),
  createRestaurant: (data) => api.post('/restaurants', data),
  updateRestaurant: (id, data) => api.patch(`/restaurants/${id}`, data),
  toggleRestaurantStatus: (id, data) => api.patch(`/restaurants/${id}/status`, data),
  deleteRestaurant: (id) => api.delete(`/restaurants/${id}`),

  // Menus & Categories
  getMenusByRestaurant: (restaurantId) => api.get(`/menus/restaurant/${restaurantId}`),
  getCategoriesByRestaurant: (restaurantId) =>
    api.get(`/food-categories/restaurant/${restaurantId}`),
  getCategoriesByMenu: (menuId) => api.get(`/food-categories/menu/${menuId}`),
};
