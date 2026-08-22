import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/auth.service.js';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export const VerifyOtp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const purpose = searchParams.get('purpose') || 'REGISTRATION';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Timer for resend cooldown (60 seconds)
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (!email) {
      setError('Invalid email address. Please register or login again.');
      return;
    }

    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Please enter a valid 6-digit numeric OTP.');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.verifyOtp({
        email,
        otpCode: otp,
        purpose
      });

      if (response.success) {
        setSuccessMsg('OTP verified successfully! Redirecting you to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Invalid or expired OTP code. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    
    setError('');
    setSuccessMsg('');
    setResending(true);

    try {
      await authService.sendOtp({ email, purpose });
      setSuccessMsg('Verification OTP resent successfully.');
      setCooldown(60);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to resend verification OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070f] flex items-center justify-center p-4">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600/20 text-blue-400 rounded-full mb-4">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white mb-2">Verify OTP</h2>
          <p className="text-sm text-slate-400">
            Enter the 6-digit verification code sent to <span className="text-slate-200 font-medium block truncate mt-1">{email}</span>
          </p>
        </div>

        {error && (
          <div className="flex items-center bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm">
            <AlertCircle size={16} className="mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl mb-6 text-sm">
            <CheckCircle2 size={16} className="mr-2 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-center text-xs font-semibold text-slate-300 uppercase tracking-widest mb-3">
              One-Time Password
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full tracking-[1.5em] text-center py-3 bg-slate-950/60 border border-slate-800 text-white placeholder-slate-800 rounded-xl focus:outline-none focus:border-blue-500/80 transition-colors text-xl font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="animate-spin mr-2" size={18} />
            ) : (
              <ArrowRight className="mr-2" size={18} />
            )}
            Verify & Activate
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-slate-500 text-sm">
            Didn't receive the code?{' '}
            {cooldown > 0 ? (
              <span className="text-slate-400 font-medium">Resend in {cooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-blue-400 hover:underline font-semibold"
              >
                {resending ? 'Resending...' : 'Resend Code'}
              </button>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
};
export default VerifyOtp;
