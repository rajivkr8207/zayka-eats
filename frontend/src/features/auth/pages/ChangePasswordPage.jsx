import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router';
import { toast } from 'react-toastify';
import { FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { authService } from '../services/auth.service.js';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPasswordValue = watch('newPassword');

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully! 🔐');
      reset();
      navigate('/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password. Verify your current password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-surface border border-border-strong shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center text-xl mx-auto shadow-sm">
          <FiLock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-text-primary">Change Password</h1>
        <p className="text-xs text-text-muted">Keep your Zayka Eats account safe with a strong password</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Current Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">Current Password</label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
            <input
              type={showCurrent ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('currentPassword', { required: 'Current password is required' })}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3.5 top-3 text-text-muted hover:text-text-primary"
            >
              {showCurrent ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-[11px] text-rose-500">{errors.currentPassword.message}</p>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">New Password</label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
            <input
              type={showNew ? 'text' : 'password'}
              placeholder="At least 6 characters"
              {...register('newPassword', {
                required: 'New password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3.5 top-3 text-text-muted hover:text-text-primary"
            >
              {showNew ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-[11px] text-rose-500">{errors.newPassword.message}</p>
          )}
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">Confirm New Password</label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm new password"
              {...register('confirmPassword', {
                required: 'Please confirm your new password',
                validate: (val) => val === newPasswordValue || 'Passwords do not match',
              })}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-3 text-text-muted hover:text-text-primary"
            >
              {showConfirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[11px] text-rose-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md hover:shadow-orange-500/25 transition-all disabled:opacity-50"
        >
          {isLoading ? 'Updating Password...' : 'Update Password'}
        </button>
      </form>

      <div className="text-center text-xs text-text-muted pt-2 border-t border-border-subtle">
        <Link to="/profile" className="inline-flex items-center gap-1 hover:text-brand font-medium">
          <FiArrowLeft className="w-3.5 h-3.5" /> Back to Profile
        </Link>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
