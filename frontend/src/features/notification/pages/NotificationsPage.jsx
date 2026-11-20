import { useEffect } from 'react';
import { useNotification } from '../hooks/useNotification.js';
import { FiBell, FiCheck, FiCheckCircle, FiInfo } from 'react-icons/fi';

const NotificationsPage = () => {
  const { notifications, unreadCount, fetchAll, markAsRead, markAll } = useNotification();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand/10 text-brand">
            <FiBell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-text-primary">Notifications</h1>
            <p className="text-xs text-text-muted">
              {unreadCount > 0 ? `${unreadCount} unread update(s)` : 'All caught up!'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAll()}
            className="text-xs text-brand font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <FiCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-12 rounded-3xl bg-surface border border-border-strong text-center space-y-3">
          <FiCheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
          <h2 className="text-base font-bold text-text-primary">No Notifications Yet</h2>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Updates about your orders, coupons, and deliveries will show up here in real time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => {
                if (!notif.isRead) markAsRead(notif._id);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                notif.isRead
                  ? 'bg-surface border-border-subtle hover:border-border-strong'
                  : 'bg-brand/5 border-brand/40 shadow-sm'
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  notif.isRead ? 'bg-surface-elevated text-text-muted' : 'bg-brand text-white'
                }`}
              >
                <FiInfo className="w-4 h-4" />
              </div>

              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-text-primary">{notif.title}</h4>
                  <span className="text-[10px] text-text-muted">
                    {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString('en-IN') : ''}
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
