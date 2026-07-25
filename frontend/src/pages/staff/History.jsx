import React, { useState, useEffect } from 'react';
import { History, ClipboardList } from 'lucide-react';
import { getAssignedRequests } from '../../services/staff.service';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

export default function HistoryPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await getAssignedRequests({ page, limit, status: 'COMPLETED' });
        setRequests(res.data.requests || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setHasNextPage(res.data.pagination?.hasNextPage || false);
        setHasPreviousPage(res.data.pagination?.hasPreviousPage || false);
      } catch (err) {
        console.error('Failed to load completed task history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Work History</h2>
        <p className="text-xs font-semibold text-slate-400 mt-1">Review all your completed service requests</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader size="lg" />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState 
          title="No completed requests" 
          description="You haven't marked any service requests as completed yet."
          icon={ClipboardList}
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div 
              key={req.id} 
              className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[9px] font-bold text-slate-500 bg-slate-100 rounded-full border border-slate-200">
                    ID: {req.id.slice(-6).toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-bold text-indigo-600 bg-indigo-50 rounded-full border border-indigo-100">
                    {req.serviceType?.name || 'Service'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 truncate">{req.title}</h4>
                <p className="text-xs font-semibold text-slate-400 truncate">{req.description}</p>
                <p className="text-[10px] text-slate-400 font-medium">
                  Completed: {formatDate(req.completedAt || req.updatedAt)} · Student: <span className="font-bold text-slate-600">{req.student?.name}</span>
                </p>
              </div>

              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${getStatusBadgeClass(req.status)}`}>
                {req.status}
              </span>
            </div>
          ))}

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