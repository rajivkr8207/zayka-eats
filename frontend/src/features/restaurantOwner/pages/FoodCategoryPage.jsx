import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { FiArrowLeft, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { ownerService } from '../services/owner.service.js';
import FoodItemForm from '../components/FoodItemForm.jsx';
import { toast } from 'react-toastify';

const FoodCategoryPage = () => {
  const { restaurantId, menuId } = useParams();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Category Modal
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');

  // Add Item to Category
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await ownerService.getCategoriesByMenu(menuId);
      const list = res.data?.data?.categories || res.data?.data || [];
      setCategories(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, [menuId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    try {
      setIsSubmitting(true);
      await ownerService.createCategory({
        restaurant: restaurantId,
        menu: menuId,
        name: categoryName.trim(),
        description: categoryDesc.trim(),
      });
      toast.success('Food category created!');
      setCategoryName('');
      setCategoryDesc('');
      setShowAddCategory(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (window.confirm('Delete this category and all dishes inside it?')) {
      try {
        await ownerService.deleteCategory(catId);
        toast.success('Category deleted');
        fetchCategories();
      } catch {
        toast.error('Failed to delete category');
      }
    }
  };

  const handleSaveFoodItem = async (data) => {
    try {
      setIsSubmitting(true);
      if (editingItem) {
        await ownerService.updateFoodItem(activeCategoryId, editingItem._id, data);
        toast.success('Dish updated!');
      } else {
        await ownerService.addFoodItem(activeCategoryId, data);
        toast.success('Dish added to category!');
      }
      setShowItemForm(false);
      setEditingItem(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save dish');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFoodItem = async (categoryId, itemId) => {
    if (window.confirm('Remove this dish?')) {
      try {
        await ownerService.deleteFoodItem(categoryId, itemId);
        toast.success('Dish deleted');
        fetchCategories();
      } catch {
        toast.error('Failed to delete dish');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={`/owner/restaurants/${restaurantId}/menus`}
            className="p-2.5 rounded-xl bg-surface border border-border-subtle hover:border-brand text-text-muted hover:text-text-primary"
          >
            <FiArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-text-primary">Menu Categories & Dishes</h1>
            <p className="text-xs text-text-muted">Organize your food items into categories (e.g. Starters, Biryani)</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddCategory(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md shadow-orange-500/20 cursor-pointer"
        >
          <FiPlus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-32 bg-surface rounded-2xl" />
          <div className="h-32 bg-surface rounded-2xl" />
        </div>
      ) : categories.length === 0 ? (
        <div className="p-12 rounded-3xl bg-surface border border-border-strong text-center space-y-3">
          <h2 className="text-base font-bold text-text-primary">No Categories Created</h2>
          <p className="text-xs text-text-muted">Add your first category to start placing tasty dishes into it.</p>
          <button
            onClick={() => setShowAddCategory(true)}
            className="px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-bold"
          >
            Add Category
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => {
            const items = cat.items || cat.foodItems || [];
            return (
              <div
                key={cat._id}
                className="p-6 rounded-3xl bg-surface border border-border-subtle hover:border-border-strong transition-all space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <div>
                    <h3 className="text-base font-black text-text-primary">{cat.name}</h3>
                    {cat.description && (
                      <p className="text-xs text-text-muted">{cat.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveCategoryId(cat._id);
                        setEditingItem(null);
                        setShowItemForm(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-brand/10 text-brand hover:bg-brand hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <FiPlus className="w-3.5 h-3.5" /> Add Dish
                    </button>

                    <button
                      onClick={() => handleDeleteCategory(cat._id)}
                      className="p-2 text-text-muted hover:text-rose-500 rounded-lg hover:bg-surface-elevated cursor-pointer"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Food Items Grid in Category */}
                {items.length === 0 ? (
                  <p className="text-xs text-text-muted italic">No food items added in this category yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {items.map((item) => (
                      <div
                        key={item._id}
                        className="p-3.5 rounded-2xl bg-surface-elevated border border-border-subtle flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5 flex-1 pr-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-3 h-3 border rounded-sm flex items-center justify-center ${
                                item.isVeg ? 'border-emerald-500' : 'border-rose-500'
                              }`}
                            >
                              <span
                                className={`w-1 h-1 rounded-full ${
                                  item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                              />
                            </span>
                            <span className="text-xs font-bold text-text-primary">{item.name}</span>
                          </div>
                          <span className="text-xs font-black text-text-primary block">₹{item.price}</span>
                          {item.description && (
                            <p className="text-[11px] text-text-muted line-clamp-1">{item.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setActiveCategoryId(cat._id);
                              setEditingItem(item);
                              setShowItemForm(true);
                            }}
                            className="p-1.5 text-text-muted hover:text-brand rounded-lg hover:bg-surface"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFoodItem(cat._id, item._id)}
                            className="p-1.5 text-text-muted hover:text-rose-500 rounded-lg hover:bg-surface"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-surface border border-border-strong shadow-2xl space-y-4">
            <h2 className="text-lg font-black text-text-primary">Add Category</h2>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Biryani & Pulao"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Fragrant basmati rice preparations"
                  value={categoryDesc}
                  onChange={(e) => setCategoryDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCategory(false)}
                  className="px-4 py-2 rounded-xl bg-surface-elevated text-text-muted text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md"
                >
                  {isSubmitting ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Food Item Modal */}
      {showItemForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-surface border border-border-strong shadow-2xl space-y-4">
            <h2 className="text-lg font-black text-text-primary">
              {editingItem ? 'Edit Dish' : 'Add Dish to Category'}
            </h2>
            <FoodItemForm
              initialData={editingItem}
              onSubmit={handleSaveFoodItem}
              onCancel={() => {
                setShowItemForm(false);
                setEditingItem(null);
              }}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodCategoryPage;
