import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { FiArrowLeft } from 'react-icons/fi';
import { ownerService } from '../services/owner.service.js';
import { toast } from 'react-toastify';

const RestaurantFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      cuisineTypes: '',
      addressLine1: '',
      city: '',
      state: '',
      pinCode: '',
      contactNumber: '',
      openingHoursFrom: '10:00',
      openingHoursTo: '23:00',
      coverImage: '',
      logo: '',
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      ownerService
        .getRestaurantById(id)
        .then((res) => {
          const data = res.data?.data?.restaurant || res.data?.data;
          if (data) {
            reset({
              name: data.name || '',
              description: data.description || '',
              cuisineTypes: data.cuisineTypes?.join(', ') || '',
              addressLine1: data.address?.addressLine1 || '',
              city: data.address?.city || '',
              state: data.address?.state || '',
              pinCode: data.address?.pinCode || '',
              contactNumber: data.contactNumber || '',
              openingHoursFrom: data.openingHours?.from || '10:00',
              openingHoursTo: data.openingHours?.to || '23:00',
              coverImage: data.coverImage || '',
              logo: data.logo || '',
            });
          }
        })
        .catch(() => {
          toast.error('Failed to load restaurant details');
          navigate('/owner/restaurants');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, isEdit, reset, navigate]);

  const onSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      const payload = {
        name: formData.name,
        description: formData.description,
        cuisineTypes: formData.cuisineTypes
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
        address: {
          addressLine1: formData.addressLine1,
          city: formData.city,
          state: formData.state,
          pinCode: formData.pinCode,
        },
        contactNumber: formData.contactNumber,
        openingHours: {
          from: formData.openingHoursFrom,
          to: formData.openingHoursTo,
        },
        coverImage: formData.coverImage,
        logo: formData.logo,
      };

      if (isEdit) {
        await ownerService.updateRestaurant(id, payload);
        toast.success('Restaurant updated successfully!');
      } else {
        await ownerService.createRestaurant(payload);
        toast.success('Restaurant registered! Submitted for admin approval.');
      }
      navigate('/owner/restaurants');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save restaurant');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
          <p className="text-xs text-text-muted">Fill in your kitchen and brand details</p>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-surface border border-border-strong shadow-xl">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-surface-elevated rounded-xl" />
            <div className="h-10 bg-surface-elevated rounded-xl" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Restaurant Name</label>
              <input
                type="text"
                placeholder="e.g. Dawat-e-Khaas"
                {...register('name', { required: 'Name is required' })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
              />
              {errors.name && <p className="text-[11px] text-rose-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Cuisine Types (Comma-separated)</label>
              <input
                type="text"
                placeholder="Biryani, North Indian, Mughlai"
                {...register('cuisineTypes', { required: 'Cuisines are required' })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
              />
              {errors.cuisineTypes && (
                <p className="text-[11px] text-rose-500">{errors.cuisineTypes.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">About / Description</label>
              <textarea
                rows={2}
                placeholder="Authentic dum biryani and smoky kebabs cooked with traditional dum style..."
                {...register('description')}
                className="w-full px-4 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary">Contact Number</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  {...register('contactNumber')}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary">Opens At</label>
                  <input
                    type="time"
                    {...register('openingHoursFrom')}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary">Closes At</label>
                  <input
                    type="time"
                    {...register('openingHoursTo')}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
                  />
                </div>
              </div>
            </div>

            {/* Address fields */}
            <div className="pt-2 space-y-3 border-t border-border-subtle">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Kitchen Address
              </h3>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary">Street / Area</label>
                <input
                  type="text"
                  placeholder="Shop 4, Market Complex"
                  {...register('addressLine1', { required: 'Street is required' })}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  {...register('city', { required: 'City is required' })}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
                />
                <input
                  type="text"
                  placeholder="State"
                  {...register('state', { required: 'State is required' })}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
                />
                <input
                  type="text"
                  placeholder="PIN Code"
                  {...register('pinCode', { required: 'PIN is required' })}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
                />
              </div>
            </div>

            {/* Image URLs */}
            <div className="pt-2 space-y-3 border-t border-border-subtle">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary">Cover Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  {...register('coverImage')}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary">Logo URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  {...register('logo')}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md hover:shadow-orange-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Saving Restaurant...' : isEdit ? 'Save Changes' : 'Submit Restaurant for Approval'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RestaurantFormPage;
