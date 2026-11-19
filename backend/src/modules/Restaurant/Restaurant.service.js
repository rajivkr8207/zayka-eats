import mongoose from 'mongoose';
import Restaurant from './Restaurant.model.js';
import User from '../user/user.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { ROLES } from '../../constants/roles.js';
import { UploadImageToImageKit } from '../../services/image.service.js';
import { deleteCache } from '../../utils/cache.js';
import logger from '../../config/logger.js';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Helper to auto-resolve address, city, state, pincode, and exact coordinates.
 * If latitude and longitude are supplied, it attempts reverse-geocoding to automatically
 * determine or enrich city, state, country, and formatted exact location.
 */
export const resolveAddressAndLocation = async ({
  address,
  landmark,
  city,
  state,
  country = 'India',
  pincode,
  latitude,
  longitude,
  coordinates,
}) => {
  let lat = latitude !== undefined && latitude !== null && latitude !== '' ? Number(latitude) : null;
  let lng = longitude !== undefined && longitude !== null && longitude !== '' ? Number(longitude) : null;

  if ((lat === null || lng === null) && Array.isArray(coordinates) && coordinates.length === 2) {
    lng = Number(coordinates[0]);
    lat = Number(coordinates[1]);
  }

  // Attempt reverse-geocoding if coordinates are valid
  if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ZaykaFoodDeliveryPlatform/1.0',
            'Accept-Language': 'en',
          },
          signal: controller.signal,
        },
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};

        // Auto-fill city if not provided
        if (!city || city.trim() === '') {
          city =
            addr.city ||
            addr.town ||
            addr.village ||
            addr.municipality ||
            addr.suburb ||
            addr.county ||
            '';
        }

        // Auto-fill state if not provided
        if (!state || state.trim() === '') {
          state = addr.state || '';
        }

        // Auto-fill pincode if not provided
        if (!pincode || pincode.trim() === '') {
          pincode = addr.postcode || '';
        }

        // Auto-fill country
        if (!country || country === 'India') {
          country = addr.country || 'India';
        }

        // Auto-fill exact address if not provided
        if (!address || address.trim() === '') {
          const parts = [
            addr.building || addr.house_number,
            addr.road || addr.street,
            addr.suburb || addr.neighbourhood,
            city,
            state,
            pincode,
          ].filter(Boolean);
          address = parts.length > 0 ? parts.join(', ') : data.display_name || '';
        }
      }
    } catch (err) {
      logger.warn(`Reverse geocoding warning: ${err.message}`);
    }
  }

  return {
    address: address ? address.trim() : '',
    landmark: landmark ? landmark.trim() : '',
    city: city ? city.trim() : '',
    state: state ? state.trim() : '',
    country: country ? country.trim() : 'India',
    pincode: pincode ? pincode.trim() : '',
    location: {
      type: 'Point',
      coordinates:
        lng !== null && lat !== null && !isNaN(lng) && !isNaN(lat) ? [lng, lat] : [0, 0],
    },
  };
};

// ─────────────────────────────────────────────
// CREATE / REGISTER RESTAURANT
// ─────────────────────────────────────────────
export const createRestaurant = async ({
  user,
  restaurantData,
  logoBuffer,
  logoMimeType,
  coverBuffer,
  coverMimeType,
}) => {
  const {
    name,
    description,
    email,
    phone,
    address,
    landmark,
    city,
    state,
    country,
    pincode,
    latitude,
    longitude,
    coordinates,
    cuisineTypes,
    priceForTwo,
    openingTime,
    closingTime,
    workingDays,
    fssaiLicenseNumber,
    gstNumber,
    panNumber,
  } = restaurantData;

  // Resolve Owner Contact Information (automatic fallback to authenticated user)
  const ownerEmail = (email || user.email)?.trim().toLowerCase();
  const ownerPhone = (phone || user.mobile)?.trim();

  if (!ownerPhone) {
    throw new ApiError(
      400,
      'Contact phone number is required. Please provide a phone number or update your user profile mobile.',
    );
  }

  // Resolve Location and Address automatically
  const resolvedAddress = await resolveAddressAndLocation({
    address,
    landmark,
    city,
    state,
    country,
    pincode,
    latitude,
    longitude,
    coordinates,
  });

  if (!resolvedAddress.address) {
    throw new ApiError(400, 'Restaurant address is required');
  }
  if (!resolvedAddress.city) {
    throw new ApiError(
      400,
      'City is required. Please provide city or exact location coordinates',
    );
  }

  // Generate Base Slug for filenames
  const slugBase = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Upload Logo to ImageKit in 'zayka' folder with 'resturantlogo' filename prefix
  let logoUrl = null;
  if (logoBuffer) {
    if (logoBuffer.length > MAX_IMAGE_SIZE) {
      throw new ApiError(400, 'Restaurant logo size must not exceed 5MB');
    }
    const ext =
      {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
      }[logoMimeType] || 'jpg';

    const logoUpload = await UploadImageToImageKit({
      buffer: logoBuffer,
      fileName: `resturantlogo-${slugBase}-${Date.now()}.${ext}`,
      folderPath: 'zayka',
    });

    if (!logoUpload?.url) {
      throw new ApiError(502, 'Failed to upload restaurant logo to image hosting');
    }
    logoUrl = logoUpload.url;
  }

  // Upload Cover Image (Optional) to ImageKit in 'zayka' folder
  let coverUrl = null;
  if (coverBuffer) {
    if (coverBuffer.length > MAX_IMAGE_SIZE) {
      throw new ApiError(400, 'Restaurant cover image size must not exceed 5MB');
    }
    const ext =
      {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
      }[coverMimeType] || 'jpg';

    const coverUpload = await UploadImageToImageKit({
      buffer: coverBuffer,
      fileName: `restaurantcover-${slugBase}-${Date.now()}.${ext}`,
      folderPath: 'zayka',
    });
    coverUrl = coverUpload?.url || null;
  }

  // Parse cuisineTypes if sent as string/JSON
  let parsedCuisines = [];
  if (Array.isArray(cuisineTypes)) {
    parsedCuisines = cuisineTypes.map((c) => String(c).trim()).filter(Boolean);
  } else if (typeof cuisineTypes === 'string') {
    try {
      const parsed = JSON.parse(cuisineTypes);
      parsedCuisines = Array.isArray(parsed) ? parsed : [cuisineTypes.trim()];
    } catch {
      parsedCuisines = cuisineTypes.split(',').map((c) => c.trim()).filter(Boolean);
    }
  }

  // Parse workingDays if sent as string/JSON
  let parsedWorkingDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  if (Array.isArray(workingDays) && workingDays.length > 0) {
    parsedWorkingDays = workingDays;
  } else if (typeof workingDays === 'string') {
    try {
      const parsed = JSON.parse(workingDays);
      if (Array.isArray(parsed) && parsed.length > 0) parsedWorkingDays = parsed;
    } catch {
      parsedWorkingDays = workingDays.split(',').map((d) => d.trim()).filter(Boolean);
    }
  }

  // Create Restaurant Document
  const restaurant = await Restaurant.create({
    name: name.trim(),
    description: description ? description.trim() : '',
    logo: logoUrl,
    coverImage: coverUrl,
    owner: user._id,
    ownerName: user.fullName,
    email: ownerEmail,
    phone: ownerPhone,
    address: resolvedAddress.address,
    landmark: resolvedAddress.landmark,
    city: resolvedAddress.city,
    state: resolvedAddress.state,
    country: resolvedAddress.country,
    pincode: resolvedAddress.pincode,
    location: resolvedAddress.location,
    cuisineTypes: parsedCuisines,
    priceForTwo: Number(priceForTwo) || 0,
    openingTime: openingTime || '09:00',
    closingTime: closingTime || '23:00',
    workingDays: parsedWorkingDays,
    fssaiLicenseNumber: fssaiLicenseNumber ? fssaiLicenseNumber.trim() : '',
    gstNumber: gstNumber ? gstNumber.trim() : '',
    panNumber: panNumber ? panNumber.trim() : '',
    isActive: true,
    isOpen: false,
    approvalStatus: 'pending',
  });

  // Promote user to RESTAURANT_OWNER if currently CUSTOMER
  if (user.role === ROLES.CUSTOMER) {
    await User.findByIdAndUpdate(user._id, { $set: { role: ROLES.RESTAURANT_OWNER } });
    await deleteCache(`auth:user:${user._id}`);
  }

  return restaurant;
};

// ─────────────────────────────────────────────
// GET RESTAURANT BY ID OR SLUG
// ─────────────────────────────────────────────
export const getRestaurantByIdOrSlug = async (idOrSlug) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
  const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug.toLowerCase().trim() };

  const restaurant = await Restaurant.findOne(query).populate('owner', 'fullName email mobile');
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }
  return restaurant;
};

// ─────────────────────────────────────────────
// GET ALL RESTAURANTS (Search, Filters, GeoNear)
// ─────────────────────────────────────────────
export const getAllRestaurants = async (queryParams) => {
  const {
    city,
    cuisine,
    search,
    isOpen,
    latitude,
    longitude,
    maxDistanceKm = 15,
    page = 1,
    limit = 20,
    sort = 'rating',
  } = queryParams;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  // Base query: Only active & approved restaurants for public discovery
  const filter = {
    isActive: true,
    approvalStatus: 'approved',
  };

  if (city) {
    filter.city = new RegExp(`^${city.trim()}$`, 'i');
  }

  if (cuisine) {
    filter.cuisineTypes = { $in: [new RegExp(cuisine.trim(), 'i')] };
  }

  if (isOpen !== undefined) {
    filter.isOpen = isOpen === 'true' || isOpen === true;
  }

  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { name: searchRegex },
      { cuisineTypes: { $in: [searchRegex] } },
      { city: searchRegex },
      { address: searchRegex },
    ];
  }

  const hasGeoCoordinates =
    latitude !== undefined &&
    longitude !== undefined &&
    !isNaN(Number(latitude)) &&
    !isNaN(Number(longitude));

  // If user provided exact location, use MongoDB Geospatial $near
  if (hasGeoCoordinates) {
    filter.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [Number(longitude), Number(latitude)],
        },
        $maxDistance: Number(maxDistanceKm) * 1000, // in meters
      },
    };
  }

  // Sorting
  let sortOption = { averageRating: -1, totalReviews: -1 };
  if (!hasGeoCoordinates) {
    if (sort === 'price_asc') sortOption = { priceForTwo: 1 };
    else if (sort === 'price_desc') sortOption = { priceForTwo: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };
    else if (sort === 'rating') sortOption = { averageRating: -1, totalReviews: -1 };
  }

  const [restaurants, total] = await Promise.all([
    Restaurant.find(filter)
      .sort(hasGeoCoordinates ? undefined : sortOption)
      .skip(skip)
      .limit(limitNum)
      .select('-__v')
      .lean(),
    Restaurant.countDocuments(filter),
  ]);

  return {
    restaurants,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

// ─────────────────────────────────────────────
// GET LOGGED-IN OWNER'S RESTAURANTS
// ─────────────────────────────────────────────
export const getMyRestaurants = async (ownerId) => {
  return Restaurant.find({ owner: ownerId }).sort({ createdAt: -1 }).lean();
};

// ─────────────────────────────────────────────
// UPDATE RESTAURANT
// ─────────────────────────────────────────────
export const updateRestaurant = async ({
  id,
  user,
  updateData,
  logoBuffer,
  logoMimeType,
  coverBuffer,
  coverMimeType,
}) => {
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  // Verify ownership or Admin role
  const isOwner = restaurant.owner.toString() === user._id.toString();
  const isAdmin = user.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to update this restaurant');
  }

  const updates = {};

  if (updateData.name) {
    updates.name = updateData.name.trim();
  }
  if (updateData.description !== undefined) {
    updates.description = updateData.description.trim();
  }
  if (updateData.email) {
    updates.email = updateData.email.trim().toLowerCase();
  }
  if (updateData.phone) {
    updates.phone = updateData.phone.trim();
  }
  if (updateData.priceForTwo !== undefined) {
    updates.priceForTwo = Number(updateData.priceForTwo) || 0;
  }
  if (updateData.openingTime) {
    updates.openingTime = updateData.openingTime;
  }
  if (updateData.closingTime) {
    updates.closingTime = updateData.closingTime;
  }
  if (updateData.fssaiLicenseNumber !== undefined) {
    updates.fssaiLicenseNumber = updateData.fssaiLicenseNumber.trim();
  }
  if (updateData.gstNumber !== undefined) {
    updates.gstNumber = updateData.gstNumber.trim();
  }
  if (updateData.panNumber !== undefined) {
    updates.panNumber = updateData.panNumber.trim();
  }

  // Address & location updates
  if (
    updateData.address ||
    updateData.city ||
    updateData.latitude !== undefined ||
    updateData.longitude !== undefined ||
    updateData.coordinates
  ) {
    const resolved = await resolveAddressAndLocation({
      address: updateData.address || restaurant.address,
      landmark: updateData.landmark !== undefined ? updateData.landmark : restaurant.landmark,
      city: updateData.city || restaurant.city,
      state: updateData.state !== undefined ? updateData.state : restaurant.state,
      country: updateData.country || restaurant.country,
      pincode: updateData.pincode !== undefined ? updateData.pincode : restaurant.pincode,
      latitude: updateData.latitude,
      longitude: updateData.longitude,
      coordinates: updateData.coordinates,
    });

    updates.address = resolved.address;
    updates.landmark = resolved.landmark;
    updates.city = resolved.city;
    updates.state = resolved.state;
    updates.country = resolved.country;
    updates.pincode = resolved.pincode;
    if (resolved.location.coordinates[0] !== 0 || resolved.location.coordinates[1] !== 0) {
      updates.location = resolved.location;
    }
  }

  // Handle Logo Upload to 'zayka' folder
  if (logoBuffer) {
    if (logoBuffer.length > MAX_IMAGE_SIZE) {
      throw new ApiError(400, 'Restaurant logo size must not exceed 5MB');
    }
    const ext =
      {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
      }[logoMimeType] || 'jpg';

    const logoUpload = await UploadImageToImageKit({
      buffer: logoBuffer,
      fileName: `resturantlogo-${restaurant.slug || 'logo'}-${Date.now()}.${ext}`,
      folderPath: 'zayka',
    });

    if (logoUpload?.url) {
      updates.logo = logoUpload.url;
    }
  }

  // Handle Cover Image Upload
  if (coverBuffer) {
    if (coverBuffer.length > MAX_IMAGE_SIZE) {
      throw new ApiError(400, 'Restaurant cover image size must not exceed 5MB');
    }
    const ext =
      {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
      }[coverMimeType] || 'jpg';

    const coverUpload = await UploadImageToImageKit({
      buffer: coverBuffer,
      fileName: `restaurantcover-${restaurant.slug || 'cover'}-${Date.now()}.${ext}`,
      folderPath: 'zayka',
    });

    if (coverUpload?.url) {
      updates.coverImage = coverUpload.url;
    }
  }

  // Parse cuisineTypes
  if (updateData.cuisineTypes) {
    if (Array.isArray(updateData.cuisineTypes)) {
      updates.cuisineTypes = updateData.cuisineTypes;
    } else if (typeof updateData.cuisineTypes === 'string') {
      try {
        const parsed = JSON.parse(updateData.cuisineTypes);
        updates.cuisineTypes = Array.isArray(parsed) ? parsed : [updateData.cuisineTypes.trim()];
      } catch {
        updates.cuisineTypes = updateData.cuisineTypes.split(',').map((c) => c.trim()).filter(Boolean);
      }
    }
  }

  const updated = await Restaurant.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true },
  );

  return updated;
};

// ─────────────────────────────────────────────
// TOGGLE OPEN / CLOSED STATUS
// ─────────────────────────────────────────────
export const toggleRestaurantStatus = async (id, user, isOpen) => {
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  const isOwner = restaurant.owner.toString() === user._id.toString();
  const isAdmin = user.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to change this restaurant status');
  }

  restaurant.isOpen = Boolean(isOpen);
  await restaurant.save();

  return restaurant;
};

// ─────────────────────────────────────────────
// ADMIN APPROVAL / REJECTION
// ─────────────────────────────────────────────
export const updateRestaurantApproval = async (id, { approvalStatus, rejectionReason }) => {
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  restaurant.approvalStatus = approvalStatus;
  if (approvalStatus === 'rejected') {
    restaurant.rejectionReason = rejectionReason || 'Application rejected by administration';
  } else if (approvalStatus === 'approved') {
    restaurant.rejectionReason = null;
  }

  await restaurant.save();
  return restaurant;
};

// ─────────────────────────────────────────────
// DELETE / DEACTIVATE RESTAURANT
// ─────────────────────────────────────────────
export const deleteRestaurant = async (id, user) => {
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  const isOwner = restaurant.owner.toString() === user._id.toString();
  const isAdmin = user.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to delete this restaurant');
  }

  restaurant.isActive = false;
  await restaurant.save();

  return { message: 'Restaurant deactivated successfully' };
};
