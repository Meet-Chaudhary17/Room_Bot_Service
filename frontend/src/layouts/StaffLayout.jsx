import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Home, ClipboardCheck, History, User, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const StaffLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/staff', icon: Home },
    { name: 'Pending Requests', path: '/staff/requests', icon: ClipboardCheck },
    { name: 'Work History', path: '/staff/history', icon: History },
    { name: 'Profile', path: '/staff/profile', icon: User }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0d0f17] text-white border-r border-slate-800/80">
      <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
        <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
          Room-Bot Staff
        </span>
        <button onClick={() => setMobileOpen(false)} className="md:hidden text-slate-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="p-6 border-b border-slate-800/80 bg-slate-900/40">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Staff Member</p>
        <h4 className="font-semibold text-slate-200 truncate">{user?.fullName || 'Staff'}</h4>
        <p className="text-xs text-teal-400 font-medium">Role: {user?.role || 'Service Staff'}</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-teal-600/20 text-teal-400 border border-teal-500/20 font-medium'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white border border-transparent'
              }`}
            >
              <Icon size={18} className={`mr-3 ${isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-white'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/80">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
        >
          <LogOut size={18} className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#07090f] overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-full shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 w-64 z-50 md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-[#0d0f17] border-b border-slate-800/80 md:hidden z-30">
          <span className="text-lg font-bold text-white">Room-Bot Staff</span>
          <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-white">
            <Menu size={24} />
          </button>
        </header>

        {/* Scrollable Layout Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#06080e] via-[#090b14] to-[#030408] p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default StaffLayout;
