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

const AllRoutes = express.Router();

AllRoutes.use('/health', healthRoute);
AllRoutes.use('/auth', authRouter);
AllRoutes.use('/restaurants', restaurantRouter);
AllRoutes.use('/menus', menuRouter);
AllRoutes.use('/food-categories', foodCategoryRouter);
AllRoutes.use('/addresses', addressRouter);
AllRoutes.use('/cart', cartRouter);
AllRoutes.use('/orders', orderRouter);
AllRoutes.use('/payments', paymentRouter);
AllRoutes.use('/delivery', deliveryRouter);

export { AllRoutes };
