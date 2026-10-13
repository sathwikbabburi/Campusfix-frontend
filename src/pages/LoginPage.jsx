import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonaClick = async (roleKey) => {
    setLoading(true);
    setError('');
    try {
      await quickLogin(roleKey);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Demo persona login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-blue-500/20 font-bold text-xl">
            CF
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Sign in to CampusFix</h2>
          <p className="text-xs text-gray-500 mt-1">Access your campus tickets, resolution updates & dashboard</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Campus Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahul.verma@campusfix.edu"
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition active:scale-98 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Fast Logins Section for Viva & Examiners */}
        <div className="pt-4 border-t border-gray-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 text-center mb-2.5">
            ⚡ 1-Click Evaluator Personas
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handlePersonaClick('STUDENT')}
              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-left border border-blue-100 transition flex flex-col"
            >
              <span>👨‍🎓 Student</span>
              <span className="text-[10px] text-blue-500 font-normal truncate">Rahul Verma</span>
            </button>

            <button
              type="button"
              onClick={() => handlePersonaClick('STAFF')}
              className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded-lg text-left border border-amber-100 transition flex flex-col"
            >
              <span>⚡ Electrician</span>
              <span className="text-[10px] text-amber-600 font-normal truncate">Manoj Kumar</span>
            </button>

            <button
              type="button"
              onClick={() => handlePersonaClick('STAFF_IT')}
              className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg text-left border border-emerald-100 transition flex flex-col"
            >
              <span>💻 IT Admin</span>
              <span className="text-[10px] text-emerald-600 font-normal truncate">Suresh Patel</span>
            </button>

            <button
              type="button"
              onClick={() => handlePersonaClick('ADMIN')}
              className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold rounded-lg text-left border border-purple-100 transition flex flex-col"
            >
              <span>🏛️ Campus Admin</span>
              <span className="text-[10px] text-purple-600 font-normal truncate">Dr. Rajesh Rao</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 pt-2">
          New to CampusFix?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
