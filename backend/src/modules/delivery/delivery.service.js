import DeliveryPartner from './delivery.model.js';
import Order from '../order/order.model.js';
import User from '../user/user.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { ROLES } from '../../constants/roles.js';
import { UploadImageToImageKit } from '../../services/image.service.js';
import { sendNotification } from '../notification/notification.service.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// ─────────────────────────────────────────────
// REGISTER AS DELIVERY PARTNER
// ─────────────────────────────────────────────
export const registerDeliveryPartner = async ({
  user,
  partnerData,
  profileImageFile,
  aadhaarFile,
  licenseFile,
  rcFile,
}) => {
  const existingPartner = await DeliveryPartner.findOne({ user: user._id });
  if (existingPartner) {
    throw new ApiError(409, 'You have already applied or registered as a delivery partner');
  }

  const {
    fullName,
    phone,
    email,
    dateOfBirth,
    gender,
    emergencyContactName,
    emergencyContactPhone,
    vehicleType,
    vehicleNumber,
    vehicleModel,
    vehicleColor,
    licenseNumber,
  } = partnerData;

  const partnerName = (fullName || user.fullName)?.trim();
  const contactPhone = (phone || user.mobile)?.trim();
  const contactEmail = (email || user.email)?.trim().toLowerCase();

  if (!partnerName) {
    throw new ApiError(400, 'Full name is required');
  }
  if (!contactPhone) {
    throw new ApiError(400, 'Contact phone number is required');
  }
  if (!vehicleType) {
    throw new ApiError(400, 'Vehicle type is required');
  }

  // Upload Profile Image if provided
  let profileImageUrl = '';
  if (profileImageFile) {
    if (profileImageFile.size > MAX_FILE_SIZE) {
      throw new ApiError(400, 'Profile image size must not exceed 5MB');
    }
    const ext = profileImageFile.mimetype === 'image/png' ? 'png' : 'jpg';
    const upload = await UploadImageToImageKit({
      buffer: profileImageFile.buffer,
      fileName: `rider-${Date.now()}.${ext}`,
      folderPath: 'zayka/delivery',
    });
    profileImageUrl = upload?.url || '';
  }

  // Upload Documents (Aadhaar, License, RC)
  let aadhaarUrl = '';
  if (aadhaarFile) {
    const ext = aadhaarFile.mimetype === 'application/pdf' ? 'pdf' : 'jpg';
    const upload = await UploadImageToImageKit({
      buffer: aadhaarFile.buffer,
      fileName: `aadhaar-${Date.now()}.${ext}`,
      folderPath: 'zayka/delivery/docs',
    });
    aadhaarUrl = upload?.url || '';
  }

  let licenseUrl = '';
  if (licenseFile) {
    const ext = licenseFile.mimetype === 'application/pdf' ? 'pdf' : 'jpg';
    const upload = await UploadImageToImageKit({
      buffer: licenseFile.buffer,
      fileName: `license-${Date.now()}.${ext}`,
      folderPath: 'zayka/delivery/docs',
    });
    licenseUrl = upload?.url || '';
  }

  let rcUrl = '';
  if (rcFile) {
    const ext = rcFile.mimetype === 'application/pdf' ? 'pdf' : 'jpg';
    const upload = await UploadImageToImageKit({
      buffer: rcFile.buffer,
      fileName: `rc-${Date.now()}.${ext}`,
      folderPath: 'zayka/delivery/docs',
    });
    rcUrl = upload?.url || '';
  }

  const partner = await DeliveryPartner.create({
    user: user._id,
    fullName: partnerName,
    profileImage: profileImageUrl,
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
    gender: gender || 'prefer_not_to_say',
    phone: contactPhone,
    email: contactEmail,
    emergencyContactName: emergencyContactName ? emergencyContactName.trim() : '',
    emergencyContactPhone: emergencyContactPhone ? emergencyContactPhone.trim() : '',
    vehicleType,
    vehicleNumber: vehicleNumber ? vehicleNumber.trim().toUpperCase() : '',
    vehicleModel: vehicleModel ? vehicleModel.trim() : '',
    vehicleColor: vehicleColor ? vehicleColor.trim() : '',
    licenseNumber: licenseNumber ? licenseNumber.trim() : '',
    documents: {
      aadhaarDocument: aadhaarUrl,
      drivingLicenseImage: licenseUrl,
      vehicleRcImage: rcUrl,
    },
    verificationStatus: 'pending',
    isOnline: false,
    isAvailable: false,
    status: 'offline',
  });

  // Promote user role to DELIVERY_PARTNER if CUSTOMER
  if (user.role === ROLES.CUSTOMER) {
    await User.findByIdAndUpdate(user._id, { $set: { role: ROLES.DELIVERY_PARTNER } });
  }

  return partner;
};

// ─────────────────────────────────────────────
// GET LOGGED-IN RIDER'S PROFILE
// ─────────────────────────────────────────────
export const getMyDeliveryProfile = async (userId) => {
  const partner = await DeliveryPartner.findOne({ user: userId })
    .populate('user', 'fullName email mobile')
    .populate('currentOrder', 'orderNumber orderStatus totalAmount deliveryAddress restaurant');

  if (!partner) {
    throw new ApiError(404, 'Delivery partner profile not found for this account');
  }

  return partner;
};

// ─────────────────────────────────────────────
// GET DELIVERY PARTNER BY ID
// ─────────────────────────────────────────────
export const getDeliveryPartnerById = async (partnerId, requesterUser) => {
  const isAdmin = requesterUser.role === ROLES.ADMIN;
  let query = DeliveryPartner.findById(partnerId).populate('user', 'fullName email mobile');

  if (isAdmin) {
    query = query.select('+licenseNumber +documents.aadhaarDocument +documents.drivingLicenseImage +documents.vehicleRcImage');
  }

  const partner = await query;
  if (!partner) {
    throw new ApiError(404, 'Delivery partner not found');
  }
  return partner;
};

// ─────────────────────────────────────────────
// UPDATE PROFILE
// ─────────────────────────────────────────────
export const updateDeliveryPartnerProfile = async ({
  userId,
  updateData,
  profileImageFile,
}) => {
  const partner = await DeliveryPartner.findOne({ user: userId });
  if (!partner) {
    throw new ApiError(404, 'Delivery partner profile not found');
  }

  const updates = {};
  if (updateData.emergencyContactName !== undefined) updates.emergencyContactName = updateData.emergencyContactName.trim();
  if (updateData.emergencyContactPhone !== undefined) updates.emergencyContactPhone = updateData.emergencyContactPhone.trim();
  if (updateData.vehicleModel !== undefined) updates.vehicleModel = updateData.vehicleModel.trim();
  if (updateData.vehicleColor !== undefined) updates.vehicleColor = updateData.vehicleColor.trim();
  if (updateData.vehicleNumber) updates.vehicleNumber = updateData.vehicleNumber.trim().toUpperCase();

  if (profileImageFile) {
    if (profileImageFile.size > MAX_FILE_SIZE) {
      throw new ApiError(400, 'Profile image size must not exceed 5MB');
    }
    const ext = profileImageFile.mimetype === 'image/png' ? 'png' : 'jpg';
    const upload = await UploadImageToImageKit({
      buffer: profileImageFile.buffer,
      fileName: `rider-${Date.now()}.${ext}`,
      folderPath: 'zayka/delivery',
    });
    if (upload?.url) {
      updates.profileImage = upload.url;
    }
  }

  const updatedPartner = await DeliveryPartner.findByIdAndUpdate(
    partner._id,
    { $set: updates },
    { new: true, runValidators: true },
  );

  return updatedPartner;
};

// ─────────────────────────────────────────────
// TOGGLE ONLINE / OFFLINE STATUS
// ─────────────────────────────────────────────
export const toggleOnlineStatus = async ({
  userId,
  isOnline,
  latitude,
  longitude,
}) => {
  const partner = await DeliveryPartner.findOne({ user: userId });
  if (!partner) {
    throw new ApiError(404, 'Delivery partner profile not found');
  }

  if (partner.verificationStatus !== 'approved') {
    throw new ApiError(
      403,
      'Your account is pending verification. You can only go online after administrator approval.',
    );
  }

  const online = Boolean(isOnline);
  partner.isOnline = online;
  partner.isAvailable = online && !partner.currentOrder;
  partner.status = online ? (partner.currentOrder ? 'on_delivery' : 'online') : 'offline';
  partner.lastActiveAt = new Date();

  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
    partner.currentLocation = {
      type: 'Point',
      coordinates: [lng, lat],
    };
  }

  await partner.save();
  return partner;
};

// ─────────────────────────────────────────────
// UPDATE LIVE LOCATION (GPS Ping)
// ─────────────────────────────────────────────
export const updateLiveLocation = async ({ userId, latitude, longitude }) => {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new ApiError(400, 'Invalid latitude or longitude coordinates');
  }

  const partner = await DeliveryPartner.findOne({ user: userId });
  if (!partner) {
    throw new ApiError(404, 'Delivery partner profile not found');
  }

  partner.currentLocation = {
    type: 'Point',
    coordinates: [lng, lat],
  };
  partner.lastActiveAt = new Date();
  await partner.save();

  return {
    currentLocation: partner.currentLocation,
    lastActiveAt: partner.lastActiveAt,
  };
};

// ─────────────────────────────────────────────
// FIND NEARBY AVAILABLE RIDERS (Geospatial $near)
// ─────────────────────────────────────────────
export const findNearbyAvailableRiders = async ({
  latitude,
  longitude,
  maxDistanceKm = 10,
  limit = 10,
}) => {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (isNaN(lat) || isNaN(lng)) {
    throw new ApiError(400, 'Valid latitude and longitude are required');
  }

  return DeliveryPartner.find({
    verificationStatus: 'approved',
    isOnline: true,
    isAvailable: true,
    status: 'online',
    currentLocation: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: Number(maxDistanceKm) * 1000,
      },
    },
  })
    .limit(Number(limit))
    .select('fullName phone vehicleType averageRating currentLocation')
    .lean();
};

// ─────────────────────────────────────────────
// ACCEPT DELIVERY TASK
// ─────────────────────────────────────────────
export const acceptDeliveryTask = async ({ user, orderId }) => {
  const partner = await DeliveryPartner.findOne({ user: user._id });
  if (!partner) {
    throw new ApiError(404, 'Delivery partner profile not found');
  }
  if (partner.verificationStatus !== 'approved') {
    throw new ApiError(403, 'Account is not approved to accept deliveries');
  }
  if (!partner.isOnline) {
    throw new ApiError(400, 'You must be online to accept delivery tasks');
  }
  if (partner.currentOrder) {
    throw new ApiError(400, 'You already have an active ongoing delivery task');
  }

  // Atomic lock: assign rider only if no one has claimed the order yet
  const order = await Order.findOneAndUpdate(
    {
      _id: orderId,
      deliveryPartner: null,
      orderStatus: { $nin: ['delivered', 'cancelled'] },
    },
    {
      $set: { deliveryPartner: user._id },
    },
    { new: true },
  );

  if (!order) {
    // Could be: not found, already claimed, or in a terminal status
    const existing = await Order.findById(orderId).select('deliveryPartner orderStatus');
    if (!existing) {
      throw new ApiError(404, 'Order not found');
    }
    if (['delivered', 'cancelled'].includes(existing.orderStatus)) {
      throw new ApiError(400, `Cannot accept an order with status '${existing.orderStatus}'`);
    }
    throw new ApiError(409, 'This order has already been accepted by another delivery partner');
  }

  order.statusHistory.push({
    status: order.orderStatus,
    note: `Delivery partner ${partner.fullName} accepted delivery task`,
    updatedBy: user._id,
    changedAt: new Date(),
  });
  await order.save();

  partner.currentOrder = order._id;
  partner.isAvailable = false;
  partner.status = 'on_delivery';
  await partner.save();

  // Notify customer in real-time that delivery partner is assigned
  sendNotification({
    recipientId: order.user,
    title: 'Rider Assigned! 🛵',
    message: `${partner.fullName} has accepted your order delivery.`,
    type: 'delivery_assigned',
    orderId: order._id,
  }).catch((err) => console.error('Delivery assigned notification failed:', err));

  return { order, partner };
};

// ─────────────────────────────────────────────
// COMPLETE DELIVERY TASK (Order Delivered)
// ─────────────────────────────────────────────
export const completeDeliveryTask = async ({ user, orderId, paymentReceived = false }) => {
  const partner = await DeliveryPartner.findOne({ user: user._id });
  if (!partner) {
    throw new ApiError(404, 'Delivery partner profile not found');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (!order.deliveryPartner || order.deliveryPartner.toString() !== user._id.toString()) {
    throw new ApiError(403, 'You are not assigned as the delivery partner for this order');
  }

  if (order.orderStatus === 'delivered') {
    throw new ApiError(400, 'This order has already been marked as delivered');
  }

  // Update order status
  order.orderStatus = 'delivered';
  order.deliveredAt = new Date();
  if (order.paymentMethod === 'cod' && (paymentReceived || order.paymentStatus !== 'paid')) {
    order.paymentStatus = 'paid';
    order.paidAt = new Date();
  }

  order.statusHistory.push({
    status: 'delivered',
    note: 'Order successfully delivered to customer',
    updatedBy: user._id,
    changedAt: new Date(),
  });
  await order.save();

  // Free rider for next delivery
  partner.currentOrder = null;
  partner.isAvailable = partner.isOnline;
  partner.status = partner.isOnline ? 'online' : 'offline';
  partner.totalDeliveries = (partner.totalDeliveries || 0) + 1;
  await partner.save();

  return { order, partner };
};

// ─────────────────────────────────────────────
// ADMIN REVIEW APPLICATION (Approve / Reject)
// ─────────────────────────────────────────────
export const reviewDeliveryPartnerApplication = async ({
  partnerId,
  adminUser,
  verificationStatus,
  rejectionReason = '',
}) => {
  if (adminUser.role !== ROLES.ADMIN) {
    throw new ApiError(403, 'Only administrators can verify delivery partners');
  }

  const partner = await DeliveryPartner.findById(partnerId);
  if (!partner) {
    throw new ApiError(404, 'Delivery partner not found');
  }

  partner.verificationStatus = verificationStatus;
  if (verificationStatus === 'approved') {
    partner.verifiedAt = new Date();
    partner.verifiedBy = adminUser._id;
    partner.rejectionReason = '';

    // Ensure user role is DELIVERY_PARTNER
    await User.findByIdAndUpdate(partner.user, { $set: { role: ROLES.DELIVERY_PARTNER } });
  } else if (verificationStatus === 'rejected') {
    partner.rejectionReason = rejectionReason || 'Application rejected by administration';
    partner.isOnline = false;
    partner.isAvailable = false;
    partner.status = 'inactive';
  }

  await partner.save();
  return partner;
};

// ─────────────────────────────────────────────
// ADMIN LIST DELIVERY PARTNERS
// ─────────────────────────────────────────────
export const listDeliveryPartners = async (queryParams = {}) => {
  const { status, verificationStatus, vehicleType, page = 1, limit = 20 } = queryParams;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const filter = {};
  if (status) filter.status = status;
  if (verificationStatus) filter.verificationStatus = verificationStatus;
  if (vehicleType) filter.vehicleType = vehicleType;

  const [partners, total] = await Promise.all([
    DeliveryPartner.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'fullName email mobile')
      .lean(),
    DeliveryPartner.countDocuments(filter),
  ]);

  return {
    partners,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};
