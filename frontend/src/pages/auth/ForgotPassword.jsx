import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { forgotPassword } from '../../services/auth.service';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { validateEmail } from '../../utils/validators';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword(email);
      toast.success(response.message || 'Reset OTP sent to your email.');
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      toast.error(err.message || 'Failed to request reset OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-100 rounded-2xl border border-slate-100 sm:px-10">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">Reset your password</h2>
            <p className="text-xs font-semibold text-slate-400 mt-1">Enter your registered email to receive a recovery OTP</p>
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
              error={error}
            />

            <div>
              <Button type="submit" className="w-full py-3" loading={loading}>
                Send Recovery OTP
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs font-bold">
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}