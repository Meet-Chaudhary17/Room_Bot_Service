import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import Button from '../components/common/Button';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-6">
        <Lock className="w-8 h-8" />
      </div>

      <h1 className="text-3xl font-extrabold text-slate-800 leading-tight">
        403 - Unauthorized Access
      </h1>

      <p className="text-sm font-semibold text-slate-400 max-w-sm mt-3 leading-relaxed mb-6">
        You do not possess the required user roles to access this private platform directory.
      </p>

      <Button variant="primary" onClick={() => navigate(-1)}>
        Go Back
      </Button>
    </div>
  );
}