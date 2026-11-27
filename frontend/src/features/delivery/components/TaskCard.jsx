import { FiMapPin, FiPhone, FiCheck, FiTruck, FiNavigation } from 'react-icons/fi';

const TaskCard = ({ task, onAccept, onComplete, onStatusUpdate, isUpdating, isAvailable = false }) => {
  if (!task) return null;

  const {
    _id,
    orderNumber,
    restaurant,
    deliveryAddress,
    customer,
    user,
    totalAmount,
    status,
    orderStatus,
    deliveryPartner,
  } = task;

  const currentStatus = orderStatus || status || 'pending';
  const customerInfo = user || customer || {};
  const isAssignedToMe = Boolean(deliveryPartner);

  return (
    <div className="p-6 rounded-3xl bg-surface border border-brand/50 hover:border-brand shadow-xl space-y-4 transition-all">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-xl bg-brand/10 text-brand">
            <FiTruck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-text-primary">
              Delivery #{orderNumber || _id?.slice(-8)?.toUpperCase()}
            </h3>
            <span className="text-[11px] text-brand font-bold uppercase tracking-wider">
              {currentStatus.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <span className="text-base font-black text-text-primary">₹{totalAmount}</span>
      </div>

      {/* Pickup from Restaurant */}
      <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border-subtle space-y-1">
        <span className="text-[10px] font-black uppercase text-brand tracking-wider">
          Pickup Location
        </span>
        <h4 className="text-xs font-bold text-text-primary">{restaurant?.name || 'Restaurant'}</h4>
        <p className="text-[11px] text-text-muted flex items-center gap-1">
          <FiMapPin className="w-3 h-3 text-brand shrink-0" />
          <span>{restaurant?.address?.addressLine1 || restaurant?.address?.city || restaurant?.city || 'Address'}</span>
        </p>
      </div>

      {/* Drop to Customer */}
      <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border-subtle space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">
            Customer Drop
          </span>
          {customerInfo.mobile && (
            <a
              href={`tel:${customerInfo.mobile}`}
              className="text-[11px] text-brand font-bold flex items-center gap-1 hover:underline"
            >
              <FiPhone className="w-3 h-3" /> Call {customerInfo.mobile}
            </a>
          )}
        </div>
        <h4 className="text-xs font-bold text-text-primary">{customerInfo.fullName || 'Customer'}</h4>
        <p className="text-[11px] text-text-muted flex items-center gap-1">
          <FiMapPin className="w-3 h-3 text-emerald-500 shrink-0" />
          <span>
            {deliveryAddress?.addressLine1 || ''}{deliveryAddress?.city ? `, ${deliveryAddress.city}` : ''}
          </span>
        </p>
      </div>

      {/* Action button */}
      <div className="pt-2">
        {isAvailable || !isAssignedToMe ? (
          <button
            onClick={() => onAccept && onAccept(_id)}
            disabled={isUpdating}
            className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <FiNavigation className="w-4 h-4" />
            {isUpdating ? 'Accepting...' : 'Accept Delivery Task'}
          </button>
        ) : currentStatus !== 'out_for_delivery' && currentStatus !== 'picked_up' ? (
          <button
            onClick={() => onStatusUpdate ? onStatusUpdate(_id, 'out_for_delivery') : onComplete(_id)}
            disabled={isUpdating}
            className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <FiTruck className="w-4 h-4" />
            {isUpdating ? 'Updating...' : 'Pick Up & Start Delivery'}
          </button>
        ) : (
          <button
            onClick={() => onComplete && onComplete(_id)}
            disabled={isUpdating}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <FiCheck className="w-4 h-4" />
            {isUpdating ? 'Completing...' : 'Mark as Delivered'}
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
