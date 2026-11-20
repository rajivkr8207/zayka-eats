import Menu from './menu.model.js';
import Restaurant from '../Restaurant/Restaurant.model.js';
import FoodCategory from '../foodcategory/foodcategory.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { ROLES } from '../../constants/roles.js';
import { UploadImageToImageKit } from '../../services/image.service.js';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// ─────────────────────────────────────────────
// CREATE MENU
// ─────────────────────────────────────────────
export const createMenu = async ({ user, restaurantId, menuData, imageBuffer, imageMimeType }) => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  // Only the restaurant owner or Admin can create menus
  const isOwner = restaurant.owner.toString() === user._id.toString();
  const isAdmin = user.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to add a menu to this restaurant');
  }

  const trimmedName = menuData.name?.trim();
  const existingMenu = await Menu.findOne({
    restaurant: restaurantId,
    name: new RegExp(`^${trimmedName}$`, 'i'),
  });
  if (existingMenu) {
    throw new ApiError(409, `A menu named '${trimmedName}' already exists in this restaurant`);
  }

  // Upload menu image if provided
  let imageUrl = '';
  if (imageBuffer) {
    if (imageBuffer.length > MAX_IMAGE_SIZE) {
      throw new ApiError(400, 'Menu image size must not exceed 5MB');
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
      fileName: `menuimage-${Date.now()}.${ext}`,
      folderPath: 'zayka',
    });
    imageUrl = upload?.url || '';
  } else if (typeof menuData.image === 'string') {
    imageUrl = menuData.image.trim();
  }

  const menu = await Menu.create({
    restaurant: restaurantId,
    name: trimmedName,
    description: menuData.description ? menuData.description.trim() : '',
    image: imageUrl,
    isActive: menuData.isActive !== undefined ? Boolean(menuData.isActive) : true,
    sortOrder: Number(menuData.sortOrder) || 0,
  });

  return menu;
};

// ─────────────────────────────────────────────
// GET MENUS BY RESTAURANT
// ─────────────────────────────────────────────
export const getMenusByRestaurant = async (restaurantId, queryParams = {}) => {
  const restaurant = await Restaurant.findById(restaurantId).select('_id name isActive');
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  const filter = { restaurant: restaurantId };
  if (queryParams.isActive !== undefined) {
    filter.isActive = queryParams.isActive === 'true' || queryParams.isActive === true;
  }

  return Menu.find(filter).sort({ sortOrder: 1, createdAt: 1 }).lean();
};

// ─────────────────────────────────────────────
// GET SINGLE MENU BY ID
// ─────────────────────────────────────────────
export const getMenuById = async (menuId) => {
  const menu = await Menu.findById(menuId).populate(
    'restaurant',
    'name slug owner isOpen isActive',
  );
  if (!menu) {
    throw new ApiError(404, 'Menu not found');
  }
  return menu;
};

// ─────────────────────────────────────────────
// UPDATE MENU
// ─────────────────────────────────────────────
export const updateMenu = async ({ menuId, user, updateData, imageBuffer, imageMimeType }) => {
  const menu = await Menu.findById(menuId);
  if (!menu) {
    throw new ApiError(404, 'Menu not found');
  }

  const restaurant = await Restaurant.findById(menu.restaurant);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant associated with this menu not found');
  }

  const isOwner = restaurant.owner.toString() === user._id.toString();
  const isAdmin = user.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to update this menu');
  }

  const updates = {};

  if (updateData.name) {
    const trimmedName = updateData.name.trim();
    if (trimmedName.toLowerCase() !== menu.name.toLowerCase()) {
      const existing = await Menu.findOne({
        restaurant: menu.restaurant,
        name: new RegExp(`^${trimmedName}$`, 'i'),
        _id: { $ne: menuId },
      });
      if (existing) {
        throw new ApiError(409, `A menu named '${trimmedName}' already exists in this restaurant`);
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

  // Upload new image if provided
  if (imageBuffer) {
    if (imageBuffer.length > MAX_IMAGE_SIZE) {
      throw new ApiError(400, 'Menu image size must not exceed 5MB');
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
      fileName: `menuimage-${Date.now()}.${ext}`,
      folderPath: 'zayka',
    });
    if (upload?.url) {
      updates.image = upload.url;
    }
  } else if (typeof updateData.image === 'string' && updateData.image.trim()) {
    updates.image = updateData.image.trim();
  }

  const updatedMenu = await Menu.findByIdAndUpdate(
    menuId,
    { $set: updates },
    { new: true, runValidators: true },
  );

  return updatedMenu;
};

// ─────────────────────────────────────────────
// DELETE MENU (Cascades to child categories)
// ─────────────────────────────────────────────
export const deleteMenu = async (menuId, user) => {
  const menu = await Menu.findById(menuId);
  if (!menu) {
    throw new ApiError(404, 'Menu not found');
  }

  const restaurant = await Restaurant.findById(menu.restaurant);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant associated with this menu not found');
  }

  const isOwner = restaurant.owner.toString() === user._id.toString();
  const isAdmin = user.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to delete this menu');
  }

  // Cascade delete associated food categories under this menu
  await FoodCategory.deleteMany({ menu: menuId });

  await Menu.findByIdAndDelete(menuId);

  return { message: 'Menu and all its associated categories deleted successfully' };
};

// ─────────────────────────────────────────────
// TOGGLE MENU STATUS
// ─────────────────────────────────────────────
export const toggleMenuStatus = async (menuId, user, isActive) => {
  const menu = await Menu.findById(menuId);
  if (!menu) {
    throw new ApiError(404, 'Menu not found');
  }

  const restaurant = await Restaurant.findById(menu.restaurant);
  const isOwner = restaurant && restaurant.owner.toString() === user._id.toString();
  const isAdmin = user.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to change this menu status');
  }

  menu.isActive = Boolean(isActive);
  await menu.save();

  return menu;
};
