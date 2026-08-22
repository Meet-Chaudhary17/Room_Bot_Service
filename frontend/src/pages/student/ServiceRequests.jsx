import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/student.service.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { RefreshCw, Star, Trash2, Calendar, ClipboardCheck } from 'lucide-react';

export const ServiceRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await studentService.listRequests();
      if (res.success) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      await studentService.cancelRequest(requestId);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request.');
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (statusFilter === 'ALL') return true;
    return req.requestStatus === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Service Requests</h1>
          <p className="text-slate-400 text-sm mt-1">Track and manage all submitted maintenance requests</p>
        </div>

        {/* Filter controls */}
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-all duration-200 ${
                statusFilter === status
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {status === 'ALL' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
          <RefreshCw size={28} className="animate-spin mb-2" /> Loading service requests...
        </div>
      ) : error ? (
        <div className="py-12 text-center text-red-400">{error}</div>
      ) : filteredRequests.length === 0 ? (
        <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
          No matching service requests found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.map((req) => (
            <div key={req.id} className="bg-slate-900/20 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-slate-200 text-lg">{req.category.categoryName}</h3>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    req.requestStatus === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                    req.requestStatus === 'CANCELLED' ? 'bg-slate-800 text-slate-500' :
                    req.requestStatus === 'IN_PROGRESS' ? 'bg-orange-500/10 text-orange-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    {req.requestStatus === 'PENDING' ? 'Pending Assignment' : req.requestStatus.replace('_', ' ')}
                  </span>
                </div>
                
                <p className="text-slate-400 text-sm max-w-2xl">{req.description}</p>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 pt-1">
                  <span className="flex items-center"><Calendar size={14} className="mr-1.5 text-slate-600" /> Created: {new Date(req.createdAt).toLocaleDateString()}</span>
                  {req.assignedStaff && (
                    <span className="flex items-center"><ClipboardCheck size={14} className="mr-1.5 text-slate-600" /> Staff: {req.assignedStaff.fullName}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 shrink-0">
                {['PENDING', 'ASSIGNED'].includes(req.requestStatus) && (
                  <button
                    onClick={() => handleCancelRequest(req.id)}
                    className="flex items-center px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-xl text-sm font-semibold transition-all duration-200"
                  >
                    <Trash2 size={16} className="mr-1.5" /> Cancel Request
                  </button>
                )}
                {req.requestStatus === 'COMPLETED' && req.feedback && (
                  <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3.5 py-2 rounded-xl text-sm font-semibold">
                    <Star size={16} className="fill-yellow-400/20" /> {req.feedback.rating} / 5
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ServiceRequests;
