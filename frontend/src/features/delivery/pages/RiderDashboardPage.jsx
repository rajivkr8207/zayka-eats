import { useState } from 'react';
import { Link } from 'react-router';
import { FiDollarSign, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import { useDelivery } from '../hooks/useDelivery.js';
import DutyToggle from '../components/DutyToggle.jsx';
import TaskCard from '../components/TaskCard.jsx';
import { deliveryService } from '../services/delivery.service.js';
import { toast } from 'react-toastify';

const RiderDashboardPage = () => {
  const { profile, isOnline, isLoading, toggleDuty, refetch } = useDelivery();
  const [activeTask, setActiveTask] = useState(null);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  console.log(profile);
  const isVerified = profile?.deliveryPartner?.verificationStatus === 'approved';

  const handleAcceptTask = async (taskId) => {
    try {
      setIsUpdatingTask(true);
      await deliveryService.acceptTask(taskId);
      toast.success('Task accepted! Navigate to the pickup restaurant.');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept task');
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      setIsUpdatingTask(true);
      await deliveryService.completeTask(taskId, {});
      toast.success('Awesome work! Delivery completed successfully 🎉');
      setActiveTask(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete task');
    } finally {
      setIsUpdatingTask(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Verification warning if not verified */}
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

      {/* Today's Stats Bento Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bento-card p-5 space-y-1">
          <span className="text-[11px] font-bold text-text-muted uppercase">Today&apos;s Earnings</span>
          <div className="text-2xl font-black text-brand flex items-center gap-1">
            <FiDollarSign className="w-5 h-5" />
            <span>₹{profile?.todayEarnings || '450'}</span>
          </div>
          <span className="text-[10px] text-text-muted">Direct transfer daily</span>
        </div>

        <div className="bento-card p-5 space-y-1">
          <span className="text-[11px] font-bold text-text-muted uppercase">Completed Orders</span>
          <div className="text-2xl font-black text-emerald-500 flex items-center gap-1">
            <FiCheckCircle className="w-5 h-5" />
            <span>{profile?.totalDeliveries || '6'}</span>
          </div>
          <span className="text-[10px] text-text-muted">100% on-time</span>
        </div>

        <div className="bento-card p-5 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-text-muted uppercase">Duty Time</span>
          <div className="text-2xl font-black text-text-primary flex items-center gap-1">
            <FiClock className="w-5 h-5" />
            <span>{isOnline ? '3h 15m' : 'Offline'}</span>
          </div>
          <span className="text-[10px] text-text-muted">Active shift</span>
        </div>
      </div>

      {/* Active Delivery Task */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary">Current Delivery Assignment</h2>
          <Link to="/rider/history" className="text-xs text-brand font-bold hover:underline">
            Past Deliveries
          </Link>
        </div>

        {activeTask ? (
          <TaskCard
            task={activeTask}
            onAccept={handleAcceptTask}
            onComplete={handleCompleteTask}
            isUpdating={isUpdatingTask}
          />
        ) : (
          <div className="p-8 rounded-3xl bg-surface border border-border-subtle text-center space-y-2">
            <p className="text-xs text-text-muted">
              {isOnline
                ? 'Looking for nearby food orders... Keep your GPS on.'
                : 'Turn your duty online above to start receiving deliveries.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderDashboardPage;
