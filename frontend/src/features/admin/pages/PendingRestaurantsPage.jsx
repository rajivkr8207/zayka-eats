import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { adminService } from '../services/admin.service.js';
import ApprovalCard from '../components/ApprovalCard.jsx';
import { toast } from 'react-toastify';

const PendingRestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPending = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getRestaurants({ status: 'pending' });
      const list = res.data?.data?.restaurants || res.data?.data || [];
      setRestaurants(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Failed to load pending restaurants');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = async (id) => {
    try {
      setIsProcessing(true);
      await adminService.updateRestaurantStatus(id, 'approved');
      toast.success('Restaurant approved & live! ✅');
      fetchPending();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id, _reason) => {
    try {
      setIsProcessing(true);
      await adminService.updateRestaurantStatus(id, 'rejected');
      toast.info('Restaurant rejected');
      fetchPending();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/dashboard"
          className="p-2.5 rounded-xl bg-surface border border-border-subtle hover:border-brand text-text-muted hover:text-text-primary"
        >
          <FiArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-text-primary">Pending Restaurant Approvals</h1>
          <p className="text-xs text-text-muted">Review kitchen verification applications</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-20 bg-surface rounded-2xl" />
          <div className="h-20 bg-surface rounded-2xl" />
        </div>
      ) : restaurants.length === 0 ? (
        <div className="p-12 rounded-3xl bg-surface border border-border-strong text-center space-y-3">
          <FiCheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
          <h2 className="text-base font-bold text-text-primary">All Caught Up!</h2>
          <p className="text-xs text-text-muted">There are no pending restaurant approvals in the queue.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {restaurants.map((res) => (
            <ApprovalCard
              key={res._id}
              item={res}
              type="restaurant"
              onApprove={handleApprove}
              onReject={handleReject}
              isProcessing={isProcessing}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingRestaurantsPage;
