import React, { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { getAssignedRequests } from '../../services/staff.service';
import { formatDate } from '../../utils/helpers';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await getAssignedRequests({ limit: 100, status: 'COMPLETED' });
        const completedRequests = res.data.requests || [];
        // Filter out completed requests that have feedback reviews
        const filtered = completedRequests
          .filter(r => r.feedback)
          .map(r => ({
            id: r.id,
            title: r.title,
            studentName: r.student?.name,
            room: r.student?.roomNumber,
            block: r.student?.block?.name,
            createdAt: r.feedback.createdAt,
            rating: r.feedback.rating,
            comment: r.feedback.comment
          }));
        setFeedbacks(filtered);
      } catch (err) {
        console.error('Failed to load staff feedback reviews', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Reviews & Ratings</h2>
        <p className="text-xs font-semibold text-slate-400 mt-1">Feedback reviews left by student residents on your completed tasks</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader size="lg" />
        </div>
      ) : feedbacks.length === 0 ? (
        <EmptyState 
          title="No reviews yet" 
          description="You haven't received any feedback reviews from students yet."
          icon={Star}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbacks.map((fb) => (
            <div 
              key={fb.id} 
              className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-slate-200 transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Task: "{fb.title}"</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    Student: {fb.studentName} · Room {fb.room} · Block {fb.block}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-100">
                  {fb.rating}
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs font-medium text-slate-600 italic">
                  {fb.comment || "No written comments."}
                </p>
              </div>

              <p className="text-[9px] text-slate-400 font-semibold text-right">
                Reviewed: {formatDate(fb.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
