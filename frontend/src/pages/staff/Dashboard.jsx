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
  getRequestOccupants,
  generateCompletionOtp,
  verifyCompletionOtp
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
  const [startingRequestId, setStartingRequestId] = useState(null);

  // OTP Modal states
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpStep, setOtpStep] = useState(1);
  const [occupantsLoading, setOccupantsLoading] = useState(false);
  const [occupants, setOccupants] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');

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
    if (startingRequestId) return;
    setStartingRequestId(requestId);
    try {
      await startRequestWork(requestId);
      toast.success('Work started on service request!');
      loadDashboardData();
    } catch (err) {
      toast.error(err.message || 'Failed to start request.');
    } finally {
      setStartingRequestId(null);
    }
  };

  const handleStartCompletion = async (requestId) => {
    setSelectedRequestId(requestId);
    setOtpModalOpen(true);
    setOtpStep(1);
    setOccupantsLoading(true);
    setOccupants([]);
    setSelectedStudentId('');
    setOtpCode('');
    setOtpError('');
    try {
      const res = await getRequestOccupants(requestId);
      setOccupants(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedStudentId(res.data[0].id);
      }
    } catch (err) {
      toast.error('Failed to fetch room occupants.');
    } finally {
      setOccupantsLoading(false);
    }
  };

  const handleSendCompletionOtp = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      toast.error('Please select an occupant to receive the OTP.');
      return;
    }
    setActionLoading(true);
    try {
      await generateCompletionOtp(selectedRequestId, selectedStudentId);
      toast.success('Completion OTP dispatched successfully to selected occupant!');
      setOtpStep(2);
    } catch (err) {
      toast.error(err.message || 'Failed to dispatch completion OTP.');
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
      await verifyCompletionOtp(selectedRequestId, selectedStudentId, otpCode);
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
                      ID: {String(req.id).toUpperCase()}
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
                    {req.status === 'ASSIGNED' ? 'Pending' : req.status.replace('_', ' ')}
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
                      loading={Boolean(startingRequestId && startingRequestId === req.id)}
                      disabled={Boolean(startingRequestId && startingRequestId !== req.id)}
                      icon={Play}
                    >
                      Start Work
                    </Button>
                  )}

                  {req.status === 'IN_PROGRESS' && (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => handleStartCompletion(req.id)}
                      disabled={startingRequestId !== null}
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
        {(() => {
          const currentReq = requests.find(r => r.id === selectedRequestId);
          return (
            <>
              {currentReq && (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-4 space-y-1.5 text-xs font-semibold text-slate-500">
                  <h4 className="text-xs font-extrabold text-slate-800">Request: "{currentReq.title}"</h4>
                  <div className="grid grid-cols-2 gap-2 mt-1.5 text-[10px]">
                    <div>
                      <p className="text-slate-400">Block</p>
                      <p className="font-extrabold text-slate-700">{currentReq.student?.block?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Room</p>
                      <p className="font-extrabold text-slate-700">{currentReq.roomNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Requester</p>
                      <p className="font-extrabold text-slate-700">{currentReq.student?.name || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {otpStep === 1 ? (
                <form onSubmit={handleSendCompletionOtp} className="space-y-4">
                  <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                    Select the occupant currently present in the room to receive the completion verification code:
                  </p>

                  {occupantsLoading ? (
                    <div className="py-6 text-center text-slate-400 flex items-center justify-center">
                      <Loader size="sm" />
                      <span className="ml-2 text-xs">Loading occupants...</span>
                    </div>
                  ) : occupants.length === 0 ? (
                    <div className="py-4 text-center text-slate-500 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold">
                      No active roommates registered for this block and room.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {occupants.map((occ) => (
                        <label
                          key={occ.id}
                          className={`flex items-start p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                            selectedStudentId === occ.id
                              ? 'bg-indigo-50/50 border-indigo-500 text-indigo-900'
                              : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name="occupant"
                            value={occ.id}
                            checked={selectedStudentId === occ.id}
                            onChange={() => setSelectedStudentId(occ.id)}
                            className="mt-1 mr-3 accent-indigo-600"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{occ.fullName}</p>
                            <p className="text-[10px] text-slate-500 truncate">{occ.email}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button 
                      variant="outline" 
                      onClick={() => { setOtpModalOpen(false); setOtpCode(''); setOtpError(''); }} 
                      disabled={actionLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      loading={actionLoading}
                      disabled={occupantsLoading || !selectedStudentId}
                    >
                      Send OTP
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyCompletionSubmit} className="space-y-4">
                  <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                    Please input the 6-digit task completion verification OTP code sent to the student's email inbox:
                    <span className="block mt-1 font-bold text-slate-700 truncate">
                      {occupants.find(o => o.id === selectedStudentId)?.email}
                    </span>
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
                      onClick={() => { setOtpStep(1); setOtpCode(''); setOtpError(''); }} 
                      disabled={actionLoading}
                    >
                      Back
                    </Button>
                    <Button type="submit" loading={actionLoading}>
                      Verify & Complete Task
                    </Button>
                  </div>
                </form>
              )}
            </>
          );
        })()}
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
                ID: {String(viewedRequest.id).toUpperCase()}
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