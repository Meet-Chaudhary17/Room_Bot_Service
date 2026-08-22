import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service.js';
import { RefreshCw, Search, ShieldAlert, ShieldCheck } from 'lucide-react';

export const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [blockFilter, setBlockFilter] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await adminService.listStudents({
        search: search || undefined,
        block: blockFilter || undefined
      });
      if (res.success) {
        setStudents(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch students directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, blockFilter]);

  const handleToggleStatus = async (studentId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Blocked' : 'Active';
    if (!window.confirm(`Are you sure you want to change student status to ${nextStatus}?`)) return;
    try {
      await adminService.updateStudentStatus(studentId, nextStatus);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update student status.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Student Management</h1>
        <p className="text-slate-400 text-sm mt-1">Review student directories and modify access permissions</p>
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
            placeholder="Search name, registration or email..."
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
          <RefreshCw size={28} className="animate-spin mb-2" /> Loading student directory...
        </div>
      ) : error ? (
        <div className="py-12 text-center text-red-400">{error}</div>
      ) : students.length === 0 ? (
        <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
          No registered students found.
        </div>
      ) : (
        <div className="overflow-x-auto bg-slate-900/20 border border-slate-800 rounded-2xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900/40 text-xs text-slate-400 uppercase tracking-widest border-b border-slate-800">
                <th className="p-4">Student ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Block & Room</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {students.map((student) => (
                <tr key={student.studentId} className="hover:bg-slate-900/20">
                  <td className="p-4 font-semibold text-slate-400">#STU-{student.studentId}</td>
                  <td className="p-4 text-slate-200">{student.name}</td>
                  <td className="p-4">{student.email}</td>
                  <td className="p-4">{student.roomNumber} ({student.block})</td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      student.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {student.status === 'Active' ? (
                      <button
                        onClick={() => handleToggleStatus(student.studentId, student.status)}
                        className="inline-flex items-center px-2.5 py-1.5 bg-red-650 hover:bg-red-500/10 text-red-450 border border-red-500/20 hover:text-red-400 rounded-lg text-xs font-semibold transition-all duration-200"
                      >
                        <ShieldAlert size={12} className="mr-1" /> Block User
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleStatus(student.studentId, student.status)}
                        className="inline-flex items-center px-2.5 py-1.5 bg-emerald-650 hover:bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 hover:text-emerald-400 rounded-lg text-xs font-semibold transition-all duration-200"
                      >
                        <ShieldCheck size={12} className="mr-1" /> Unblock User
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
export default StudentManagement;
