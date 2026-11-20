import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../features/auth/auth.slice.js';
import ThemeToggle from './ThemeToggle.jsx';
import NotificationDropdown from './NotificationDropdown.jsx';
import {
  FiShoppingBag,
  FiSearch,
  FiMapPin,
  FiLogOut,
  FiChevronDown,
} from 'react-icons/fi';
import { ROLES } from '../../constants/roles.js';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const totalItems = useSelector((state) => state.cart.totalItems);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setIsProfileOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Location */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-brand text-white flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition-transform">
              Z
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-text-primary leading-none">
                Zayka<span className="text-brand">Eats</span>
              </span>
              <span className="text-[10px] text-text-muted font-medium tracking-wide">
                FRESH & FAST
              </span>
            </div>
          </Link>

          {/* Location Picker Pill (Desktop) */}
          <Link
            to="/explore"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border-subtle text-xs text-text-secondary hover:border-border-strong cursor-pointer transition-colors"
          >
            <FiMapPin className="text-brand w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-medium truncate max-w-[150px]">Near You 📍</span>
            <FiChevronDown className="w-3 h-3 text-text-muted" />
          </Link>
        </div>

        {/* Center: Search Bar (Desktop) */}
        <form
          onSubmit={handleSearch}
          className="hidden lg:flex flex-1 max-w-md items-center relative"
        >
          <FiSearch className="absolute left-3.5 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search restaurants, cuisines, or dishes..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
          />
        </form>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Switcher */}
          <ThemeToggle />

          {/* Real-time Notifications */}
          <NotificationDropdown />

          {/* Cart Button */}
          <Link
            to="/cart"
            className="relative flex items-center gap-2 py-2 px-3.5 rounded-xl bg-surface border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-strong transition-all group"
            title="Shopping Cart"
          >
            <FiShoppingBag className="w-4 h-4 text-text-secondary group-hover:text-brand transition-colors" />
            <span className="hidden sm:inline text-xs font-semibold">Cart</span>
            {totalItems > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-brand text-white text-[10px] font-bold min-w-[20px] text-center">
                {totalItems}
              </span>
            )}
          </Link>

          {/* User Account / Login */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-surface border border-border-subtle hover:border-border-strong transition-all cursor-pointer"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold text-xs">
                    {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-semibold text-text-primary max-w-[100px] truncate">
                  {user?.fullName || user?.username || 'Account'}
                </span>
                <FiChevronDown className="w-3 h-3 text-text-muted hidden sm:inline" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface border border-border-strong shadow-2xl z-50 p-1.5 divide-y divide-border-subtle">
                  <div className="px-3 py-2">
                    <p className="text-xs font-bold text-text-primary truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-[11px] text-text-muted truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-brand/10 text-brand text-[10px] font-semibold uppercase">
                      {user?.role?.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="py-1">
                    {/* Common to all */}
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-3 py-1.5 rounded-xl text-xs text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                    >
                      My Profile
                    </Link>

                    {/* Customer-specific links */}
                    {(!user?.role || user?.role === ROLES.CUSTOMER) && (
                      <>
                        <Link
                          to="/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-3 py-1.5 rounded-xl text-xs text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                        >
                          Customer Dashboard
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-3 py-1.5 rounded-xl text-xs text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                        >
                          My Orders
                        </Link>
                        <Link
                          to="/addresses"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-3 py-1.5 rounded-xl text-xs text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                        >
                          Saved Addresses
                        </Link>
                      </>
                    )}

                    {/* Restaurant Owner Links */}
                    {user?.role === ROLES.RESTAURANT_OWNER && (
                      <>
                        <Link
                          to="/owner/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-3 py-1.5 rounded-xl text-xs text-brand font-bold hover:bg-brand/10 transition-colors"
                        >
                          Owner Dashboard
                        </Link>
                        <Link
                          to="/owner/restaurants"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-3 py-1.5 rounded-xl text-xs text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                        >
                          My Restaurants
                        </Link>
                        <Link
                          to="/owner/orders"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-3 py-1.5 rounded-xl text-xs text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                        >
                          Live Orders
                        </Link>
                      </>
                    )}

                    {/* Delivery Partner Links */}
                    {user?.role === ROLES.DELIVERY_PARTNER && (
                      <>
                        <Link
                          to="/rider/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-3 py-1.5 rounded-xl text-xs text-brand font-bold hover:bg-brand/10 transition-colors"
                        >
                          Rider Dashboard
                        </Link>
                        <Link
                          to="/rider/history"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-3 py-1.5 rounded-xl text-xs text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                        >
                          Delivery History
                        </Link>
                      </>
                    )}

                    {/* Admin Links */}
                    {user?.role === ROLES.ADMIN && (
                      <>
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-3 py-1.5 rounded-xl text-xs text-brand font-bold hover:bg-brand/10 transition-colors"
                        >
                          Admin Console
                        </Link>
                        <Link
                          to="/admin/restaurants"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-3 py-1.5 rounded-xl text-xs text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                        >
                          Restaurant Approvals
                        </Link>
                        <Link
                          to="/admin/riders"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-3 py-1.5 rounded-xl text-xs text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                        >
                          Rider Approvals
                        </Link>
                        <Link
                          to="/admin/coupons"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-3 py-1.5 rounded-xl text-xs text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                        >
                          Coupons
                        </Link>
                        <Link
                          to="/admin/logs"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-3 py-1.5 rounded-xl text-xs text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                        >
                          Activity Logs
                        </Link>
                      </>
                    )}
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-500 hover:bg-rose-500/10 transition-colors font-medium cursor-pointer"
                    >
                      <FiLogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="py-1.5 px-3.5 rounded-xl border border-border-subtle text-xs font-semibold text-text-primary hover:bg-surface-elevated transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline py-1.5 px-3.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-sm transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
