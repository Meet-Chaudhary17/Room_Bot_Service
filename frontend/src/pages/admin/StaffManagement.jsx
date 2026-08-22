import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service.js';
import { RefreshCw, Search, ShieldAlert, ShieldCheck, Star } from 'lucide-react';

export const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [blockFilter, setBlockFilter] = useState('');

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await adminService.listStaff({
        search: search || undefined,
        block: blockFilter || undefined
      });
      if (res.success) {
        setStaffList(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch staff directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [search, blockFilter]);

  const handleToggleStatus = async (staffId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Blocked' : 'Active';
    if (!window.confirm(`Are you sure you want to change staff status to ${nextStatus}?`)) return;
    try {
      await adminService.updateStaffStatus(staffId, nextStatus);
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update staff status.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Staff Management</h1>
        <p className="text-slate-400 text-sm mt-1">Monitor staff performance, workloads, and manage platform permissions</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/20 p-4 border border-slate-800 rounded-xl">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or role..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none focus:border-blue-500/80"
          />
        </div>

        <div>
          <select
            value={blockFilter}
            onChange={(e) => setBlockFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
          >
            <option value="">All Hostel Blocks</option>
            <option value="A Block">Block A</option>
            <option value="B Block">Block B</option>
            <option value="C Block">Block C</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
          <RefreshCw size={28} className="animate-spin mb-2" /> Loading staff directory...
        </div>
      ) : error ? (
        <div className="py-12 text-center text-red-400">{error}</div>
      ) : staffList.length === 0 ? (
        <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
          No registered staff members found.
        </div>
      ) : (
        <div className="overflow-x-auto bg-slate-900/20 border border-slate-800 rounded-2xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900/40 text-xs text-slate-400 uppercase tracking-widest border-b border-slate-800">
                <th className="p-4">Staff ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Role & Block</th>
                <th className="p-4">Active Jobs</th>
                <th className="p-4">Completed Jobs</th>
                <th className="p-4">Avg Rating</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {staffList.map((staff) => (
                <tr key={staff.staffId} className="hover:bg-slate-900/20">
                  <td className="p-4 font-semibold text-slate-400">#STF-{staff.staffId}</td>
                  <td className="p-4 text-slate-200">{staff.name}</td>
                  <td className="p-4">{staff.role} ({staff.block})</td>
                  <td className="p-4 font-semibold text-blue-400">{staff.activeRequests}</td>
                  <td className="p-4 font-semibold text-emerald-400">{staff.completedRequests}</td>
                  <td className="p-4">
                    {staff.averageRating > 0 ? (
                      <span className="flex items-center text-yellow-400 font-semibold gap-1">
                        <Star size={14} className="fill-yellow-400" /> {staff.averageRating}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">N/A</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      staff.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {staff.status === 'Active' ? (
                      <button
                        onClick={() => handleToggleStatus(staff.staffId, staff.status)}
                        className="inline-flex items-center px-2.5 py-1.5 bg-red-650 hover:bg-red-500/10 text-red-450 border border-red-500/20 hover:text-red-400 rounded-lg text-xs font-semibold transition-all duration-200"
                      >
                        <ShieldAlert size={12} className="mr-1" /> Block Staff
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleStatus(staff.staffId, staff.status)}
                        className="inline-flex items-center px-2.5 py-1.5 bg-emerald-650 hover:bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 hover:text-emerald-400 rounded-lg text-xs font-semibold transition-all duration-200"
                      >
                        <ShieldCheck size={12} className="mr-1" /> Unblock Staff
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default StaffManagement;
