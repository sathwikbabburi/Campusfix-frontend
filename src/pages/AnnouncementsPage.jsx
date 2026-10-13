import React, { useState, useEffect } from 'react';
import { announcementsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AnnouncementsPage = () => {
  const { isAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    department: 'Campus Wide',
    priority: 'NORMAL',
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await announcementsApi.getAll();
      if (res.success) setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await announcementsApi.create(formData);
      if (res.success) {
        setModalOpen(false);
        setFormData({ title: '', content: '', department: 'Campus Wide', priority: 'NORMAL' });
        fetchAnnouncements();
      }
    } catch (err) {
      alert(err.message || 'Could not post notice');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this notice?')) {
      try {
        await announcementsApi.delete(id);
        fetchAnnouncements();
      } catch (err) {
        alert(err.message || 'Could not delete notice');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Campus Maintenance Advisories</h1>
          <p className="text-xs text-gray-500 mt-1">
            Official announcements regarding power shutdowns, water reservoir cleanings, network upgrades & civil works
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition"
          >
            + Broadcast Advisory
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching notices..." />
      ) : announcements.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 text-gray-400 text-sm">
          No active maintenance notices at this time. All campus systems operating normally.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {announcements.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                    {item.department}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 leading-snug">{item.title}</h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed whitespace-pre-line">{item.content}</p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <span>By: {item.createdBy?.fullName || 'Campus Administration'}</span>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-semibold"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Broadcast Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-lg text-gray-900">Broadcast Maintenance Advisory</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Water Supply Interruption on Block B"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Details & Timeline *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Specify affected wings, dates, and alternate arrangements..."
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                >
                  <option value="Campus Wide">Campus Wide</option>
                  <option value="Electrical & Power Dept">Electrical & Power Dept</option>
                  <option value="Plumbing & Water Dept">Plumbing & Water Dept</option>
                  <option value="IT & Systems Support">IT & Systems Support</option>
                  <option value="Estate & Facilities Office">Estate & Facilities Office</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
