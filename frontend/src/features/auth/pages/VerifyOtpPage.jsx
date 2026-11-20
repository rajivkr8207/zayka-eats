import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { toast } from 'react-toastify';
import { FiShield, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth.js';
import { authService } from '../services/auth.service.js';
import { ROLES } from '../../../constants/roles.js';

const VerifyOtpPage = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const navigate = useNavigate();
  const { verifyOtpCode, isLoading } = useAuth();

  const [resendCooldown, setResendCooldown] = useState(30);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: initialEmail,
      otp: '',
    },
  });

  const emailValue = watch('email');

  useEffect(() => {
    if (initialEmail) {
      setValue('email', initialEmail);
    }
  }, [initialEmail, setValue]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendOtp = async () => {
    if (!emailValue) {
      toast.error('Please provide an email address');
      return;
    }
    try {
      setIsResending(true);
      await authService.resendOtp({ email: emailValue });
      toast.success('New OTP sent to your email!');
      setResendCooldown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const resultAction = await verifyOtpCode({ email: data.email, otp: data.otp });
      if (resultAction?.type?.endsWith('fulfilled')) {
        toast.success('Account successfully verified! 🎉');
        const user = resultAction.payload?.user;
        if (user) {
          if (user.role === ROLES.RESTAURANT_OWNER) {
            navigate('/owner/dashboard', { replace: true });
          } else if (user.role === ROLES.DELIVERY_PARTNER) {
            navigate('/rider/dashboard', { replace: true });
          } else if (user.role === ROLES.ADMIN) {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        } else {
          navigate('/login', { replace: true });
        }
      }
    } catch {
      // Error handled in slice
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-surface border border-border-strong shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center text-xl mx-auto shadow-sm">
          <FiShield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-text-primary">Verify Your Email</h1>
        <p className="text-xs text-text-muted">
          Enter the 6-digit OTP code sent to your registered email address
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">Email Address</label>
          <input
            type="email"
            placeholder="user@example.com"
            {...register('email', { required: 'Email is required' })}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
          />
          {errors.email && <p className="text-[11px] text-rose-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">6-Digit Code</label>
          <input
            type="text"
            maxLength={6}
            placeholder="123456"
            {...register('otp', {
              required: 'OTP is required',
              pattern: { value: /^\d{6}$/, message: 'OTP must be exactly 6 digits' },
            })}
            className="w-full text-center tracking-[0.5em] text-lg font-bold py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
          />
          {errors.otp && <p className="text-[11px] text-rose-500">{errors.otp.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md hover:shadow-orange-500/25 transition-all disabled:opacity-50"
        >
          {isLoading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>

      <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border-subtle">
        <Link to="/login" className="flex items-center gap-1 hover:text-brand font-medium">
          <FiArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </Link>
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={resendCooldown > 0 || isResending}
          className="flex items-center gap-1 text-brand font-bold hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
        </button>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
