import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { FiDollarSign, FiCheckCircle, FiClock, FiAlertCircle, FiRefreshCw, FiPackage } from 'react-icons/fi';
import { useDelivery } from '../hooks/useDelivery.js';
import DutyToggle from '../components/DutyToggle.jsx';
import TaskCard from '../components/TaskCard.jsx';
import { deliveryService } from '../services/delivery.service.js';
import { toast } from 'react-toastify';

const RiderDashboardPage = () => {
  const { profile, isOnline, isLoading, toggleDuty, refetch } = useDelivery();
  const [activeTask, setActiveTask] = useState(null);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [isFetchingTasks, setIsFetchingTasks] = useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);

  const isVerified = profile?.deliveryPartner?.verificationStatus === 'approved';
  const partnerInfo = profile?.deliveryPartner;

  // ── Fetch active + available tasks
  const fetchTasks = useCallback(async () => {
    if (!isVerified) return;
    try {
      setIsFetchingTasks(true);
      const [activeRes, availableRes] = await Promise.allSettled([
        deliveryService.getActiveTask(),
        deliveryService.getAvailableTasks(),
      ]);

      if (activeRes.status === 'fulfilled') {
        const data = activeRes.value.data?.data;
        setActiveTask(data?.activeTask || null);
      }

      if (availableRes.status === 'fulfilled') {
        const data = availableRes.value.data?.data;
        setAvailableTasks(Array.isArray(data?.availableTasks) ? data.availableTasks : []);
      }
    } catch {
      // silent — not critical on first load
    } finally {
      setIsFetchingTasks(false);
    }
  }, [isVerified]);

  useEffect(() => {
    fetchTasks();
    // Refresh every 30s while online
    const interval = isOnline ? setInterval(fetchTasks, 30000) : null;
    return () => { if (interval) clearInterval(interval); };
  }, [fetchTasks, isOnline]);

  // ── Accept a new delivery task
  const handleAcceptTask = async (taskId) => {
    try {
      setIsUpdatingTask(true);
      await deliveryService.acceptTask(taskId);
      toast.success('Task accepted! Navigate to the pickup restaurant. 🛵');
      await fetchTasks();
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept task');
    } finally {
      setIsUpdatingTask(false);
    }
  };

  // ── Intermediate status update (picked_up → out_for_delivery)
  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      setIsUpdatingTask(true);
      await deliveryService.updateOrderStatus(taskId, newStatus);
      toast.success(`Status updated: ${newStatus.replace(/_/g, ' ')} ✅`);
      await fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdatingTask(false);
    }
  };

  // ── Complete delivery
  const handleCompleteTask = async (taskId) => {
    try {
      setIsUpdatingTask(true);
      await deliveryService.completeTask(taskId, { paymentReceived: true });
      toast.success('Awesome work! Delivery completed 🎉');
      setActiveTask(null);
      await fetchTasks();
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete task');
    } finally {
      setIsUpdatingTask(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Verification warning */}
      {!isVerified && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-text-primary">Profile Under Verification</h4>
              <p className="text-[11px] text-text-muted">
                Submit or verify your KYC documents to activate duty.
              </p>
            </div>
          </div>
          <Link
            to="/rider/onboard"
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors whitespace-nowrap"
          >
            Complete KYC
          </Link>
        </div>
      )}

      {/* Duty Toggle */}
      <DutyToggle isOnline={isOnline} onToggle={toggleDuty} disabled={isLoading || !isVerified} />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bento-card p-5 space-y-1">
          <span className="text-[11px] font-bold text-text-muted uppercase">Today&apos;s Earnings</span>
          <div className="text-2xl font-black text-brand flex items-center gap-1">
            <FiDollarSign className="w-5 h-5" />
            <span>₹{partnerInfo?.todayEarnings || 0}</span>
          </div>
          <span className="text-[10px] text-text-muted">Direct transfer daily</span>
        </div>

        <div className="bento-card p-5 space-y-1">
          <span className="text-[11px] font-bold text-text-muted uppercase">Completed</span>
          <div className="text-2xl font-black text-emerald-500 flex items-center gap-1">
            <FiCheckCircle className="w-5 h-5" />
            <span>{partnerInfo?.totalDeliveries || 0}</span>
          </div>
          <span className="text-[10px] text-text-muted">Total deliveries</span>
        </div>

        <div className="bento-card p-5 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-text-muted uppercase">Duty Status</span>
          <div className="text-2xl font-black text-text-primary flex items-center gap-1">
            <FiClock className="w-5 h-5" />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <span className="text-[10px] text-text-muted">
            {isOnline ? 'Ready for deliveries' : 'Go online to earn'}
          </span>
        </div>
      </div>

      {/* ── Active Delivery ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary">Current Delivery Assignment</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchTasks}
              disabled={isFetchingTasks}
              className="p-2 rounded-xl bg-surface border border-border-subtle hover:border-brand text-text-muted hover:text-brand cursor-pointer transition-colors"
              title="Refresh"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${isFetchingTasks ? 'animate-spin' : ''}`} />
            </button>
            <Link to="/rider/history" className="text-xs text-brand font-bold hover:underline">
              Past Deliveries
            </Link>
          </div>
        </div>

        {activeTask ? (
          <TaskCard
            task={activeTask}
            onStatusUpdate={handleStatusUpdate}
            onComplete={handleCompleteTask}
            isUpdating={isUpdatingTask}
          />
        ) : (
          <div className="p-8 rounded-3xl bg-surface border border-border-subtle text-center space-y-2">
            <FiPackage className="w-8 h-8 text-text-muted mx-auto" />
            <p className="text-xs text-text-muted">
              {isOnline
                ? 'No active delivery. Accept an available task below.'
                : 'Turn your duty online above to start receiving deliveries.'}
            </p>
          </div>
        )}
      </div>

      {/* ── Available Tasks ── */}
      {isOnline && isVerified && !activeTask && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            Available Orders
            {availableTasks.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[11px] font-black">
                {availableTasks.length}
              </span>
            )}
          </h2>

          {isFetchingTasks ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="h-48 rounded-3xl bg-surface animate-pulse border border-border-subtle" />
              ))}
            </div>
          ) : availableTasks.length === 0 ? (
            <div className="p-8 rounded-3xl bg-surface border border-border-subtle text-center space-y-2">
              <p className="text-xs text-text-muted">
                No orders available right now. Hang tight, new orders arrive soon! 🕐
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onAccept={handleAcceptTask}
                  isUpdating={isUpdatingTask}
                  isAvailable
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RiderDashboardPage;
