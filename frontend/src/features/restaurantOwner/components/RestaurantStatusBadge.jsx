const RestaurantStatusBadge = ({ status }) => {
  const config = {
    pending: { label: 'Pending Approval', bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
    approved: { label: 'Verified & Live', bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
    rejected: { label: 'Rejected', bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20' },
    suspended: { label: 'Suspended', bg: 'bg-neutral-500/10', text: 'text-neutral-500', border: 'border-neutral-500/20' },
  };

  const current = config[status?.toLowerCase()] || {
    label: status || 'Pending',
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    border: 'border-amber-500/20',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${current.bg} ${current.text} ${current.border}`}
    >
      {current.label}
    </span>
  );
};

export default RestaurantStatusBadge;
