import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  Star,
  Play,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  getDashboard, 
  getAssignedRequests, 
  startRequestWork, 
  requestCompletion, 
  verifyCompletion 
} from '../../services/staff.service';
import { formatDate, getStatusBadgeClass, getPriorityBadgeClass } from '../../utils/helpers';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ pending: 0, inProgress: 0, completedToday: 0, rating: 5.0 });
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PENDING, IN_PROGRESS
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // OTP Modal states
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');

  // Request Details Modal states
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [viewedRequest, setViewedRequest] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const dashRes = await getDashboard();
      setMetrics({
        pending: dashRes.data.totalAssigned || 0, // wait! In staff stats, totalAssigned represents pending tasks
        inProgress: dashRes.data.inProgress || 0,
        completedToday: dashRes.data.completed || 0,
        rating: dashRes.data.ratingAverage || 5.0
      });

      const reqRes = await getAssignedRequests({ limit: 20 });
      const reqs = reqRes.data.requests || [];
      setRequests(reqs);
      applyFilter(reqs, activeTab);
    } catch (err) {
      toast.error('Failed to load staff dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const applyFilter = (list, tab) => {
    if (tab === 'PENDING') {
      setFilteredRequests(list.filter(r => r.status === 'ASSIGNED'));
    } else if (tab === 'IN_PROGRESS') {
      setFilteredRequests(list.filter(r => r.status === 'IN_PROGRESS' || r.status === 'OTP_PENDING'));
    } else {
      setFilteredRequests(list);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    applyFilter(requests, tab);
  };

  const handleStartWork = async (requestId) => {
    setActionLoading(true);
    try {
      await startRequestWork(requestId);
      toast.success('Work started on service request!');
      loadDashboardData();
    } catch (err) {
      toast.error(err.message || 'Failed to start request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestCompletion = async (requestId) => {
    setActionLoading(true);
    try {
      await requestCompletion(requestId);
      toast.success('Completion OTP dispatched successfully to student!');
      loadDashboardData();
    } catch (err) {
      toast.error(err.message || 'Failed to request completion.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyCompletionSubmit = async (e) => {
    e.preventDefault();
    setOtpError('');

    if (!otpCode.trim() || otpCode.length !== 6) {
      setOtpError('Please enter a 6-digit OTP code');
      return;
    }

    setActionLoading(true);
    try {
      await verifyCompletion(selectedRequestId, otpCode);
      toast.success('OTP verified! Service request marked as COMPLETED.');
      setOtpModalOpen(false);
      setOtpCode('');
      loadDashboardData();
    } catch (err) {
      toast.error(err.message || 'OTP verification failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{metrics.pending}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50/60 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* In Progress */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{metrics.inProgress}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>

        {/* Completed */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed Today</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{metrics.completedToday}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Avg. Rating */}
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg. Rating</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{Number(metrics.rating).toFixed(1)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Star className="w-5 h-5 fill-amber-500" />
          </div>
        </div>
      </div>

      {/* Requests Queue List */}
      <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
        {/* Filter Tabs */}
        <div className="flex border-b border-slate-100 pb-2 gap-4">
          {[
            { id: 'ALL', label: 'All', count: requests.length },
            { id: 'PENDING', label: 'Pending', count: requests.filter(r => r.status === 'ASSIGNED').length },
            { id: 'IN_PROGRESS', label: 'In Progress', count: requests.filter(r => r.status === 'IN_PROGRESS' || r.status === 'OTP_PENDING').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                pb-2 text-xs font-bold transition-all relative flex items-center gap-1.5 focus:outline-none
                ${activeTab === tab.id 
                  ? 'text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600' 
                  : 'text-slate-400 hover:text-slate-600'}
              `}
            >
              {tab.label}
              <span className={`
                px-1.5 py-0.5 text-[9px] font-bold rounded-full
                ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}
              `}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Requests Logs */}
        <div className="space-y-4 pt-2">
          {filteredRequests.length === 0 ? (
            <EmptyState 
              title="No assigned requests" 
              description="There are no active requests in this queue tab."
              icon={ClipboardList}
            />
          ) : (
            filteredRequests.map((req) => (
              <div 
                key={req.id}
                className="p-5 border border-slate-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 text-[9px] font-bold text-slate-500 bg-slate-100 rounded-full border border-slate-200">
                      ID: {req.id.slice(-6).toUpperCase()}
                    </span>
                    <span className="px-2.5 py-0.5 text-[9px] font-bold text-indigo-600 bg-indigo-50 rounded-full border border-indigo-100">
                      {req.serviceType?.name || 'Service'}
                    </span>
                    <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full border ${getPriorityBadgeClass(req.priority)}`}>
                      {req.priority === 3 ? 'High' : req.priority === 2 ? 'Medium' : 'Low'} Priority
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 leading-snug">{req.title}</h4>
                  <p className="text-xs font-semibold text-slate-400 leading-relaxed truncate">{req.description}</p>
                  
                  <p className="text-[10px] text-slate-400 font-medium">
                    Room {req.student?.roomNumber || 'N/A'} · Block {req.student?.block?.name || 'N/A'} · Student: <span className="font-bold text-slate-600">{req.student?.name}</span>
                  </p>
                </div>

                {/* Status Trigger Action Buttons */}
                <div className="flex items-center justify-end gap-3 min-w-[140px]">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusBadgeClass(req.status)}`}>
                    {req.status.replace('_', ' ')}
                  </span>

                  <button 
                    onClick={() => { setViewedRequest(req); setDetailsModalOpen(true); }}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl border border-slate-100 transition-all flex items-center justify-center"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {req.status === 'ASSIGNED' && (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => handleStartWork(req.id)}
                      loading={actionLoading}
                      icon={Play}
                    >
                      Start Work
                    </Button>
                  )}

                  {req.status === 'IN_PROGRESS' && (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => handleRequestCompletion(req.id)}
                      loading={actionLoading}
                      icon={CheckCircle2}
                    >
                      Complete
                    </Button>
                  )}

                  {req.status === 'OTP_PENDING' && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => { setSelectedRequestId(req.id); setOtpModalOpen(true); }}
                      icon={Lock}
                    >
                      Verify OTP
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Verify Completion OTP Modal */}
      <Modal 
        isOpen={otpModalOpen} 
        onClose={() => { setOtpModalOpen(false); setOtpCode(''); setOtpError(''); }} 
        title="Verify Task Completion OTP"
      >
        <form onSubmit={handleVerifyCompletionSubmit} className="space-y-4">
          <p className="text-xs font-semibold text-slate-400 leading-relaxed">
            Please input the 6-digit task completion verification OTP code sent to the student's email inbox.
          </p>

          <Input
            id="otp"
            label="Completion OTP"
            type="text"
            icon={Lock}
            required
            maxLength={6}
            placeholder="Enter 6-digit OTP code"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            error={otpError}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button 
              variant="outline" 
              onClick={() => { setOtpModalOpen(false); setOtpCode(''); setOtpError(''); }} 
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={actionLoading}>
              Verify & Complete Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Request Details Modal */}
      <Modal 
        isOpen={detailsModalOpen} 
        onClose={() => { setDetailsModalOpen(false); setViewedRequest(null); }} 
        title="Request Details"
      >
        {viewedRequest && (
          <div className="space-y-5 pt-2">
            {/* Top row: ID, Status, Priority */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-100 rounded-full border border-slate-200">
                ID: {viewedRequest.id.slice(-6).toUpperCase()}
              </span>
              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadgeClass(viewedRequest.status)}`}>
                {viewedRequest.status.replace('_', ' ')}
              </span>
              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getPriorityBadgeClass(viewedRequest.priority)}`}>
                {viewedRequest.priority === 3 ? 'High' : viewedRequest.priority === 2 ? 'Medium' : 'Low'} Priority
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-800 leading-snug">{viewedRequest.title}</h3>
              <p className="text-xs font-semibold text-slate-400 leading-relaxed whitespace-pre-line">{viewedRequest.description}</p>
            </div>

            {/* Coordinates / Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Student */}
              <div className="p-4 bg-slate-50 border border-slate-100/50 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student</p>
                <p className="text-xs font-extrabold text-slate-700 mt-1">{viewedRequest.student?.name || 'N/A'}</p>
              </div>

              {/* Room */}
              <div className="p-4 bg-slate-50 border border-slate-100/50 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Room</p>
                <p className="text-xs font-extrabold text-slate-700 mt-1">
                  {viewedRequest.student?.roomNumber || 'N/A'} · Block {viewedRequest.student?.block?.name || viewedRequest.student?.blockId || 'N/A'}
                </p>
              </div>

              {/* Category */}
              <div className="p-4 bg-slate-50 border border-slate-100/50 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</p>
                <p className="text-xs font-extrabold text-slate-700 mt-1">{viewedRequest.serviceType?.name || 'N/A'}</p>
              </div>

              {/* Submitted */}
              <div className="p-4 bg-slate-50 border border-slate-100/50 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submitted</p>
                <p className="text-xs font-extrabold text-slate-700 mt-1">{formatDate(viewedRequest.createdAt)}</p>
              </div>
            </div>

            {/* Actions / Close Button */}
            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <Button onClick={() => { setDetailsModalOpen(false); setViewedRequest(null); }}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}