import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-sm font-bold text-white">Room-Bot Service</p>
          <p className="text-xs text-slate-500 mt-1">© {new Date().getFullYear()} Room-Bot. All rights reserved.</p>
        </div>
        <div className="flex items-center gap-6 text-xs font-semibold">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}