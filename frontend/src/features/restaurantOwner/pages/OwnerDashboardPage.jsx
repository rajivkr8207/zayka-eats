import { Link } from 'react-router';
import { FiPlus, FiShoppingBag, FiLayers, FiDollarSign, FiArrowRight } from 'react-icons/fi';
import { useOwnerRestaurant } from '../hooks/useOwnerRestaurant.js';
import RestaurantStatusBadge from '../components/RestaurantStatusBadge.jsx';

const OwnerDashboardPage = () => {
  const { restaurants, isLoading } = useOwnerRestaurant();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-orange-500/10 via-surface to-surface border border-border-strong shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary">Restaurant Partner Portal</h1>
          <p className="text-xs text-text-muted mt-1">
            Manage your kitchen locations, menu items, prices, and live customer orders.
          </p>
        </div>
        <Link
          to="/owner/restaurants/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all"
        >
          <FiPlus className="w-4 h-4" /> Add Restaurant
        </Link>
      </div>

      {/* Metrics Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bento-card p-6 space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Restaurants</span>
            <div className="p-2 rounded-xl bg-brand/10 text-brand">
              <FiLayers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-text-primary">{restaurants.length}</div>
          <p className="text-[11px] text-text-muted">Registered dining & kitchen outlets</p>
        </div>

        <Link
          to="/owner/orders"
          className="bento-card p-6 space-y-2 group hover:-translate-y-1 transition-transform"
        >
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider group-hover:text-brand">
              Live Orders
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <FiShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-text-primary">Active</div>
          <p className="text-[11px] text-emerald-500 flex items-center gap-1 font-semibold">
            View live kitchen orders <FiArrowRight className="w-3.5 h-3.5" />
          </p>
        </Link>

        <div className="bento-card p-6 space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Kitchen Status</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <FiDollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-text-primary">Online</div>
          <p className="text-[11px] text-text-muted">Ready to receive delivery orders</p>
        </div>
      </div>

      {/* My Outlets List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">Your Outlets</h2>
          <Link
            to="/owner/restaurants"
            className="text-xs text-brand font-bold hover:underline flex items-center gap-1"
          >
            Manage all <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-20 bg-surface rounded-2xl" />
            <div className="h-20 bg-surface rounded-2xl" />
          </div>
        ) : restaurants.length === 0 ? (
          <div className="p-12 rounded-3xl bg-surface border border-border-strong text-center space-y-3">
            <h3 className="text-base font-bold text-text-primary">No Restaurant Registered Yet</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              Get started by registering your restaurant or cloud kitchen with Zayka Eats.
            </p>
            <Link
              to="/owner/restaurants/new"
              className="inline-block px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-bold"
            >
              Register First Outlet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restaurants.map((res) => (
              <div
                key={res._id}
                className="p-5 rounded-2xl bg-surface border border-border-subtle hover:border-border-strong transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-text-primary">{res.name}</h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      {res.cuisineTypes?.join(', ') || 'Multi-cuisine'}
                    </p>
                  </div>
                  <RestaurantStatusBadge status={res.status} />
                </div>

                <div className="pt-3 border-t border-border-subtle flex flex-wrap gap-2 text-xs">
                  <Link
                    to={`/owner/restaurants/${res._id}/menus`}
                    className="px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-brand/10 hover:text-brand font-semibold transition-colors"
                  >
                    Menus & Categories
                  </Link>
                  <Link
                    to={`/owner/restaurants/${res._id}/edit`}
                    className="px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-elevated/80 font-semibold transition-colors"
                  >
                    Edit Details
                  </Link>
                  <Link
                    to="/owner/orders"
                    className="px-3 py-1.5 rounded-xl bg-brand/10 text-brand font-semibold hover:bg-brand hover:text-white transition-colors"
                  >
                    Orders
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboardPage;
