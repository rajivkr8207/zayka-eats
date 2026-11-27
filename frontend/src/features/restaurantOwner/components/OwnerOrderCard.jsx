import { useState, useEffect } from 'react';
import { FiClock, FiUser, FiMapPin, FiPhone } from 'react-icons/fi';
import OrderStatusBadge from '../../order/components/OrderStatusBadge.jsx';

// What restaurant owner can transition to:
const STATUS_OPTIONS = [
  { value: 'confirmed', label: '✅ Accept & Confirm' },
  { value: 'preparing', label: '🍳 Food Cooking' },
  { value: 'ready_for_pickup', label: '📦 Ready for Pickup' },
  { value: 'out_for_delivery', label: '🛵 Handover to Rider' },
  { value: 'cancelled', label: '❌ Cancel Order' },
];

const OwnerOrderCard = ({ order, onStatusUpdate }) => {
  // Normalise field names: backend sends orderStatus, some old data may have status
  const currentStatus = order?.orderStatus || order?.status || 'pending';
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync when order changes (e.g. real-time refetch)
  useEffect(() => {
    setSelectedStatus(order?.orderStatus || order?.status || 'pending');
  }, [order]);

  if (!order) return null;

  const {
    _id,
    orderNumber,
    user,         // populated from backend as { fullName, mobile, email }
    customer,     // legacy / fallback
    items = [],
    totalAmount,
    deliveryAddress,
    deliveryPartner,
    createdAt,
    customerNote,
    specialInstructions,
    paymentMethod,
  } = order;

  const customerName =
    user?.fullName || customer?.fullName || order?.guestName || 'Customer';
  const customerPhone = user?.mobile || customer?.mobile || '';

  const handleUpdate = async (newStatus) => {
    if (newStatus === currentStatus) return;
    setIsUpdating(true);
    try {
      await onStatusUpdate(_id, newStatus);
      setSelectedStatus(newStatus);
    } catch {
      // parent shows toast
      setSelectedStatus(currentStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-surface border border-border-subtle hover:border-border-strong transition-all space-y-4">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-extrabold text-text-primary">
              Order #{orderNumber || _id?.slice(-8)?.toUpperCase()}
            </h3>
            <OrderStatusBadge status={currentStatus} />
            {paymentMethod && (
              <span className="px-2 py-0.5 rounded-full bg-surface-elevated border border-border-subtle text-[10px] font-bold text-text-muted uppercase">
                {paymentMethod === 'cod' ? 'COD' : 'Online'}
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-1 flex items-center gap-2">
            <FiClock className="w-3 h-3" />
            {createdAt ? new Date(createdAt).toLocaleTimeString('en-IN') : ''}
            <span>•</span>
            <FiUser className="w-3 h-3" />
            <strong className="text-text-primary">{customerName}</strong>
            {customerPhone && (
              <a href={`tel:${customerPhone}`} className="flex items-center gap-0.5 text-brand hover:underline">
                <FiPhone className="w-3 h-3" /> {customerPhone}
              </a>
            )}
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-lg font-black text-brand">₹{totalAmount}</span>
        </div>
      </div>

      {/* ── Items ── */}
      <div className="space-y-1.5 divide-y divide-border-subtle/50">
        {items.map((item, idx) => (
          <div key={idx} className="pt-1.5 flex justify-between text-xs text-text-secondary">
            <span>
              <strong className="text-text-primary">{item.quantity}x</strong> {item.name}
            </span>
            <span className="font-semibold text-text-primary">
              ₹{(Number(item.price) * Number(item.quantity)).toFixed(0)}
            </span>
          </div>
        ))}
      </div>

      {/* ── Customer Note ── */}
      {(customerNote || specialInstructions) && (
        <p className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 font-medium">
          📝 Note: {customerNote || specialInstructions}
        </p>
      )}

      {/* ── Delivery Address ── */}
      {deliveryAddress && (
        <div className="p-3 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-muted flex items-start gap-2">
          <FiMapPin className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
          <span>
            {deliveryAddress.addressLine1}
            {deliveryAddress.city ? `, ${deliveryAddress.city}` : ''}
            {deliveryAddress.pincode ? ` - ${deliveryAddress.pincode}` : ''}
          </span>
        </div>
      )}

      {/* ── Assigned Delivery Partner ── */}
      {deliveryPartner && (
        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs flex items-center gap-2">
          <span className="text-emerald-500 font-bold">🛵 Rider:</span>
          <span className="text-text-primary font-semibold">
            {deliveryPartner.fullName || 'Assigned'}
          </span>
          {deliveryPartner.mobile && (
            <a href={`tel:${deliveryPartner.mobile}`} className="ml-auto text-brand font-bold hover:underline flex items-center gap-1">
              <FiPhone className="w-3 h-3" /> {deliveryPartner.mobile}
            </a>
          )}
        </div>
      )}

      {/* ── Status Update ── */}
      {!['delivered', 'cancelled'].includes(currentStatus) && (
        <div className="pt-2 border-t border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-xs font-semibold text-text-muted">Update Progress:</span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedStatus}
              disabled={isUpdating}
              onChange={(e) => handleUpdate(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-bold focus:outline-none focus:border-brand cursor-pointer disabled:opacity-50"
            >
              <option value={currentStatus} disabled>
                Current: {currentStatus.replace(/_/g, ' ')}
              </option>
              {STATUS_OPTIONS.filter((o) => o.value !== currentStatus).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {isUpdating && (
              <span className="text-[11px] text-brand font-bold animate-pulse">Updating…</span>
            )}
          </div>
        </div>
      )}

      {['delivered', 'cancelled'].includes(currentStatus) && (
        <div className="pt-2 border-t border-border-subtle">
          <span className={`text-xs font-bold ${currentStatus === 'delivered' ? 'text-emerald-500' : 'text-red-500'}`}>
            {currentStatus === 'delivered' ? '✅ Order Delivered' : '❌ Order Cancelled'}
          </span>
        </div>
      )}
    </div>
  );
};

export default OwnerOrderCard;
