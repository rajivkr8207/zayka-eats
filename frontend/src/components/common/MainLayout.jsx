import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import BottomNav from './BottomNav.jsx';
import CartConflictModal from '../../features/cart/components/CartConflictModal.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  syncNotifications,
  pushLiveNotification,
  setUnreadCount,
} from '../../features/notification/notification.slice.js';
import { fetchCart } from '../../features/cart/cart.slice.js';
import { clearAuth } from '../../features/auth/auth.slice.js';
import { initializeSocket } from '../../lib/socket.js';

const MainLayout = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const themeMode = useSelector((state) => state.theme.mode);

  // Initialize socket & fetch active cart when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      const socket = initializeSocket();

      if (socket) {
        socket.on('notification:sync', (data) => {
          dispatch(syncNotifications(data));
        });

        socket.on('notification:new', (notification) => {
          dispatch(pushLiveNotification(notification));
          toast.info(`${notification.title}\n${notification.message}`, {
            icon: '🔔',
          });
        });

        socket.on('notification:unread_count', ({ unreadCount }) => {
          dispatch(setUnreadCount(unreadCount));
        });

        socket.on('auth:expired', () => {
          toast.error('Session expired. Please log in again.');
          dispatch(clearAuth());
        });
      }
    }
  }, [dispatch, isAuthenticated]);

  // Handle global auth:logout custom event
  useEffect(() => {
    const handleLogoutEvent = () => {
      dispatch(clearAuth());
    };
    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => window.removeEventListener('auth:logout', handleLogoutEvent);
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-app text-primary transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      <Footer />
      <BottomNav />
      <CartConflictModal />

      {/* Global Toast Provider */}
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={themeMode === 'dark' ? 'dark' : 'light'}
      />
    </div>
  );
};

export default MainLayout;
