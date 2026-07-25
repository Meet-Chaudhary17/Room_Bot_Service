import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getComplaints, resolveComplaint } from '../../services/admin.service';
import { formatDate } from '../../utils/helpers';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await getComplaints({ page, limit });
      setComplaints(res.data.complaints || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load complaints history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page]);

  const handleResolve = async (complaintId) => {
    setResolving(true);
    try {
      await resolveComplaint(complaintId);
      toast.success('Complaint marked as RESOLVED.');
      fetchComplaints();
    } catch (err) {
      toast.error(err.message || 'Resolve action failed.');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Student Grievances</h2>
        <p className="text-xs font-semibold text-slate-400 mt-1">Review, coordinate, and mark student complaints as resolved</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader size="lg" />
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState 
          title="No complaints logged" 
          description="There are currently no active grievances submitted by students."
          icon={MessageSquare}
        />
      ) : (
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-semibold text-slate-500">
              <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Grievance / Details</th>
                  <th className="px-6 py-4">Submitted Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {complaints.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      <div>{comp.student?.name}</div>
                      <div className="text-[10px] text-slate-400 font-medium">Room {comp.student?.roomNumber} · Block {comp.student?.block?.name}</div>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <div className="font-bold text-slate-800">{comp.subject}</div>
                      <div className="text-slate-400 text-[11px] leading-relaxed truncate">{comp.description}</div>
                    </td>
                    <td className="px-6 py-4">{formatDate(comp.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`
                        px-2.5 py-1 text-[10px] font-bold rounded-full border flex items-center gap-1.5 w-fit
                        ${comp.status === 'RESOLVED' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'}
                      `}>
                        {comp.status === 'RESOLVED' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {comp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {comp.status !== 'RESOLVED' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleResolve(comp.id)}
                          loading={resolving}
                          icon={CheckCircle}
                        >
                          Mark Resolved
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            hasNextPage={page < totalPages}
            hasPreviousPage={page > 1}
          />
        </div>
      )}
    </div>
  );
}