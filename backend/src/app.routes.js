import express from 'express';
import healthRoute from './modules/health/health.route.js';
import authRouter from './modules/user/user.route.js';
import restaurantRouter from './modules/Restaurant/Restaurant.route.js';
import menuRouter from './modules/menu/menu.route.js';
import foodCategoryRouter from './modules/foodcategory/foodcategory.route.js';
import addressRouter from './modules/adress/adress.route.js';
import cartRouter from './modules/cart/cart.route.js';
import orderRouter from './modules/order/order.route.js';
import paymentRouter from './modules/payment/payment.route.js';
import deliveryRouter from './modules/delivery/delivery.route.js';
import couponRouter from './modules/coupon/coupon.route.js';
import reviewRouter from './modules/review/review.route.js';
import notificationRouter from './modules/notification/notification.route.js';
import couponRedemptionRouter from './modules/couponredemption/couponredemption.route.js';
import activityLogRouter from './modules/activityLog/activityLog.route.js';
import adminRouter from './modules/admin/admin.route.js';
import { auditActivity } from './modules/activityLog/activityLog.middleware.js';

const AllRoutes = express.Router();

// Auto-audit all write operations across Zayka Eats API
AllRoutes.use(auditActivity);

AllRoutes.use('/health', healthRoute);
AllRoutes.use('/auth', authRouter);
AllRoutes.use('/admin', adminRouter);
AllRoutes.use('/restaurants', restaurantRouter);
AllRoutes.use('/menus', menuRouter);
AllRoutes.use('/food-categories', foodCategoryRouter);
AllRoutes.use('/addresses', addressRouter);
AllRoutes.use('/cart', cartRouter);
AllRoutes.use('/orders', orderRouter);
AllRoutes.use('/payments', paymentRouter);
AllRoutes.use('/delivery', deliveryRouter);
AllRoutes.use('/coupons', couponRouter);
AllRoutes.use('/reviews', reviewRouter);
AllRoutes.use('/notifications', notificationRouter);
AllRoutes.use('/coupon-redemptions', couponRedemptionRouter);
AllRoutes.use('/activity-logs', activityLogRouter);

export { AllRoutes };
