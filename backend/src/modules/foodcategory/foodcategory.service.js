import FoodCategory from './foodcategory.model.js';
import Menu from '../menu/menu.model.js';
import Restaurant from '../Restaurant/Restaurant.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { ROLES } from '../../constants/roles.js';
import { UploadImageToImageKit } from '../../services/image.service.js';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// ─────────────────────────────────────────────
// CREATE FOOD CATEGORY
// ─────────────────────────────────────────────
export const createFoodCategory = async ({ user, categoryData, imageBuffer, imageMimeType }) => {
  const { restaurantId, menuId, name, description, sortOrder, isActive } = categoryData;

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  // Verify ownership or admin privileges
  const isOwner = restaurant.owner.toString() === user._id.toString();
  const isAdmin = user.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to add categories to this restaurant');
  }

  // Verify menu exists and belongs to this restaurant
  const menu = await Menu.findOne({ _id: menuId, restaurant: restaurantId });
  if (!menu) {
    throw new ApiError(404, 'Menu was not found in this restaurant');
  }

  const trimmedName = name.trim();
  const existingCategory = await FoodCategory.findOne({
    menu: menuId,
    name: new RegExp(`^${trimmedName}$`, 'i'),
  });
  if (existingCategory) {
    throw new ApiError(409, `A food category named '${trimmedName}' already exists in this menu`);
  }

  // Upload image to ImageKit 'zayka' folder if provided
  let imageUrl = '';
  if (imageBuffer) {
    if (imageBuffer.length > MAX_IMAGE_SIZE) {
      throw new ApiError(400, 'Category image size must not exceed 5MB');
    }
    const ext =
      {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
      }[imageMimeType] || 'jpg';

    const upload = await UploadImageToImageKit({
      buffer: imageBuffer,
      fileName: `categoryimage-${Date.now()}.${ext}`,
      folderPath: 'zayka',
    });
    imageUrl = upload?.url || '';
  } else if (typeof categoryData.image === 'string') {
    imageUrl = categoryData.image.trim();
  }

  const category = await FoodCategory.create({
    restaurant: restaurantId,
    menu: menuId,
    name: trimmedName,
    description: description ? description.trim() : '',
    image: imageUrl,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    sortOrder: Number(sortOrder) || 0,
  });

  return category;
};

// ─────────────────────────────────────────────
// GET CATEGORIES BY MENU
// ─────────────────────────────────────────────
export const getCategoriesByMenu = async (menuId, queryParams = {}) => {
  const menu = await Menu.findById(menuId).select('_id name restaurant');
  if (!menu) {
    throw new ApiError(404, 'Menu not found');
  }

  const filter = { menu: menuId };
  if (queryParams.isActive !== undefined) {
    filter.isActive = queryParams.isActive === 'true' || queryParams.isActive === true;
  }

  return FoodCategory.find(filter).sort({ sortOrder: 1, createdAt: 1 }).lean();
};

// ─────────────────────────────────────────────
// GET ALL CATEGORIES BY RESTAURANT
// ─────────────────────────────────────────────
export const getCategoriesByRestaurant = async (restaurantId, queryParams = {}) => {
  const restaurant = await Restaurant.findById(restaurantId).select('_id name');
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  const filter = { restaurant: restaurantId };
  if (queryParams.isActive !== undefined) {
    filter.isActive = queryParams.isActive === 'true' || queryParams.isActive === true;
  }

  return FoodCategory.find(filter)
    .populate('menu', 'name isActive sortOrder')
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();
};

// ─────────────────────────────────────────────
// GET SINGLE CATEGORY BY ID
// ─────────────────────────────────────────────
export const getFoodCategoryById = async (categoryId) => {
  const category = await FoodCategory.findById(categoryId)
    .populate('restaurant', 'name slug owner isOpen')
    .populate('menu', 'name isActive');

  if (!category) {
    throw new ApiError(404, 'Food category not found');
  }
  return category;
};

// ─────────────────────────────────────────────
// UPDATE FOOD CATEGORY
// ─────────────────────────────────────────────
export const updateFoodCategory = async ({
  categoryId,
  user,
  updateData,
  imageBuffer,
  imageMimeType,
}) => {
  const category = await FoodCategory.findById(categoryId);
  if (!category) {
    throw new ApiError(404, 'Food category not found');
  }

  const restaurant = await Restaurant.findById(category.restaurant);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant associated with this category not found');
  }

  const isOwner = restaurant.owner.toString() === user._id.toString();
  const isAdmin = user.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to update this category');
  }

  const updates = {};

  if (updateData.name) {
    const trimmedName = updateData.name.trim();
    if (trimmedName.toLowerCase() !== category.name.toLowerCase()) {
      const existing = await FoodCategory.findOne({
        menu: category.menu,
        name: new RegExp(`^${trimmedName}$`, 'i'),
        _id: { $ne: categoryId },
      });
      if (existing) {
        throw new ApiError(
          409,
          `A food category named '${trimmedName}' already exists in this menu`,
        );
      }
      updates.name = trimmedName;
    }
  }

  if (updateData.description !== undefined) {
    updates.description = updateData.description.trim();
  }

  if (updateData.isActive !== undefined) {
    updates.isActive = Boolean(updateData.isActive);
  }

  if (updateData.sortOrder !== undefined) {
    updates.sortOrder = Number(updateData.sortOrder) || 0;
  }

  // Upload image to ImageKit 'zayka' folder
  if (imageBuffer) {
    if (imageBuffer.length > MAX_IMAGE_SIZE) {
      throw new ApiError(400, 'Category image size must not exceed 5MB');
    }
    const ext =
      {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
      }[imageMimeType] || 'jpg';

    const upload = await UploadImageToImageKit({
      buffer: imageBuffer,
      fileName: `categoryimage-${Date.now()}.${ext}`,
      folderPath: 'zayka',
    });
    if (upload?.url) {
      updates.image = upload.url;
    }
  } else if (typeof updateData.image === 'string' && updateData.image.trim()) {
    updates.image = updateData.image.trim();
  }

  const updatedCategory = await FoodCategory.findByIdAndUpdate(
    categoryId,
    { $set: updates },
    { new: true, runValidators: true },
  );

  return updatedCategory;
};

// ─────────────────────────────────────────────
// DELETE FOOD CATEGORY
// ─────────────────────────────────────────────
export const deleteFoodCategory = async (categoryId, user) => {
  const category = await FoodCategory.findById(categoryId);
  if (!category) {
    throw new ApiError(404, 'Food category not found');
  }

  const restaurant = await Restaurant.findById(category.restaurant);
  const isOwner = restaurant && restaurant.owner.toString() === user._id.toString();
  const isAdmin = user.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to delete this category');
  }

  await FoodCategory.findByIdAndDelete(categoryId);

  return { message: 'Food category deleted successfully' };
};

// ─────────────────────────────────────────────
// TOGGLE FOOD CATEGORY STATUS
// ─────────────────────────────────────────────
export const toggleFoodCategoryStatus = async (categoryId, user, isActive) => {
  const category = await FoodCategory.findById(categoryId);
  if (!category) {
    throw new ApiError(404, 'Food category not found');
  }

  const restaurant = await Restaurant.findById(category.restaurant);
  const isOwner = restaurant && restaurant.owner.toString() === user._id.toString();
  const isAdmin = user.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to change this category status');
  }

  category.isActive = Boolean(isActive);
  await category.save();

  return category;
};

// ─────────────────────────────────────────────
// ADD FOOD ITEM TO CATEGORY
// ─────────────────────────────────────────────
export const addFoodItem = async (categoryId, user, itemData) => {
  const category = await FoodCategory.findById(categoryId);
  if (!category) {
    throw new ApiError(404, 'Food category not found');
  }

  const restaurant = await Restaurant.findById(category.restaurant);
  const isOwner = restaurant && restaurant.owner.toString() === user._id.toString();
  const isAdmin = user.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to add food items to this category');
  }

  const { name, description, price, isVeg, isAvailable, image } = itemData;

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new ApiError(400, 'Dish name is required');
  }
  if (price === undefined || price === null || isNaN(Number(price)) || Number(price) <= 0) {
    throw new ApiError(400, 'Valid positive price is required');
  }

  const newItem = {
    name: name.trim(),
    description: description ? description.trim() : '',
    price: Number(price) || 0,
    isVeg: isVeg !== undefined ? Boolean(isVeg) : true,
    isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    image: image ? image.trim() : '',
  };

  category.items.push(newItem);
  await category.save();

  return category.items[category.items.length - 1];
};

// ─────────────────────────────────────────────
// UPDATE FOOD ITEM IN CATEGORY
// ─────────────────────────────────────────────
export const updateFoodItem = async (categoryId, itemId, user, itemData) => {
  const category = await FoodCategory.findById(categoryId);
  if (!category) {
    throw new ApiError(404, 'Food category not found');
  }

  const restaurant = await Restaurant.findById(category.restaurant);
  const isOwner = restaurant && restaurant.owner.toString() === user._id.toString();
  const isAdmin = user.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to update food items in this category');
  }

  const item = category.items.id(itemId);
  if (!item) {
    throw new ApiError(404, 'Food item not found in this category');
  }

  if (itemData.name !== undefined) item.name = itemData.name.trim();
  if (itemData.description !== undefined) item.description = itemData.description.trim();
  if (itemData.price !== undefined) item.price = Number(itemData.price) || 0;
  if (itemData.isVeg !== undefined) item.isVeg = Boolean(itemData.isVeg);
  if (itemData.isAvailable !== undefined) item.isAvailable = Boolean(itemData.isAvailable);
  if (itemData.image !== undefined) item.image = itemData.image.trim();

  await category.save();
  return item;
};

// ─────────────────────────────────────────────
// DELETE FOOD ITEM FROM CATEGORY
// ─────────────────────────────────────────────
export const deleteFoodItem = async (categoryId, itemId, user) => {
  const category = await FoodCategory.findById(categoryId);
  if (!category) {
    throw new ApiError(404, 'Food category not found');
  }

  const restaurant = await Restaurant.findById(category.restaurant);
  const isOwner = restaurant && restaurant.owner.toString() === user._id.toString();
  const isAdmin = user.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to delete food items from this category');
  }

  const item = category.items.id(itemId);
  if (!item) {
    throw new ApiError(404, 'Food item not found in this category');
  }

  category.items.pull(itemId);
  await category.save();

  return { message: 'Food item deleted successfully' };
};
