import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Compass,
  GitCompare,
  Briefcase,
  SearchCode,
  Map,
  BookOpen,
  Bot,
  TrendingUp,
  DollarSign,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, userProfile, logout, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Resume Analysis', path: '/resume', icon: FileText },
    { name: 'Career Explorer', path: '/career-explorer', icon: Compass },
    { name: 'Skill Gap Matrix', path: '/skill-gap', icon: GitCompare },
    { name: 'Live Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Job Matcher', path: '/job-analysis', icon: SearchCode },
    { name: 'Learning Roadmap', path: '/roadmap', icon: Map },
    { name: 'Learning Resources', path: '/resources', icon: BookOpen },
    { name: 'LensBot AI Mentor', path: '/lensbot', icon: Bot, badge: 'AI' },
    { name: 'Market Insights', path: '/market-insights', icon: TrendingUp },
    { name: 'Salary Insights', path: '/salary-insights', icon: DollarSign },
    { name: 'Profile & Goals', path: '/profile', icon: User },
    { name: 'Settings & Status', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans">
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-bold text-navy-950 text-base">
            Career<span className="text-brand-600">Lens</span> AI
          </span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Toggle navigation drawer"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Backdrop for mobile drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-subtle">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-navy-950">
                Career<span className="text-brand-600">Lens</span>
              </span>
              <span className="ml-1 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase bg-brand-50 text-brand-700 rounded border border-brand-200">
                AI
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Quick Info */}
        <div className="p-4 mx-3 my-2 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm border border-brand-200 overflow-hidden shrink-0">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                userProfile?.displayName?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {userProfile?.displayName || currentUser?.displayName || 'CareerLens User'}
              </p>
              <p className="text-[11px] text-brand-600 font-medium truncate">
                {userProfile?.targetRole || 'Select Target Role'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold border border-brand-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-brand-600 text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Firebase Config Notice & Logout */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          {!isConfigured && (
            <Link
              to="/settings"
              className="block p-2 text-[11px] rounded-lg bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors"
            >
              <div className="flex items-center space-x-1.5 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Firebase Keys Setup</span>
              </div>
              <p className="text-[10px] text-amber-700 mt-0.5">
                Paste credentials into .env.local
              </p>
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
