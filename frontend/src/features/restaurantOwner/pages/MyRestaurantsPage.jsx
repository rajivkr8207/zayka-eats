import { Link } from 'react-router';
import { FiPlus, FiEdit2, FiTrash2, FiLayers } from 'react-icons/fi';
import { useOwnerRestaurant } from '../hooks/useOwnerRestaurant.js';
import RestaurantStatusBadge from '../components/RestaurantStatusBadge.jsx';
import { ownerService } from '../services/owner.service.js';
import { toast } from 'react-toastify';

const MyRestaurantsPage = () => {
  const { restaurants, isLoading, refetch } = useOwnerRestaurant();

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this restaurant profile?')) {
      try {
        await ownerService.deleteRestaurant(id);
        toast.success('Restaurant deleted successfully');
        refetch();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete restaurant');
      }
    }
  };

  const handleToggleStatus = async (id, currentIsOpen) => {
    try {
      await ownerService.toggleRestaurantStatus(id, { isOpen: !currentIsOpen });
      toast.success(`Kitchen status updated to ${!currentIsOpen ? 'OPEN' : 'CLOSED'}`);
      refetch();
    } catch {
      toast.error('Failed to toggle status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary">My Restaurants</h1>
          <p className="text-xs text-text-muted">Manage your locations, menus, and opening hours</p>
        </div>
        <Link
          to="/owner/restaurants/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
        >
          <FiPlus className="w-4 h-4" /> Add Outlet
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-28 bg-surface rounded-2xl" />
          <div className="h-28 bg-surface rounded-2xl" />
        </div>
      ) : restaurants.length === 0 ? (
        <div className="p-12 rounded-3xl bg-surface border border-border-strong text-center space-y-3">
          <h2 className="text-base font-bold text-text-primary">No Restaurants Listed</h2>
          <p className="text-xs text-text-muted">Register an outlet to start serving hungry customers</p>
          <Link
            to="/owner/restaurants/new"
            className="inline-block px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-bold"
          >
            Create Restaurant
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {restaurants.map((res) => (
            <div
              key={res._id}
              className="p-6 rounded-3xl bg-surface border border-border-subtle hover:border-border-strong transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-text-primary">{res.name}</h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    {res.city || res.address?.city || res.address || 'City not set'} • {res.cuisineTypes?.join(', ')}
                  </p>
                </div>
                <RestaurantStatusBadge status={res.approvalStatus || res.status} />
              </div>

              {/* Toggle Open/Closed */}
              <div className="p-3 rounded-2xl bg-surface-elevated flex items-center justify-between text-xs">
                <span className="font-medium text-text-secondary">
                  Current Status: <strong className={res.isOpen ? 'text-emerald-500' : 'text-rose-500'}>
                    {res.isOpen ? 'Accepting Orders' : 'Closed'}
                  </strong>
                </span>
                <button
                  onClick={() => handleToggleStatus(res._id, res.isOpen)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    res.isOpen
                      ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white'
                      : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                  }`}
                >
                  {res.isOpen ? 'Mark Closed' : 'Open Now'}
                </button>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
                <Link
                  to={`/owner/restaurants/${res._id}/menus`}
                  className="inline-flex items-center gap-1.5 text-xs text-brand hover:underline font-bold"
                >
                  <FiLayers className="w-3.5 h-3.5" /> Manage Menus
                </Link>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/owner/restaurants/${res._id}/edit`}
                    className="p-2 rounded-xl text-text-muted hover:text-brand hover:bg-surface-elevated"
                    title="Edit Details"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(res._id)}
                    className="p-2 rounded-xl text-text-muted hover:text-rose-500 hover:bg-surface-elevated cursor-pointer"
                    title="Delete Restaurant"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRestaurantsPage;
