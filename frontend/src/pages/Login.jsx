import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { authService } from '../services/auth.service.js';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, User, AlertCircle, RefreshCw } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState('STUDENT'); // STUDENT, STAFF, ADMINISTRATOR
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (role === 'STUDENT') {
        response = await authService.loginStudent({ email: emailOrUsername, password });
      } else if (role === 'STAFF') {
        response = await authService.loginStaff({ email: emailOrUsername, password });
      } else {
        response = await authService.loginAdmin({ username: emailOrUsername, password });
      }

      if (response.success) {
        const { token, user } = response.data;
        login(token, user);
        
        if (role === 'STUDENT') navigate('/student');
        else if (role === 'STAFF') navigate('/staff');
        else navigate('/admin');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      
      // If user needs to verify email, redirect to verify-otp page
      if (err.response?.data?.code === 'EMAIL_NOT_VERIFIED' && role !== 'ADMINISTRATOR') {
        navigate(`/verify-otp?email=${encodeURIComponent(emailOrUsername)}&purpose=REGISTRATION`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070f] flex items-center justify-center p-4">
      {/* Decorative gradient glowing circles */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">Welcome Back</h2>
          <p className="text-sm text-slate-400">Access your Room-Bot Service account</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl mb-6 border border-slate-800">
          {['STUDENT', 'STAFF', 'ADMIN'].map((item) => {
            const mappedRole = item === 'ADMIN' ? 'ADMINISTRATOR' : item;
            const active = role === mappedRole;
            return (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setRole(mappedRole);
                  setEmailOrUsername('');
                  setError('');
                }}
                className={`py-2 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200 ${
                  active
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="flex items-center bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm">
            <AlertCircle size={16} className="mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-2">
              {role === 'ADMINISTRATOR' ? 'Username' : 'Email Address'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                {role === 'ADMINISTRATOR' ? <User size={18} /> : <Mail size={18} />}
              </span>
              <input
                type={role === 'ADMINISTRATOR' ? 'text' : 'email'}
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder={role === 'ADMINISTRATOR' ? 'Enter admin username' : 'name@example.com'}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 rounded-xl focus:outline-none focus:border-blue-500/80 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 rounded-xl focus:outline-none focus:border-blue-500/80 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="animate-spin mr-2" size={18} />
            ) : (
              <LogIn className="mr-2" size={18} />
            )}
            Sign In
          </button>
        </form>

        {role !== 'ADMINISTRATOR' && (
          <p className="text-center text-slate-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:underline">
              Create an Account
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
};
export default Login;
