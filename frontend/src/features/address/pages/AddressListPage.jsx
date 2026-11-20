import { Link, useNavigate } from 'react-router';
import { FiPlus, FiMapPin } from 'react-icons/fi';
import { useAddress } from '../hooks/useAddress.js';
import AddressCard from '../components/AddressCard.jsx';
import { toast } from 'react-toastify';

const AddressListPage = () => {
  const { addresses, isLoading, removeAddress, setDefault } = useAddress();
  const navigate = useNavigate();

  const handleEdit = (addr) => {
    navigate(`/addresses/${addr._id}/edit`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await removeAddress(id);
        toast.success('Address removed');
      } catch {
        toast.error('Failed to remove address');
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefault(id);
      toast.success('Default address updated');
    } catch {
      toast.error('Failed to update default address');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary">Saved Addresses</h1>
          <p className="text-xs text-text-muted">Manage your delivery locations</p>
        </div>
        <Link
          to="/addresses/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
        >
          <FiPlus className="w-4 h-4" /> Add Address
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-24 bg-surface rounded-2xl" />
          <div className="h-24 bg-surface rounded-2xl" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="p-12 rounded-3xl bg-surface border border-border-strong text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center text-xl mx-auto">
            <FiMapPin className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-text-primary">No Addresses Saved Yet</h2>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Save your home, office, or other locations for seamless 1-click delivery checkout.
          </p>
          <Link
            to="/addresses/new"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-bold"
          >
            <FiPlus className="w-4 h-4" /> Add Your First Address
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <AddressCard
              key={addr._id}
              address={addr}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressListPage;
