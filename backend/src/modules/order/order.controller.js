import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
  createOrderFromCart,
  verifyOrderPayment,
  getCustomerOrders,
  getRestaurantOrders,
  getOrderById,
  updateOrderStatus,
  assignDeliveryPartner,
  cancelOrder,
} from './order.service.js';

// ─────────────────────────────────────────────
// POST /api/v1/orders (Checkout from Cart)
// ─────────────────────────────────────────────
export const createOrderController = asyncHandler(async (req, res) => {
  const order = await createOrderFromCart({
    user: req.user,
    addressId: req.body.addressId,
    paymentMethod: req.body.paymentMethod,
    customerNote: req.body.customerNote,
  });

  return res.status(201).json(new ApiResponse(201, { order }, 'Order placed successfully'));
});

// ─────────────────────────────────────────────
// POST /api/v1/orders/verify-payment
// ─────────────────────────────────────────────
export const verifyPaymentController = asyncHandler(async (req, res) => {
  const order = await verifyOrderPayment({
    orderId: req.body.orderId,
    userId: req.user._id,
    paymentId: req.body.paymentId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { order }, 'Payment verified and order confirmed'));
});

// ─────────────────────────────────────────────
// GET /api/v1/orders/my-orders (Customer Orders)
// ─────────────────────────────────────────────
export const getCustomerOrdersController = asyncHandler(async (req, res) => {
  const result = await getCustomerOrders(req.user._id, req.query);
  return res.status(200).json(new ApiResponse(200, result, 'Orders fetched successfully'));
});

// ─────────────────────────────────────────────
// GET /api/v1/orders/restaurant/:restaurantId (Restaurant Orders)
// ─────────────────────────────────────────────
export const getRestaurantOrdersController = asyncHandler(async (req, res) => {
  const result = await getRestaurantOrders(req.params.restaurantId, req.user, req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Restaurant orders fetched successfully'));
});

// ─────────────────────────────────────────────
// GET /api/v1/orders/:id (Order Details)
// ─────────────────────────────────────────────
export const getOrderByIdController = asyncHandler(async (req, res) => {
  const order = await getOrderById(req.params.id, req.user);
  return res.status(200).json(new ApiResponse(200, order, 'Order details fetched successfully'));
});

// ─────────────────────────────────────────────
// PATCH /api/v1/orders/:id/status (Kitchen/Delivery/Admin Status Transition)
// ─────────────────────────────────────────────
export const updateOrderStatusController = asyncHandler(async (req, res) => {
  const order = await updateOrderStatus({
    orderId: req.params.id,
    user: req.user,
    newStatus: req.body.newStatus,
    note: req.body.note,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { order }, `Order status updated to ${order.orderStatus}`));
});

// ─────────────────────────────────────────────
// PATCH /api/v1/orders/:id/assign-rider (Assign Delivery Partner)
// ─────────────────────────────────────────────
export const assignDeliveryPartnerController = asyncHandler(async (req, res) => {
  const order = await assignDeliveryPartner({
    orderId: req.params.id,
    user: req.user,
    riderId: req.body.riderId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { order }, 'Delivery partner assigned successfully'));
});

// ─────────────────────────────────────────────
// PATCH /api/v1/orders/:id/cancel (Cancel Order)
// ─────────────────────────────────────────────
export const cancelOrderController = asyncHandler(async (req, res) => {
  const order = await cancelOrder({
    orderId: req.params.id,
    user: req.user,
    reason: req.body.reason,
  });

  return res.status(200).json(new ApiResponse(200, { order }, 'Order cancelled successfully'));
});
