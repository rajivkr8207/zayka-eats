import Order from './order.model.js';
import Cart from '../cart/cart.model.js';
import Restaurant from '../Restaurant/Restaurant.model.js';
import Address from '../adress/adress.model.js';
import User from '../user/user.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { ROLES } from '../../constants/roles.js';

// ─────────────────────────────────────────────
// CREATE ORDER FROM USER CART (Checkout)
// ─────────────────────────────────────────────
export const createOrderFromCart = async ({
  user,
  addressId,
  paymentMethod,
  customerNote = '',
}) => {
  // 1. Fetch user's active cart
  const cart = await Cart.findOne({ user: user._id });
  if (!cart || !cart.items || cart.items.length === 0) {
    throw new ApiError(400, 'Your cart is empty. Please add items before placing an order.');
  }

  if (!cart.restaurant) {
    throw new ApiError(400, 'Invalid cart: Restaurant is missing.');
  }

  // 2. Validate Restaurant
  const restaurant = await Restaurant.findById(cart.restaurant).select(
    '_id name isOpen isActive',
  );
  if (!restaurant || !restaurant.isActive) {
    throw new ApiError(400, 'The restaurant is currently inactive or not available.');
  }
  if (!restaurant.isOpen) {
    throw new ApiError(400, 'The restaurant is currently closed and not accepting orders.');
  }

  // 3. Resolve and validate Delivery Address
  let address;
  if (addressId) {
    address = await Address.findOne({
      _id: addressId,
      user: user._id,
      isActive: true,
    });
  } else {
    // Fallback to user's default address
    address = await Address.findOne({
      user: user._id,
      isDefault: true,
      isActive: true,
    });
  }

  if (!address) {
    throw new ApiError(400, 'Please select or add a valid delivery address before checking out.');
  }

  // 4. Create immutable snapshots of address and items
  const deliveryAddressSnapshot = {
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 || '',
    landmark: address.landmark || '',
    city: address.city,
    state: address.state,
    country: address.country || 'India',
    pincode: address.pincode,
    location: address.location || { type: 'Point', coordinates: [0, 0] },
  };

  const itemsSnapshot = cart.items.map((item) => ({
    food: item.food,
    name: item.name,
    image: item.image || '',
    price: Number(item.price),
    quantity: Number(item.quantity),
    subtotal: Number(item.subtotal),
  }));

  // 5. Pricing calculations
  const platformFee = 5; // Standard ₹5 platform fee
  const subtotal = Number(cart.subtotal);
  const discount = Number(cart.discount) || 0;
  const deliveryFee = Number(cart.deliveryFee) || 0;
  const tax = Number(cart.tax) || 0;
  const totalAmount = Math.max(
    0,
    Math.round((subtotal - discount + deliveryFee + tax + platformFee) * 100) / 100,
  );

  // 6. Generate readable unique order number
  const timestampPart = Date.now().toString().slice(-7);
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `ORD-${timestampPart}-${randomPart}`;

  // 7. Initial Status & History
  const isCod = paymentMethod === 'cod';
  const initialOrderStatus = isCod ? 'confirmed' : 'pending';
  const initialHistoryNote = isCod
    ? 'Order placed with Cash on Delivery'
    : 'Order created. Awaiting online payment confirmation';

  const estimatedDeliveryTime = new Date(Date.now() + 40 * 60 * 1000); // 40 minutes

  // 8. Create Order Document
  const order = await Order.create({
    orderNumber,
    user: user._id,
    restaurant: restaurant._id,
    items: itemsSnapshot,
    deliveryAddress: deliveryAddressSnapshot,
    subtotal,
    discount,
    deliveryFee,
    tax,
    platformFee,
    totalAmount,
    couponCode: cart.couponCode || null,
    paymentMethod,
    paymentStatus: 'pending',
    orderStatus: initialOrderStatus,
    customerNote: customerNote ? customerNote.trim() : '',
    estimatedDeliveryTime,
    statusHistory: [
      {
        status: initialOrderStatus,
        note: initialHistoryNote,
        updatedBy: user._id,
        changedAt: new Date(),
      },
    ],
  });

  // 9. Clear user's cart on order placement
  cart.items = [];
  cart.restaurant = null;
  cart.subtotal = 0;
  cart.discount = 0;
  cart.deliveryFee = 0;
  cart.tax = 0;
  cart.totalAmount = 0;
  cart.couponCode = null;
  await cart.save();

  return order;
};

// ─────────────────────────────────────────────
// VERIFY ONLINE PAYMENT & CONFIRM ORDER
// ─────────────────────────────────────────────
export const verifyOrderPayment = async ({ orderId, userId, paymentId }) => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.paymentStatus === 'paid') {
    return order;
  }

  order.paymentStatus = 'paid';
  order.paymentId = paymentId || `PAY-${Date.now()}`;
  order.paidAt = new Date();
  order.orderStatus = 'confirmed';

  order.statusHistory.push({
    status: 'confirmed',
    note: 'Online payment received and verified. Order confirmed.',
    updatedBy: userId,
    changedAt: new Date(),
  });

  await order.save();
  return order;
};

// ─────────────────────────────────────────────
// GET CUSTOMER'S ORDERS
// ─────────────────────────────────────────────
export const getCustomerOrders = async (userId, queryParams = {}) => {
  const { status, page = 1, limit = 10 } = queryParams;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const filter = { user: userId };
  if (status) {
    filter.orderStatus = status;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('restaurant', 'name slug logo address city phone')
      .populate('deliveryPartner', 'fullName mobile')
      .lean(),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

// ─────────────────────────────────────────────
// GET RESTAURANT'S ORDERS (Restaurant Owner / Admin)
// ─────────────────────────────────────────────
export const getRestaurantOrders = async (restaurantId, user, queryParams = {}) => {
  const restaurant = await Restaurant.findById(restaurantId).select('_id owner');
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  const isOwner = restaurant.owner.toString() === user._id.toString();
  const isAdmin = user.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to view orders for this restaurant');
  }

  const { status, page = 1, limit = 20 } = queryParams;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const filter = { restaurant: restaurantId };
  if (status) {
    filter.orderStatus = status;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'fullName mobile email')
      .populate('deliveryPartner', 'fullName mobile')
      .lean(),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

// ─────────────────────────────────────────────
// GET SINGLE ORDER DETAILS (Role-Based Access)
// ─────────────────────────────────────────────
export const getOrderById = async (orderId, user) => {
  const order = await Order.findById(orderId)
    .populate('restaurant', 'name slug logo address city phone owner')
    .populate('user', 'fullName mobile email')
    .populate('deliveryPartner', 'fullName mobile');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Check permission: Customer, Restaurant Owner, Delivery Partner, or Admin
  const isCustomer = order.user._id.toString() === user._id.toString();
  const isRestaurantOwner =
    order.restaurant && order.restaurant.owner?.toString() === user._id.toString();
  const isRider =
    order.deliveryPartner && order.deliveryPartner._id.toString() === user._id.toString();
  const isAdmin = user.role === ROLES.ADMIN;

  if (!isCustomer && !isRestaurantOwner && !isRider && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to view this order');
  }

  return order;
};

// ─────────────────────────────────────────────
// UPDATE ORDER STATUS (Kitchen & Delivery Transitions)
// ─────────────────────────────────────────────
export const updateOrderStatus = async ({ orderId, user, newStatus, note = '' }) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const restaurant = await Restaurant.findById(order.restaurant).select('owner');
  const isRestaurantOwner =
    restaurant && restaurant.owner.toString() === user._id.toString();
  const isRider =
    order.deliveryPartner && order.deliveryPartner.toString() === user._id.toString();
  const isAdmin = user.role === ROLES.ADMIN;

  // Validate state machine permissions
  if (['preparing', 'ready_for_pickup'].includes(newStatus)) {
    if (!isRestaurantOwner && !isAdmin) {
      throw new ApiError(403, 'Only the restaurant owner or admin can update kitchen status');
    }
  } else if (['picked_up', 'out_for_delivery', 'delivered'].includes(newStatus)) {
    if (!isRider && !isAdmin) {
      throw new ApiError(403, 'Only the assigned delivery partner or admin can update delivery status');
    }
  } else if (!isAdmin) {
    throw new ApiError(403, 'You do not have permission to perform this status update');
  }

  if (order.orderStatus === 'cancelled') {
    throw new ApiError(400, 'Cannot change status of an already cancelled order');
  }
  if (order.orderStatus === 'delivered') {
    throw new ApiError(400, 'Order has already been delivered');
  }

  // Handle Delivered status completion
  if (newStatus === 'delivered') {
    order.deliveredAt = new Date();
    if (order.paymentMethod === 'cod' && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.paidAt = new Date();
    }
  }

  order.orderStatus = newStatus;
  order.statusHistory.push({
    status: newStatus,
    note: note || `Status updated to ${newStatus}`,
    updatedBy: user._id,
    changedAt: new Date(),
  });

  await order.save();
  return order;
};

// ─────────────────────────────────────────────
// ASSIGN DELIVERY PARTNER
// ─────────────────────────────────────────────
export const assignDeliveryPartner = async ({ orderId, user, riderId }) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const restaurant = await Restaurant.findById(order.restaurant).select('owner');
  const isRestaurantOwner =
    restaurant && restaurant.owner.toString() === user._id.toString();
  const isAdmin = user.role === ROLES.ADMIN;

  if (!isRestaurantOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to assign riders to this order');
  }

  const rider = await User.findById(riderId);
  if (!rider || rider.role !== ROLES.DELIVERY_PARTNER) {
    throw new ApiError(400, 'Invalid delivery partner specified');
  }

  order.deliveryPartner = rider._id;
  order.statusHistory.push({
    status: order.orderStatus,
    note: `Delivery partner ${rider.fullName} (${rider.mobile || ''}) assigned to order`,
    updatedBy: user._id,
    changedAt: new Date(),
  });

  await order.save();
  return order.populate('deliveryPartner', 'fullName mobile');
};

// ─────────────────────────────────────────────
// CANCEL ORDER
// ─────────────────────────────────────────────
export const cancelOrder = async ({ orderId, user, reason = '' }) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.orderStatus === 'delivered') {
    throw new ApiError(400, 'Delivered orders cannot be cancelled');
  }
  if (order.orderStatus === 'cancelled') {
    throw new ApiError(400, 'Order is already cancelled');
  }

  const isCustomer = order.user.toString() === user._id.toString();
  const restaurant = await Restaurant.findById(order.restaurant).select('owner');
  const isRestaurantOwner =
    restaurant && restaurant.owner.toString() === user._id.toString();
  const isAdmin = user.role === ROLES.ADMIN;

  if (!isCustomer && !isRestaurantOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to cancel this order');
  }

  // Customer cannot cancel if restaurant has already started preparing the food
  if (isCustomer && !['pending', 'confirmed'].includes(order.orderStatus)) {
    throw new ApiError(
      400,
      'Order cannot be cancelled because the restaurant has already started preparing your food.',
    );
  }

  order.orderStatus = 'cancelled';
  order.cancelledAt = new Date();
  order.cancellationReason = reason || (isCustomer ? 'Cancelled by customer' : 'Cancelled by restaurant');

  // If online payment was completed, set to refund pending
  if (order.paymentStatus === 'paid') {
    order.paymentStatus = 'refunded';
  }

  order.statusHistory.push({
    status: 'cancelled',
    note: order.cancellationReason,
    updatedBy: user._id,
    changedAt: new Date(),
  });

  await order.save();
  return order;
};
