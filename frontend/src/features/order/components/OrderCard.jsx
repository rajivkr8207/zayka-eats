import { Link } from 'react-router';
import { FiChevronRight, FiClock, FiShoppingBag } from 'react-icons/fi';
import OrderStatusBadge from './OrderStatusBadge.jsx';

const OrderCard = ({ order }) => {
  if (!order) return null;

  const {
    _id,
    orderNumber,
    restaurant,
    items = [],
    totalAmount,
    status,
    createdAt,
  } = order;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const displayId = orderNumber || _id?.slice(-8)?.toUpperCase();

  return (
    <Link
      to={`/orders/${_id}`}
      className="p-5 rounded-2xl bg-surface border border-border-subtle hover:border-border-strong hover:shadow-lg transition-all block group"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-brand">
            <FiShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary group-hover:text-brand transition-colors">
              {restaurant?.name || 'Zayka Partner Restaurant'}
            </h3>
            <p className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
              <FiClock className="w-3 h-3" /> {formattedDate} • Order #{displayId}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <OrderStatusBadge status={status} />
          <FiChevronRight className="w-4 h-4 text-text-muted group-hover:text-brand transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>

      <div className="pt-3 flex items-center justify-between text-xs">
        <p className="text-text-secondary truncate max-w-xs">
          {items.map((i) => `${i.name} (x${i.quantity})`).join(', ') || 'Delicious food items'}
        </p>
        <span className="font-extrabold text-sm text-text-primary">₹{totalAmount}</span>
      </div>
    </Link>
  );
};

export default OrderCard;
