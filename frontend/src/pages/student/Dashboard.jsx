import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, 
  History, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  MessageSquare, 
  Star,
  Sparkles,
  Wind,
  Lightbulb,
  Droplet,
  FolderOpen,
  Activity
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { getRequestHistory } from '../../services/student.service';
import { getComplaints } from '../../services/student.service';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [complaintCount, setComplaintCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dashboard Aggregates
  const [activeCount, setActiveCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [avgRating, setAvgRating] = useState('N/A');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const reqRes = await getRequestHistory({ limit: 10 });
        const reqs = reqRes.data.requests || [];
        setRequests(reqs);

        // Calculate aggregates
        const active = reqs.filter(r => ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'OTP_PENDING'].includes(r.status)).length;
        const completed = reqs.filter(r => r.status === 'COMPLETED').length;
        
        setActiveCount(active);
        setCompletedCount(completed);

        // Calculate dynamic average rating given
        const ratedRequests = reqs.filter(r => r.feedback);
        if (ratedRequests.length > 0) {
          const sum = ratedRequests.reduce((acc, r) => acc + r.feedback.rating, 0);
          setAvgRating((sum / ratedRequests.length).toFixed(1));
        } else {
          setAvgRating('N/A');
        }

        // Fetch complaints to get count
        const compRes = await getComplaints();
        setComplaintCount(compRes.data.length || 0);
      } catch (err) {
        setError('Failed to load dashboard metrics. Please reload.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const serviceCategories = [
    { name: 'Cleaning', icon: Sparkles, color: 'bg-blue-50 text-blue-600', role: 'CLEANING' },
    { name: 'AC Maintenance', icon: Wind, color: 'bg-cyan-50 text-cyan-600', role: 'GENERAL' },
    { name: 'Electrical', icon: Lightbulb, color: 'bg-amber-50 text-amber-600', role: 'ELECTRICIAN' },
    { name: 'Plumbing', icon: Droplet, color: 'bg-blue-50 text-indigo-600', role: 'PLUMBER' },
    { name: 'Furniture', icon: FolderOpen, color: 'bg-purple-50 text-purple-600', role: 'CARPENTER' },
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner Card */}
      <div className="p-6 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl text-white shadow-xl shadow-indigo-100 flex flex-col justify-between">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-100">Good morning</p>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Kwame'} 👋
          </h1>
          <p className="text-xs text-indigo-100 font-semibold max-w-sm leading-normal">
            You have {activeCount} active requests and {completedCount} completed.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/student/services')}
            className="bg-white text-indigo-600 border-white hover:bg-indigo-50 font-bold"
          >
            <Plus className="w-4 h-4" />
            New Request
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/student/history')}
            className="text-white hover:bg-white/10 font-bold border border-white/20"
          >
            <History className="w-4 h-4" />
            View History
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Requests */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Requests</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{activeCount}</p>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">Currently in progress</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Completed */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{completedCount}</p>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">All time</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Complaints */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Complaints</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{complaintCount}</p>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">Submitted</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Average Rating */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg. Rating Given</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{avgRating}</p>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">Out of 5.0</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Star className="w-5 h-5 fill-purple-600" />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Requests & Request a Service */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Requests List */}
        <div className="lg:col-span-2 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Recent Requests</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Your latest service requests</p>
            </div>
            <Link to="/student/history">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {requests.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold py-4 text-center">No service requests created yet.</p>
            ) : (
              requests.slice(0, 3).map((req) => (
                <div 
                  key={req.id} 
                  className="p-4 border border-slate-100 rounded-xl hover:border-slate-200 transition-all flex items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 text-[9px] font-bold text-slate-500 bg-slate-100 rounded-full">
                        {req.id.slice(-6).toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 text-[9px] font-bold text-indigo-600 bg-indigo-50 rounded-full">
                        {req.serviceType?.name || 'Service'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 truncate">{req.title}</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {formatDate(req.createdAt)} · {req.staff?.name || 'Unassigned'}
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${getStatusBadgeClass(req.status)}`}>
                    {req.status.replace('_', ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Request a Service Selector Grid */}
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Request a Service</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Choose a service category to get started</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {serviceCategories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => navigate('/student/services', { state: { category: cat.name } })}
                className={`
                  w-full p-4 rounded-xl flex items-center gap-4 transition-all duration-200 text-left hover:scale-[1.01] active:scale-100
                  ${cat.color} bg-opacity-70 hover:bg-opacity-90
                `}
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <cat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{cat.name}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Automated allocation to {cat.role.toLowerCase()} staff</p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}