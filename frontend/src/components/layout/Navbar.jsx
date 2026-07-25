import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const handleDashboardRedirect = () => {
    if (role === 'STUDENT') navigate('/student/dashboard');
    else if (role === 'STAFF') navigate('/staff/dashboard');
    else if (role === 'ADMIN') navigate('/admin/dashboard');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Wrench className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-800 text-base leading-tight">
            Room-Bot <span className="text-indigo-600">Service</span>
          </span>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
          <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
          <a href="#services" className="hover:text-slate-900 transition-colors">Services</a>
          <a href="#about" className="hover:text-slate-900 transition-colors">About</a>
          <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <button 
              onClick={handleDashboardRedirect}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-md shadow-indigo-100"
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-md shadow-indigo-100"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}