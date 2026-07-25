import React, { useState, useEffect } from 'react';
import { Star, MessageSquareWarning, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { getFeedbacks } from '../../services/admin.service';
import { formatDate } from '../../utils/helpers';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [ratingFilter, setRatingFilter] = useState('');

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      try {
        const params = { page, limit };
        if (ratingFilter) params.rating = ratingFilter;
        
        const res = await getFeedbacks(params);
        setFeedbacks(res.data.feedbacks || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      } catch (err) {
        toast.error('Failed to load feedback logs.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, [page, ratingFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Feedback Reviews</h2>
          <p className="text-xs font-semibold text-slate-400 mt-1">Monitor quality controls and student ratings reviews logs</p>
        </div>

        <div className="flex gap-3 items-center justify-end">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Filter className="w-4 h-4 text-slate-400" />
            Filter Stars
          </div>
          <select
            value={ratingFilter}
            onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
            className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* List content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader size="lg" />
        </div>
      ) : feedbacks.length === 0 ? (
        <EmptyState 
          title="No feedback logs" 
          description="There are currently no reviews submitted by students."
          icon={Star}
        />
      ) : (
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-semibold text-slate-500">
              <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Technician Assigned</th>
                  <th className="px-6 py-4">Request / Task Details</th>
                  <th className="px-6 py-4">Student Rating</th>
                  <th className="px-6 py-4">Review Comments</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {feedbacks.map((fb) => (
                  <tr key={fb.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-800">{fb.request?.student?.name}</td>
                    <td className="px-6 py-4 font-bold text-indigo-600">{fb.request?.staff?.name || 'Unassigned'}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 truncate max-w-xs">{fb.request?.title}</div>
                      <div className="text-[10px] text-slate-400 font-medium">Category: {fb.request?.serviceType?.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                        {fb.rating}
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate font-medium text-slate-500">
                      {fb.comment || <span className="text-slate-300 italic">No comments</span>}
                    </td>
                    <td className="px-6 py-4">{formatDate(fb.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            hasNextPage={false} // wait! Feedbacks use simple offset pagination, no next check needed
            hasPreviousPage={false}
          />
        </div>
      )}
    </div>
  );
}