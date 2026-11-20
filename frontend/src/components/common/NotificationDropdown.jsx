import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  markAsRead,
  markAllAsRead,
  fetchNotifications,
} from '../../features/notification/notification.slice.js';
import { FiBell, FiCheck, FiInbox } from 'react-icons/fi';
import { Link } from 'react-router';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();

  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications({ limit: 10 }));
    }
  }, [dispatch, isAuthenticated]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-surface border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-strong transition-all"
        title="Notifications"
        aria-label="Notifications"
      >
        <FiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-surface border border-border-strong shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-text-primary">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand text-xs font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => dispatch(markAllAsRead())}
                className="text-xs text-brand hover:underline flex items-center gap-1 font-medium"
              >
                <FiCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border-subtle">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-text-muted text-sm flex flex-col items-center gap-2">
                <FiInbox className="w-8 h-8 opacity-40" />
                <span>No notifications yet</span>
              </div>
            ) : (
              notifications.slice(0, 15).map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => {
                    if (!notif.isRead) dispatch(markAsRead(notif._id));
                  }}
                  className={`p-3.5 transition-colors cursor-pointer flex gap-3 ${
                    notif.isRead ? 'bg-surface opacity-80' : 'bg-brand/5'
                  } hover:bg-surface-elevated`}
                >
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-brand"
                    style={{ opacity: notif.isRead ? 0 : 1 }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-primary leading-tight">
                      {notif.title}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-text-muted mt-1 block">
                      {new Date(notif.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-surface-elevated border-t border-border-subtle text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs text-text-secondary hover:text-brand font-medium transition-colors"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
