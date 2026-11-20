import { useSelector, useDispatch } from 'react-redux';
import { closeConflictModal, addToCart } from '../cart.slice.js';
import { FiAlertTriangle } from 'react-icons/fi';

const CartConflictModal = () => {
  const dispatch = useDispatch();
  const { conflictModal } = useSelector((state) => state.cart);

  if (!conflictModal?.isOpen) return null;

  const handleReplaceCart = () => {
    if (conflictModal.pendingItem) {
      dispatch(
        addToCart({
          ...conflictModal.pendingItem,
          replaceCart: true,
        }),
      );
    }
    dispatch(closeConflictModal());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md p-6 rounded-2xl bg-surface border border-border-strong shadow-2xl space-y-4">
        {/* Icon & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
            <FiAlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">Replace Cart Items?</h3>
            <p className="text-xs text-text-muted">Single-restaurant order policy</p>
          </div>
        </div>

        {/* Message */}
        <div className="p-3.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-secondary leading-relaxed space-y-2">
          <p>
            Your cart already contains dishes from{' '}
            <strong className="text-text-primary">
              {conflictModal.currentRestaurant?.name || 'another restaurant'}
            </strong>
            .
          </p>
          <p>
            Adding dishes from{' '}
            <strong className="text-brand">
              {conflictModal.newRestaurant?.name || 'this new restaurant'}
            </strong>{' '}
            will reset your current cart. Would you like to start a fresh order?
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => dispatch(closeConflictModal())}
            className="flex-1 py-2.5 px-4 rounded-xl border border-border-subtle text-text-primary text-xs font-semibold hover:bg-surface-elevated transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReplaceCart}
            className="flex-1 py-2.5 px-4 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md hover:shadow-orange-500/20 transition-all"
          >
            Yes, Replace Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartConflictModal;
