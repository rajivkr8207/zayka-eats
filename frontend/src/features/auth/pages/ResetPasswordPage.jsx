import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { toast } from 'react-toastify';
import { FiLock, FiEye, FiEyeOff, FiKey } from 'react-icons/fi';
import { authService } from '../services/auth.service.js';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      token: tokenParam,
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPasswordValue = watch('newPassword');

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await authService.resetPassword({
        token: data.token,
        newPassword: data.newPassword,
      });
      toast.success('Password successfully reset! Please login with your new password.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed. Invalid or expired token.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-surface border border-border-strong shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center text-xl mx-auto shadow-sm">
          <FiKey className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-text-primary">Set New Password</h1>
        <p className="text-xs text-text-muted">
          Enter the reset token received in email along with your new password
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Token */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">Reset Token</label>
          <input
            type="text"
            placeholder="Paste your reset token"
            {...register('token', { required: 'Reset token is required' })}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
          />
          {errors.token && <p className="text-[11px] text-rose-500">{errors.token.message}</p>}
        </div>

        {/* New Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">New Password</label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 6 characters"
              {...register('newPassword', {
                required: 'New password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-text-muted hover:text-text-primary"
            >
              {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-[11px] text-rose-500">{errors.newPassword.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">Confirm New Password</label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              {...register('confirmPassword', {
                required: 'Please confirm your new password',
                validate: (value) => value === newPasswordValue || 'Passwords do not match',
              })}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-3 text-text-muted hover:text-text-primary"
            >
              {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
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
          {isLoading ? 'Updating Password...' : 'Reset Password'}
        </button>
      </form>

      <div className="text-center text-xs text-text-muted pt-2 border-t border-border-subtle">
        <Link to="/login" className="hover:text-brand font-medium">
          Remember your password? Sign In
        </Link>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
