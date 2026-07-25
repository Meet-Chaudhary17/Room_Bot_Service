import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function VerifyOTP() {
  const { verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    if (!otp.trim() || otp.length !== 6) {
      setError('OTP must be a 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOtp(email, otp);
      toast.success(response.message || 'Email verified successfully! You can now log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-100 rounded-2xl border border-slate-100 sm:px-10">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">Verify your email</h2>
            <p className="text-xs font-semibold text-slate-400 mt-1">Enter the 6-digit OTP code sent to your inbox</p>
          </div>

          <form className="space-y-4" onSubmit={handleVerify}>
            <Input
              id="email"
              label="Email address"
              type="email"
              icon={Mail}
              required
              placeholder="you@university.edu.gh"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!location.state?.email}
            />

            <Input
              id="otp"
              label="Verification OTP"
              type="text"
              icon={Check}
              required
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              error={error}
            />

            <div>
              <Button type="submit" className="w-full py-3" loading={loading}>
                Verify OTP & Activate
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}