import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import {
  FiArrowLeft,
  FiMapPin,
  FiPhone,
  FiXCircle,
  FiTruck,
} from 'react-icons/fi';
import { useOrder } from '../../order/hooks/useOrder.js';
import OrderTimeline from '../../order/components/OrderTimeline.jsx';
import OrderStatusBadge from '../../order/components/OrderStatusBadge.jsx';
import { toast } from 'react-toastify';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const { currentOrder, fetchOrderById, cancel, isLoading } = useOrder();
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId);
    }
  }, [orderId, fetchOrderById]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        <div className="h-40 bg-surface rounded-3xl" />
        <div className="h-64 bg-surface rounded-3xl" />
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-surface border border-border-strong text-center space-y-3">
        <h2 className="text-lg font-bold text-text-primary">Order Not Found</h2>
        <Link to="/orders" className="text-xs text-brand font-bold hover:underline">
          Back to My Orders
        </Link>
      </div>
    );
  }

  const {
    _id,
    orderNumber,
    restaurant,
    items = [],
    deliveryAddress,
    deliveryPartner,
    status,
    totalAmount,
    subtotal,
    deliveryFee = 30,
    tax: _tax = 0,
    discount = 0,
    createdAt,
  } = currentOrder;

  const canCancel = ['pending', 'confirmed'].includes(status?.toLowerCase());

  const handleCancel = async () => {
    const reason = window.prompt('Please provide a reason for cancelling:');
    if (!reason) return;
    try {
      setIsCancelling(true);
      await cancel(_id, reason);
      toast.success('Order cancelled successfully');
      fetchOrderById(_id);
    } catch {
      toast.error('Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary font-medium"
        >
          <FiArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
        <OrderStatusBadge status={status} />
      </div>

      {/* Main Order Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border-strong shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border-subtle">
          <div>
            <h1 className="text-xl font-black text-text-primary">
              Order #{orderNumber || _id?.slice(-8)?.toUpperCase()}
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              From <strong className="text-text-primary">{restaurant?.name || 'Restaurant'}</strong>
            </p>
          </div>
          <div className="text-xs text-text-muted sm:text-right">
            {createdAt ? new Date(createdAt).toLocaleString('en-IN') : ''}
          </div>
        </div>

        {/* Live Timeline */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Live Delivery Status
          </h3>
          <OrderTimeline status={status} />
        </div>

        {/* Delivery Partner Details (if assigned) */}
        {deliveryPartner && (
          <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                <FiTruck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-primary">
                  {deliveryPartner.fullName || 'Delivery Partner'}
                </p>
                <p className="text-[11px] text-text-muted">Assigned Delivery Hero 🛵</p>
              </div>
            </div>
            {deliveryPartner.mobile && (
              <a
                href={`tel:${deliveryPartner.mobile}`}
                className="p-2 rounded-xl bg-brand text-white text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <FiPhone className="w-3.5 h-3.5" /> Call
              </a>
            )}
          </div>
        )}

        {/* Ordered Items List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Ordered Items
          </h3>
          <div className="divide-y divide-border-subtle">
            {items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-surface-elevated flex items-center justify-center font-bold text-text-muted text-[11px]">
                    {item.quantity}x
                  </span>
                  <span className="font-semibold text-text-primary">{item.name}</span>
                </div>
                <span className="font-bold text-text-primary">
                  ₹{Number(item.price) * Number(item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        {deliveryAddress && (
          <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
              <FiMapPin className="text-brand w-3.5 h-3.5" /> Delivery Address
            </div>
            <p className="text-xs text-text-secondary">
              {deliveryAddress.addressLine1}, {deliveryAddress.city} - {deliveryAddress.pinCode}
            </p>
          </div>
        )}

        {/* Bill Breakdown */}
        <div className="space-y-2 pt-3 border-t border-border-subtle text-xs">
          <div className="flex justify-between text-text-secondary">
            <span>Item Subtotal</span>
            <span>₹{subtotal || totalAmount - deliveryFee}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Delivery Fee</span>
            <span>₹{deliveryFee}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-500 font-semibold">
              <span>Coupon Discount</span>
              <span>-₹{discount}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-extrabold text-text-primary pt-2 border-t border-border-subtle">
            <span>Total Paid</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>

        {/* Cancel Action (if eligible) */}
        {canCancel && (
          <div className="pt-2">
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="w-full py-2.5 rounded-xl border border-rose-500/40 text-rose-500 hover:bg-rose-500/10 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FiXCircle className="w-4 h-4" />
              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailPage;
