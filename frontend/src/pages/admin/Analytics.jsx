import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service.js';
import { RefreshCw, BarChart2, TrendingUp, Clock, Star, AlertCircle } from 'lucide-react';

export const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAnalytics();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch platform analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
        <RefreshCw size={28} className="animate-spin mb-2" /> Loading platform analytics...
      </div>
    );
  }

  if (error) {
    return <div className="py-12 text-center text-red-400">{error}</div>;
  }

  const completionRate = data.totalRequests > 0 ? ((data.completedRequests / data.totalRequests) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">System Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Review operational speed, task completion rates, and average feedback</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core performance values */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-slate-200 font-bold text-lg flex items-center"><TrendingUp size={20} className="text-blue-400 mr-2" /> Completion Insights</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="block text-slate-500 text-xs uppercase tracking-wider font-semibold">Total Requests</span>
              <span className="text-3xl font-bold text-white mt-1 block">{data.totalRequests}</span>
            </div>
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="block text-slate-500 text-xs uppercase tracking-wider font-semibold">Completion Rate</span>
              <span className="text-3xl font-bold text-emerald-400 mt-1 block">{completionRate}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Completed ({data.completedRequests})</span>
              <span>Cancelled ({data.cancelledRequests})</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden flex">
              <div style={{ width: `${completionRate}%` }} className="bg-emerald-500 h-full" />
              <div style={{ width: `${data.totalRequests > 0 ? (data.cancelledRequests / data.totalRequests) * 100 : 0}%` }} className="bg-red-500 h-full" />
            </div>
          </div>
        </div>

        {/* Speed metrics */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-slate-200 font-bold text-lg flex items-center"><Clock size={20} className="text-orange-400 mr-2" /> Resolution Velocity</h3>
            <p className="text-slate-400 text-sm mt-1">Average time spent between staff assignment and student OTP completion verification.</p>
          </div>
          
          <div className="p-6 bg-slate-950/60 border border-slate-850 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold block">Average Resolution Speed</span>
              <span className="text-3xl font-bold text-slate-200 mt-1 block">{data.averageResolutionTime}</span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400">
              <Clock size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid bottom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-slate-200 font-bold text-lg flex items-center"><Star size={20} className="text-yellow-400 mr-2" /> Quality of Service</h3>
          
          <div className="p-6 bg-slate-950/60 border border-slate-850 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold block">Average Staff Performance</span>
              <span className="text-3xl font-bold text-yellow-400 mt-1.5 block">{data.averageStaffRating} / 5.0</span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-400">
              <Star size={32} className="fill-yellow-400/20" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-slate-200 font-bold text-lg flex items-center"><TrendingUp size={20} className="text-rose-400 mr-2" /> Platform Grievances</h3>
          
          <div className="p-6 bg-slate-950/60 border border-slate-850 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold block">Total Logged Complaints</span>
              <span className="text-3xl font-bold text-rose-450 mt-1.5 block">{data.totalComplaints} Complaints</span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400">
              <AlertCircle size={32} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Analytics;
