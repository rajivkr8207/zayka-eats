import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { FiMapPin, FiCreditCard, FiCheckCircle, FiPlus, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../hooks/useCart.js';
import { useAddress } from '../../address/hooks/useAddress.js';
import { orderService } from '../../order/services/order.service.js';
import { paymentService } from '../../payment/services/payment.service.js';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, items, clear } = useCart();
  const { addresses, isLoading: isAddressLoading } = useAddress();

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'online'
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // If no address selected yet, default to first or isDefault address
  const activeAddressId =
    selectedAddressId || addresses.find((a) => a.isDefault)?._id || addresses[0]?._id;

  const handlePlaceOrder = async () => {
    if (!activeAddressId) {
      toast.error('Please select or add a delivery address');
      return;
    }

    try {
      setIsPlacingOrder(true);

      const orderPayload = {
        addressId: activeAddressId,
        deliveryAddressId: activeAddressId,
        paymentMethod: paymentMethod === 'cod' ? 'cod' : 'online',
      };

      const res = await orderService.createOrder(orderPayload);
      const newOrder = res.data?.data?.order;

      if (paymentMethod === 'online' && newOrder) {
        try {
          const payRes = await paymentService.initiatePayment({
            orderId: newOrder._id,
            amount: newOrder.totalAmount,
          });
          toast.info('Payment gateway simulated for testing: Payment auto-verified! 💳');
          await paymentService.verifyPayment({
            orderId: newOrder._id,
            razorpayPaymentId: 'pay_simulated_test',
            razorpayOrderId: payRes.data?.data?.razorpayOrderId || 'order_sim',
            razorpaySignature: 'sig_sim',
          });
        } catch {
          // If payment gateway fails, still track order
        }
      }

      await clear();
      toast.success('Order placed successfully! 🍕 Your food is being prepared.');
      navigate(`/orders/${newOrder._id || ''}`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!cart || items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-surface border border-border-strong text-center space-y-3">
        <h2 className="text-lg font-bold text-text-primary">Cart is empty</h2>
        <Link to="/explore" className="text-xs text-brand font-bold hover:underline">
          Browse food
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/cart"
          className="p-2.5 rounded-xl bg-surface border border-border-subtle hover:border-brand text-text-muted hover:text-text-primary"
        >
          <FiArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-text-primary">Checkout</h1>
          <p className="text-xs text-text-muted">Confirm delivery address and select payment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Address & Payment Selection */}
        <div className="md:col-span-2 space-y-6">
          {/* Address Selection */}
          <div className="p-6 rounded-3xl bg-surface border border-border-strong shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <FiMapPin className="text-brand" /> Delivery Address
              </h3>
              <Link
                to="/addresses/new"
                className="text-xs text-brand font-bold hover:underline flex items-center gap-1"
              >
                <FiPlus className="w-3.5 h-3.5" /> Add New
              </Link>
            </div>

            {isAddressLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-16 bg-surface-elevated rounded-2xl" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="p-4 rounded-2xl bg-surface-elevated text-center space-y-2">
                <p className="text-xs text-text-muted">No saved address found.</p>
                <Link
                  to="/addresses/new"
                  className="inline-block px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold"
                >
                  Add Delivery Address
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => {
                  const isSelected = activeAddressId === addr._id;
                  return (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                        isSelected
                          ? 'border-brand bg-brand/5 shadow-md shadow-orange-500/10'
                          : 'border-border-subtle bg-surface-elevated hover:border-border-strong'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-primary uppercase">
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand/10 text-brand">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary mt-1">{addr.addressLine1}</p>
                        <p className="text-[11px] text-text-muted">
                          {addr.city}, {addr.state} - {addr.pincode || addr.pinCode}
                        </p>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                          isSelected ? 'border-brand bg-brand text-white' : 'border-border-subtle'
                        }`}
                      >
                        {isSelected && <FiCheckCircle className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment Method Selection */}
          <div className="p-6 rounded-3xl bg-surface border border-border-strong shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 pb-3 border-b border-border-subtle">
              <FiCreditCard className="text-brand" /> Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'cod'
                    ? 'border-brand bg-brand/5 shadow-sm'
                    : 'border-border-subtle bg-surface-elevated hover:border-border-strong'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-text-primary">Cash on Delivery (COD)</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">Pay in cash or UPI upon delivery</p>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border ${
                    paymentMethod === 'cod' ? 'border-brand bg-brand' : 'border-border-subtle'
                  }`}
                />
              </div>

              <div
                onClick={() => setPaymentMethod('online')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'online'
                    ? 'border-brand bg-brand/5 shadow-sm'
                    : 'border-border-subtle bg-surface-elevated hover:border-border-strong'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-text-primary">Online Payment</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">UPI, Cards, NetBanking, Razorpay</p>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border ${
                    paymentMethod === 'online' ? 'border-brand bg-brand' : 'border-border-subtle'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary & Place Order */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-surface border border-border-strong shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-text-primary pb-3 border-b border-border-subtle">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs divide-y divide-border-subtle/50">
              {items.map((item) => (
                <div key={item._id} className="pt-2 flex justify-between">
                  <span className="text-text-secondary truncate max-w-[150px]">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-semibold text-text-primary">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-border-subtle space-y-2 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>₹{cart.subtotal}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-emerald-500 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{cart.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-text-secondary">
                <span>Delivery Fee</span>
                <span>{cart.deliveryFee === 0 ? 'FREE' : `₹${cart.deliveryFee}`}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>GST (5%)</span>
                <span>₹{cart.tax}</span>
              </div>
              <div className="pt-2 border-t border-border-subtle flex justify-between text-base font-black text-text-primary">
                <span>Total Amount</span>
                <span className="text-brand">₹{cart.totalAmount}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || addresses.length === 0}
              className="w-full py-3.5 rounded-2xl bg-brand hover:bg-brand-hover text-white text-xs font-extrabold shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPlacingOrder ? 'Confirming Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
