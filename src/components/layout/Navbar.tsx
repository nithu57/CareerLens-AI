import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  Briefcase,
  TrendingUp,
  BookOpen,
  Bot,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, userProfile, logout, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const navLinks = [
    { name: 'Features', path: '/features' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Career Explorer', path: '/career-explorer' },
    { name: 'Live Jobs', path: '/jobs' },
    { name: 'Market Insights', path: '/market-insights' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-subtle group-hover:shadow-card transition-all">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-navy-950 font-sans">
                Career<span className="text-brand-600">Lens</span>
              </span>
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-brand-50 text-brand-700 rounded border border-brand-200">
                AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-brand-700 bg-brand-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Auth Action Area */}
          <div className="hidden md:flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all flex items-center space-x-1.5"
                >
                  <span>Dashboard</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-semibold text-xs overflow-hidden">
                      {currentUser.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        currentUser.displayName?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                  </button>
                  <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-elevated border border-slate-200 py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {userProfile?.displayName || currentUser.displayName || 'Member'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      <Compass className="w-4 h-4 mr-2 text-slate-400" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      <UserIcon className="w-4 h-4 mr-2 text-slate-400" />
                      Profile & Skills
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      <ShieldCheck className="w-4 h-4 mr-2 text-slate-400" />
                      Settings & Setup
                    </Link>
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-3">
            {currentUser ? (
              <div className="space-y-2">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2.5 text-center rounded-lg font-semibold text-white bg-brand-600"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full py-2 text-center text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center rounded-lg text-sm font-medium text-slate-700 border border-slate-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center rounded-lg text-sm font-semibold text-white bg-brand-600"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
