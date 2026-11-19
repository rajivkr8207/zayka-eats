import { Router } from 'express';
import {
  createOrderController,
  verifyPaymentController,
  getCustomerOrdersController,
  getRestaurantOrdersController,
  getOrderByIdController,
  updateOrderStatusController,
  assignDeliveryPartnerController,
  cancelOrderController,
} from './order.controller.js';
import { verifyJWT } from '../../middlewares/auth.middleware.js';
import {
  createOrderValidation,
  verifyPaymentValidation,
  orderIdParamValidation,
  restaurantOrdersQueryValidation,
  updateStatusValidation,
  assignRiderValidation,
  cancelOrderValidation,
} from './order.validate.js';

const orderRouter = Router();

// ─────────────────────────────────────────────
// PROTECTED ORDER ROUTES (Requires Authentication)
// ─────────────────────────────────────────────

/**
 * @route   POST /api/v1/orders
 * @desc    Place order from active cart (Checkout)
 * @access  Protected (Customer)
 */
orderRouter.post('/', verifyJWT, createOrderValidation, createOrderController);

/**
 * @route   POST /api/v1/orders/verify-payment
 * @desc    Verify online payment gateway callback and confirm order
 * @access  Protected (Customer)
 */
orderRouter.post(
  '/verify-payment',
  verifyJWT,
  verifyPaymentValidation,
  verifyPaymentController,
);

/**
 * @route   GET /api/v1/orders/my-orders
 * @desc    Get order history of the authenticated customer
 * @access  Protected (Customer)
 */
orderRouter.get('/my-orders', verifyJWT, getCustomerOrdersController);

/**
 * @route   GET /api/v1/orders/restaurant/:restaurantId
 * @desc    Get orders received by a specific restaurant (with status filter & pagination)
 * @access  Protected (Restaurant Owner or Admin)
 */
orderRouter.get(
  '/restaurant/:restaurantId',
  verifyJWT,
  restaurantOrdersQueryValidation,
  getRestaurantOrdersController,
);

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get complete order details (Customer, Owner, Rider, or Admin)
 * @access  Protected
 */
orderRouter.get('/:id', verifyJWT, orderIdParamValidation, getOrderByIdController);

/**
 * @route   PATCH /api/v1/orders/:id/status
 * @desc    Update order lifecycle status (Kitchen: preparing/ready; Delivery: picked/out/delivered)
 * @access  Protected (Owner, Rider, or Admin)
 */
orderRouter.patch(
  '/:id/status',
  verifyJWT,
  updateStatusValidation,
  updateOrderStatusController,
);

/**
 * @route   PATCH /api/v1/orders/:id/assign-rider
 * @desc    Assign delivery partner to an order
 * @access  Protected (Restaurant Owner or Admin)
 */
orderRouter.patch(
  '/:id/assign-rider',
  verifyJWT,
  assignRiderValidation,
  assignDeliveryPartnerController,
);

/**
 * @route   PATCH /api/v1/orders/:id/cancel
 * @desc    Cancel an order (Customer if before cooking, Owner/Admin with reason)
 * @access  Protected
 */
orderRouter.patch(
  '/:id/cancel',
  verifyJWT,
  cancelOrderValidation,
  cancelOrderController,
);

export default orderRouter;
