import crypto from 'crypto';
import Payment from './payment.model.js';
import Order from '../order/order.model.js';
import Config from '../../config/config.js';
import { ApiError } from '../../utils/ApiError.js';
import { ROLES } from '../../constants/roles.js';
import logger from '../../config/logger.js';

// ─────────────────────────────────────────────
// HELPER: CREATE RAZORPAY GATEWAY ORDER
// ─────────────────────────────────────────────
export const createRazorpayOrder = async ({
  amountInPaise,
  currency = 'INR',
  receipt,
}) => {
  const keyId = Config.razorpay_key_id;
  const keySecret = Config.razorpay_key_secret;

  if (keyId && keySecret) {
    try {
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency,
          receipt,
        }),
      });

      if (response.ok) {
        return await response.json();
      }
      const errData = await response.json();
      logger.warn(`Razorpay API error response: ${JSON.stringify(errData)}`);
      if (Config.env === 'production') {
        throw new ApiError(502, `Payment gateway error: ${errData?.error?.description || 'Failed to create order'}`);
      }
    } catch (err) {
      logger.warn(`Razorpay request failed: ${err.message}`);
      if (Config.env === 'production') {
        throw new ApiError(502, `Payment gateway error: ${err.message}`);
      }
    }
  }

  // Fallback simulator for sandbox / dev
  return {
    id: `order_sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    amount: amountInPaise,
    currency,
    receipt,
    status: 'created',
  };
};

// ─────────────────────────────────────────────
// HELPER: VERIFY RAZORPAY SIGNATURE
// ─────────────────────────────────────────────
export const verifyRazorpaySignature = ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const keySecret = Config.razorpay_key_secret;
  if (!keySecret) return false;

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return generatedSignature === razorpaySignature;
};

// ─────────────────────────────────────────────
// INITIATE PAYMENT FOR ORDER
// ─────────────────────────────────────────────
export const initiateOrderPayment = async ({
  user,
  orderId,
  paymentMethod = 'upi',
}) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.user.toString() !== user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to pay for this order');
  }

  if (order.paymentStatus === 'paid') {
    throw new ApiError(400, 'This order has already been paid for');
  }

  if (order.orderStatus === 'cancelled') {
    throw new ApiError(400, 'Cannot make payment for a cancelled order');
  }

  const timestampPart = Date.now().toString().slice(-7);
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  const paymentNumber = `PAY-${timestampPart}-${randomPart}`;

  // Cash On Delivery handling
  if (order.paymentMethod === 'cod') {
    const payment = await Payment.create({
      user: user._id,
      order: order._id,
      paymentNumber,
      amount: order.totalAmount,
      currency: 'INR',
      paymentMethod: 'cod',
      paymentGateway: 'cash',
      paymentStatus: 'pending',
    });

    order.paymentId = payment.paymentNumber;
    await order.save();

    return {
      payment,
      message: 'Cash on delivery payment initiated. Payment to be collected upon delivery.',
    };
  }

  // Online Payment handling (Razorpay)
  const amountInPaise = Math.round(order.totalAmount * 100);
  const gatewayOrder = await createRazorpayOrder({
    amountInPaise,
    currency: 'INR',
    receipt: order.orderNumber,
  });

  const payment = await Payment.create({
    user: user._id,
    order: order._id,
    paymentNumber,
    amount: order.totalAmount,
    currency: 'INR',
    paymentMethod,
    paymentGateway: 'razorpay',
    gatewayOrderId: gatewayOrder.id,
    paymentStatus: 'pending',
  });

  order.paymentId = payment.paymentNumber;
  await order.save();

  return {
    payment,
    razorpayOrderId: gatewayOrder.id,
    amount: order.totalAmount,
    currency: 'INR',
    keyId: Config.razorpay_key_id,
  };
};

// ─────────────────────────────────────────────
// VERIFY ONLINE PAYMENT (Razorpay Signature Callback)
// ─────────────────────────────────────────────
export const verifyPayment = async ({
  user,
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.user.toString() !== user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to verify payment for this order');
  }

  let payment = await Payment.findOne({
    order: order._id,
    $or: [{ gatewayOrderId: razorpayOrderId }, { paymentStatus: 'pending' }],
  }).sort({ createdAt: -1 });

  if (!payment) {
    payment = await Payment.create({
      user: user._id,
      order: order._id,
      paymentNumber: `PAY-${Date.now().toString().slice(-7)}-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: order.totalAmount,
      currency: 'INR',
      paymentMethod: 'upi',
      paymentGateway: 'razorpay',
      gatewayOrderId: razorpayOrderId,
      paymentStatus: 'pending',
    });
  }

  // Verify Signature
  const isSimulated = razorpayOrderId?.startsWith('order_sim_');
  const isValidSignature =
    isSimulated ||
    verifyRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

  if (!isValidSignature && Config.env === 'production') {
    payment.paymentStatus = 'failed';
    payment.failedAt = new Date();
    payment.failureReason = 'Payment gateway signature verification failed';
    await payment.save();

    throw new ApiError(400, 'Payment verification failed: Signature mismatch');
  }

  // Update Payment to Success
  payment.paymentStatus = 'success';
  payment.gatewayPaymentId = razorpayPaymentId;
  payment.paidAt = new Date();
  await payment.save();

  // Update Order to Paid and Confirmed
  order.paymentStatus = 'paid';
  order.paymentId = razorpayPaymentId;
  order.paidAt = new Date();
  if (order.orderStatus === 'pending') {
    order.orderStatus = 'confirmed';
  }

  order.statusHistory.push({
    status: order.orderStatus,
    note: `Online payment received successfully (Transaction: ${razorpayPaymentId})`,
    updatedBy: user._id,
    changedAt: new Date(),
  });

  await order.save();

  return {
    success: true,
    payment,
    order,
  };
};

// ─────────────────────────────────────────────
// HANDLE RAZORPAY WEBHOOKS
// ─────────────────────────────────────────────
export const processWebhook = async ({ rawBody, signature }) => {
  const webhookSecret = Config.razorpay_webhook_secret || Config.razorpay_key_secret;

  if (webhookSecret && signature) {
    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSig !== signature && Config.env === 'production') {
      throw new ApiError(400, 'Invalid webhook signature');
    }
  }

  const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : JSON.parse(rawBody.toString('utf8'));
  const event = payload.event;
  const paymentEntity = payload.payload?.payment?.entity;

  if (event === 'payment.captured' && paymentEntity) {
    const gatewayOrderId = paymentEntity.order_id;
    const payment = await Payment.findOne({ gatewayOrderId });
    if (payment) {
      payment.paymentStatus = 'success';
      payment.gatewayPaymentId = paymentEntity.id;
      payment.paidAt = new Date();
      await payment.save();

      const order = await Order.findById(payment.order);
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.paidAt = new Date();
        order.paymentId = paymentEntity.id;
        if (order.orderStatus === 'pending') order.orderStatus = 'confirmed';
        await order.save();
      }
    }
  }

  return { status: 'ok' };
};

// ─────────────────────────────────────────────
// GET PAYMENT BY ORDER ID
// ─────────────────────────────────────────────
export const getPaymentByOrderId = async (orderId, user) => {
  const order = await Order.findById(orderId).populate('restaurant', 'owner');
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const isCustomer = order.user.toString() === user._id.toString();
  const isOwner = order.restaurant?.owner?.toString() === user._id.toString();
  const isAdmin = user.role === ROLES.ADMIN;

  if (!isCustomer && !isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to view payment for this order');
  }

  const payment = await Payment.findOne({ order: orderId }).sort({ createdAt: -1 });
  if (!payment) {
    throw new ApiError(404, 'No payment record found for this order');
  }

  return payment;
};

// ─────────────────────────────────────────────
// GET USER'S PAYMENT TRANSACTIONS
// ─────────────────────────────────────────────
export const getUserPayments = async (userId, queryParams = {}) => {
  const { page = 1, limit = 10 } = queryParams;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [payments, total] = await Promise.all([
    Payment.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('order', 'orderNumber totalAmount orderStatus')
      .lean(),
    Payment.countDocuments({ user: userId }),
  ]);

  return {
    payments,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

// ─────────────────────────────────────────────
// PROCESS REFUND (Admin Only)
// ─────────────────────────────────────────────
export const processRefund = async ({ orderId, adminUser, refundReason, amount }) => {
  if (adminUser.role !== ROLES.ADMIN) {
    throw new ApiError(403, 'Only administrators can initiate refunds');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const payment = await Payment.findOne({ order: orderId, paymentStatus: 'success' });
  if (!payment) {
    throw new ApiError(400, 'No successful payment found to refund for this order');
  }

  const refundAmt = Number(amount) || payment.amount;

  payment.paymentStatus = 'refunded';
  payment.refundStatus = 'success';
  payment.refundAmount = refundAmt;
  payment.refundId = `REF-${Date.now().toString().slice(-7)}`;
  payment.refundReason = refundReason || 'Refund processed by support';
  payment.refundedAt = new Date();
  await payment.save();

  order.paymentStatus = 'refunded';
  order.statusHistory.push({
    status: order.orderStatus,
    note: `Refund of ₹${refundAmt} processed: ${payment.refundReason}`,
    updatedBy: adminUser._id,
    changedAt: new Date(),
  });
  await order.save();

  return {
    payment,
    order,
  };
};
