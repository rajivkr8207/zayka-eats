import { useState } from 'react';
import { FiClock } from 'react-icons/fi';
import OrderStatusBadge from '../../order/components/OrderStatusBadge.jsx';

const STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Accept & Confirm' },
  { value: 'preparing', label: 'Food Cooking' },
  { value: 'out_for_delivery', label: 'Handover to Rider' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancel Order' },
];

const OwnerOrderCard = ({ order, onStatusUpdate }) => {
  const [selectedStatus, setSelectedStatus] = useState(order?.status || 'pending');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!order) return null;

  const {
    _id,
    orderNumber,
    customer,
    items = [],
    totalAmount,
    status,
    createdAt,
    specialInstructions,
  } = order;

  const handleUpdate = async (newStatus) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(_id, newStatus);
      setSelectedStatus(newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-surface border border-border-subtle hover:border-border-strong transition-all space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-text-primary">
              Order #{orderNumber || _id?.slice(-8)?.toUpperCase()}
            </h3>
            <OrderStatusBadge status={status} />
          </div>
          <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
            <FiClock className="w-3 h-3" />
            {createdAt ? new Date(createdAt).toLocaleTimeString('en-IN') : ''} • Customer:{' '}
            <strong className="text-text-primary">{customer?.fullName || 'Guest'}</strong>
          </p>
        </div>

        <div className="text-right">
          <span className="text-lg font-black text-brand">₹{totalAmount}</span>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-1.5 divide-y divide-border-subtle/50">
        {items.map((item, idx) => (
          <div key={idx} className="pt-1.5 flex justify-between text-xs text-text-secondary">
            <span>
              <strong className="text-text-primary">{item.quantity}x</strong> {item.name}
            </span>
            <span className="font-semibold text-text-primary">
              ₹{Number(item.price) * Number(item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {specialInstructions && (
        <p className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 font-medium">
          Note: {specialInstructions}
        </p>
      )}

      {/* Action / Status Dropdown */}
      <div className="pt-2 border-t border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <span className="text-xs font-semibold text-text-muted">Update Progress:</span>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedStatus}
            disabled={isUpdating}
            onChange={(e) => handleUpdate(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary font-bold focus:outline-none focus:border-brand cursor-pointer"
          >
            <option value="pending" disabled>
              Pending
            </option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default OwnerOrderCard;
