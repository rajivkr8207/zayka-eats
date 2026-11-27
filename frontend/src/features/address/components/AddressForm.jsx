import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { FiMapPin, FiNavigation, FiUser, FiPhone } from 'react-icons/fi';
import { addressService } from '../services/address.service.js';
import { toast } from 'react-toastify';

const AddressForm = ({ initialData, onSubmit, isLoading }) => {
  const [isLocating, setIsLocating] = useState(false);

  // Pre-fill name/phone from logged-in user
  const authUser = useSelector((state) => state.auth?.user);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: initialData?.fullName || authUser?.fullName || '',
      phone: initialData?.phone || authUser?.mobile || '',
      label: initialData?.label || initialData?.addressType || 'HOME',
      addressLine1: initialData?.addressLine1 || '',
      landmark: initialData?.landmark || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      pinCode: initialData?.pincode || initialData?.pinCode || '',
      isDefault: initialData?.isDefault || false,
    },
  });

  // ── GPS Auto-fill
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await addressService.reverseGeocode(latitude, longitude);
          const data = res.data?.data;
          if (data) {
            setValue('addressLine1', data.addressLine1 || data.formattedAddress || '');
            setValue('city', data.city || '');
            setValue('state', data.state || '');
            setValue('pinCode', data.pinCode || data.pincode || data.postcode || '');
            toast.success('Address auto-filled from your location! 📍');
          }
        } catch {
          toast.error('Could not determine exact address from GPS');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        toast.error('Location permission was denied');
        setIsLocating(false);
      },
      { timeout: 8000 },
    );
  };

  // ── Normalise and submit — map frontend keys → backend keys
  const handleFormSubmit = (data) => {
    const payload = {
      fullName: data.fullName?.trim(),
      phone: data.phone?.trim(),
      addressType: data.label?.toLowerCase() === 'work' ? 'office' : (data.label?.toLowerCase() || 'home'),
      addressLine1: data.addressLine1?.trim(),
      landmark: data.landmark?.trim() || '',
      city: data.city?.trim(),
      state: data.state?.trim(),
      pincode: data.pinCode?.trim(),   // backend field name
      pinCode: data.pinCode?.trim(),   // alias for safety
      isDefault: Boolean(data.isDefault),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* GPS Auto Fill Button */}
      <button
        type="button"
        onClick={handleUseGPS}
        disabled={isLocating}
        className="w-full py-2.5 px-4 rounded-xl bg-surface-elevated border border-brand/30 hover:border-brand text-brand text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
      >
        <FiNavigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
        {isLocating ? 'Detecting Location...' : 'Use Current GPS Location'}
      </button>

      {/* Recipient Full Name */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-text-secondary">
          Recipient Full Name <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <FiUser className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="e.g. Rahul Sharma"
            {...register('fullName', { required: 'Recipient full name is required' })}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
          />
        </div>
        {errors.fullName && <p className="text-[11px] text-rose-500">{errors.fullName.message}</p>}
      </div>

      {/* Phone Number */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-text-secondary">
          Contact Phone <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <FiPhone className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
          <input
            type="tel"
            placeholder="10-digit mobile number"
            maxLength={10}
            {...register('phone', {
              required: 'Phone number is required',
              pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit mobile number' },
            })}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
          />
        </div>
        {errors.phone && <p className="text-[11px] text-rose-500">{errors.phone.message}</p>}
      </div>

      {/* Address Type */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-text-secondary">Address Type</label>
        <select
          {...register('label')}
          className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
        >
          <option value="HOME">🏠 Home</option>
          <option value="WORK">💼 Work / Office</option>
          <option value="OTHER">📍 Other</option>
        </select>
      </div>

      {/* Address Line 1 */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-text-secondary">
          Flat / House No. / Street <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <FiMapPin className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="e.g. Flat 402, Royal Palms, MG Road"
            {...register('addressLine1', { required: 'Street address is required' })}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
          />
        </div>
        {errors.addressLine1 && <p className="text-[11px] text-rose-500">{errors.addressLine1.message}</p>}
      </div>

      {/* Landmark */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-text-secondary">Landmark (Optional)</label>
        <input
          type="text"
          placeholder="e.g. Near City Mall"
          {...register('landmark')}
          className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
        />
      </div>

      {/* City / State / PIN */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">City <span className="text-rose-500">*</span></label>
          <input
            type="text"
            placeholder="e.g. Mumbai"
            {...register('city', { required: 'City is required' })}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
          />
          {errors.city && <p className="text-[11px] text-rose-500">{errors.city.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">State <span className="text-rose-500">*</span></label>
          <input
            type="text"
            placeholder="e.g. Maharashtra"
            {...register('state', { required: 'State is required' })}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
          />
          {errors.state && <p className="text-[11px] text-rose-500">{errors.state.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">PIN Code <span className="text-rose-500">*</span></label>
          <input
            type="text"
            placeholder="400001"
            maxLength={6}
            {...register('pinCode', {
              required: 'PIN code is required',
              pattern: { value: /^\d{6}$/, message: 'Must be 6 digits' },
            })}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
          />
          {errors.pinCode && <p className="text-[11px] text-rose-500">{errors.pinCode.message}</p>}
        </div>
      </div>

      {/* Default Checkbox */}
      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="isDefault"
          {...register('isDefault')}
          className="rounded border-border-subtle text-brand focus:ring-brand"
        />
        <label htmlFor="isDefault" className="text-xs text-text-secondary cursor-pointer">
          Make this my default delivery address
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md hover:shadow-orange-500/25 transition-all disabled:opacity-50 cursor-pointer"
      >
        {isLoading ? 'Saving Address...' : 'Save Address'}
      </button>
    </form>
  );
};

export default AddressForm;
