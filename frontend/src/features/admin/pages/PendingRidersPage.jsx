import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { adminService } from '../services/admin.service.js';
import ApprovalCard from '../components/ApprovalCard.jsx';
import { toast } from 'react-toastify';

const PendingRidersPage = () => {
  const [riders, setRiders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPendingRiders = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getPartners({ isVerified: false });
      const list = res.data?.data?.partners || res.data?.data || [];
      setRiders(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Failed to load pending delivery partners');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRiders();
  }, [fetchPendingRiders]);

  const handleApprove = async (id) => {
    try {
      setIsProcessing(true);
      await adminService.verifyPartner(id, { isVerified: true, verificationStatus: 'approved' });
      toast.success('Delivery Partner verified and ready for duty! 🛵');
      fetchPendingRiders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id, reason) => {
    try {
      setIsProcessing(true);
      await adminService.verifyPartner(id, { isVerified: false, status: 'rejected', reason });
      toast.info('Delivery Partner application rejected');
      fetchPendingRiders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
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
          <h1 className="text-xl font-black text-text-primary">Pending Delivery Hero Approvals</h1>
          <p className="text-xs text-text-muted">Review driving licenses & vehicle registrations</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-20 bg-surface rounded-2xl" />
          <div className="h-20 bg-surface rounded-2xl" />
        </div>
      ) : riders.length === 0 ? (
        <div className="p-12 rounded-3xl bg-surface border border-border-strong text-center space-y-3">
          <FiCheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
          <h2 className="text-base font-bold text-text-primary">No Pending Riders</h2>
          <p className="text-xs text-text-muted">All delivery partner KYC applications have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {riders.map((rider) => (
            <ApprovalCard
              key={rider._id}
              item={rider}
              type="rider"
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

export default PendingRidersPage;
