import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintsApi, categoriesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

const ComplaintsListPage = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  const fetchCategories = async () => {
    try {
      const res = await categoriesApi.getAll();
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 9,
        search: search.trim() || undefined,
        categoryId: selectedCategory || undefined,
        status: selectedStatus || undefined,
        priority: selectedPriority || undefined,
      };
      const res = await complaintsApi.getAll(params);
      if (res.success && res.data) {
        setComplaints(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [page, selectedCategory, selectedStatus, selectedPriority]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchComplaints();
  };

  const handleUpvote = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await complaintsApi.toggleUpvote(id);
      if (res.success) {
        setComplaints((prev) =>
          prev.map((c) => {
            if (c.id === id) {
              const diff = res.data ? 1 : -1;
              return {
                ...c,
                hasUpvoted: res.data,
                upvotesCount: Math.max(0, (c.upvotesCount || 0) + diff),
              };
            }
            return c;
          })
        );
      }
    } catch (err) {
      alert(err.message || 'Please sign in to upvote');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Campus Complaints & Repairs</h1>
          <p className="text-xs text-gray-500 mt-1">
            Browse, filter, and track public issues reported by students and faculty ({totalElements} total tickets)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-blue-600' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Grid View"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'table' ? 'bg-white shadow-xs text-blue-600' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Table View"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <Link
            to="/new-complaint"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
          >
            <span>+</span> Lodge Issue
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <svg className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket # (CF-...), problem description, location..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold rounded-xl transition"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-gray-50">
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(0); }}
            className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setPage(0); }}
            className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => { setSelectedPriority(e.target.value); setPage(0); }}
            className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('');
              setSelectedStatus('');
              setSelectedPriority('');
              setPage(0);
            }}
            className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner text="Fetching campus tickets..." size="lg" />
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No complaints found"
          description="Try broadening your search query or reset the applied category and status filters."
          actionText="Lodge New Complaint"
          actionLink="/new-complaint"
        />
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {complaints.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
            >
              {/* Optional Photo Header */}
              {item.imageUrl && (
                <div className="h-44 w-full overflow-hidden bg-gray-100 relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  {!item.imageUrl && (
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-mono text-xs font-bold text-gray-400">{item.ticketNumber}</span>
                      <StatusBadge status={item.status} />
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {item.category?.name}
                    </span>
                    <PriorityBadge priority={item.priority} />
                  </div>

                  <Link to={`/complaints/${item.id}`} className="block">
                    <h3 className="font-bold text-base text-gray-900 group-hover:text-blue-600 transition line-clamp-2 mt-1">
                      {item.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-gray-500 line-clamp-3 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                    <span>📍</span>
                    <span className="truncate">{item.locationBlock}</span>
                  </div>

                  {/* Upvote Button */}
                  <button
                    onClick={(e) => handleUpvote(item.id, e)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition ${
                      item.hasUpvoted
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                    }`}
                  >
                    <span>👍</span>
                    <span>{item.upvotesCount}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Upvotes</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {complaints.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{item.ticketNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900 max-w-xs truncate">{item.title}</td>
                    <td className="py-3.5 px-4">{item.category?.name}</td>
                    <td className="py-3.5 px-4"><PriorityBadge priority={item.priority} /></td>
                    <td className="py-3.5 px-4">{item.locationBlock}</td>
                    <td className="py-3.5 px-4"><StatusBadge status={item.status} /></td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={(e) => handleUpvote(item.id, e)}
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          item.hasUpvoted ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        👍 {item.upvotesCount}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/complaints/${item.id}`}
                        className="px-3 py-1 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-lg text-xs font-semibold transition"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-xs text-gray-500 font-medium">
            Page {page + 1} of {totalPages} ({totalElements} items)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsListPage;
