import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6">
        <ShieldAlert className="w-8 h-8" />
      </div>
      
      <h1 className="text-3xl font-extrabold text-slate-800 leading-tight">
        404 - Page Not Found
      </h1>
      
      <p className="text-sm font-semibold text-slate-400 max-w-sm mt-3 leading-relaxed mb-6">
        The page you are looking for does not exist or has been relocated by the administrator.
      </p>

      <Link to="/">
        <Button variant="primary">
          Back to Homepage
        </Button>
      </Link>
    </div>
  );
}