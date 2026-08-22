import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { adminService } from '../../services/admin.service.js';
import { motion } from 'framer-motion';
import { 
  Users, Construction, ClipboardList, CheckCircle, 
  AlertTriangle, Star, RefreshCw 
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    activeRequests: 0,
    completedRequests: 0,
    activeComplaints: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboard();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-slate-900/40 p-6 border border-slate-800 rounded-3xl backdrop-blur-md">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">System Administration</h1>
        <p className="text-slate-400 text-sm mt-1">Hello, {user?.fullName || 'Administrator'}. Monitor Platform activities and oversee operations.</p>
      </div>

      {/* Grid of stats */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
          <RefreshCw size={28} className="animate-spin mb-2" /> Loading platform statistics...
        </div>
      ) : error ? (
        <div className="py-12 text-center text-red-400">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Total Registered Students', val: stats.totalStudents, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: Users },
            { title: 'Total Registered Staff', val: stats.totalStaff, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20', icon: Construction },
            { title: 'Active Service Requests', val: stats.activeRequests, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', icon: ClipboardList },
            { title: 'Completed Service Requests', val: stats.completedRequests, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle },
            { title: 'Active Complaints Lodged', val: stats.activeComplaints, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', icon: AlertTriangle },
            { title: 'Platform Service Rating', val: stats.averageRating ? `${stats.averageRating} ★` : 'N/A', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', icon: Star }
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className={`p-6 border rounded-2xl flex items-center justify-between ${stat.bg}`}>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-white mt-1.5">{stat.val}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-slate-900/50 ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default Dashboard;
