import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { staffService } from '../../services/staff.service.js';
import { RefreshCw, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await staffService.getProfile();
      if (res.success) {
        setProfile(res.data);
        setName(res.data.name);
        setPhoneNumber(res.data.phoneNumber || '');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await staffService.updateProfile({
        name,
        phoneNumber
      });

      if (res.success) {
        setSuccess('Profile updated successfully.');
        updateUserProfile({ fullName: name, phoneNumber });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
        <RefreshCw size={28} className="animate-spin mb-2" /> Loading profile details...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Review your details and update contact information</p>
      </div>

      {error && (
        <div className="flex items-center bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm">
          <AlertCircle size={16} className="mr-2 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-sm">
          <CheckCircle2 size={16} className="mr-2 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
            <input
              type="text"
              disabled
              value={profile?.email || ''}
              className="w-full px-3 py-2.5 bg-slate-950/40 border border-slate-800/80 text-slate-500 rounded-xl text-sm cursor-not-allowed focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Division Role</label>
            <input
              type="text"
              disabled
              value={profile?.role || ''}
              className="w-full px-3 py-2.5 bg-slate-950/40 border border-slate-800/80 text-slate-500 rounded-xl text-sm cursor-not-allowed focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Assigned Block</label>
            <input
              type="text"
              disabled
              value={profile?.block || ''}
              className="w-full px-3 py-2.5 bg-slate-950/40 border border-slate-800/80 text-slate-500 rounded-xl text-sm cursor-not-allowed focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/50">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm focus:outline-none focus:border-blue-500/80 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-sm focus:outline-none focus:border-blue-500/80 transition-colors"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800/50">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="animate-spin mr-2" size={16} /> : <Save className="mr-1.5" size={16} />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
export default Profile;
