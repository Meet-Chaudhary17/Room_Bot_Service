import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Wrench, Shield, CheckCircle, Clock } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function Home() {
  const features = [
    { title: 'Workload-Balanced Allocations', desc: 'Auto-assign requests to staff with the lowest workload in the respective block.', icon: Wrench },
    { title: 'OTP Completion Verification', desc: 'Secure verification via email OTP ensuring work is completed before close out.', icon: CheckCircle },
    { title: 'Admin Override Controls', desc: 'Administrator dashboard monitoring with override and reassignment capabilities.', icon: Shield },
    { title: 'Real-Time Sync Alerts', desc: 'Immediate notification pushes for requests status changes and updates.', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-8">
            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
            University Hostel Management Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-800 tracking-tight max-w-3xl leading-tight">
            Modern hostel services,{' '}
            <span className="text-indigo-600">seamlessly managed.</span>
          </h1>

          <p className="text-base sm:text-lg font-semibold text-slate-400 max-w-2xl mt-6 leading-relaxed">
            Room-Bot connects students, maintenance staff, and administrators on a single intelligent platform — from request submission to verified completion.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full sm:w-auto">
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:bg-indigo-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-8 py-4 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:text-slate-900 transition-all text-center"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-slate-50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">Advanced Operational Automation</h2>
              <p className="text-sm font-semibold text-slate-400 mt-2">Engineered to streamline room maintenance and service allocations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((f, i) => (
                <div key={i} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 leading-tight mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}