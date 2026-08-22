import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/student.service.js';
import { RefreshCw, Calendar, Shield, Info } from 'lucide-react';

export const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await studentService.listComplaints();
      if (res.success) {
        setComplaints(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Lodge & Track Complaints</h1>
        <p className="text-slate-400 text-sm mt-1">Monitor resolutions and review warden feedback</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
          <RefreshCw size={28} className="animate-spin mb-2" /> Loading complaints history...
        </div>
      ) : error ? (
        <div className="py-12 text-center text-red-400">{error}</div>
      ) : complaints.length === 0 ? (
        <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
          No complaints logged.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {complaints.map((comp) => (
            <div key={comp.id} className="bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-slate-200 text-lg">{comp.category.categoryName}</h3>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    comp.complaintStatus === 'RESOLVED' || comp.complaintStatus === 'CLOSED' ? 'bg-emerald-500/10 text-emerald-400' :
                    comp.complaintStatus === 'UNDER_REVIEW' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {comp.complaintStatus.replace('_', ' ')}
                  </span>
                </div>
                
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  comp.priority === 'HIGH' ? 'bg-red-500/10 text-red-400' :
                  comp.priority === 'NORMAL' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  Priority: {comp.priority}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-slate-300 font-medium text-sm">Title: {comp.title}</h4>
                <p className="text-slate-400 text-sm">{comp.description}</p>
              </div>

              {comp.resolutionNotes && (
                <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl flex items-start text-sm">
                  <Info size={16} className="text-blue-400 mr-2.5 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-blue-400">Resolution Notes</h5>
                    <p className="text-slate-300 mt-1">{comp.resolutionNotes}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 border-t border-slate-800/50 pt-3">
                <span className="flex items-center"><Calendar size={14} className="mr-1.5 text-slate-600" /> Logged: {new Date(comp.createdAt).toLocaleDateString()}</span>
                {comp.resolvedAt && (
                  <span className="flex items-center"><Shield size={14} className="mr-1.5 text-slate-600" /> Resolved: {new Date(comp.resolvedAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Complaints;
