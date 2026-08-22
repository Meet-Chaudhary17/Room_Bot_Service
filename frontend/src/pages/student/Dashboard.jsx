import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { studentService } from '../../services/student.service.js';
import { motion } from 'framer-motion';
import { 
  ClipboardList, AlertTriangle, CheckCircle, Plus, Star, 
  Trash2, X, MessageSquare, AlertCircle, RefreshCw 
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  
  // Dashboard state
  const [stats, setStats] = useState({ activeRequests: 0, completedRequests: 0, activeComplaints: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  
  // Forms state
  const [requestForm, setRequestForm] = useState({ category_id: '1', title: '', description: '' });
  const [complaintForm, setComplaintForm] = useState({ category_id: '1', title: '', description: '', priority: 'NORMAL' });
  const [feedbackForm, setFeedbackForm] = useState({ requestId: '', staffId: '', rating: 5, comments: '' });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await studentService.getDashboard();
      if (res.success) {
        setStats({
          activeRequests: res.data.activeRequests,
          completedRequests: res.data.completedRequests,
          activeComplaints: res.data.activeComplaints
        });
        setRecentRequests(res.data.recentRequests || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const res = await studentService.createRequest({
        category_id: Number(requestForm.category_id),
        title: requestForm.title,
        description: requestForm.description,
        room_number: user?.roomNumber || 'N/A'
      });

      if (res.success) {
        setRequestModalOpen(false);
        setRequestForm({ category_id: '1', title: '', description: '' });
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to submit service request.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const res = await studentService.createComplaint({
        category_id: Number(complaintForm.category_id),
        title: complaintForm.title,
        description: complaintForm.description,
        priority: complaintForm.priority
      });

      if (res.success) {
        setComplaintModalOpen(false);
        setComplaintForm({ category_id: '1', title: '', description: '', priority: 'NORMAL' });
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to submit complaint.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      await studentService.cancelRequest(requestId);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request.');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const res = await studentService.submitFeedback({
        request_id: Number(feedbackForm.requestId),
        staff_id: Number(feedbackForm.staffId),
        rating: Number(feedbackForm.rating),
        comments: feedbackForm.comments
      });

      if (res.success) {
        setFeedbackModalOpen(false);
        setFeedbackForm({ requestId: '', staffId: '', rating: 5, comments: '' });
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-6 border border-slate-800 rounded-3xl backdrop-blur-md">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Hello, {user?.fullName}!</h1>
          <p className="text-slate-400 text-sm mt-1">Submit maintenance requests and track resolutions for room {user?.roomNumber}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setRequestModalOpen(true)}
            className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all duration-200"
          >
            <Plus size={16} className="mr-1.5" /> Request Service
          </button>
          <button
            onClick={() => setComplaintModalOpen(true)}
            className="flex items-center px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-semibold transition-all duration-200"
          >
            <AlertTriangle size={16} className="mr-1.5 text-amber-500" /> Lodge Complaint
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { title: 'Active Requests', val: stats.activeRequests, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: ClipboardList },
          { title: 'Completed Requests', val: stats.completedRequests, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle },
          { title: 'Open Complaints', val: stats.activeComplaints, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', icon: AlertTriangle }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`p-6 border rounded-2xl flex items-center justify-between ${stat.bg}`}>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stat.val}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-slate-900/50 ${stat.color}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent requests list */}
      <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Recent Requests</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center">
            <RefreshCw size={28} className="animate-spin mb-2" /> Loading recent requests...
          </div>
        ) : recentRequests.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No requests submitted. Click "Request Service" to start.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/40 text-xs text-slate-400 uppercase tracking-widest border-b border-slate-800">
                  <th className="p-4">Category</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {recentRequests.map((req) => (
                  <tr key={req.requestId} className="text-slate-300 hover:bg-slate-900/20">
                    <td className="p-4 font-semibold text-slate-200">{req.category.categoryName}</td>
                    <td className="p-4 max-w-xs truncate">{req.description}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                        req.requestStatus === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                        req.requestStatus === 'CANCELLED' ? 'bg-slate-800 text-slate-500' :
                        req.requestStatus === 'IN_PROGRESS' ? 'bg-orange-500/10 text-orange-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {req.requestStatus === 'PENDING' ? 'Pending Assignment' : req.requestStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {['PENDING', 'ASSIGNED'].includes(req.requestStatus) && (
                        <button
                          onClick={() => handleCancelRequest(req.requestId)}
                          className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                          title="Cancel Request"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      {req.requestStatus === 'COMPLETED' && !req.feedback && (
                        <button
                          onClick={() => {
                            setFeedbackForm({
                              requestId: req.requestId,
                              staffId: req.assignedStaffId,
                              rating: 5,
                              comments: ''
                            });
                            setFeedbackModalOpen(true);
                          }}
                          className="inline-flex items-center px-3 py-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 rounded-lg text-xs font-semibold transition-all duration-200"
                        >
                          <Star size={12} className="mr-1 fill-yellow-400/20 text-yellow-400" /> Rate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* -------------------- CREATE SERVICE REQUEST MODAL -------------------- */}
      {requestModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Create Service Request</h3>
              <button onClick={() => setRequestModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            {formError && (
              <div className="p-4 mx-6 mt-4 flex items-center bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                <AlertCircle size={16} className="mr-2 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">Category</label>
                <select
                  value={requestForm.category_id}
                  onChange={(e) => setRequestForm({ ...requestForm, category_id: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-blue-500/80 transition-colors text-sm"
                >
                  <option value="1">Cleaning</option>
                  <option value="2">Electrical Maintenance</option>
                  <option value="3">Plumbing</option>
                  <option value="4">AC Maintenance</option>
                  <option value="5">Furniture Repair</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">Problem Title</label>
                <input
                  type="text"
                  required
                  value={requestForm.title}
                  onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                  placeholder="E.g. Leak in bathroom tap"
                  className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 rounded-xl focus:outline-none focus:border-blue-500/80 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">Detailed Description</label>
                <textarea
                  required
                  rows={4}
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                  placeholder="Detail the issue (location, frequency, severity)..."
                  className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 rounded-xl focus:outline-none focus:border-blue-500/80 transition-colors text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center justify-center transition-all duration-200"
              >
                {formLoading ? <RefreshCw className="animate-spin mr-2" size={18} /> : null}
                Submit Request
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* -------------------- LODGE COMPLAINT MODAL -------------------- */}
      {complaintModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Lodge Complaint</h3>
              <button onClick={() => setComplaintModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="p-4 mx-6 mt-4 flex items-center bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                <AlertCircle size={16} className="mr-2 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateComplaint} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">Category</label>
                <select
                  value={complaintForm.category_id}
                  onChange={(e) => setComplaintForm({ ...complaintForm, category_id: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-blue-500/80 transition-colors text-sm"
                >
                  <option value="1">Electricity</option>
                  <option value="2">Water Supply</option>
                  <option value="3">Warden Misbehavior</option>
                  <option value="4">Cleanliness Issue</option>
                  <option value="5">Mess / Food Quality</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">Priority</label>
                <select
                  value={complaintForm.priority}
                  onChange={(e) => setComplaintForm({ ...complaintForm, priority: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-blue-500/80 transition-colors text-sm"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">Complaint Title</label>
                <input
                  type="text"
                  required
                  value={complaintForm.title}
                  onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })}
                  placeholder="E.g. Electricity disconnected since 4 hours"
                  className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 rounded-xl focus:outline-none focus:border-blue-500/80 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">Description</label>
                <textarea
                  required
                  rows={4}
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  placeholder="Detail the issue completely..."
                  className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 rounded-xl focus:outline-none focus:border-blue-500/80 transition-colors text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center justify-center transition-all duration-200"
              >
                {formLoading ? <RefreshCw className="animate-spin mr-2" size={18} /> : null}
                Lodge Complaint
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* -------------------- FEEDBACK STAR MODAL -------------------- */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Rate Service</h3>
              <button onClick={() => setFeedbackModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="p-4 mx-6 mt-4 flex items-center bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                <AlertCircle size={16} className="mr-2 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFeedbackSubmit} className="p-6 space-y-5">
              <div className="flex flex-col items-center">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Service Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                      className="p-1 text-slate-600 hover:text-yellow-400 transition-colors"
                    >
                      <Star
                        size={32}
                        className={star <= feedbackForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">Comments (Optional)</label>
                <textarea
                  rows={3}
                  value={feedbackForm.comments}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                  placeholder="Share details about the work done..."
                  className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 rounded-xl focus:outline-none focus:border-blue-500/80 transition-colors text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center justify-center transition-all duration-200"
              >
                {formLoading ? <RefreshCw className="animate-spin mr-2" size={18} /> : null}
                Submit Feedback
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;
