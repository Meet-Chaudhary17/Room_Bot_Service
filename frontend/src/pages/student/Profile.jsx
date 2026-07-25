import React from 'react';
import { User, Mail, BookOpen, Home, Calendar } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { formatDate } from '../../utils/helpers';

export default function Profile() {
  const { user } = useAuth();

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'KA';
  };

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
          <h2 className="text-xl font-bold text-slate-800">{user?.name || 'Student Profile'}</h2>
          <p className="text-xs font-semibold text-slate-400 mt-1">Hostel Student Resident</p>
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

          {/* Registration No */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Registration ID</p>
              <p className="text-xs font-bold text-slate-700">{user?.registrationNo}</p>
            </div>
          </div>

          {/* Room Coordinate */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Home className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Hostel Coordinates</p>
              <p className="text-xs font-bold text-slate-700">
                Room {user?.roomNumber || 'N/A'} · Block {user?.block?.name || user?.blockId || 'N/A'}
              </p>
            </div>
          </div>

          {/* Joined Date */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Member Since</p>
              <p className="text-xs font-bold text-slate-700">{formatDate(user?.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}