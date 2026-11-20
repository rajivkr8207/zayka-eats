import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import {
  fetchCart,
  addToCart,
  updateItemQuantity,
  removeItem,
  applyCoupon,
  removeCoupon,
  clearCart,
  closeConflictModal,
  resetCartState,
} from '../cart.slice.js';

export const useCart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, totalItems, isLoading, error, conflictModal } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  return {
    cart,
    items: cart?.items || [],
    totalItems,
    subtotal: cart?.subtotal || 0,
    discount: cart?.discount || 0,
    deliveryFee: cart?.deliveryFee || 0,
    tax: cart?.tax || 0,
    totalAmount: cart?.totalAmount || 0,
    restaurant: cart?.restaurant || null,
    couponCode: cart?.couponCode || null,
    isLoading,
    error,
    conflictModal,

    fetchUserCart: () => dispatch(fetchCart()),
    addItem: (payload) => {
      if (!isAuthenticated) {
        sessionStorage.setItem('zayka_pending_cart_item', JSON.stringify(payload));
        toast.info('Please sign in to add delicious food to your cart 🍔');
        navigate('/login', { state: { from: { pathname: window.location.pathname } } });
        return;
      }
      return dispatch(addToCart(payload));
    },
    updateQuantity: (itemId, quantity) => dispatch(updateItemQuantity({ itemId, quantity })),
    deleteItem: (itemId) => dispatch(removeItem(itemId)),
    applyDiscountCode: (code) => dispatch(applyCoupon(code)),
    removeDiscountCode: () => dispatch(removeCoupon()),
    clear: () => dispatch(clearCart()),
    dismissConflict: () => dispatch(closeConflictModal()),
    resetCart: () => dispatch(resetCartState()),
  };
};

export default useCart;
