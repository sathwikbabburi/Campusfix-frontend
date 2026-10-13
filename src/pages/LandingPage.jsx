import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardApi, announcementsApi } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';

const LandingPage = () => {
  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [searchTicket, setSearchTicket] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, annRes] = await Promise.all([
          dashboardApi.getStats(),
          announcementsApi.getActive(),
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (annRes.success) setAnnouncements(annRes.data);
      } catch (err) {
        console.error('Failed to load landing page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (searchTicket.trim()) {
      navigate(`/track?ticket=${encodeURIComponent(searchTicket.trim())}`);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-900 to-gray-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm animate-pulse">
            <span>✨ Powered by AI Automatic Categorization & RAG</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Fix Campus Issues <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Faster, Smarter, & Seamlessly.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-blue-100/80 leading-relaxed font-light">
            CampusFix automatically classifies complaints, notifies specialized maintenance crews, enforces SLA turnaround times, and keeps every student informed.
          </p>

          {/* Quick Ticket Tracker Search Box */}
          <form onSubmit={handleTrackSubmit} className="max-w-xl mx-auto flex gap-2 p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTicket}
                onChange={(e) => setSearchTicket(e.target.value)}
                placeholder="Enter Ticket Number (e.g. CF-2026-001)..."
                className="w-full bg-transparent px-4 py-3 text-white placeholder-blue-200/60 text-sm focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl text-sm transition shadow-md active:scale-95"
            >
              Track Issue
            </button>
          </form>

          {/* Primary CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to="/new-complaint"
              className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              🚀 Lodge a Complaint
            </Link>
            <Link
              to="/complaints"
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 backdrop-blur-sm transition"
            >
              Browse Campus Issues
            </Link>
          </div>
        </div>
      </section>

      {/* Real-time KPI Stats Banner */}
      <section className="max-w-6xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center p-3 border-r border-gray-100 last:border-none">
            <div className="text-3xl font-extrabold text-blue-600">{stats?.totalComplaints ?? 5}</div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Total Reported</div>
          </div>
          <div className="text-center p-3 border-r border-gray-100 last:border-none">
            <div className="text-3xl font-extrabold text-purple-600">{stats?.inProgressComplaints ?? 2}</div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">In Progress</div>
          </div>
          <div className="text-center p-3 border-r border-gray-100 last:border-none">
            <div className="text-3xl font-extrabold text-emerald-600">{stats?.resolvedComplaints ?? 1}</div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Resolved</div>
          </div>
          <div className="text-center p-3">
            <div className="text-3xl font-extrabold text-amber-500">⭐ {stats?.averageRating ?? 4.8} / 5</div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Student Satisfaction</div>
          </div>
        </div>
      </section>

      {/* Campus Advisories & Announcements */}
      {announcements && announcements.length > 0 && (
        <section className="max-w-6xl mx-auto px-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📢</span>
              <h3 className="font-bold text-amber-900 text-sm uppercase tracking-wider">Active Campus Maintenance Notice</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {announcements.slice(0, 2).map((ann) => (
                <div key={ann.id} className="bg-white/80 p-4 rounded-xl border border-amber-100">
                  <div className="font-bold text-gray-900 text-sm mb-1">{ann.title}</div>
                  <p className="text-xs text-gray-600 line-clamp-2">{ann.content}</p>
                  <span className="inline-block mt-2 text-[10px] font-semibold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded">
                    {ann.department}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Core Innovation Highlights (Week 1 to 15 Architecture) */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">Engineered for Universities</h2>
          <h3 className="text-3xl font-extrabold text-gray-900">Why CampusFix is Different</h3>
          <p className="text-sm text-gray-500 mt-2">Eliminating traditional paper registers, messy WhatsApp groups, and untracked maintenance calls.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl mb-4">
              🤖
            </div>
            <h4 className="font-bold text-gray-900 text-base mb-2">Instant AI Auto-Categorization</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Our intelligent keyword and NLP engine immediately detects whether an issue belongs to Electrical, Plumbing, IT, or Civil, and calculates urgency.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl mb-4">
              👍
            </div>
            <h4 className="font-bold text-gray-900 text-base mb-2">Duplicate Prevention & Upvoting</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Multiple students in a dorm or lab can upvote a single ticket instead of lodging 50 identical complaints, escalating its urgency score!
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mb-4">
              ⏱️
            </div>
            <h4 className="font-bold text-gray-900 text-base mb-2">Strict Department SLAs & Audit</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Every category has enforced resolution deadlines (e.g. 12h for electrical, 24h for WiFi). Full timestamped audit trail on every update.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Resolved Issues Showcase */}
      {stats?.recentComplaints && stats.recentComplaints.length > 0 && (
        <section className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Recent Campus Activity</h3>
              <p className="text-xs text-gray-500 mt-1">Live updates on maintenance tickets across campus blocks</p>
            </div>
            <Link to="/complaints" className="text-xs font-bold text-blue-600 hover:text-blue-700">
              View All Issues →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {stats.recentComplaints.slice(0, 3).map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-xs font-bold text-gray-500">{item.ticketNumber}</span>
                    <StatusBadge status={item.status} />
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 mb-1 line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.description}</p>
                </div>
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  <span>📍 {item.locationBlock}</span>
                  <span>👍 {item.upvotesCount} upvotes</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default LandingPage;
