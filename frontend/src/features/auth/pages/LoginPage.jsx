import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth.js';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../cart/cart.thunk.js';
import { Link, useNavigate, useLocation } from 'react-router';
import { toast } from 'react-toastify';
import { FiLock, FiMail } from 'react-icons/fi';
import { ROLES } from '../../../constants/roles.js';

const LoginPage = () => {
  const { login, isLoading, error } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const resultAction = await login(data);
      if (resultAction?.type?.endsWith('fulfilled')) {
        const user = resultAction.payload?.user;
        toast.success(`Welcome back, ${user?.fullName || 'Foodie'}! 🍽️`);

        // Check if there was a pending cart item before login
        const pendingCartItem = sessionStorage.getItem('zayka_pending_cart_item');
        if (pendingCartItem) {
          try {
            const parsed = JSON.parse(pendingCartItem);
            sessionStorage.removeItem('zayka_pending_cart_item');
            await dispatch(addToCart(parsed));
            toast.info('Item added to your cart!');
            navigate('/cart', { replace: true });
            return;
          } catch {
            sessionStorage.removeItem('zayka_pending_cart_item');
          }
        }

        // Role-based redirection
        if (user?.role === ROLES.RESTAURANT_OWNER) {
          navigate('/owner/dashboard', { replace: true });
        } else if (user?.role === ROLES.DELIVERY_PARTNER) {
          navigate('/rider/dashboard', { replace: true });
        } else if (user?.role === ROLES.ADMIN) {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate(from !== '/login' ? from : '/', { replace: true });
        }
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
        <h1 className="text-2xl font-black text-text-primary">Sign in to Zayka Eats</h1>
        <p className="text-xs text-text-muted">Enter your email or mobile to access your account</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Identifier */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary">Email or Username</label>
          <div className="relative">
            <FiMail className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="e.g. rahul@example.com"
              {...register('identifier', { required: 'Please enter your email or username' })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>
          {errors.identifier && (
            <p className="text-[11px] text-rose-500">{errors.identifier.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-secondary">Password</label>
            <Link to="/forgot-password" className="text-[11px] text-brand hover:underline font-medium">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
            <input
              type="password"
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>
          {errors.password && (
            <p className="text-[11px] text-rose-500">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md hover:shadow-orange-500/25 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="text-center text-xs text-text-muted">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-brand font-bold hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
