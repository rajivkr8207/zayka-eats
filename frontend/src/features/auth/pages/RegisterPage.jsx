import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth.js';
import { Link, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiLock } from 'react-icons/fi';
import { ROLES, ROLE_LABELS } from '../../../constants/roles.js';

const RegisterPage = () => {
  const { register: registerAction, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      mobile: '',
      password: '',
      role: ROLES.CUSTOMER,
    },
  });

  const onSubmit = async (data) => {
    try {
      const resultAction = await registerAction(data);
      if (resultAction?.type?.endsWith('fulfilled')) {
        toast.success('Registration successful! Please verify your OTP sent to email.');
        navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`);
      }
    } catch {
      // Handled in slice
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-surface border border-border-strong shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center font-black text-xl mx-auto shadow-md">
          Z
        </div>
        <h1 className="text-2xl font-black text-text-primary">Join Zayka Eats</h1>
        <p className="text-xs text-text-muted">Create an account to order or partner with us</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">Full Name</label>
          <div className="relative">
            <FiUser className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              {...register('fullName', { required: 'Full name is required' })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
            />
          </div>
          {errors.fullName && <p className="text-[11px] text-rose-500">{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">Email Address</label>
          <div className="relative">
            <FiMail className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
            <input
              type="email"
              placeholder="rahul@example.com"
              {...register('email', { required: 'Email is required' })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
            />
          </div>
          {errors.email && <p className="text-[11px] text-rose-500">{errors.email.message}</p>}
        </div>

        {/* Mobile */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">Mobile Number (10 Digits)</label>
          <div className="relative">
            <FiPhone className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
            <input
              type="tel"
              placeholder="9876543210"
              {...register('mobile', {
                required: 'Mobile number is required',
                pattern: { value: /^[6-9]\d{9}$/, message: 'Please enter a valid 10-digit Indian mobile number' },
              })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
            />
          </div>
          {errors.mobile && <p className="text-[11px] text-rose-500">{errors.mobile.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">Password</label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
            <input
              type="password"
              placeholder="At least 6 characters"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
            />
          </div>
          {errors.password && <p className="text-[11px] text-rose-500">{errors.password.message}</p>}
        </div>

        {/* Role Selection */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">I want to join as</label>
          <select
            {...register('role')}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
          >
            <option value={ROLES.CUSTOMER}>{ROLE_LABELS[ROLES.CUSTOMER]}</option>
            <option value={ROLES.RESTAURANT_OWNER}>{ROLE_LABELS[ROLES.RESTAURANT_OWNER]}</option>
            <option value={ROLES.DELIVERY_PARTNER}>{ROLE_LABELS[ROLES.DELIVERY_PARTNER]}</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md hover:shadow-orange-500/25 transition-all disabled:opacity-50"
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className="text-center text-xs text-text-muted">
        Already have an account?{' '}
        <Link to="/login" className="text-brand font-bold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
