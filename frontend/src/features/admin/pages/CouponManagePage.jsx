import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { FiArrowLeft, FiPlus, FiTrash2, FiTag } from 'react-icons/fi';
import { adminService } from '../services/admin.service.js';
import CouponForm from '../components/CouponForm.jsx';
import { toast } from 'react-toastify';

const CouponManagePage = () => {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCoupons = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getCoupons();
      const list = res.data?.data?.coupons || res.data?.data || [];
      setCoupons(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleSave = async (data) => {
    try {
      setIsSubmitting(true);
      if (editingCoupon) {
        await adminService.updateCoupon(editingCoupon._id, data);
        toast.success('Coupon updated successfully!');
      } else {
        await adminService.createCoupon(data);
        toast.success('Coupon created successfully!');
      }
      setShowModal(false);
      setEditingCoupon(null);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this promotional coupon?')) {
      try {
        await adminService.deleteCoupon(id);
        toast.success('Coupon deleted');
        fetchCoupons();
      } catch {
        toast.error('Failed to delete coupon');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/dashboard"
            className="p-2.5 rounded-xl bg-surface border border-border-subtle hover:border-brand text-text-muted hover:text-text-primary"
          >
            <FiArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-text-primary">Coupon Management</h1>
            <p className="text-xs text-text-muted">Create platform promotional discount codes</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingCoupon(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md shadow-orange-500/20 cursor-pointer"
        >
          <FiPlus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-20 bg-surface rounded-2xl" />
          <div className="h-20 bg-surface rounded-2xl" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="p-12 rounded-3xl bg-surface border border-border-strong text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto">
            <FiTag className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-text-primary">No Coupons Found</h2>
          <p className="text-xs text-text-muted">Create your first promo code to boost orders.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {coupons.map((c) => (
            <div
              key={c._id}
              className="p-5 rounded-2xl bg-surface border border-border-subtle hover:border-border-strong transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-1 rounded-lg bg-brand/10 text-brand font-black text-xs uppercase tracking-wider">
                    {c.code}
                  </span>
                  <p className="text-xs font-bold text-text-primary mt-2">
                    {c.discountType === 'percentage'
                      ? `${c.discountValue}% OFF`
                      : `₹${c.discountValue} FLAT OFF`}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(c._id)}
                  className="p-1.5 text-text-muted hover:text-rose-500 rounded-lg hover:bg-surface-elevated"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2 border-t border-border-subtle text-[11px] text-text-muted space-y-0.5">
                <p>Min Order: ₹{c.minOrderAmount || 0}</p>
                <p>Max Discount: ₹{c.maxDiscountAmount || 'No Limit'}</p>
                <p>Status: <strong className={c.isActive ? 'text-emerald-500' : 'text-rose-500'}>
                  {c.isActive ? 'Active' : 'Disabled'}
                </strong></p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-surface border border-border-strong shadow-2xl space-y-4">
            <h2 className="text-lg font-black text-text-primary">
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </h2>
            <CouponForm
              initialData={editingCoupon}
              onSubmit={handleSave}
              onCancel={() => {
                setShowModal(false);
                setEditingCoupon(null);
              }}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagePage;
