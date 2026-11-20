import { useState, useEffect, useCallback } from 'react';
import { useOwnerRestaurant } from '../hooks/useOwnerRestaurant.js';
import { ownerService } from '../services/owner.service.js';
import OwnerOrderCard from '../components/OwnerOrderCard.jsx';
import { FiRefreshCw, FiShoppingBag } from 'react-icons/fi';
import { toast } from 'react-toastify';

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'preparing', 'out_for_delivery'];

const IncomingOrdersPage = () => {
  const { restaurants, isLoading: isRestaurantsLoading } = useOwnerRestaurant();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Select first restaurant automatically
  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurantId) {
      setSelectedRestaurantId(restaurants[0]._id);
    }
  }, [restaurants, selectedRestaurantId]);

  const fetchOrders = useCallback(async () => {
    if (!selectedRestaurantId) return;
    try {
      setIsLoadingOrders(true);
      const res = await ownerService.getRestaurantOrders(selectedRestaurantId);
      const list = res.data?.data?.orders || res.data?.data || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Failed to load restaurant orders');
    } finally {
      setIsLoadingOrders(false);
    }
  }, [selectedRestaurantId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await ownerService.updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeFilter === 'all') return true;
    return o.status?.toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Restaurant Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary">Incoming Kitchen Orders</h1>
          <p className="text-xs text-text-muted">Real-time orders ready to prepare and pack</p>
        </div>

        <div className="flex items-center gap-2">
          {restaurants.length > 1 && (
            <select
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs font-bold text-text-primary focus:outline-none focus:border-brand"
            >
              {restaurants.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl bg-surface border border-border-subtle hover:border-brand text-text-muted hover:text-text-primary cursor-pointer"
            title="Refresh Orders"
          >
            <FiRefreshCw className={`w-4 h-4 ${isLoadingOrders ? 'animate-spin text-brand' : ''}`} />
          </button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-2 overflow-x-auto">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === filter
                ? 'bg-brand text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
            }`}
          >
            {filter.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {isLoadingOrders || isRestaurantsLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-32 bg-surface rounded-3xl" />
          <div className="h-32 bg-surface rounded-3xl" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 rounded-3xl bg-surface border border-border-strong text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto">
            <FiShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-text-primary">No Incoming Orders</h2>
          <p className="text-xs text-text-muted">
            {activeFilter === 'all'
              ? 'Your kitchen is all caught up! New orders will arrive here live.'
              : `No orders in status "${activeFilter.replace('_', ' ')}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OwnerOrderCard
              key={order._id}
              order={order}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default IncomingOrdersPage;
