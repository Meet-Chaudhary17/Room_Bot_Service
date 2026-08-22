import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { staffService } from '../../services/staff.service.js';
import { motion } from 'framer-motion';
import { 
  ClipboardList, AlertTriangle, CheckCircle, Star, Play, 
  CheckSquare, X, RefreshCw, AlertCircle, KeyRound 
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ assignedRequests: 0, pendingRequests: 0, completedToday: 0, averageRating: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await staffService.getDashboard();
      if (res.success) {
        setStats({
          assignedRequests: res.data.assignedRequests,
          pendingRequests: res.data.pendingRequests,
          completedToday: res.data.completedToday,
          averageRating: res.data.averageRating
        });
        setRecentRequests(res.data.recentRequests || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load staff stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStartWork = async (requestId) => {
    try {
      await staffService.startWork(requestId);
      fetchDashboardData();
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
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
      setOtpError(err.response?.data?.message || 'Failed to verify OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-slate-900/40 p-6 border border-slate-800 rounded-3xl backdrop-blur-md">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">Welcome Back, {user?.fullName}!</h1>
        <p className="text-slate-400 text-sm mt-1">Manage assignments and verify task completions for {user?.role} division</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        {[
          { title: 'Total Assigned', val: stats.assignedRequests, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: ClipboardList },
          { title: 'Pending Work', val: stats.pendingRequests, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: AlertTriangle },
          { title: 'Completed Today', val: stats.completedToday, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle },
          { title: 'Average Rating', val: stats.averageRating ? `${stats.averageRating} ★` : 'N/A', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', icon: Star }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`p-6 border rounded-2xl flex items-center justify-between ${stat.bg}`}>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stat.val}</h3>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-slate-900/50 ${stat.color}`}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent requests list */}
      <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800/80">
          <h2 className="text-lg font-bold text-white">Recent Assigned Requests</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center">
            <RefreshCw size={28} className="animate-spin mb-2" /> Loading recent assignments...
          </div>
        ) : recentRequests.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No active service requests assigned to you.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/40 text-xs text-slate-400 uppercase tracking-widest border-b border-slate-800">
                  <th className="p-4">Request ID</th>
                  <th className="p-4">Room</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">Assigned Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {recentRequests.map((req) => (
                  <tr key={req.requestId} className="text-slate-300 hover:bg-slate-900/20">
                    <td className="p-4 font-semibold text-slate-400">#SR-{req.requestId}</td>
                    <td className="p-4 text-slate-200">{req.studentRoom}</td>
                    <td className="p-4">{req.serviceCategory}</td>
                    <td className="p-4">{req.assignedDate}</td>
                    <td className="p-4 text-right">
                      {req.status === 'Assigned' && (
                        <button
                          onClick={() => handleStartWork(req.requestId)}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all duration-200"
                        >
                          <Play size={12} className="mr-1 fill-white" /> Start Work
                        </button>
                      )}
                      {req.status === 'In Progress' && (
                        <button
                          onClick={() => handleCompleteWorkClick(req.requestId)}
                          className="inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all duration-200"
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
      </div>

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
export default Dashboard;
