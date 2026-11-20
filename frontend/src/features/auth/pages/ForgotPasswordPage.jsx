import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { authService } from '../services/auth.service.js';

const ForgotPasswordPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '' },
  });

  const emailValue = watch('email');

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await authService.forgotPassword({ email: data.email });
      setIsSubmitted(true);
      toast.success('Password reset link sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send password reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-surface border border-border-strong shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center text-xl mx-auto shadow-sm">
          <FiMail className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-text-primary">Forgot Password?</h1>
        <p className="text-xs text-text-muted">
          No worries, enter your registered email and we&apos;ll send you instructions to reset your password.
        </p>
      </div>

      {isSubmitted ? (
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
          <FiCheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-text-primary">Check Your Inbox</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            We have sent a password reset token and instructions to <strong className="text-text-primary">{emailValue}</strong>.
          </p>
          <div className="pt-2">
            <Link
              to="/reset-password"
              className="inline-block px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover shadow-sm"
            >
              Enter Reset Token
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
              <input
                type="email"
                placeholder="your.email@example.com"
                {...register('email', { required: 'Please enter your email address' })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
              />
            </div>
            {errors.email && <p className="text-[11px] text-rose-500">{errors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md hover:shadow-orange-500/25 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Sending Instructions...' : 'Send Reset Link'}
          </button>
        </form>
      )}

      <div className="text-center text-xs text-text-muted pt-2 border-t border-border-subtle">
        <Link to="/login" className="inline-flex items-center gap-1 hover:text-brand font-medium">
          <FiArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
