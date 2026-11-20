import { useState } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';

const ApprovalCard = ({ item, type, onApprove, onReject, isProcessing }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const title = type === 'restaurant' ? item.name : item.user?.fullName || item.user?.email || 'Partner';
  const subtitle =
    type === 'restaurant'
      ? `${item.address?.city || ''} • ${item.cuisineTypes?.join(', ') || ''}`
      : `Vehicle: ${item.vehicleType?.toUpperCase()} (${item.vehicleNumber || 'Pending'})`;

  const handleRejectConfirm = () => {
    onReject(item._id, rejectReason || 'Did not meet requirements');
    setShowRejectInput(false);
  };

  return (
    <div className="p-5 rounded-2xl bg-surface border border-border-subtle hover:border-border-strong transition-all space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-black text-text-primary">{title}</h4>
          <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {!showRejectInput ? (
            <>
              <button
                onClick={() => onApprove(item._id)}
                disabled={isProcessing}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <FiCheck className="w-3.5 h-3.5" /> Approve
              </button>
              <button
                onClick={() => setShowRejectInput(true)}
                disabled={isProcessing}
                className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <FiX className="w-3.5 h-3.5" /> Reject
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-rose-500"
              />
              <button
                onClick={handleRejectConfirm}
                className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 cursor-pointer"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowRejectInput(false)}
                className="px-2 py-1.5 text-text-muted hover:text-text-primary text-xs"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovalCard;
