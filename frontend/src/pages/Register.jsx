import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service.js';
import { motion } from 'framer-motion';
import { UserPlus, User, Mail, Lock, Phone, Hash, Home, AlertCircle, RefreshCw } from 'lucide-react';

export const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('STUDENT'); // STUDENT, STAFF
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [blockId, setBlockId] = useState('1'); // Default to Block A (1)
  
  // Student specific
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [roomNumber, setRoomNumber] = useState('');

  // Staff specific
  const [serviceRole, setServiceRole] = useState('CLEANING');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const commonData = {
      email,
      password,
      fullName,
      phoneNumber: phoneNumber || undefined,
      blockId: Number(blockId)
    };

    try {
      if (role === 'STUDENT') {
        await authService.registerStudent({
          ...commonData,
          registrationNumber,
          roomNumber
        });
      } else {
        await authService.registerStaff({
          ...commonData,
          serviceRole
        });
      }

      // Success redirects to OTP verification
      navigate(`/verify-otp?email=${encodeURIComponent(email)}&purpose=REGISTRATION`);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Registration failed. Please check the entered fields.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070f] flex items-center justify-center p-4">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">Create Account</h2>
          <p className="text-sm text-slate-400">Join the hostel management platform</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl mb-6 border border-slate-800">
          {['STUDENT', 'STAFF'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setRole(item);
                setError('');
              }}
              className={`py-2 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200 ${
                role === item
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm">
            <AlertCircle size={16} className="mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 rounded-xl focus:outline-none focus:border-blue-500/80 transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 rounded-xl focus:outline-none focus:border-blue-500/80 transition-colors text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 rounded-xl focus:outline-none focus:border-blue-500/80 transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Phone size={16} />
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 rounded-xl focus:outline-none focus:border-blue-500/80 transition-colors text-sm"
                />
              </div>
            </div>
          </div>

          {/* Student Specific Fields */}
          {role === 'STUDENT' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/50">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
                  Registration Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Hash size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="REG12345"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 rounded-xl focus:outline-none focus:border-blue-500/80 transition-colors text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
                  Room Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Home size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="A-203"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 rounded-xl focus:outline-none focus:border-blue-500/80 transition-colors text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Staff Specific Fields */}
          {role === 'STAFF' && (
            <div className="pt-2 border-t border-slate-800/50">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
                Service Role
              </label>
              <select
                value={serviceRole}
                onChange={(e) => setServiceRole(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-blue-500/80 transition-colors text-sm"
              >
                <option value="CLEANING">Cleaning</option>
                <option value="ELECTRICAL_MAINTENANCE">Electrical Maintenance</option>
                <option value="PLUMBING">Plumbing</option>
                <option value="AC_MAINTENANCE">AC Maintenance</option>
                <option value="FURNITURE_REPAIR">Furniture Repair</option>
              </select>
            </div>
          )}

          {/* Block Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
              Hostel Block
            </label>
            <select
              value={blockId}
              onChange={(e) => setBlockId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-blue-500/80 transition-colors text-sm"
            >
              <option value="1">Block A</option>
              <option value="2">Block B</option>
              <option value="3">Block C</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center disabled:opacity-50 mt-6"
          >
            {loading ? (
              <RefreshCw className="animate-spin mr-2" size={18} />
            ) : (
              <UserPlus className="mr-2" size={18} />
            )}
            Register Account
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
export default Register;
