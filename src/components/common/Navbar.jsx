import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isStaff, logout, quickLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickLoginOpen, setQuickLoginOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleQuickLogin = async (role) => {
    try {
      await quickLogin(role);
      setQuickLoginOpen(false);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent">
                  Campus<span className="text-blue-500">Fix</span>
                </span>
                <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase -mt-1">
                  Smart AI Resolution
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/') ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Home
              </Link>

              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/dashboard') ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Dashboard
                </Link>
              )}

              <Link
                to="/complaints"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/complaints') ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                All Issues
              </Link>

              <Link
                to="/track"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/track') ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Track Ticket
              </Link>

              <Link
                to="/announcements"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/announcements') ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Notices
              </Link>
            </div>
          </div>

          {/* Right Action Section */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/new-complaint"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-sm font-semibold shadow-sm shadow-blue-500/20 hover:shadow-md transition active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Lodge Complaint
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="flex items-center gap-2.5">
                  <img
                    src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={user?.fullName}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/30"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-gray-900 max-w-[120px] truncate">{user?.fullName}</span>
                    <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">{user?.role}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Demo Quick-Login Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setQuickLoginOpen(!quickLoginOpen)}
                    className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition flex items-center gap-1.5"
                  >
                    <span>⚡ Quick Demo Login</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {quickLoginOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                        Switch Demo Persona
                      </div>
                      <button
                        onClick={() => handleQuickLogin('STUDENT')}
                        className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between"
                      >
                        <span>👨‍🎓 Student (Rahul)</span>
                        <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">Student</span>
                      </button>
                      <button
                        onClick={() => handleQuickLogin('STAFF')}
                        className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between"
                      >
                        <span>⚡ Manoj (Electrical Tech)</span>
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Staff</span>
                      </button>
                      <button
                        onClick={() => handleQuickLogin('STAFF_IT')}
                        className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between"
                      >
                        <span>💻 Suresh (IT Admin)</span>
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Staff</span>
                      </button>
                      <button
                        onClick={() => handleQuickLogin('ADMIN')}
                        className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-700 flex items-center justify-between"
                      >
                        <span>🏛️ Dr. Rao (Campus Admin)</span>
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Admin</span>
                      </button>
                    </div>
                  )}
                </div>

                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            Home
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Dashboard
            </Link>
          )}
          <Link
            to="/complaints"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            All Issues
          </Link>
          <Link
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            Track Ticket
          </Link>
          <Link
            to="/announcements"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            Notices
          </Link>
          <Link
            to="/new-complaint"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-center px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-sm"
          >
            + Lodge Complaint
          </Link>
          {isAuthenticated ? (
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg"
            >
              Sign Out ({user?.fullName})
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
