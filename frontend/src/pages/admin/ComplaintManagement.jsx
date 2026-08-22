import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service.js';
import { RefreshCw, Search, ShieldCheck, X, AlertCircle, Info, MessageSquare } from 'lucide-react';

export const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [blockFilter, setBlockFilter] = useState('');

  // Resolve Modal State
  const [activeComp, setActiveComp] = useState(null);
  const [resolveStatus, setResolveStatus] = useState('Resolved'); // Under Review, Resolved, Closed
  const [notes, setNotes] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await adminService.listComplaints({
        status: statusFilter || undefined,
        block: blockFilter || undefined
      });
      if (res.success) {
        setComplaints(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch platform complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, blockFilter]);

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      await adminService.resolveComplaint(activeComp.complaintId, resolveStatus, notes);
      setActiveComp(null);
      setNotes('');
      fetchComplaints();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to update complaint status.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Complaint Management</h1>
        <p className="text-slate-400 text-sm mt-1">Review student grievances and record formal resolutions</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/20 p-4 border border-slate-800 rounded-xl">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Hostel Block</label>
          <select
            value={blockFilter}
            onChange={(e) => setBlockFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
          >
            <option value="">All Blocks</option>
            <option value="A Block">Block A</option>
            <option value="B Block">Block B</option>
            <option value="C Block">Block C</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
          <RefreshCw size={28} className="animate-spin mb-2" /> Loading platform complaints...
        </div>
      ) : error ? (
        <div className="py-12 text-center text-red-400">{error}</div>
      ) : complaints.length === 0 ? (
        <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
          No complaints logged matching the filter criteria.
        </div>
      ) : (
        <div className="overflow-x-auto bg-slate-900/20 border border-slate-800 rounded-2xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900/40 text-xs text-slate-400 uppercase tracking-widest border-b border-slate-800">
                <th className="p-4">Complaint ID</th>
                <th className="p-4">Student</th>
                <th className="p-4">Category</th>
                <th className="p-4">Assigned Warden</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {complaints.map((comp) => (
                <tr key={comp.complaintId} className="hover:bg-slate-900/20">
                  <td className="p-4 font-semibold text-slate-400">#CMP-{comp.complaintId}</td>
                  <td className="p-4 text-slate-200">{comp.student}</td>
                  <td className="p-4">{comp.category}</td>
                  <td className="p-4">{comp.assignedWarden}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      comp.status === 'Resolved' || comp.status === 'Closed' ? 'bg-emerald-500/10 text-emerald-400' :
                      comp.status === 'Under Review' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-slate-800 text-slate-450'
                    }`}>
                      {comp.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {comp.status !== 'Closed' && comp.status !== 'Resolved' && (
                      <button
                        onClick={() => {
                          setActiveComp(comp);
                          setResolveStatus(comp.status === 'Submitted' ? 'Under Review' : 'Resolved');
                          setNotes('');
                          setFormError('');
                        }}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all duration-200"
                      >
                        <ShieldCheck size={12} className="mr-1" /> Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* -------------------- RESOLVE COMPLAINT MODAL -------------------- */}
      {activeComp && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Resolve Student Complaint</h3>
              <button onClick={() => setActiveComp(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="p-4 mx-6 mt-4 flex items-center bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                <AlertCircle size={16} className="mr-2 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleResolveSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Target Complaint</label>
                <span className="text-slate-200 font-semibold block text-sm">#CMP-{activeComp.complaintId} by {activeComp.student}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">Action Status</label>
                <select
                  value={resolveStatus}
                  onChange={(e) => setResolveStatus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-blue-500/80 transition-colors text-sm"
                >
                  <option value="Under Review">Under Review</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">Resolution Notes</label>
                <textarea
                  required
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide resolution details or actions taken..."
                  className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 rounded-xl focus:outline-none focus:border-blue-500/80 transition-colors text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center justify-center transition-all duration-200"
              >
                {formLoading ? <RefreshCw className="animate-spin mr-2" size={18} /> : null}
                Update Grievance
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ComplaintManagement;
