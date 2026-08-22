import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service.js';
import { RefreshCw, User, Mail, ShieldAlert } from 'lucide-react';

export const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await adminService.getProfile();
      if (res.success) {
        setProfile(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch administrator profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
        <RefreshCw size={28} className="animate-spin mb-2" /> Loading profile info...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Administrator Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Review system settings and credentials</p>
      </div>

      {error ? (
        <div className="py-6 text-center text-red-400">{error}</div>
      ) : (
        <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl">
              <span className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Administrative Name</span>
              <span className="text-slate-200 font-bold text-base flex items-center"><User size={16} className="text-fuchsia-400 mr-2" /> {profile?.name}</span>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl">
              <span className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Registered Username</span>
              <span className="text-slate-200 font-bold text-base flex items-center font-mono"><ShieldAlert size={16} className="text-fuchsia-400 mr-2" /> {profile?.username}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl col-span-2">
              <span className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Administrative Email</span>
              <span className="text-slate-200 font-bold text-base flex items-center"><Mail size={16} className="text-fuchsia-400 mr-2" /> {profile?.email}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Profile;
