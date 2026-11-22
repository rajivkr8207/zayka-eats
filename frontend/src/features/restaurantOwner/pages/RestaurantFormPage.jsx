
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { FiArrowLeft, FiMapPin } from 'react-icons/fi';
import { ownerService } from '../services/owner.service.js';
import { fetchCurrentUser } from '../../auth/auth.slice.js';
import { toast } from 'react-toastify';

const DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday',
  'Friday', 'Saturday', 'Sunday',
];

const RestaurantFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEdit = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [coordinates, setCoordinates] = useState({
    latitude: '',
    longitude: '',
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      ownerName: '',
      email: '',
      phone: '',
      description: '',
      cuisineTypes: '',
      address: '',
      landmark: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      priceForTwo: 0,
      openingTime: '09:00',
      closingTime: '23:00',
      workingDays: DAYS,
      fssaiLicenseNumber: '',
      gstNumber: '',
      panNumber: '',
      coverImage: '',
      logo: '',
    },
  });

  // Load restaurant for editing
  useEffect(() => {
    if (!isEdit || !id) return;

    ownerService
      .getRestaurantById(id)
      .then((res) => {
        const data = res.data?.data?.restaurant || res.data?.data;
        if (!data) return;

        // Supports both new flat address and old nested address structure
        const oldAddress = typeof data.address === 'object'
          ? data.address
          : {};

        reset({
          name: data.name || '',
          ownerName: data.ownerName || '',
          email: data.email || '',
          phone: data.phone || '',
          description: data.description || '',
          cuisineTypes: data.cuisineTypes?.join(', ') || '',
          address:
            typeof data.address === 'string'
              ? data.address
              : oldAddress.addressLine1 || '',
          landmark: data.landmark || '',
          city: data.city || oldAddress.city || '',
          state: data.state || oldAddress.state || '',
          country: data.country || 'India',
          pincode: data.pincode || oldAddress.pinCode || '',
          priceForTwo: data.priceForTwo || 0,
          openingTime:
            data.openingTime || data.openingHours?.from || '09:00',
          closingTime:
            data.closingTime || data.openingHours?.to || '23:00',
          workingDays: data.workingDays || DAYS,
          fssaiLicenseNumber: data.fssaiLicenseNumber || '',
          gstNumber: data.gstNumber || '',
          panNumber: data.panNumber || '',
          coverImage: data.coverImage || '',
          logo: data.logo || '',
        });

        if (data.location?.coordinates?.length === 2) {
          setCoordinates({
            longitude: data.location.coordinates[0],
            latitude: data.location.coordinates[1],
          });
        }
      })
      .catch(() => {
        toast.error('Failed to load restaurant details');
        navigate('/owner/restaurants');
      })
      .finally(() => setIsLoading(false));
  }, [id, isEdit, reset, navigate]);

  // Get current browser location and auto-fill address
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setCoordinates({ latitude, longitude });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`,
          );

          if (!response.ok) {
            throw new Error('Address lookup failed');
          }

          const result = await response.json();
          const addr = result.address || {};

          const street = [
            addr.house_number,
            addr.road,
            addr.neighbourhood,
            addr.suburb,
          ]
            .filter(Boolean)
            .join(', ');

          setValue('address', street || result.display_name || '', {
            shouldValidate: true,
          });

          setValue(
            'city',
            addr.city || addr.town || addr.village || addr.county || '',
            { shouldValidate: true },
          );

          setValue('state', addr.state || '', { shouldValidate: true });
          setValue('country', addr.country || 'India', { shouldValidate: true });
          setValue('pincode', addr.postcode || '', { shouldValidate: true });

          toast.success('Location and address fetched successfully!');
        } catch {
          toast.warning(
            'Coordinates captured, but address lookup failed. Fill address manually.',
          );
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);

        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location permission denied');
        } else if (error.code === error.TIMEOUT) {
          toast.error('Location request timed out');
        } else {
          toast.error('Unable to get your location');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  const onSubmit = async (formData) => {
    try {
      setIsSubmitting(true);

      const payload = {
        name: formData.name.trim(),
        ownerName: formData.ownerName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        description: formData.description,
        cuisineTypes: formData.cuisineTypes
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),

        // Matches the Mongoose schema (address is a String)
        address: formData.address.trim(),
        landmark: formData.landmark.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        pincode: formData.pincode.trim(),

        location: {
          type: 'Point',
          coordinates:
            coordinates.latitude !== '' && coordinates.longitude !== ''
              ? [Number(coordinates.longitude), Number(coordinates.latitude)]
              : [0, 0],
        },

        priceForTwo: Number(formData.priceForTwo) || 0,
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        workingDays: formData.workingDays || [],

        fssaiLicenseNumber: formData.fssaiLicenseNumber.trim(),
        gstNumber: formData.gstNumber.trim(),
        panNumber: formData.panNumber.trim(),

        coverImage: formData.coverImage.trim() || null,
        logo: formData.logo.trim() || null,
      };

      if (isEdit) {
        await ownerService.updateRestaurant(id, payload);
        toast.success('Restaurant updated successfully!');
      } else {
        await ownerService.createRestaurant(payload);
        toast.success('Restaurant registered! Submitted for admin approval.');
        dispatch(fetchCurrentUser());
      }

      navigate('/owner/restaurants');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to save restaurant',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand';

  const labelClass =
    'text-xs font-semibold text-text-secondary';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/owner/restaurants"
          className="p-2.5 rounded-xl bg-surface border border-border-subtle hover:border-brand text-text-muted hover:text-text-primary"
        >
          <FiArrowLeft className="w-4 h-4" />
        </Link>

        <div>
          <h1 className="text-xl font-black text-text-primary">
            {isEdit ? 'Edit Restaurant Profile' : 'Register New Restaurant'}
          </h1>
          <p className="text-xs text-text-muted">
            Fill in your restaurant, contact, address and business details
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border-strong shadow-xl">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-surface-elevated rounded-xl" />
            <div className="h-10 bg-surface-elevated rounded-xl" />
            <div className="h-10 bg-surface-elevated rounded-xl" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Basic Information */}
            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                Basic Information
              </h2>

              <div className="space-y-1">
                <label className={labelClass}>Restaurant Name *</label>
                <input
                  {...register('name', {
                    required: 'Restaurant name is required',
                    minLength: { value: 2, message: 'Minimum 2 characters' },
                    maxLength: { value: 120, message: 'Maximum 120 characters' },
                  })}
                  placeholder="e.g. Dawat-e-Khaas"
                  className={inputClass}
                />
                {errors.name && (
                  <p className="text-[11px] text-rose-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Owner Name</label>
                <input
                  {...register('ownerName')}
                  placeholder="Restaurant owner name"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Cuisine Types *</label>
                <input
                  {...register('cuisineTypes', {
                    required: 'Please enter at least one cuisine',
                  })}
                  placeholder="Biryani, North Indian, Mughlai"
                  className={inputClass}
                />
                {errors.cuisineTypes && (
                  <p className="text-[11px] text-rose-500">
                    {errors.cuisineTypes.message}
                  </p>
                )}
                <p className="text-[10px] text-text-muted">
                  Separate multiple cuisines with commas
                </p>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Description</label>
                <textarea
                  rows={3}
                  {...register('description')}
                  placeholder="Tell customers about your restaurant..."
                  className={inputClass}
                />
              </div>
            </section>

            {/* Contact */}
            <section className="space-y-4 border-t border-border-subtle pt-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                Contact Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={labelClass}>Email *</label>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Enter a valid email',
                      },
                    })}
                    placeholder="restaurant@example.com"
                    className={inputClass}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-rose-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Phone Number *</label>
                  <input
                    type="tel"
                    {...register('phone', {
                      required: 'Phone number is required',
                    })}
                    placeholder="9876543210"
                    className={inputClass}
                  />
                  {errors.phone && (
                    <p className="text-[11px] text-rose-500">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Address */}
            <section className="space-y-4 border-t border-border-subtle pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                  Restaurant Address
                </h2>

                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold disabled:opacity-50"
                >
                  <FiMapPin />
                  {isLocating ? 'Fetching Location...' : 'Use My Current Location'}
                </button>
              </div>

              <p className="text-[11px] text-text-muted">
                Allow location permission to automatically fetch your address.
              </p>

              {coordinates.latitude !== '' && (
                <div className="p-3 rounded-xl bg-surface-elevated text-[11px] text-text-secondary">
                  <p>Latitude: {coordinates.latitude}</p>
                  <p>Longitude: {coordinates.longitude}</p>
                </div>
              )}

              <div className="space-y-1">
                <label className={labelClass}>Street / Full Address *</label>
                <textarea
                  rows={2}
                  {...register('address', { required: 'Address is required' })}
                  placeholder="House number, street, area"
                  className={inputClass}
                />
                {errors.address && (
                  <p className="text-[11px] text-rose-500">{errors.address.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Landmark</label>
                <input
                  {...register('landmark')}
                  placeholder="Near market, school, hospital etc."
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={labelClass}>City *</label>
                  <input
                    {...register('city', { required: 'City is required' })}
                    placeholder="City"
                    className={inputClass}
                  />
                  {errors.city && (
                    <p className="text-[11px] text-rose-500">{errors.city.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>State *</label>
                  <input
                    {...register('state', { required: 'State is required' })}
                    placeholder="State"
                    className={inputClass}
                  />
                  {errors.state && (
                    <p className="text-[11px] text-rose-500">{errors.state.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Country *</label>
                  <input
                    {...register('country', { required: 'Country is required' })}
                    placeholder="Country"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>PIN Code *</label>
                  <input
                    {...register('pincode', { required: 'PIN code is required' })}
                    placeholder="Postal PIN code"
                    className={inputClass}
                  />
                  {errors.pincode && (
                    <p className="text-[11px] text-rose-500">{errors.pincode.message}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Business */}
            <section className="space-y-4 border-t border-border-subtle pt-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                Business Details
              </h2>

              <div className="space-y-1">
                <label className={labelClass}>Price for Two (₹)</label>
                <input
                  type="number"
                  min="0"
                  {...register('priceForTwo', { min: 0 })}
                  placeholder="500"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={labelClass}>Opening Time</label>
                  <input
                    type="time"
                    {...register('openingTime')}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Closing Time</label>
                  <input
                    type="time"
                    {...register('closingTime')}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Working Days</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DAYS.map((day) => (
                    <label
                      key={day}
                      className="flex items-center gap-2 p-2 rounded-lg bg-surface-elevated text-xs text-text-primary"
                    >
                      <input
                        type="checkbox"
                        value={day}
                        {...register('workingDays')}
                        className="accent-brand"
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* Legal Details */}
            <section className="space-y-4 border-t border-border-subtle pt-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                Legal & Tax Details
              </h2>

              <div className="space-y-1">
                <label className={labelClass}>FSSAI License Number</label>
                <input
                  {...register('fssaiLicenseNumber')}
                  placeholder="FSSAI license number"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>GST Number</label>
                <input
                  {...register('gstNumber')}
                  placeholder="GSTIN"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>PAN Number</label>
                <input
                  {...register('panNumber')}
                  placeholder="PAN"
                  className={inputClass}
                />
              </div>
            </section>

            {/* Images */}
            <section className="space-y-4 border-t border-border-subtle pt-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                Restaurant Images
              </h2>

              <div className="space-y-1">
                <label className={labelClass}>Cover Image URL</label>
                <input
                  {...register('coverImage')}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Logo URL</label>
                <input
                  {...register('logo')}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>
            </section>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting
                ? 'Saving Restaurant...'
                : isEdit
                  ? 'Save Changes'
                  : 'Submit Restaurant for Approval'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RestaurantFormPage;
