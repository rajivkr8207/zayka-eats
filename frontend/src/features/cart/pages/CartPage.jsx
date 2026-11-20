import { useState } from 'react';
import { Link } from 'react-router';
import { useCart } from '../hooks/useCart.js';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiTag, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-toastify';

const CartPage = () => {
  const {
    cart,
    items,
    isLoading,
    updateQuantity,
    deleteItem,
    applyDiscountCode,
    removeDiscountCode,
    clear,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    try {
      const result = await applyDiscountCode(couponInput.trim().toUpperCase());
      if (result?.type?.endsWith('fulfilled')) {
        toast.success(`Coupon '${couponInput.toUpperCase()}' applied! 🎉`);
        setCouponInput('');
      } else {
        toast.error(result.payload || 'Failed to apply coupon');
      }
    } catch {
      // ignore
    }
  };

  const handleRemoveCoupon = async () => {
    await removeDiscountCode();
    toast.info('Coupon removed');
  };

  if (!cart || items.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 max-w-sm mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-surface border border-border-strong text-text-muted flex items-center justify-center mx-auto text-3xl shadow-sm">
          <FiShoppingBag className="w-8 h-8 opacity-40 text-brand" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Your cart is empty</h2>
        <p className="text-xs text-text-muted">
          Looks like you haven&apos;t added any delicious food yet. Explore top restaurants near you!
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md transition-all"
        >
          Browse Restaurants <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-black text-text-primary">Your Cart</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Ordering from:{' '}
            <strong className="text-brand">
              {cart.restaurant?.name || 'Selected Restaurant'}
            </strong>
          </p>
        </div>
        <button
          type="button"
          onClick={() => clear()}
          className="text-xs text-rose-500 hover:underline flex items-center gap-1 font-medium"
        >
          <FiTrash2 className="w-3.5 h-3.5" /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Items list */}
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-2xl bg-surface border border-border-subtle divide-y divide-border-subtle overflow-hidden">
            {items.map((item) => (
              <div key={item._id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-text-primary truncate">{item.name}</h4>
                    <p className="text-xs font-semibold text-text-secondary mt-0.5">
                      ₹{item.price} each
                    </p>
                  </div>
                </div>

                {/* Quantity Controls & Total */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="flex items-center rounded-xl bg-surface-elevated border border-border-subtle p-1">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        if (item.quantity <= 1) {
                          deleteItem(item._id);
                        } else {
                          updateQuantity(item._id, item.quantity - 1);
                        }
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                    >
                      <FiMinus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-text-primary">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                    >
                      <FiPlus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="text-xs font-bold text-text-primary min-w-[60px] text-right tabular-nums">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Section */}
          <div className="p-4 rounded-2xl bg-surface border border-border-subtle space-y-3">
            <h4 className="text-xs font-bold text-text-primary flex items-center gap-2">
              <FiTag className="text-brand" /> Apply Discount Coupon
            </h4>
            {cart.couponCode ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500">
                <span className="font-bold">✓ Coupon &apos;{cart.couponCode}&apos; Applied (-₹{cart.discount})</span>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-rose-500 hover:underline font-semibold ml-2"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter promo code (e.g. FIRST50)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary uppercase placeholder:normal-case placeholder:text-text-muted focus:outline-none focus:border-brand"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-surface-elevated border border-border-strong hover:bg-brand hover:text-white text-xs font-bold transition-all"
                >
                  Apply
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right: Bill Details & Checkout */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-surface border border-border-strong shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-3">
              Bill Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Item Subtotal</span>
                <span className="font-semibold text-text-primary tabular-nums">₹{cart.subtotal}</span>
              </div>

              {cart.discount > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span>Coupon Discount</span>
                  <span className="font-semibold tabular-nums">-₹{cart.discount}</span>
                </div>
              )}

              <div className="flex justify-between text-text-secondary">
                <span>Delivery Partner Fee</span>
                <span className="font-semibold text-text-primary tabular-nums">
                  {cart.deliveryFee === 0 ? (
                    <span className="text-emerald-500 font-bold uppercase">Free</span>
                  ) : (
                    `₹${cart.deliveryFee}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-text-secondary">
                <span>GST & Restaurant Taxes (5%)</span>
                <span className="font-semibold text-text-primary tabular-nums">₹{cart.tax}</span>
              </div>

              <div className="pt-3 border-t border-border-subtle flex justify-between text-sm font-bold text-text-primary">
                <span>To Pay</span>
                <span className="text-base text-brand font-extrabold tabular-nums">
                  ₹{cart.totalAmount}
                </span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all"
            >
              Proceed to Checkout <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
