import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { FiArrowLeft, FiPlus, FiTrash2, FiEdit2, FiLayers, FiChevronRight } from 'react-icons/fi';
import { ownerService } from '../services/owner.service.js';
import { toast } from 'react-toastify';

const MenuManagePage = () => {
  const { restaurantId } = useParams();
  const [menus, setMenus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [menuName, setMenuName] = useState('');
  const [menuDescription, setMenuDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMenus = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await ownerService.getMenus(restaurantId);
      const list = res.data?.data?.menus || res.data?.data || [];
      setMenus(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load restaurant menus');
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const handleOpenAddModal = () => {
    setEditingMenu(null);
    setMenuName('');
    setMenuDescription('');
    setShowModal(true);
  };

  const handleOpenEditModal = (menu) => {
    setEditingMenu(menu);
    setMenuName(menu.name || '');
    setMenuDescription(menu.description || '');
    setShowModal(true);
  };

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    if (!menuName.trim()) {
      toast.warning('Please enter a menu name');
      return;
    }
    try {
      setIsSubmitting(true);
      if (editingMenu) {
        await ownerService.updateMenu(editingMenu._id, {
          name: menuName.trim(),
          description: menuDescription.trim(),
        });
        toast.success('Menu updated successfully!');
      } else {
        await ownerService.createMenu({
          restaurantId,
          restaurant: restaurantId,
          name: menuName.trim(),
          description: menuDescription.trim(),
        });
        toast.success('Menu created successfully!');
      }
      setShowModal(false);
      setEditingMenu(null);
      setMenuName('');
      setMenuDescription('');
      fetchMenus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save menu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMenu = async (menuId) => {
    if (window.confirm('Delete this menu along with its categories and dishes?')) {
      try {
        await ownerService.deleteMenu(menuId);
        toast.success('Menu deleted');
        fetchMenus();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete menu');
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
          onClick={handleOpenAddModal}
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
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold cursor-pointer"
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

              <div className="flex items-center gap-2">
                <Link
                  to={`/owner/restaurants/${restaurantId}/menus/${menu._id}/categories`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-elevated text-xs text-brand font-semibold hover:underline"
                >
                  Categories & Dishes <FiChevronRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => handleOpenEditModal(menu)}
                  className="p-2 text-text-muted hover:text-brand rounded-lg hover:bg-surface-elevated cursor-pointer"
                  title="Edit Menu"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
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

      {/* Add / Edit Menu Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-surface border border-border-strong shadow-2xl space-y-4">
            <h2 className="text-lg font-black text-text-primary">
              {editingMenu ? 'Edit Menu' : 'Add New Menu'}
            </h2>
            <form onSubmit={handleSaveMenu} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary">Menu Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Regular Menu, Lunch Specials, Desserts"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Available daily from 11am to 11pm"
                  value={menuDescription}
                  onChange={(e) => setMenuDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-elevated text-text-muted text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting
                    ? editingMenu
                      ? 'Saving...'
                      : 'Creating...'
                    : editingMenu
                      ? 'Save Changes'
                      : 'Create Menu'}
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
