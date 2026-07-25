import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Star, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { submitFeedback } from '../../services/student.service';
import Button from '../../components/common/Button';

export default function Feedback() {
  const navigate = useNavigate();
  const location = useLocation();

  const requestId = location.state?.requestId || '';
  const requestTitle = location.state?.title || '';

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // If page is accessed directly without state, redirect
  if (!requestId) {
    return <Navigate to="/student/history" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await submitFeedback(requestId, { rating, comment });
      toast.success(response.message || 'Feedback submitted successfully! Thank you.');
      navigate('/student/history');
    } catch (err) {
      toast.error(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 border border-slate-100 rounded-3xl shadow-sm space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold text-slate-800">Rate Service Quality</h2>
        <p className="text-xs font-semibold text-slate-400">Share your experience with request:</p>
        <p className="text-xs font-bold text-indigo-600 truncate max-w-xs mx-auto">"{requestTitle}"</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating Select Panel */}
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Overall Rating</p>
          <div className="flex items-center gap-1.5 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  className={`
                    w-10 h-10 transition-all duration-100
                    ${(hoverRating || rating) >= star 
                      ? 'fill-amber-400 text-amber-400' 
                      : 'text-slate-200'}
                  `}
                />
              </button>
            ))}
          </div>
          <p className="text-xs font-bold text-amber-600 mt-2">
            {rating === 5 ? 'Excellent!' : rating === 4 ? 'Very Good' : rating === 3 ? 'Satisfactory' : rating === 2 ? 'Needs Improvement' : 'Unacceptable'}
          </p>
        </div>

        {/* Comment textarea */}
        <div className="flex flex-col gap-1.5 w-full">
          <label htmlFor="comment" className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            Comments (Optional)
          </label>
          <textarea
            id="comment"
            rows={3}
            placeholder="Add comments on promptness, cleanliness, or technician behavior..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={() => navigate('/student/history')} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Submit Review
          </Button>
        </div>
      </form>
    </div>
  );
}