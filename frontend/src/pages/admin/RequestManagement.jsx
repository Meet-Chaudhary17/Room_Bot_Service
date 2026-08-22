import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service.js';
import { RefreshCw, Search, Calendar, FileText } from 'lucide-react';

export const RequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [blockFilter, setBlockFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await adminService.listServiceRequests({
        status: statusFilter || undefined,
        block: blockFilter || undefined,
        serviceType: serviceFilter || undefined
      });
      if (res.success) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch platform service requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, blockFilter, serviceFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Service Request Monitoring</h1>
        <p className="text-slate-400 text-sm mt-1">Read-only real-time tracking of all submitted hostel requests</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/20 p-4 border border-slate-800 rounded-xl">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending Assignment</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
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

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Service Type</label>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
          >
            <option value="">All Services</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Electrical Maintenance">Electrical Maintenance</option>
            <option value="Plumbing">Plumbing</option>
            <option value="AC Maintenance">AC Maintenance</option>
            <option value="Furniture Repair">Furniture Repair</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
          <RefreshCw size={28} className="animate-spin mb-2" /> Loading platform requests...
        </div>
      ) : error ? (
        <div className="py-12 text-center text-red-400">{error}</div>
      ) : requests.length === 0 ? (
        <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
          No service requests found matching the filter criteria.
        </div>
      ) : (
        <div className="overflow-x-auto bg-slate-900/20 border border-slate-800 rounded-2xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900/40 text-xs text-slate-400 uppercase tracking-widest border-b border-slate-800">
                <th className="p-4">Request ID</th>
                <th className="p-4">Student</th>
                <th className="p-4">Assigned Staff</th>
                <th className="p-4">Service Type</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Completed On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {requests.map((req) => (
                <tr key={req.requestId} className="hover:bg-slate-900/20">
                  <td className="p-4 font-semibold text-slate-400">#SR-{req.requestId}</td>
                  <td className="p-4 text-slate-200">{req.student}</td>
                  <td className="p-4">{req.staff || <span className="text-slate-500 italic text-xs">Unassigned</span>}</td>
                  <td className="p-4">{req.serviceType}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      req.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                      req.status === 'Cancelled' ? 'bg-slate-800 text-slate-500' :
                      req.status === 'In Progress' ? 'bg-orange-500/10 text-orange-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">{req.completedDate || <span className="text-slate-650 italic text-xs">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default RequestManagement;
