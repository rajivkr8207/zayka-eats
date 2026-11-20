import api from '../../../lib/axios.js';

export const ownerService = {
  // Restaurants
  getMyRestaurants: () => api.get('/restaurants/my-restaurants'),
  createRestaurant: (data) => api.post('/restaurants', data),
  getRestaurantById: (id) => api.get(`/restaurants/${id}`),
  updateRestaurant: (id, data) => api.patch(`/restaurants/${id}`, data),
  toggleRestaurantStatus: (id, data) => api.patch(`/restaurants/${id}/status`, data),
  deleteRestaurant: (id) => api.delete(`/restaurants/${id}`),

  // Menus
  getMenus: (restaurantId) => api.get(`/menus/restaurant/${restaurantId}`),
  createMenu: (data) => api.post('/menus', data),
  updateMenu: (id, data) => api.patch(`/menus/${id}`, data),
  deleteMenu: (id) => api.delete(`/menus/${id}`),

  // Food Categories
  getCategories: (restaurantId) => api.get(`/food-categories/restaurant/${restaurantId}`),
  getCategoriesByMenu: (menuId) => api.get(`/food-categories/menu/${menuId}`),
  createCategory: (data) => api.post('/food-categories', data),
  updateCategory: (id, data) => api.patch(`/food-categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/food-categories/${id}`),

  // Items in Category
  addFoodItem: (categoryId, data) => api.post(`/food-categories/${categoryId}/items`, data),
  updateFoodItem: (categoryId, itemId, data) =>
    api.patch(`/food-categories/${categoryId}/items/${itemId}`, data),
  deleteFoodItem: (categoryId, itemId) =>
    api.delete(`/food-categories/${categoryId}/items/${itemId}`),

  // Incoming Orders
  getRestaurantOrders: (restaurantId, params) =>
    api.get(`/orders/restaurant/${restaurantId}`, { params }),
  updateOrderStatus: (orderId, data) => api.patch(`/orders/${orderId}/status`, data),
};

export default ownerService;
