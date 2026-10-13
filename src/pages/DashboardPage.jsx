import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardApi, complaintsApi } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DashboardPage = () => {
  const { user, isAdmin, isStaff } = useAuth();
  const [stats, setStats] = useState(null);
  const [myComplaints, setMyComplaints] = useState([]);
  const [assignedComplaints, setAssignedComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const statsRes = await dashboardApi.getStats();
      if (statsRes.success) setStats(statsRes.data);

      if (isStaff || isAdmin) {
        const assignedRes = await complaintsApi.getAssigned();
        if (assignedRes.success) setAssignedComplaints(assignedRes.data);
      }

      const myRes = await complaintsApi.getMy();
      if (myRes.success) setMyComplaints(myRes.data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Compiling campus analytics & reports..." size="lg" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Greeting */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
            alt=""
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500/20 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome, {user?.fullName}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {user?.department} • CampusFix Control Hub
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-xl border border-gray-200 transition"
            title="Refresh Metrics"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <Link
            to="/new-complaint"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition"
          >
            + Lodge Complaint
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Campus Issues</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              📋
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-gray-900">{stats?.totalComplaints || 0}</span>
            <span className="text-xs text-gray-500 ml-2">All-time</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">In Progress</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
              ⚙️
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-purple-600">{stats?.inProgressComplaints || 0}</span>
            <span className="text-xs text-purple-600/70 ml-2">Active repair</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Resolved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              ✅
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-emerald-600">{stats?.resolvedComplaints || 0}</span>
            <span className="text-xs text-emerald-600/70 ml-2">Fixed & closed</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Critical Safety</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">
              🚨
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-red-600">{stats?.criticalComplaints || 0}</span>
            <span className="text-xs text-red-600/70 ml-2">High urgency</span>
          </div>
        </div>
      </div>

      {/* Staff View: My Assigned Tickets Queue */}
      {(isStaff || isAdmin) && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Assigned Maintenance Queue</h2>
              <p className="text-xs text-gray-500">Tickets assigned to your department ({user?.department})</p>
            </div>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">
              {assignedComplaints.length} Assigned
            </span>
          </div>

          {assignedComplaints.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400 bg-gray-50 rounded-2xl">
              No pending assigned tickets in your queue! Outstanding work completed.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Issue Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {assignedComplaints.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{item.ticketNumber}</td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900 max-w-xs truncate">{item.title}</td>
                      <td className="py-3.5 px-4">{item.category?.name}</td>
                      <td className="py-3.5 px-4"><PriorityBadge priority={item.priority} /></td>
                      <td className="py-3.5 px-4">{item.locationBlock} {item.roomNumber && `(${item.roomNumber})`}</td>
                      <td className="py-3.5 px-4"><StatusBadge status={item.status} /></td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/complaints/${item.id}`}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                        >
                          Update Status
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Analytics Breakdown Grid: Categories & Locations */}
      {stats?.complaintsByCategory && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-gray-900">Issues by Category</h3>
            <div className="space-y-3">
              {Object.entries(stats.complaintsByCategory).map(([catName, count]) => {
                const percentage = stats.totalComplaints > 0 ? Math.round((count / stats.totalComplaints) * 100) : 0;
                return (
                  <div key={catName} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-700">{catName}</span>
                      <span className="text-gray-400 font-mono">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location Hotspots */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-gray-900">Location Hotspots</h3>
            <div className="space-y-3">
              {stats.complaintsByLocation && Object.entries(stats.complaintsByLocation).map(([locName, count]) => {
                return (
                  <div key={locName} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">📍</span>
                      <span className="text-xs font-bold text-gray-800">{locName}</span>
                    </div>
                    <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-gray-200 text-blue-700">
                      {count} tickets
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* User's Own Submitted Complaints */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">My Submitted Complaints</h2>
            <p className="text-xs text-gray-500">Track real-time progress and resolutions for tickets you lodged</p>
          </div>
          <Link to="/new-complaint" className="text-xs font-bold text-blue-600 hover:text-blue-700">
            + New Ticket
          </Link>
        </div>

        {myComplaints.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400 bg-gray-50 rounded-2xl">
            You haven't submitted any complaints yet. When you notice an issue around campus, report it here!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Upvotes</th>
                  <th className="py-3 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {myComplaints.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{item.ticketNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900 max-w-xs truncate">{item.title}</td>
                    <td className="py-3.5 px-4">{item.category?.name}</td>
                    <td className="py-3.5 px-4">{item.locationBlock}</td>
                    <td className="py-3.5 px-4"><StatusBadge status={item.status} /></td>
                    <td className="py-3.5 px-4">👍 {item.upvotesCount}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/complaints/${item.id}`}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
