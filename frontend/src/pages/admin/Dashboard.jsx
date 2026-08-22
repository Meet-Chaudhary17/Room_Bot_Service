import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  FileText, 
  CheckSquare,
  ArrowUpRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getDashboardStats } from '../../services/admin.service';
import Loader from '../../components/common/Loader';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res.data);
      } catch (err) {
        toast.error('Failed to load admin dashboard overview statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  // Fallbacks if data is empty
  const totalStudents = stats?.totalStudents || 0;
  const activeStaff = stats?.activeStaff || 0;
  const requestsThisWeek = stats?.totalRequests || 0;
  
  // Calculate completion percentage
  const completed = stats?.requestStatusCounts?.COMPLETED || 0;
  const total = stats?.totalRequests || 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Students</p>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800">{totalStudents}</p>
            <p className="text-[9px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              ▲ 3.2% from last week
            </p>
          </div>
        </div>

        {/* Active Staff */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Staff</p>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800">{activeStaff}</p>
            <p className="text-[9px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              ▲ 0% from last week
            </p>
          </div>
        </div>

        {/* Requests This Week */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Requests</p>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800">{requestsThisWeek}</p>
            <p className="text-[9px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              ▲ 12% from last week
            </p>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completion Rate</p>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800">{completionRate}%</p>
            <p className="text-[9px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              ▲ 2.1% from last week
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Volume Spline Chart & Category counts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Request Volume Spline SVG Chart */}
        <div className="lg:col-span-2 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Request Volume</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Last 7 days volume report</p>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 rounded-lg">
              This Week
            </span>
          </div>

          {/* SVG Spline Chart representation */}
          <div className="pt-4 h-64 relative">
            <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0"/>
                </linearGradient>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="50" x2="600" y2="50" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="100" x2="600" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="150" x2="600" y2="150" stroke="#f1f5f9" strokeWidth="1" />

              {/* Spline Area Fills */}
              <path d="M 0 140 C 100 80, 200 60, 300 110 C 400 30, 500 50, 600 140 L 600 200 L 0 200 Z" fill="url(#blueGrad)" />
              <path d="M 0 160 C 100 110, 200 90, 300 130 C 400 60, 500 70, 600 160 L 600 200 L 0 200 Z" fill="url(#greenGrad)" />

              {/* Spline Outline Curves */}
              <path d="M 0 140 C 100 80, 200 60, 300 110 C 400 30, 500 50, 600 140" fill="none" stroke="#4f46e5" strokeWidth="3" />
              <path d="M 0 160 C 100 110, 200 90, 300 130 C 400 60, 500 70, 600 160" fill="none" stroke="#10b981" strokeWidth="3" />
            </svg>
            
            {/* Legend Indicators */}
            <div className="flex items-center gap-4 mt-4 text-[10px] font-bold text-slate-500 justify-center">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                Requests
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Completed
              </span>
            </div>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">By Service Category</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Category wise task counts</p>
          </div>

          <div className="space-y-3 pt-2">
            {stats?.requestsByServiceType?.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold py-8 text-center">No categories stats loaded.</p>
            ) : (
              stats?.requestsByServiceType?.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0">
                  <span className="text-xs font-bold text-slate-600">{cat.name}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 rounded-full">
                    {cat.count} requests
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}