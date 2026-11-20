import Coupon from './coupon.model.js';
import Order from '../order/order.model.js';
import { ApiError } from '../../utils/ApiError.js';

// ─────────────────────────────────────────────
// CORE COUPON DISCOUNT CALCULATION
// ─────────────────────────────────────────────
export function calculateCouponDiscount(coupon, subtotal) {
  if (subtotal < coupon.minOrderAmount) {
    throw new Error(`Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`);
  }

  let discount;

  if (coupon.discountType === 'percentage') {
    discount = (subtotal * coupon.discountValue) / 100;

    if (coupon.maxDiscount != null) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.discountValue;
  }

  // Never discount more than the eligible subtotal
  discount = Math.min(discount, subtotal);

  return Math.round(discount * 100) / 100;
}

// ─────────────────────────────────────────────
// VALIDATE AND CALCULATE COUPON APPLICABILITY
// ─────────────────────────────────────────────
export const validateAndCalculateCoupon = async ({
  code,
  subtotal,
  userId = null,
  restaurantId = null,
}) => {
  if (!code) {
    throw new ApiError(400, 'Coupon code is required');
  }

  const cleanCode = code.toUpperCase().trim();
  const coupon = await Coupon.findOne({ code: cleanCode, isDeleted: false });

  if (!coupon) {
    throw new ApiError(404, `Coupon code '${cleanCode}' is invalid or does not exist`);
  }

  if (!coupon.isActive) {
    throw new ApiError(400, `Coupon '${cleanCode}' is currently inactive`);
  }

  const now = new Date();
  if (now < new Date(coupon.startDate)) {
    throw new ApiError(400, `Coupon '${cleanCode}' is not active yet`);
  }
  if (now > new Date(coupon.expiryDate)) {
    throw new ApiError(400, `Coupon '${cleanCode}' has expired`);
  }

  // Overall usage limit
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, `Coupon '${cleanCode}' usage limit has been reached`);
  }

  // Restaurant restriction
  if (coupon.applicableRestaurants && coupon.applicableRestaurants.length > 0 && restaurantId) {
    const isApplicable = coupon.applicableRestaurants.some(
      (rId) => rId.toString() === restaurantId.toString(),
    );
    if (!isApplicable) {
      throw new ApiError(400, `Coupon '${cleanCode}' is not applicable for this restaurant`);
    }
  }

  // First-time user only rule
  if (coupon.newUserOnly && userId) {
    const pastOrdersCount = await Order.countDocuments({
      user: userId,
      orderStatus: { $ne: 'cancelled' },
    });
    if (pastOrdersCount > 0) {
      throw new ApiError(400, `Coupon '${cleanCode}' is valid only for first-time orders`);
    }
  }

  // Usage limit per user
  if (coupon.usageLimitPerUser && userId) {
    const userUsedCount = await Order.countDocuments({
      user: userId,
      couponCode: cleanCode,
      orderStatus: { $ne: 'cancelled' },
    });
    if (userUsedCount >= coupon.usageLimitPerUser) {
      throw new ApiError(
        400,
        `You have already redeemed coupon '${cleanCode}' maximum allowed times (${coupon.usageLimitPerUser})`,
      );
    }
  }

  // Calculate discount using core formula
  let discount;
  try {
    discount = calculateCouponDiscount(coupon, subtotal);
  } catch (err) {
    throw new ApiError(400, err.message);
  }

  return {
    coupon: {
      _id: coupon._id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscount: coupon.maxDiscount,
      minOrderAmount: coupon.minOrderAmount,
    },
    discount,
    subtotal,
    finalAmount: Math.max(0, Math.round((subtotal - discount) * 100) / 100),
  };
};

// ─────────────────────────────────────────────
// CREATE COUPON (Admin / Owner)
// ─────────────────────────────────────────────
export const createCoupon = async (couponData, creatorUser) => {
  const code = couponData.code.toUpperCase().trim();

  const existing = await Coupon.findOne({ code, isDeleted: false });
  if (existing) {
    throw new ApiError(409, `Coupon with code '${code}' already exists`);
  }

  const coupon = await Coupon.create({
    ...couponData,
    code,
    createdBy: creatorUser?._id || null,
  });

  return coupon;
};

// ─────────────────────────────────────────────
// GET PUBLIC AVAILABLE COUPONS
// ─────────────────────────────────────────────
export const getAvailableCoupons = async ({ restaurantId = null, subtotal = null }) => {
  const now = new Date();

  const filter = {
    isActive: true,
    isDeleted: false,
    startDate: { $lte: now },
    expiryDate: { $gte: now },
  };

  if (restaurantId) {
    filter.$or = [{ applicableRestaurants: { $size: 0 } }, { applicableRestaurants: restaurantId }];
  }

  if (subtotal != null) {
    filter.minOrderAmount = { $lte: Number(subtotal) };
  }

  const coupons = await Coupon.find(filter)
    .select(
      'code name description discountType discountValue maxDiscount minOrderAmount expiryDate applicableRestaurants',
    )
    .sort({ discountValue: -1 })
    .lean();

  return coupons;
};

// ─────────────────────────────────────────────
// GET COUPON BY ID
// ─────────────────────────────────────────────
export const getCouponById = async (couponId) => {
  const coupon = await Coupon.findById(couponId)
    .populate('applicableRestaurants', 'name slug address city')
    .populate('applicableCategories', 'name slug');

  if (!coupon || coupon.isDeleted) {
    throw new ApiError(404, 'Coupon not found');
  }

  return coupon;
};

// ─────────────────────────────────────────────
// UPDATE COUPON (Admin)
// ─────────────────────────────────────────────
export const updateCoupon = async (couponId, updateData) => {
  const coupon = await Coupon.findById(couponId);
  if (!coupon || coupon.isDeleted) {
    throw new ApiError(404, 'Coupon not found');
  }

  if (updateData.code) {
    updateData.code = updateData.code.toUpperCase().trim();
    const existing = await Coupon.findOne({
      code: updateData.code,
      _id: { $ne: couponId },
      isDeleted: false,
    });
    if (existing) {
      throw new ApiError(409, `Another coupon with code '${updateData.code}' already exists`);
    }
  }

  Object.assign(coupon, updateData);
  await coupon.save();

  return coupon;
};

// ─────────────────────────────────────────────
// DELETE COUPON (Soft Delete)
// ─────────────────────────────────────────────
export const deleteCoupon = async (couponId) => {
  const coupon = await Coupon.findById(couponId);
  if (!coupon || coupon.isDeleted) {
    throw new ApiError(404, 'Coupon not found');
  }

  coupon.isDeleted = true;
  coupon.isActive = false;
  await coupon.save();

  return { message: `Coupon '${coupon.code}' successfully deleted` };
};

// ─────────────────────────────────────────────
// LIST COUPONS (Admin)
// ─────────────────────────────────────────────
export const listCoupons = async ({ page = 1, limit = 20, restaurantId, isActive, search }) => {
  const filter = { isDeleted: false };

  if (isActive !== undefined) {
    filter.isActive = String(isActive) === 'true';
  }

  if (restaurantId) {
    filter.applicableRestaurants = restaurantId;
  }

  if (search) {
    filter.$or = [
      { code: { $regex: search.trim(), $options: 'i' } },
      { name: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [coupons, total] = await Promise.all([
    Coupon.find(filter)
      .populate('applicableRestaurants', 'name slug')
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Coupon.countDocuments(filter),
  ]);

  return {
    coupons,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

// ─────────────────────────────────────────────
// RECORD COUPON USAGE (Atomic counter increment)
// ─────────────────────────────────────────────
export const recordCouponUsage = async (couponCode) => {
  if (!couponCode) return;
  await Coupon.findOneAndUpdate(
    { code: couponCode.toUpperCase().trim() },
    { $inc: { usedCount: 1 } },
  );
};
