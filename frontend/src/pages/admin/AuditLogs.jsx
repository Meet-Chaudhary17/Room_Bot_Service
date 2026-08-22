import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service.js';
import { RefreshCw, ShieldAlert, ShieldCheck, Activity } from 'lucide-react';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await adminService.listAuditLogs();
      if (res.success) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch system audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">System Audit Logging</h1>
        <p className="text-slate-400 text-sm mt-1">Read-only immutable transaction logs of all administrator operations</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
          <RefreshCw size={28} className="animate-spin mb-2" /> Loading audit history...
        </div>
      ) : error ? (
        <div className="py-12 text-center text-red-400">{error}</div>
      ) : logs.length === 0 ? (
        <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
          No audit logs recorded.
        </div>
      ) : (
        <div className="overflow-x-auto bg-slate-900/20 border border-slate-800 rounded-2xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900/40 text-xs text-slate-400 uppercase tracking-widest border-b border-slate-800">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Administrator</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">IP Address</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {logs.map((log) => (
                <tr key={log.logId} className="hover:bg-slate-900/20">
                  <td className="p-4 text-slate-450 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-4 text-slate-200">{log.administrator}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                      log.action.includes('BLOCK') ? 'bg-red-500/15 text-red-400' :
                      log.action.includes('UNBLOCK') ? 'bg-emerald-500/15 text-emerald-400' :
                      'bg-blue-500/15 text-blue-400'
                    }`}>
                      <Activity size={12} className="mr-1" /> {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 uppercase text-xs">{log.targetTable} (ID: {log.targetRecordId})</td>
                  <td className="p-4 text-slate-500 font-mono text-xs">{log.ipAddress || '127.0.0.1'}</td>
                  <td className="p-4 text-right text-slate-300 text-xs max-w-xs truncate">{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default AuditLogs;
