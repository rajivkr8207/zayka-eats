import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { FiTruck, FiCheckCircle } from 'react-icons/fi';
import { deliveryService } from '../services/delivery.service.js';
import { toast } from 'react-toastify';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      vehicleType: 'motorcycle',
      vehicleNumber: '',
      drivingLicenseNumber: '',
      aadhaarNumber: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await deliveryService.onboard(data);
      setIsSubmitted(true);
      toast.success('KYC documents submitted for review!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Onboarding submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-surface border border-border-strong shadow-xl text-center space-y-4">
        <FiCheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
        <h2 className="text-xl font-black text-text-primary">Verification In Progress</h2>
        <p className="text-xs text-text-secondary leading-relaxed">
          Your delivery hero KYC documents have been received by the Zayka Eats compliance team.
          You will be notified once your profile is verified and approved!
        </p>
        <button
          onClick={() => navigate('/rider/dashboard')}
          className="px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-bold"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto">
          <FiTruck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-text-primary">Delivery Partner Onboarding</h1>
        <p className="text-xs text-text-muted">
          Complete KYC verification to begin delivering food and earning daily
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-surface border border-border-strong shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Vehicle Type</label>
            <select
              {...register('vehicleType')}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
            >
              <option value="motorcycle">Motorcycle / Bike</option>
              <option value="scooter">Electric / Petrol Scooter</option>
              <option value="bicycle">Bicycle</option>
              <option value="car">Four Wheeler</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Vehicle Plate Number</label>
            <input
              type="text"
              placeholder="e.g. MH 02 AB 1234"
              {...register('vehicleNumber', { required: 'Vehicle number is required' })}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
            />
            {errors.vehicleNumber && (
              <p className="text-[11px] text-rose-500">{errors.vehicleNumber.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Driving License Number</label>
            <input
              type="text"
              placeholder="e.g. MH0220190012345"
              {...register('drivingLicenseNumber', { required: 'Driving license is required' })}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
            />
            {errors.drivingLicenseNumber && (
              <p className="text-[11px] text-rose-500">{errors.drivingLicenseNumber.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Aadhaar Card Number (12 Digits)</label>
            <input
              type="text"
              placeholder="1234 5678 9012"
              maxLength={12}
              {...register('aadhaarNumber', {
                required: 'Aadhaar is required',
                pattern: { value: /^\d{12}$/, message: 'Aadhaar must be 12 digits' },
              })}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
            />
            {errors.aadhaarNumber && (
              <p className="text-[11px] text-rose-500">{errors.aadhaarNumber.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md hover:shadow-orange-500/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Submitting Documents...' : 'Submit for Verification'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
