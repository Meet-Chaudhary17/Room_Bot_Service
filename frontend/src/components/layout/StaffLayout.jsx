import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  History, 
  Star, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Wrench 
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useNotification from '../../hooks/useNotification';
import { getProfile } from '../../services/staff.service';

export default function StaffLayout({ children }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [staffStats, setStaffStats] = useState({ rating: 5.0, count: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStaffStats = async () => {
      try {
        const res = await getProfile();
        setStaffStats({
          rating: res.data.ratingAverage || 5.0,
          count: res.data.feedbackCount || 0
        });
      } catch (err) {
        console.error("Failed to load staff ratings stats", err);
      }
    };
    fetchStaffStats();
  }, []);

  const navItems = [
    { name: 'Pending Requests', path: '/staff/dashboard', icon: ClipboardList },
    { name: 'History', path: '/staff/history', icon: History },
    { name: 'Feedback & Ratings', path: '/staff/feedback', icon: Star },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'ET';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col justify-between
        transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header & Links */}
        <div>
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-lg leading-tight">Room-Bot</h1>
                <p className="text-xs font-semibold text-slate-400">Staff Portal</p>
              </div>
            </div>
            <button className="lg:hidden p-1 rounded-lg text-slate-400 hover:bg-slate-100" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Navigation</p>
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                  ${isActive 
                    ? 'bg-indigo-50/80 text-indigo-600 shadow-sm shadow-indigo-50/10' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Rating Widget & Profile Block */}
        <div className="p-4 space-y-4">
          {/* Average Rating Panel */}
          <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-2xl flex flex-col items-center justify-center text-center">
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Your Average Rating</p>
            <p className="text-3xl font-extrabold text-amber-700 mt-1">{Number(staffStats.rating).toFixed(1)}</p>
            <div className="flex items-center gap-0.5 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.round(staffStats.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                />
              ))}
            </div>
            <p className="text-[10px] text-amber-600 font-semibold mt-1">{staffStats.count} ratings</p>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 truncate">{user?.name || 'Staff Member'}</p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.role || 'Technician'} · Block {user?.block?.name || user?.blockId || 'N/A'}
                </p>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-800 leading-tight">Overview</h2>
              <p className="text-xs text-slate-400 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Block {user?.block?.name || user?.blockId || 'N/A'}</p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/staff/notifications')}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 relative border border-slate-100"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                {getInitials(user?.name)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name || 'Staff'}</p>
                <p className="text-[10px] text-slate-400 font-medium">{user?.role || 'Maintenance'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Main Content */}
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}