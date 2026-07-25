import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Check, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { resetPassword } from '../../services/auth.service';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { validatePassword } from '../../utils/validators';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const newErrors = {};

    if (!email.trim()) newErrors.email = 'Email address is required';
    if (!otp.trim() || otp.length !== 6) newErrors.otp = 'OTP must be 6 digits';
    if (!validatePassword(newPassword)) newErrors.newPassword = 'Password must be at least 8 characters';
    if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword(email, otp, newPassword);
      toast.success(response.message || 'Password reset successful! Please sign in with your new password.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password. Check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-100 rounded-2xl border border-slate-100 sm:px-10">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">Set new password</h2>
            <p className="text-xs font-semibold text-slate-400 mt-1">Enter your recovery details to finalize password changes</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
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
              error={errors.email}
            />

            <Input
              id="otp"
              label="Recovery OTP"
              type="text"
              icon={Check}
              required
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              error={errors.otp}
            />

            <Input
              id="newPassword"
              label="New Password"
              type="password"
              icon={Lock}
              required
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={errors.newPassword}
            />

            <Input
              id="confirmPassword"
              label="Confirm New Password"
              type="password"
              icon={Lock}
              required
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
            />

            <div>
              <Button type="submit" className="w-full py-3" loading={loading}>
                Reset Password & Sign In
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}