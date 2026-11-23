import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

const FoodItemForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || '',
      isVeg: initialData?.isVeg ?? true,
      isAvailable: initialData?.isAvailable ?? true,
      image: initialData?.image || '',
    },
  });

  useEffect(() => {
    reset({
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || '',
      isVeg: initialData?.isVeg ?? true,
      isAvailable: initialData?.isAvailable ?? true,
      image: initialData?.image || '',
    });
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-text-secondary">Dish Name *</label>
        <input
          type="text"
          placeholder="e.g. Butter Chicken"
          {...register('name', { required: 'Dish name is required' })}
          className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
        />
        {errors.name && <p className="text-[11px] text-rose-500">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">Price (₹) *</label>
          <input
            type="number"
            placeholder="250"
            {...register('price', { required: 'Price is required', min: 1 })}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
          />
          {errors.price && <p className="text-[11px] text-rose-500">{errors.price.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">Image URL</label>
          <input
            type="text"
            placeholder="https://images.unsplash.com/..."
            {...register('image')}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-text-secondary">Description</label>
        <textarea
          rows={2}
          placeholder="Tender chicken cooked in rich buttery tomato gravy..."
          {...register('description')}
          className="w-full px-4 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
        />
      </div>

      <div className="flex items-center gap-6 pt-1">
        <label className="flex items-center gap-2 text-xs text-text-primary font-medium cursor-pointer">
          <input
            type="checkbox"
            {...register('isVeg')}
            className="rounded border-border-subtle text-emerald-500 focus:ring-emerald-500"
          />
          Pure Vegetarian
        </label>

        <label className="flex items-center gap-2 text-xs text-text-primary font-medium cursor-pointer">
          <input
            type="checkbox"
            {...register('isAvailable')}
            className="rounded border-border-subtle text-brand focus:ring-brand"
          />
          Currently Available
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-surface-elevated text-text-muted hover:text-text-primary text-xs font-bold cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Dish' : 'Save Dish'}
        </button>
      </div>
    </form>
  );
};

export default FoodItemForm;
