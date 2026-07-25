import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, BookOpen, Star, Calendar, Home } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { getProfile } from '../../services/staff.service';
import { formatDate } from '../../utils/helpers';
import Loader from '../../components/common/Loader';

export default function Profile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        setProfileData(res.data);
      } catch (err) {
        console.error('Failed to load profile details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'ET';
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
      {/* Profile Banner */}
      <div className="h-32 bg-indigo-600 relative flex items-end justify-center sm:justify-start px-6 pb-4">
        <div className="absolute top-1/2 left-6 sm:translate-y-2 translate-y-4">
          <div className="w-24 h-24 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold text-2xl shadow-md">
            {getInitials(user?.name)}
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="pt-16 pb-8 px-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{user?.name || 'Staff Profile'}</h2>
          <p className="text-xs font-semibold text-slate-400 mt-1">Hostel Maintenance Technician</p>
        </div>

        <div className="border-t border-slate-100 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Mail className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Email</p>
              <p className="text-xs font-bold text-slate-700">{user?.email}</p>
            </div>
          </div>

          {/* Employee ID */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Employee ID</p>
              <p className="text-xs font-bold text-slate-700">{user?.employeeId}</p>
            </div>
          </div>

          {/* Role Specialization */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Shield className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Specialization</p>
              <p className="text-xs font-bold text-slate-700">{user?.role || 'Maintenance'}</p>
            </div>
          </div>

          {/* Assigned Block */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Home className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Assigned Block</p>
              <p className="text-xs font-bold text-slate-700">Block {user?.block?.name || user?.blockId || 'N/A'}</p>
            </div>
          </div>

          {/* Member Since */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Member Since</p>
              <p className="text-xs font-bold text-slate-700">{formatDate(user?.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Rating Metrics Panel */}
        <div className="p-5 bg-amber-50/40 border border-amber-100 rounded-2xl flex items-center justify-around text-center">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">Average Rating</p>
            <p className="text-2xl font-extrabold text-amber-700">{Number(profileData?.ratingAverage || 5.0).toFixed(1)}</p>
          </div>
          <div className="w-px h-10 bg-amber-200" />
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">Reviews Count</p>
            <p className="text-2xl font-extrabold text-amber-700">{profileData?.feedbackCount || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}