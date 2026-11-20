import { Routes, Route } from 'react-router';
import MainLayout from '../components/common/MainLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import { ROLES } from '../constants/roles.js';

// Public Pages
import HomePage from '../pages/HomePage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import LoginPage from '../features/auth/pages/LoginPage.jsx';
import RegisterPage from '../features/auth/pages/RegisterPage.jsx';
import VerifyOtpPage from '../features/auth/pages/VerifyOtpPage.jsx';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage.jsx';
import ExplorePage from '../features/restaurant/pages/ExplorePage.jsx';
import RestaurantDetailPage from '../features/restaurant/pages/RestaurantDetailPage.jsx';
import CartPage from '../features/cart/pages/CartPage.jsx';

// Authenticated (All Roles) Pages
import ProfilePage from '../features/auth/pages/ProfilePage.jsx';
import ChangePasswordPage from '../features/auth/pages/ChangePasswordPage.jsx';
import CheckoutPage from '../features/cart/pages/CheckoutPage.jsx';
import NotificationsPage from '../features/notification/pages/NotificationsPage.jsx';

// Customer Pages
import CustomerDashboardPage from '../features/customer/pages/CustomerDashboardPage.jsx';
import MyOrdersPage from '../features/customer/pages/MyOrdersPage.jsx';
import OrderDetailPage from '../features/customer/pages/OrderDetailPage.jsx';
import AddressListPage from '../features/address/pages/AddressListPage.jsx';
import AddressFormPage from '../features/address/pages/AddressFormPage.jsx';

// Restaurant Owner Pages
import OwnerDashboardPage from '../features/restaurantOwner/pages/OwnerDashboardPage.jsx';
import MyRestaurantsPage from '../features/restaurantOwner/pages/MyRestaurantsPage.jsx';
import RestaurantFormPage from '../features/restaurantOwner/pages/RestaurantFormPage.jsx';
import MenuManagePage from '../features/restaurantOwner/pages/MenuManagePage.jsx';
import FoodCategoryPage from '../features/restaurantOwner/pages/FoodCategoryPage.jsx';
import IncomingOrdersPage from '../features/restaurantOwner/pages/IncomingOrdersPage.jsx';

// Delivery Partner Pages
import RiderDashboardPage from '../features/delivery/pages/RiderDashboardPage.jsx';
import OnboardingPage from '../features/delivery/pages/OnboardingPage.jsx';
import DeliveryHistoryPage from '../features/delivery/pages/DeliveryHistoryPage.jsx';

// Admin Pages
import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage.jsx';
import PendingRestaurantsPage from '../features/admin/pages/PendingRestaurantsPage.jsx';
import PendingRidersPage from '../features/admin/pages/PendingRidersPage.jsx';
import CouponManagePage from '../features/admin/pages/CouponManagePage.jsx';
import ActivityLogsPage from '../features/admin/pages/ActivityLogsPage.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* ── Public Routes ── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/restaurants/:idOrSlug" element={<RestaurantDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* ── Authenticated (All Roles) ── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        {/* ── Customer Role Routes ── */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.CUSTOMER]} />}>
          <Route path="/dashboard" element={<CustomerDashboardPage />} />
          <Route path="/orders" element={<MyOrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/addresses" element={<AddressListPage />} />
          <Route path="/addresses/new" element={<AddressFormPage />} />
          <Route path="/addresses/:id/edit" element={<AddressFormPage />} />
        </Route>

        {/* ── Restaurant Owner Role Routes ── */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.RESTAURANT_OWNER]} />}>
          <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
          <Route path="/owner/restaurants" element={<MyRestaurantsPage />} />
          <Route path="/owner/restaurants/new" element={<RestaurantFormPage />} />
          <Route path="/owner/restaurants/:id/edit" element={<RestaurantFormPage />} />
          <Route path="/owner/restaurants/:restaurantId/menus" element={<MenuManagePage />} />
          <Route
            path="/owner/restaurants/:restaurantId/menus/:menuId/categories"
            element={<FoodCategoryPage />}
          />
          <Route path="/owner/orders" element={<IncomingOrdersPage />} />
        </Route>

        {/* ── Delivery Partner Role Routes ── */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.DELIVERY_PARTNER]} />}>
          <Route path="/rider/dashboard" element={<RiderDashboardPage />} />
          <Route path="/rider/onboard" element={<OnboardingPage />} />
          <Route path="/rider/history" element={<DeliveryHistoryPage />} />
        </Route>

        {/* ── Admin Role Routes ── */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/restaurants" element={<PendingRestaurantsPage />} />
          <Route path="/admin/riders" element={<PendingRidersPage />} />
          <Route path="/admin/coupons" element={<CouponManagePage />} />
          <Route path="/admin/logs" element={<ActivityLogsPage />} />
        </Route>

        {/* ── Catch-All 404 ── */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
