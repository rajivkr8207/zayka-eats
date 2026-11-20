import { useSelector, useDispatch } from 'react-redux';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
} from '../notification.slice.js';

export const useNotification = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, isLoading, error } = useSelector(
    (state) => state.notifications,
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    loadNotifications: (params) => dispatch(fetchNotifications(params)),
    loadUnreadCount: () => dispatch(fetchUnreadCount()),
    markNotificationRead: (id) => dispatch(markAsRead(id)),
    markAllNotificationsRead: () => dispatch(markAllAsRead()),
    clearAll: () => dispatch(clearAllNotifications()),
  };
};

export default useNotification;
