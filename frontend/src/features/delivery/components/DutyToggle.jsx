import { FiPower } from 'react-icons/fi';

const DutyToggle = ({ isOnline, onToggle, disabled }) => {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`w-full p-6 rounded-3xl border transition-all flex items-center justify-between shadow-lg cursor-pointer ${
        isOnline
          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/20'
          : 'bg-surface border-border-strong text-text-secondary hover:border-brand/40'
      } disabled:opacity-50`}
    >
      <div className="flex items-center gap-4 text-left">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all ${
            isOnline ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25' : 'bg-surface-elevated text-text-muted'
          }`}
        >
          <FiPower className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-black text-text-primary">
            {isOnline ? "You're Online & Receiving Orders" : "You're Offline"}
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            {isOnline
              ? 'GPS active • Live orders will be assigned to you'
              : 'Turn on to start delivering and earning'}
          </p>
        </div>
      </div>

      <div
        className={`w-14 h-8 rounded-full p-1 transition-colors ${
          isOnline ? 'bg-emerald-500' : 'bg-surface-elevated border border-border-subtle'
        }`}
      >
        <div
          className={`w-6 h-6 rounded-full bg-white transition-transform ${
            isOnline ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </div>
    </button>
  );
};

export default DutyToggle;
