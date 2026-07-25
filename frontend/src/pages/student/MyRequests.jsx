import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, AlertCircle, MessageSquareWarning } from 'lucide-react';
import toast from 'react-hot-toast';
import { getRequestHistory } from '../../services/student.service';
import { formatDate, getStatusBadgeClass, getPriorityBadgeClass } from '../../utils/helpers';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

export default function MyRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search, Filter & Pagination states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search.trim()) params.search = search;
      if (status) params.status = status;

      const res = await getRequestHistory(params);
      setRequests(res.data.requests || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setHasNextPage(res.data.pagination?.hasNextPage || false);
      setHasPreviousPage(res.data.pagination?.hasPreviousPage || false);
    } catch (err) {
      setError(err.message || 'Failed to load request history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRequests();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">My Requests</h2>
          <p className="text-xs font-semibold text-slate-400 mt-1">Track and manage your submitted service requests</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/student/services')}>
          New Request
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:max-w-md">
          <Input
            id="search"
            type="text"
            placeholder="Search by request title..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <div className="flex gap-3 w-full md:w-auto items-center justify-end">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Filter className="w-4 h-4 text-slate-400" />
            Filter Status
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="OTP_PENDING">OTP Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* List content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader size="lg" />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState 
          title="No requests found" 
          description="We couldn't find any service requests matching your search or filters."
          icon={MessageSquareWarning}
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div 
              key={req.id} 
              className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-slate-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Left Column: Details */}
              <div className="space-y-2 flex-1 min-w-0">
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
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">{req.description}</p>
                
                <p className="text-[10px] text-slate-400 font-medium">
                  Submitted: {formatDate(req.createdAt)} · Staff Assigned: <span className="font-semibold text-slate-600">{req.staff?.name || 'Unassigned'}</span>
                </p>
              </div>

              {/* Right Column: Status & Actions */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusBadgeClass(req.status)}`}>
                  {req.status.replace('_', ' ')}
                </span>

                {/* Submit Feedback Button (for completed requests without feedback) */}
                {req.status === 'COMPLETED' && !req.feedback && (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => navigate('/student/feedback', { state: { requestId: req.id, title: req.title } })}
                  >
                    Submit Feedback
                  </Button>
                )}
                {req.feedback && (
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    Rated: {req.feedback.rating} ★
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
          />
        </div>
      )}
    </div>
  );
}