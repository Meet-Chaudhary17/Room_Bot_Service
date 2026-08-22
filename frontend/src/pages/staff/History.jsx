import React, { useState, useEffect } from 'react';
import { staffService } from '../../services/staff.service.js';
import { RefreshCw, Star, Calendar, ClipboardCheck } from 'lucide-react';

export const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await staffService.getHistory();
      if (res.success) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch work history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Work History</h1>
        <p className="text-slate-400 text-sm mt-1">Review all completed requests and student feedback</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
          <RefreshCw size={28} className="animate-spin mb-2" /> Loading work history...
        </div>
      ) : error ? (
        <div className="py-12 text-center text-red-400">{error}</div>
      ) : history.length === 0 ? (
        <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
          No completed work available.
        </div>
      ) : (
        <div className="overflow-x-auto bg-slate-900/20 border border-slate-800 rounded-2xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900/40 text-xs text-slate-400 uppercase tracking-widest border-b border-slate-800">
                <th className="p-4">Request ID</th>
                <th className="p-4">Service Type</th>
                <th className="p-4">Completed On</th>
                <th className="p-4">Feedback Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {history.map((req) => (
                <tr key={req.requestId} className="hover:bg-slate-900/20">
                  <td className="p-4 font-semibold text-slate-400">#SR-{req.requestId}</td>
                  <td className="p-4 text-slate-200">{req.serviceType}</td>
                  <td className="p-4">{req.completedOn}</td>
                  <td className="p-4">
                    {req.rating !== null ? (
                      <span className="flex items-center text-yellow-400 font-semibold gap-1">
                        <Star size={14} className="fill-yellow-400" /> {req.rating} / 5
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">No rating provided</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default History;
