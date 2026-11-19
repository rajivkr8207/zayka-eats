import Address from './adress.model.js';
import { ApiError } from '../../utils/ApiError.js';
import logger from '../../config/logger.js';

// ─────────────────────────────────────────────
// REVERSE GEOCODE COORDINATES (Swiggy Style Map Pick)
// ─────────────────────────────────────────────
export const reverseGeocodeCoordinates = async (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new ApiError(400, 'Invalid latitude or longitude coordinates');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

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

    if (!res.ok) {
      throw new Error(`Geocoding server responded with HTTP ${res.status}`);
    }

    const data = await res.json();
    const addr = data.address || {};

    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.suburb ||
      addr.county ||
      '';

    const state = addr.state || '';
    const country = addr.country || 'India';
    const pincode = addr.postcode || '';

    // Line 1: House / Building / Landmark details
    const line1Parts = [addr.house_number, addr.building, addr.amenity].filter(Boolean);
    const addressLine1 = line1Parts.join(', ');

    // Line 2: Road, Street, Locality, Suburb
    const line2Parts = [addr.road || addr.street, addr.neighbourhood || addr.suburb].filter(Boolean);
    const addressLine2 = line2Parts.join(', ');

    const landmark = addr.neighbourhood || addr.poi || '';

    const formattedAddress = data.display_name || [addressLine1, addressLine2, city, state, pincode].filter(Boolean).join(', ');

    return {
      latitude: lat,
      longitude: lng,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      country,
      pincode,
      formattedAddress,
    };
  } catch (error) {
    logger.warn(`Reverse geocoding failed: ${error.message}`);
    return {
      latitude: lat,
      longitude: lng,
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      formattedAddress: '',
    };
  }
};

// ─────────────────────────────────────────────
// CREATE USER ADDRESS (Auto-fetch / Map Pick / Manual)
// ─────────────────────────────────────────────
export const createAddress = async ({ user, addressData }) => {
  let {
    fullName,
    phone,
    alternatePhone,
    addressLine1,
    addressLine2,
    landmark,
    city,
    state,
    country = 'India',
    pincode,
    latitude,
    longitude,
    coordinates,
    addressType = 'home',
    isDefault,
  } = addressData;

  // Fallback to authenticated user's details if missing
  const recipientName = (fullName || user.fullName)?.trim();
  const contactPhone = (phone || user.mobile)?.trim();

  if (!recipientName) {
    throw new ApiError(400, 'Recipient full name is required');
  }
  if (!contactPhone) {
    throw new ApiError(400, 'Contact phone number is required');
  }

  // Resolve coordinates
  let lat = latitude !== undefined && latitude !== null && latitude !== '' ? Number(latitude) : null;
  let lng = longitude !== undefined && longitude !== null && longitude !== '' ? Number(longitude) : null;

  if ((lat === null || lng === null) && Array.isArray(coordinates) && coordinates.length === 2) {
    lng = Number(coordinates[0]);
    lat = Number(coordinates[1]);
  }

  // If coordinates provided, auto-fill any missing address fields using reverse geocoding
  if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
    if (!city || !state || !pincode || !addressLine1) {
      const geo = await reverseGeocodeCoordinates(lat, lng);
      if (!city) city = geo.city;
      if (!state) state = geo.state;
      if (!pincode) pincode = geo.pincode;
      if (!country || country === 'India') country = geo.country || 'India';
      if (!addressLine1) addressLine1 = geo.addressLine1 || geo.addressLine2 || geo.formattedAddress.split(',')[0];
      if (!addressLine2) addressLine2 = geo.addressLine2;
      if (!landmark) landmark = geo.landmark;
    }
  }

  if (!addressLine1 || addressLine1.trim() === '') {
    throw new ApiError(400, 'Flat / House / Building details (addressLine1) are required');
  }
  if (!city || city.trim() === '') {
    throw new ApiError(400, 'City is required');
  }
  if (!state || state.trim() === '') {
    throw new ApiError(400, 'State is required');
  }
  if (!pincode || pincode.trim() === '') {
    throw new ApiError(400, 'Pincode is required');
  }

  // Build full formatted address string
  const formattedAddress = [
    addressLine1.trim(),
    addressLine2?.trim(),
    landmark?.trim(),
    city.trim(),
    state.trim(),
    pincode.trim(),
    country.trim(),
  ]
    .filter(Boolean)
    .join(', ');

  // Check if this is the user's first address
  const addressCount = await Address.countDocuments({ user: user._id, isActive: true });
  const shouldBeDefault = addressCount === 0 || Boolean(isDefault);

  // If this address is default, reset other addresses
  if (shouldBeDefault) {
    await Address.updateMany({ user: user._id }, { $set: { isDefault: false } });
  }

  const location = {
    type: 'Point',
    coordinates:
      lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng) ? [lng, lat] : [0, 0],
  };

  const address = await Address.create({
    user: user._id,
    fullName: recipientName,
    phone: contactPhone,
    alternatePhone: alternatePhone ? alternatePhone.trim() : '',
    addressLine1: addressLine1.trim(),
    addressLine2: addressLine2 ? addressLine2.trim() : '',
    landmark: landmark ? landmark.trim() : '',
    city: city.trim(),
    state: state.trim(),
    country: country.trim(),
    pincode: pincode.trim(),
    formattedAddress,
    location,
    addressType: ['home', 'office', 'other'].includes(addressType) ? addressType : 'home',
    isDefault: shouldBeDefault,
    isActive: true,
  });

  return address;
};

// ─────────────────────────────────────────────
// GET ALL ADDRESSES FOR USER
// ─────────────────────────────────────────────
export const getUserAddresses = async (userId) => {
  return Address.find({ user: userId, isActive: true })
    .sort({ isDefault: -1, updatedAt: -1 })
    .lean();
};

// ─────────────────────────────────────────────
// GET SINGLE ADDRESS BY ID
// ─────────────────────────────────────────────
export const getAddressById = async (addressId, userId) => {
  const address = await Address.findOne({
    _id: addressId,
    user: userId,
    isActive: true,
  });

  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  return address;
};

// ─────────────────────────────────────────────
// UPDATE ADDRESS
// ─────────────────────────────────────────────
export const updateAddress = async ({ addressId, userId, updateData }) => {
  const address = await Address.findOne({
    _id: addressId,
    user: userId,
    isActive: true,
  });

  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  const updates = {};

  if (updateData.fullName) updates.fullName = updateData.fullName.trim();
  if (updateData.phone) updates.phone = updateData.phone.trim();
  if (updateData.alternatePhone !== undefined) updates.alternatePhone = updateData.alternatePhone.trim();
  if (updateData.addressLine1) updates.addressLine1 = updateData.addressLine1.trim();
  if (updateData.addressLine2 !== undefined) updates.addressLine2 = updateData.addressLine2.trim();
  if (updateData.landmark !== undefined) updates.landmark = updateData.landmark.trim();
  if (updateData.city) updates.city = updateData.city.trim();
  if (updateData.state) updates.state = updateData.state.trim();
  if (updateData.country) updates.country = updateData.country.trim();
  if (updateData.pincode) updates.pincode = updateData.pincode.trim();
  if (updateData.addressType) updates.addressType = updateData.addressType;

  // Handle coordinates update
  let lat = updateData.latitude !== undefined && updateData.latitude !== null && updateData.latitude !== '' ? Number(updateData.latitude) : null;
  let lng = updateData.longitude !== undefined && updateData.longitude !== null && updateData.longitude !== '' ? Number(updateData.longitude) : null;

  if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
    updates.location = {
      type: 'Point',
      coordinates: [lng, lat],
    };
  }

  // Handle Default change
  if (updateData.isDefault === true && !address.isDefault) {
    await Address.updateMany({ user: userId }, { $set: { isDefault: false } });
    updates.isDefault = true;
  }

  // Rebuild formatted address string
  const finalLine1 = updates.addressLine1 || address.addressLine1;
  const finalLine2 = updates.addressLine2 !== undefined ? updates.addressLine2 : address.addressLine2;
  const finalLandmark = updates.landmark !== undefined ? updates.landmark : address.landmark;
  const finalCity = updates.city || address.city;
  const finalState = updates.state || address.state;
  const finalPincode = updates.pincode || address.pincode;
  const finalCountry = updates.country || address.country;

  updates.formattedAddress = [
    finalLine1,
    finalLine2,
    finalLandmark,
    finalCity,
    finalState,
    finalPincode,
    finalCountry,
  ]
    .filter(Boolean)
    .join(', ');

  const updatedAddress = await Address.findByIdAndUpdate(
    addressId,
    { $set: updates },
    { new: true, runValidators: true },
  );

  return updatedAddress;
};

// ─────────────────────────────────────────────
// SET DEFAULT ADDRESS
// ─────────────────────────────────────────────
export const setDefaultAddress = async (addressId, userId) => {
  const address = await Address.findOne({
    _id: addressId,
    user: userId,
    isActive: true,
  });

  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  await Address.updateMany({ user: userId }, { $set: { isDefault: false } });

  address.isDefault = true;
  await address.save();

  return address;
};

// ─────────────────────────────────────────────
// DELETE ADDRESS
// ─────────────────────────────────────────────
export const deleteAddress = async (addressId, userId) => {
  const address = await Address.findOne({
    _id: addressId,
    user: userId,
    isActive: true,
  });

  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  const wasDefault = address.isDefault;
  address.isActive = false;
  address.isDefault = false;
  await address.save();

  // If the deleted address was default, promote the next active address to default
  if (wasDefault) {
    const nextAddress = await Address.findOne({ user: userId, isActive: true }).sort({ updatedAt: -1 });
    if (nextAddress) {
      nextAddress.isDefault = true;
      await nextAddress.save();
    }
  }

  return { message: 'Address removed successfully' };
};
