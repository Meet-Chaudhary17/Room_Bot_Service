import React, { useState, useEffect } from 'react';
import { staffService } from '../../services/staff.service.js';
import { RefreshCw, Play, CheckSquare, X, Info, Calendar, User, Home, Shield, Mail, KeyRound, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const ServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  
  // Details Modal State
  const [selectedReq, setSelectedReq] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // OTP Modal State
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [activeReqId, setActiveReqId] = useState(null);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [occupants, setOccupants] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [occupantsLoading, setOccupantsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await staffService.listRequests({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        search: search || undefined
      });
      if (res.success) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, priorityFilter, search]);

  const handleStartWork = async (requestId) => {
    try {
      await staffService.startWork(requestId);
      fetchRequests();
      if (selectedReq && selectedReq.requestId === requestId) {
        handleViewDetails(requestId);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start work.');
    }
  };

  const handleCompleteWorkClick = async (requestId) => {
    setActiveReqId(requestId);
    setStep(1);
    setSelectedStudentId('');
    setOtp('');
    setOtpError('');
    setSelectedReq(null); // Close the detail modal if open
    setOtpModalOpen(true);
    setOccupantsLoading(true);
    try {
      const res = await staffService.getOccupants(requestId);
      if (res.success) {
        setOccupants(res.data || []);
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Failed to fetch room occupants.');
    } finally {
      setOccupantsLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setOtpError('Please select an occupant first.');
      return;
    }
    setOtpError('');
    setOtpLoading(true);
    try {
      await staffService.generateOtp(activeReqId, Number(selectedStudentId));
      setStep(2);
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Failed to generate OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError('');
    setOtpLoading(true);

    try {
      const res = await staffService.verifyOtp(activeReqId, otp, Number(selectedStudentId));
      if (res.success) {
        setOtpModalOpen(false);
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
      setOtpError(err.response?.data?.message || 'Failed to verify OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleViewDetails = async (requestId) => {
    try {
      setDetailLoading(true);
      const res = await staffService.getRequestDetails(requestId);
      if (res.success) {
        setSelectedReq(res.data);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load request details.');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Assigned Requests</h1>
          <p className="text-slate-400 text-sm mt-1">Manage, start, and verify completions for active tasks</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/20 p-4 border border-slate-800 rounded-xl">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or room number..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none focus:border-blue-500/80"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
          >
            <option value="">All Active Statuses</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Priority</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
          <RefreshCw size={28} className="animate-spin mb-2" /> Loading active tasks...
        </div>
      ) : error ? (
        <div className="py-12 text-center text-red-400">{error}</div>
      ) : requests.length === 0 ? (
        <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
          No assigned requests found.
        </div>
      ) : (
        <div className="overflow-x-auto bg-slate-900/20 border border-slate-800 rounded-2xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900/40 text-xs text-slate-400 uppercase tracking-widest border-b border-slate-800">
                <th className="p-4">ID</th>
                <th className="p-4">Student</th>
                <th className="p-4">Room & Block</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {requests.map((req) => (
                <tr key={req.requestId} className="hover:bg-slate-900/20">
                  <td className="p-4 font-semibold text-slate-400">#SR-{req.requestId}</td>
                  <td className="p-4 text-slate-200">{req.studentName}</td>
                  <td className="p-4">{req.roomNumber} ({req.block})</td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      req.priority === 'HIGH' ? 'bg-red-500/10 text-red-400' :
                      req.priority === 'NORMAL' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {req.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      req.status === 'In Progress' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleViewDetails(req.requestId)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
                      title="View Details"
                    >
                      <Info size={16} />
                    </button>
                    {req.status === 'Assigned' && (
                      <button
                        onClick={() => handleStartWork(req.requestId)}
                        className="inline-flex items-center px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all duration-200"
                      >
                        <Play size={12} className="mr-1 fill-white" /> Start
                      </button>
                    )}
                    {req.status === 'In Progress' && (
                      <button
                        onClick={() => handleCompleteWorkClick(req.requestId)}
                        className="inline-flex items-center px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all duration-200"
                      >
                        <CheckSquare size={12} className="mr-1" /> Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* -------------------- REQUEST DETAILS MODAL -------------------- */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Service Request Details</h3>
              <button onClick={() => setSelectedReq(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-slate-500 text-xs uppercase tracking-wider font-semibold">Request ID</span>
                  <span className="text-slate-200 font-bold">#SR-{selectedReq.requestId}</span>
                </div>
                <div>
                  <span className="block text-slate-500 text-xs uppercase tracking-wider font-semibold">Priority</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                    selectedReq.priority === 'HIGH' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {selectedReq.priority}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800/50">
                <h4 className="text-slate-400 font-semibold text-xs uppercase tracking-wider">Student & Room Info</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                  <div className="flex items-center"><User size={16} className="text-slate-500 mr-2" /> {selectedReq.studentName}</div>
                  <div className="flex items-center"><Mail size={16} className="text-slate-500 mr-2" /> {selectedReq.email}</div>
                  <div className="flex items-center"><Home size={16} className="text-slate-500 mr-2" /> Room {selectedReq.roomNumber} ({selectedReq.block})</div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-800/50">
                <h4 className="text-slate-400 font-semibold text-xs uppercase tracking-wider">Job Details</h4>
                <div className="text-sm">
                  <span className="block text-slate-400 font-medium">{selectedReq.problemTitle}</span>
                  <p className="text-slate-300 mt-1">{selectedReq.description}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800/50 text-xs text-slate-500">
                <h4 className="text-slate-400 font-semibold uppercase tracking-wider">Timestamps</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>Created: {new Date(selectedReq.createdAt).toLocaleString()}</div>
                  {selectedReq.assignedAt && <div>Assigned: {new Date(selectedReq.assignedAt).toLocaleString()}</div>}
                  {selectedReq.startedAt && <div>Started: {new Date(selectedReq.startedAt).toLocaleString()}</div>}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
              <button
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-900 text-slate-300 rounded-xl text-sm font-semibold transition-colors"
              >
                Close
              </button>
              {selectedReq.status === 'Assigned' && (
                <button
                  onClick={() => handleStartWork(selectedReq.requestId)}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all duration-200"
                >
                  <Play size={14} className="mr-1.5 fill-white" /> Start Job
                </button>
              )}
              {selectedReq.status === 'In Progress' && (
                <button
                  onClick={() => handleCompleteWorkClick(selectedReq.requestId)}
                  className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all duration-200"
                >
                  <CheckSquare size={14} className="mr-1.5" /> Complete
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* -------------------- OTP VERIFICATION MODAL -------------------- */}
      {otpModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center text-teal-400 font-semibold gap-1.5">
                <KeyRound size={20} />
                <span>Verify Completion OTP</span>
              </div>
              <button onClick={() => setOtpModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {otpError && (
              <div className="p-4 mx-6 mt-4 flex items-center bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                <AlertCircle size={16} className="mr-2 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="p-6 space-y-5">
                <p className="text-slate-400 text-sm">
                  Select the occupant currently present in the room to receive the completion verification code:
                </p>

                {occupantsLoading ? (
                  <div className="py-6 text-center text-slate-400 flex flex-col items-center justify-center">
                    <RefreshCw size={20} className="animate-spin mb-2" />
                    <span>Loading occupants...</span>
                  </div>
                ) : occupants.length === 0 ? (
                  <div className="py-4 text-center text-slate-500 bg-slate-950/40 border border-slate-800/80 rounded-xl">
                    No active roommates registered for this block and room.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {occupants.map((occ) => (
                      <label
                        key={occ.id}
                        className={`flex items-start p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                          selectedStudentId === occ.id
                            ? 'bg-teal-500/10 border-teal-500 text-white'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="occupant"
                          value={occ.id}
                          checked={selectedStudentId === occ.id}
                          onChange={() => setSelectedStudentId(occ.id)}
                          className="mt-1 mr-3 accent-teal-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-200 truncate">{occ.fullName}</p>
                          <p className="text-xs text-slate-500 truncate">{occ.email}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={otpLoading || occupantsLoading || !selectedStudentId}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:hover:bg-teal-600"
                >
                  {otpLoading ? <RefreshCw className="animate-spin mr-2" size={18} /> : null}
                  Send Verification OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="p-6 space-y-5">
                <p className="text-slate-400 text-sm">
                  Enter the 6-digit OTP code sent to the selected student's email address:
                  <span className="block mt-1 font-semibold text-slate-200 truncate">
                    {occupants.find(o => o.id === selectedStudentId)?.email}
                  </span>
                </p>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-2">Verification Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full tracking-[1.5em] text-center py-2.5 bg-slate-950/60 border border-slate-800 text-white placeholder-slate-800 rounded-xl focus:outline-none focus:border-teal-500/80 transition-colors text-xl font-bold"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp('');
                      setOtpError('');
                    }}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-all duration-200"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="flex-[2] py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50"
                  >
                    {otpLoading ? <RefreshCw className="animate-spin mr-2" size={18} /> : null}
                    Complete Task
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};
export default ServiceRequests;
