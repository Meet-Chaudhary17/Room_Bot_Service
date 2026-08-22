import React, { useState, useEffect } from 'react';
import { MessageSquare, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { createComplaint, getComplaints } from '../../services/student.service';
import { formatDate } from '../../utils/helpers';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await getComplaints();
      setComplaints(res.data || []);
    } catch (err) {
      toast.error('Failed to load complaints history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const newErrors = {};

    if (!subject.trim()) newErrors.subject = 'Subject is required';
    if (!description.trim()) newErrors.description = 'Description is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const response = await createComplaint({ subject, description });
      toast.success(response.message || 'Complaint filed successfully!');
      setSubject('');
      setDescription('');
      fetchComplaints(); // reload history
    } catch (err) {
      toast.error(err.message || 'Failed to log complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* File Complaint Form */}
      <div className="lg:col-span-1 bg-white p-6 border border-slate-100 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">File a Complaint</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Submit grievances to the hostel management</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input
            id="subject"
            label="Complaint Subject"
            icon={MessageSquare}
            required
            placeholder="e.g. Water outage in Block S"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            error={errors.subject}
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="description" className="text-xs font-bold text-slate-700">
              Grievance Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              required
              rows={4}
              placeholder="Describe the complaint in detail, mentioning specific room coordinates or times..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`
                w-full py-3 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none
                ${errors.description 
                  ? 'border-rose-300 bg-rose-50/20 text-rose-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500' 
                  : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}
              `}
            />
            {errors.description && <span className="text-xs font-medium text-rose-500 pl-1">{errors.description}</span>}
          </div>

          <Button type="submit" className="w-full" loading={submitting}>
            Log Complaint
          </Button>
        </form>
      </div>

      {/* Complaints History */}
      <div className="lg:col-span-2 bg-white p-6 border border-slate-100 rounded-3xl shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Complaints Log</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Track resolve states of logged complaints</p>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader size="sm" />
            </div>
          ) : complaints.length === 0 ? (
            <p className="text-xs text-slate-400 font-semibold py-8 text-center">No complaints filed yet.</p>
          ) : (
            complaints.map((comp) => (
              <div 
                key={comp.id} 
                className="p-4 border border-slate-100 rounded-xl flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">{comp.subject}</p>
                  <p className="text-[11px] font-semibold text-slate-500 leading-normal">{comp.description}</p>
                  <p className="text-[9px] text-slate-400 font-medium">
                    Filed: {formatDate(comp.createdAt)}
                    {comp.resolvedAt && ` · Resolved: ${formatDate(comp.resolvedAt)}`}
                  </p>
                </div>

                <span className={`
                  px-2.5 py-1 text-[10px] font-bold rounded-full border flex items-center gap-1.5
                  ${comp.status === 'RESOLVED' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'}
                `}>
                  {comp.status === 'RESOLVED' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  {comp.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}