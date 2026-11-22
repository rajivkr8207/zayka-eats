import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { FiArrowLeft, FiActivity, FiRefreshCw } from 'react-icons/fi';
import { adminService } from '../services/admin.service.js';
import { toast } from 'react-toastify';

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getActivityLogs({ limit: 50 });
      const list = res.data?.data?.logs || res.data?.data || [];
      setLogs(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Failed to load system activity logs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/dashboard"
            className="p-2.5 rounded-xl bg-surface border border-border-subtle hover:border-brand text-text-muted hover:text-text-primary"
          >
            <FiArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-text-primary">System Activity Logs</h1>
            <p className="text-xs text-text-muted">Security audit records and administrative actions</p>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2.5 rounded-xl bg-surface border border-border-subtle hover:border-brand text-text-muted hover:text-text-primary cursor-pointer"
          title="Refresh Logs"
        >
          <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand' : ''}`} />
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-surface border border-border-strong shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-10 bg-surface-elevated rounded-xl" />
            <div className="h-10 bg-surface-elevated rounded-xl" />
            <div className="h-10 bg-surface-elevated rounded-xl" />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center space-y-2 text-text-muted text-xs">
            <FiActivity className="w-8 h-8 mx-auto text-brand" />
            <p>No activity logs recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-subtle text-text-muted uppercase text-[10px] font-bold tracking-wider">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">User / Actor</th>
                  <th className="pb-3">Entity</th>
                  <th className="pb-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {logs.map((log, idx) => (
                  <tr key={log._id || idx} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="py-3 text-text-muted whitespace-nowrap">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString('en-IN') : 'N/A'}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-brand/10 text-brand font-bold text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-text-primary">
                      {log.actorName || log.actorEmail || log.user?.fullName || log.user?.email || log.userId || 'System'}
                    </td>
                    <td className="py-3 text-text-secondary">{log.entityType || log.entity || 'General'}</td>
                    <td className="py-3 text-text-muted truncate max-w-xs">
                      {log.message || (typeof log.details === 'object'
                        ? JSON.stringify(log.details)
                        : log.details || '-')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogsPage;
