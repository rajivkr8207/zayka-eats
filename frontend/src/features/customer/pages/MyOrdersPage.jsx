import { useEffect, useState } from 'react';
import { useOrder } from '../../order/hooks/useOrder.js';
import OrderCard from '../../order/components/OrderCard.jsx';
import { FiShoppingBag, FiFrown } from 'react-icons/fi';
import { Link } from 'react-router';

const TABS = ['all', 'active', 'completed', 'cancelled'];

const MyOrdersPage = () => {
  const { orders, isLoading, error, fetchMyOrders } = useOrder();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') {
      return ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(
        order.status?.toLowerCase(),
      );
    }
    if (activeTab === 'completed') {
      return order.status?.toLowerCase() === 'delivered';
    }
    if (activeTab === 'cancelled') {
      return order.status?.toLowerCase() === 'cancelled';
    }
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary">My Orders</h1>
          <p className="text-xs text-text-muted">Track live food and review your previous cravings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-brand text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-28 bg-surface rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 rounded-3xl bg-surface border border-border-strong text-center space-y-2">
          <FiFrown className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-xs text-rose-500">{error}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 rounded-3xl bg-surface border border-border-strong text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center text-xl mx-auto">
            <FiShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-text-primary">No Orders in this view</h2>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            {activeTab === 'all'
              ? 'You haven&apos;t placed any orders yet. Start exploring now!'
              : `No orders currently matching "${activeTab}".`}
          </p>
          <Link
            to="/explore"
            className="inline-block px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-bold"
          >
            Browse Food
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
