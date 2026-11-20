import { useForm } from 'react-hook-form';

const CouponForm = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      code: initialData?.code || '',
      discountType: initialData?.discountType || 'percentage',
      discountValue: initialData?.discountValue || '',
      minOrderAmount: initialData?.minOrderAmount || 0,
      maxDiscountAmount: initialData?.maxDiscountAmount || '',
      usageLimit: initialData?.usageLimit || 100,
      isActive: initialData?.isActive ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-text-secondary">Coupon Code</label>
        <input
          type="text"
          placeholder="e.g. ZAYKA50"
          {...register('code', { required: 'Code is required' })}
          className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs uppercase font-black text-brand focus:outline-none focus:border-brand"
        />
        {errors.code && <p className="text-[11px] text-rose-500">{errors.code.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">Discount Type</label>
          <select
            {...register('discountType')}
            className="w-full px-3 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="flat">Flat Amount (₹)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">Discount Value</label>
          <input
            type="number"
            placeholder="50"
            {...register('discountValue', { required: 'Value is required' })}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
          />
          {errors.discountValue && (
            <p className="text-[11px] text-rose-500">{errors.discountValue.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">Min Order Amount (₹)</label>
          <input
            type="number"
            placeholder="199"
            {...register('minOrderAmount')}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">Max Discount (₹)</label>
          <input
            type="number"
            placeholder="100"
            {...register('maxDiscountAmount')}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="isActive"
          {...register('isActive')}
          className="rounded border-border-subtle text-brand focus:ring-brand"
        />
        <label htmlFor="isActive" className="text-xs font-medium text-text-primary cursor-pointer">
          Coupon is Active
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-surface-elevated text-text-muted text-xs font-bold"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Coupon'}
        </button>
      </div>
    </form>
  );
};

export default CouponForm;
