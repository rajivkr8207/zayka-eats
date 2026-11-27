import { FiHome, FiBriefcase, FiMapPin, FiCheckCircle, FiTrash2, FiEdit2 } from 'react-icons/fi';

const AddressCard = ({ address, onEdit, onDelete, onSetDefault }) => {
  if (!address) return null;

  const { _id, label, addressType, addressLine1, city, state, pinCode, pincode, landmark, isDefault, fullName } = address;
  const displayLabel = (label || addressType || 'HOME').toUpperCase();

  const getIcon = () => {
    switch (displayLabel) {
      case 'HOME':
        return <FiHome className="w-4 h-4 text-brand" />;
      case 'WORK':
      case 'OFFICE':
        return <FiBriefcase className="w-4 h-4 text-brand" />;
      default:
        return <FiMapPin className="w-4 h-4 text-brand" />;
    }
  };

  return (
    <div
      className={`p-5 rounded-2xl bg-surface border transition-all ${
        isDefault ? 'border-brand shadow-md shadow-orange-500/10' : 'border-border-subtle hover:border-border-strong'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-surface-elevated border border-border-subtle">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
                {displayLabel}
              </span>
              {isDefault && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand/10 text-brand border border-brand/20">
                  DEFAULT
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-1">
              {addressLine1}
              {landmark ? `, Near ${landmark}` : ''}
            </p>
            <p className="text-[11px] text-text-muted">
              {city}, {state} - {pincode || pinCode}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(address)}
              className="p-2 rounded-lg text-text-muted hover:text-brand hover:bg-surface-elevated transition-colors cursor-pointer"
              title="Edit Address"
            >
              <FiEdit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(_id)}
              className="p-2 rounded-lg text-text-muted hover:text-rose-500 hover:bg-surface-elevated transition-colors cursor-pointer"
              title="Delete Address"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {!isDefault && onSetDefault && (
        <div className="pt-3 mt-3 border-t border-border-subtle flex justify-end">
          <button
            onClick={() => onSetDefault(_id)}
            className="text-[11px] text-brand hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <FiCheckCircle className="w-3 h-3" /> Set as Default
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressCard;
