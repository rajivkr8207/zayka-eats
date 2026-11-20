import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { FiArrowLeft, FiPlus, FiTrash2, FiLayers, FiChevronRight } from 'react-icons/fi';
import { ownerService } from '../services/owner.service.js';
import { toast } from 'react-toastify';

const MenuManagePage = () => {
  const { restaurantId } = useParams();
  const [menus, setMenus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuDescription, setNewMenuDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMenus = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await ownerService.getMenus(restaurantId);
      const list = res.data?.data?.menus || res.data?.data || [];
      setMenus(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Failed to load restaurant menus');
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const handleCreateMenu = async (e) => {
    e.preventDefault();
    if (!newMenuName.trim()) return;
    try {
      setIsSubmitting(true);
      await ownerService.createMenu({
        restaurant: restaurantId,
        name: newMenuName.trim(),
        description: newMenuDescription.trim(),
      });
      toast.success('Menu created!');
      setNewMenuName('');
      setNewMenuDescription('');
      setShowAddModal(false);
      fetchMenus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create menu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMenu = async (menuId) => {
    if (window.confirm('Delete this menu along with its categories?')) {
      try {
        await ownerService.deleteMenu(menuId);
        toast.success('Menu deleted');
        fetchMenus();
      } catch {
        toast.error('Failed to delete menu');
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/owner/restaurants"
            className="p-2.5 rounded-xl bg-surface border border-border-subtle hover:border-brand text-text-muted hover:text-text-primary"
          >
            <FiArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-text-primary">Manage Restaurant Menus</h1>
            <p className="text-xs text-text-muted">Create meal menus like Lunch, Dinner, All-Day Menu</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
        >
          <FiPlus className="w-4 h-4" /> Create Menu
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-20 bg-surface rounded-2xl" />
          <div className="h-20 bg-surface rounded-2xl" />
        </div>
      ) : menus.length === 0 ? (
        <div className="p-12 rounded-3xl bg-surface border border-border-strong text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto">
            <FiLayers className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-text-primary">No Menus Yet</h2>
          <p className="text-xs text-text-muted">
            Create a menu to start categorizing your dishes (e.g. &quot;Main Menu&quot; or &quot;Beverages&quot;).
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-bold"
          >
            Create First Menu
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {menus.map((menu) => (
            <div
              key={menu._id}
              className="p-5 rounded-2xl bg-surface border border-border-subtle hover:border-border-strong flex items-center justify-between transition-all group"
            >
              <Link
                to={`/owner/restaurants/${restaurantId}/menus/${menu._id}/categories`}
                className="flex-1 flex items-center gap-3 cursor-pointer"
              >
                <div className="p-3 rounded-xl bg-surface-elevated text-brand group-hover:scale-105 transition-transform">
                  <FiLayers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary group-hover:text-brand transition-colors">
                    {menu.name}
                  </h3>
                  {menu.description && (
                    <p className="text-xs text-text-muted mt-0.5">{menu.description}</p>
                  )}
                </div>
              </Link>

              <div className="flex items-center gap-3">
                <Link
                  to={`/owner/restaurants/${restaurantId}/menus/${menu._id}/categories`}
                  className="inline-flex items-center gap-1 text-xs text-brand font-semibold hover:underline"
                >
                  Categories <FiChevronRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => handleDeleteMenu(menu._id)}
                  className="p-2 text-text-muted hover:text-rose-500 rounded-lg hover:bg-surface-elevated cursor-pointer"
                  title="Delete Menu"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Menu Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-surface border border-border-strong shadow-2xl space-y-4">
            <h2 className="text-lg font-black text-text-primary">Add New Menu</h2>
            <form onSubmit={handleCreateMenu} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary">Menu Name</label>
                <input
                  type="text"
                  placeholder="e.g. Regular Menu, Lunch Specials"
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Available daily from 11am to 11pm"
                  value={newMenuDescription}
                  onChange={(e) => setNewMenuDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-elevated text-text-muted text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagePage;
