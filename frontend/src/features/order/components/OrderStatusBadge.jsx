const OrderStatusBadge = ({ status }) => {
  const config = {
    pending: { label: 'Pending', bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
    confirmed: { label: 'Confirmed', bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
    preparing: { label: 'Cooking', bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20' },
    out_for_delivery: { label: 'On The Way', bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' },
    delivered: { label: 'Delivered', bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
    cancelled: { label: 'Cancelled', bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20' },
  };

  const current = config[status?.toLowerCase()] || {
    label: status || 'Unknown',
    bg: 'bg-neutral-500/10',
    text: 'text-neutral-500',
    border: 'border-neutral-500/20',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${current.bg} ${current.text} ${current.border}`}
    >
      {current.label}
    </span>
  );
};

export default OrderStatusBadge;
