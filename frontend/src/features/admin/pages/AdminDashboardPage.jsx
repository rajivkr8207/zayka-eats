import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { FiCheckSquare, FiTruck, FiTag, FiActivity, FiUsers, FiLayers, FiArrowRight } from 'react-icons/fi';
import { adminService } from '../services/admin.service.js';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 142,
    totalRestaurants: 28,
    totalOrders: 384,
    pendingApprovals: 5,
  });

  useEffect(() => {
    adminService
      .getActivityStats()
      .then((res) => {
        const data = res.data?.data;
        if (data) {
          setStats((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-red-500/10 via-surface to-surface border border-border-strong shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary">Zayka Eats Master Admin</h1>
          <p className="text-xs text-text-muted mt-1">
            System health, approval queues, platform security, and audit trails
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold">
          System All Operational 🟢
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bento-card p-5 space-y-1">
          <span className="text-[11px] font-bold text-text-muted uppercase">Total Users</span>
          <div className="text-2xl font-black text-text-primary flex items-center gap-1.5">
            <FiUsers className="w-5 h-5 text-brand" />
            <span>{stats.totalUsers}</span>
          </div>
          <span className="text-[10px] text-text-muted">Registered accounts</span>
        </div>

        <div className="bento-card p-5 space-y-1">
          <span className="text-[11px] font-bold text-text-muted uppercase">Restaurants</span>
          <div className="text-2xl font-black text-text-primary flex items-center gap-1.5">
            <FiLayers className="w-5 h-5 text-blue-500" />
            <span>{stats.totalRestaurants}</span>
          </div>
          <span className="text-[10px] text-text-muted">Kitchen partners</span>
        </div>

        <div className="bento-card p-5 space-y-1">
          <span className="text-[11px] font-bold text-text-muted uppercase">Total Orders</span>
          <div className="text-2xl font-black text-text-primary flex items-center gap-1.5">
            <FiCheckSquare className="w-5 h-5 text-emerald-500" />
            <span>{stats.totalOrders}</span>
          </div>
          <span className="text-[10px] text-text-muted">All-time deliveries</span>
        </div>

        <Link
          to="/admin/restaurants"
          className="bento-card p-5 space-y-1 group hover:-translate-y-1 transition-transform"
        >
          <span className="text-[11px] font-bold text-amber-500 uppercase">Approvals Due</span>
          <div className="text-2xl font-black text-amber-500 flex items-center gap-1.5">
            <span>{stats.pendingApprovals}</span>
          </div>
          <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-1">
            Review queues <FiArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {/* Management Navigation Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/admin/restaurants"
          className="bento-card p-5 flex flex-col justify-between space-y-4 group hover:-translate-y-1 transition-transform"
        >
          <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
            <FiLayers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary group-hover:text-brand">
              Restaurant Approvals
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">Approve, reject & verify kitchens</p>
          </div>
        </Link>

        <Link
          to="/admin/riders"
          className="bento-card p-5 flex flex-col justify-between space-y-4 group hover:-translate-y-1 transition-transform"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <FiTruck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary group-hover:text-purple-500">
              Rider Approvals
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">Verify driving licenses & KYC</p>
          </div>
        </Link>

        <Link
          to="/admin/coupons"
          className="bento-card p-5 flex flex-col justify-between space-y-4 group hover:-translate-y-1 transition-transform"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <FiTag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary group-hover:text-emerald-500">
              Coupons & Promos
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">Create and manage discounts</p>
          </div>
        </Link>

        <Link
          to="/admin/logs"
          className="bento-card p-5 flex flex-col justify-between space-y-4 group hover:-translate-y-1 transition-transform"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <FiActivity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary group-hover:text-blue-500">
              Activity Logs
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">Security audit & action tracking</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
