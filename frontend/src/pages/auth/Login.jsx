import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { validateEmail, validatePassword } from '../../utils/validators';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Get the page the user tried to access before redirecting to login
  const from = location.state?.from?.pathname || null;

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Clear errors
    setErrors({});
    const newErrors = {};

    if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await login(email, password);
      toast.success(response.message || 'Login successful!');
      
      const role = response.data.role;
      
      // Redirect based on role
      if (from) {
        navigate(from, { replace: true });
      } else if (role === 'STUDENT') {
        navigate('/student/dashboard');
      } else if (role === 'STAFF') {
        navigate('/staff/dashboard');
      } else if (role === 'ADMIN') {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Wrench className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-slate-800 text-lg leading-tight">
            Room-Bot <span className="text-indigo-600">Service</span>
          </span>
        </div>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-100 rounded-2xl border border-slate-100 sm:px-10">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">Sign in to your account</h2>
            <p className="text-xs font-semibold text-slate-400 mt-1">Enter your credentials to access the platform</p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <Input
              id="email"
              label="Email address"
              type="email"
              icon={Mail}
              required
              placeholder="you@university.edu.gh"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />

            <Input
              id="password"
              label="Password"
              type="password"
              icon={Lock}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded-lg cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs font-bold text-slate-500 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-xs">
                <Link to="/forgot-password" className="font-bold text-indigo-600 hover:text-indigo-700">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full py-3" loading={loading}>
                Sign In
              </Button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-6 text-center text-xs">
            <p className="font-semibold text-slate-500">
              New here?{' '}
              <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}