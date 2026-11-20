import { useEffect } from 'react';
import { Link } from 'react-router';
import { FiShoppingBag, FiMapPin, FiArrowRight, FiUser } from 'react-icons/fi';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { useOrder } from '../../order/hooks/useOrder.js';
import { useAddress } from '../../address/hooks/useAddress.js';
import OrderCard from '../../order/components/OrderCard.jsx';

const CustomerDashboardPage = () => {
  const { user } = useAuth();
  const { orders, fetchMyOrders, isLoading: ordersLoading } = useOrder();
  const { addresses } = useAddress();

  useEffect(() => {
    fetchMyOrders({ limit: 3 });
  }, [fetchMyOrders]);

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-brand/10 via-surface to-surface border border-border-strong shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-text-primary">
            Namaste, {user?.fullName || 'Foodie'}! 👋
          </h1>
          <p className="text-xs text-text-muted">
            Manage your past orders, delivery addresses, and personal account details.
          </p>
        </div>
        <Link
          to="/explore"
          className="px-5 py-2.5 rounded-2xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all"
        >
          Explore Restaurants
        </Link>
      </div>

      {/* Quick Action Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/orders"
          className="bento-card p-5 flex items-center justify-between group hover:-translate-y-1 transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-brand/10 text-brand">
              <FiShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary group-hover:text-brand">My Orders</h3>
              <p className="text-[11px] text-text-muted">View past & live orders</p>
            </div>
          </div>
          <FiArrowRight className="text-text-muted group-hover:text-brand transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          to="/addresses"
          className="bento-card p-5 flex items-center justify-between group hover:-translate-y-1 transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <FiMapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary group-hover:text-emerald-500">
                Saved Addresses
              </h3>
              <p className="text-[11px] text-text-muted">
                {addresses.length} saved location{addresses.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <FiArrowRight className="text-text-muted group-hover:text-emerald-500 transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          to="/profile"
          className="bento-card p-5 flex items-center justify-between group hover:-translate-y-1 transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
              <FiUser className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary group-hover:text-blue-500">My Profile</h3>
              <p className="text-[11px] text-text-muted">Edit profile & settings</p>
            </div>
          </div>
          <FiArrowRight className="text-text-muted group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">Recent Orders</h2>
          <Link to="/orders" className="text-xs text-brand font-semibold hover:underline flex items-center gap-1">
            All orders <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {ordersLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-20 bg-surface rounded-2xl" />
            <div className="h-20 bg-surface rounded-2xl" />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 rounded-3xl bg-surface border border-border-strong text-center space-y-3">
            <p className="text-xs text-text-muted">You haven&apos;t placed any orders yet.</p>
            <Link
              to="/explore"
              className="inline-block px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold"
            >
              Order Food Now
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>

      {/* Default Address Section */}
      {defaultAddress && (
        <div className="p-6 rounded-3xl bg-surface border border-border-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand/10 text-brand">
              <FiMapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-primary">Default Delivery Location</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand/10 text-brand uppercase">
                  {defaultAddress.label}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                {defaultAddress.addressLine1}, {defaultAddress.city} - {defaultAddress.pinCode}
              </p>
            </div>
          </div>
          <Link
            to="/addresses"
            className="text-xs text-brand font-bold hover:underline"
          >
            Manage Addresses
          </Link>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboardPage;
