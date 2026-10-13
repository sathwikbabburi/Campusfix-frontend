import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { complaintsApi, authApi, feedbacksApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ComplaintDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isStaff } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  // Status update form
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [actionComment, setActionComment] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionImageUrl, setResolutionImageUrl] = useState('');

  // Staff assignment form
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');

  // Feedback form
  const [rating, setRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState('');

  const fetchComplaintDetails = async () => {
    setLoading(true);
    try {
      const res = await complaintsApi.getById(id);
      if (res.success && res.data) {
        setComplaint(res.data);
        setNewStatus(res.data.status === 'ASSIGNED' ? 'IN_PROGRESS' : 'RESOLVED');
      }
    } catch (err) {
      setError(err.message || 'Complaint ticket not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const handleUpvote = async () => {
    try {
      const res = await complaintsApi.toggleUpvote(complaint.id);
      if (res.success) {
        const diff = res.data ? 1 : -1;
        setComplaint((prev) => ({
          ...prev,
          hasUpvoted: res.data,
          upvotesCount: Math.max(0, (prev.upvotesCount || 0) + diff),
        }));
      }
    } catch (err) {
      alert(err.message || 'Please sign in to upvote');
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        status: newStatus,
        actionComment: actionComment.trim() || `Status updated to ${newStatus}`,
        resolutionNotes: newStatus === 'RESOLVED' ? resolutionNotes : undefined,
        resolutionImageUrl: newStatus === 'RESOLVED' ? resolutionImageUrl : undefined,
      };
      const res = await complaintsApi.updateStatus(complaint.id, payload);
      if (res.success) {
        setStatusModalOpen(false);
        fetchComplaintDetails();
      }
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const openAssignModal = async () => {
    try {
      const res = await authApi.getStaff();
      if (res.success && res.data) {
        setStaffList(res.data);
        if (res.data.length > 0) setSelectedStaffId(res.data[0].id.toString());
      }
      setAssignModalOpen(true);
    } catch (err) {
      alert('Could not fetch technicians list');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaffId) return;
    try {
      const res = await complaintsApi.assignStaff(complaint.id, selectedStaffId);
      if (res.success) {
        setAssignModalOpen(false);
        fetchComplaintDetails();
      }
    } catch (err) {
      alert(err.message || 'Failed to assign staff');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await feedbacksApi.submit({
        complaintId: complaint.id,
        rating,
        comments: feedbackComments,
      });
      if (res.success) {
        setFeedbackModalOpen(false);
        fetchComplaintDetails();
      }
    } catch (err) {
      alert(err.message || 'Failed to submit feedback');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        await complaintsApi.delete(complaint.id);
        navigate('/complaints');
      } catch (err) {
        alert(err.message || 'Could not delete complaint');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading ticket details & history..." size="lg" />;
  }

  if (error || !complaint) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="text-3xl">🔍</div>
        <h2 className="text-xl font-bold text-gray-900">Complaint Not Found</h2>
        <p className="text-xs text-gray-500">{error || 'The requested ticket could not be located.'}</p>
        <Link to="/complaints" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">
          Return to All Issues
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === complaint.complainant?.id;
  const canUpdateStatus = isStaff || isAdmin;
  const canAssign = isAdmin;
  const canProvideFeedback = isOwner && (complaint.status === 'RESOLVED' || complaint.status === 'CLOSED') && !complaint.feedback;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/complaints" className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1">
            ← Back to Issues
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-mono text-xs font-bold text-blue-600">{complaint.ticketNumber}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Upvote Button */}
          <button
            onClick={handleUpvote}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              complaint.hasUpvoted
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <span>👍</span>
            <span>{complaint.hasUpvoted ? 'Upvoted' : 'Upvote Issue'} ({complaint.upvotesCount})</span>
          </button>

          {/* Staff Update Status Action */}
          {canUpdateStatus && (
            <button
              onClick={() => setStatusModalOpen(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              ⚙️ Update Status
            </button>
          )}

          {/* Admin Assign Staff Action */}
          {canAssign && (
            <button
              onClick={openAssignModal}
              className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs font-bold transition"
            >
              👤 Dispatch Staff
            </button>
          )}

          {/* Student Feedback Button */}
          {canProvideFeedback && (
            <button
              onClick={() => setFeedbackModalOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
            >
              ⭐ Rate Resolution
            </button>
          )}

          {/* Delete Action (if owner & submitted, or admin) */}
          {(isOwner && complaint.status === 'SUBMITTED') || isAdmin ? (
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl font-semibold transition"
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Ticket Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                  {complaint.ticketNumber}
                </span>
                <StatusBadge status={complaint.status} />
              </div>
              <PriorityBadge priority={complaint.priority} />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-snug">
                {complaint.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2">
                <span>Category: <strong className="text-gray-800">{complaint.category?.name}</strong></span>
                <span>•</span>
                <span>SLA: <strong className="text-emerald-600">{complaint.category?.slaHours}h Max</strong></span>
                <span>•</span>
                <span>Reported by: <strong className="text-gray-800">{complaint.complainant?.fullName}</strong></span>
              </div>
            </div>

            {/* Photo Evidence if uploaded */}
            {complaint.imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-gray-100 max-h-80 bg-gray-50">
                <img
                  src={complaint.imageUrl}
                  alt="Defect evidence"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed bg-gray-50/60 p-4 rounded-2xl border border-gray-100">
                {complaint.description}
              </p>
            </div>

            {/* Resolution Report Section (when resolved) */}
            {(complaint.resolutionNotes || complaint.resolutionImageUrl) && (
              <div className="bg-emerald-50/60 border border-emerald-200/80 p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <span>✅</span> Resolution Report
                </div>
                {complaint.resolutionNotes && (
                  <p className="text-xs text-emerald-950 leading-relaxed">
                    {complaint.resolutionNotes}
                  </p>
                )}
                {complaint.resolutionImageUrl && (
                  <div className="rounded-xl overflow-hidden max-h-60 border border-emerald-200">
                    <img src={complaint.resolutionImageUrl} alt="Resolution proof" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}

            {/* Student Feedback display */}
            {complaint.feedback && (
              <div className="bg-amber-50/60 border border-amber-200/80 p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-900">Student Satisfaction Rating</span>
                  <span className="text-base font-bold text-amber-600">{'⭐'.repeat(complaint.feedback.rating)} ({complaint.feedback.rating}/5)</span>
                </div>
                {complaint.feedback.comments && (
                  <p className="text-xs text-amber-950 italic">"{complaint.feedback.comments}"</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Metadata & Lifecycle Audit Timeline */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">Ticket Metadata</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-400">Campus Block:</span>
                <span className="font-semibold text-gray-800">{complaint.locationBlock}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-400">Room / Zone:</span>
                <span className="font-semibold text-gray-800">{complaint.roomNumber || 'General Area'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-400">Assigned Technician:</span>
                <span className="font-semibold text-blue-600">
                  {complaint.assignedStaff ? complaint.assignedStaff.fullName : 'Pending Allocation'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-400">Lodged At:</span>
                <span className="font-semibold text-gray-800">{new Date(complaint.createdAt).toLocaleString()}</span>
              </div>
              {complaint.resolvedAt && (
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-400">Resolved At:</span>
                  <span className="font-semibold text-emerald-600">{new Date(complaint.resolvedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Vertical Lifecycle Audit Timeline (Week 4 topic) */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">Audit Trail & Timeline</h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100">
              {complaint.timeline && complaint.timeline.length > 0 ? (
                complaint.timeline.map((entry, idx) => (
                  <div key={entry.id || idx} className="relative group">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-50" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {entry.newStatus}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 mt-1 leading-snug">{entry.actionComment}</p>
                      {entry.updatedBy && (
                        <div className="text-[10px] text-gray-400 mt-0.5">by {entry.updatedBy.fullName}</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-400">No timeline events recorded yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Update Status (Staff & Admin) */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-lg text-gray-900">Update Ticket Workflow Status</h3>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                >
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress (Work Commenced)</option>
                  <option value="RESOLVED">Resolved (Issue Fixed)</option>
                  <option value="CLOSED">Closed</option>
                  <option value="REOPENED">Reopened</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Progress Comment *</label>
                <textarea
                  required
                  rows={2}
                  value={actionComment}
                  onChange={(e) => setActionComment(e.target.value)}
                  placeholder="Technician reached site / ordered replacement parts..."
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>

              {newStatus === 'RESOLVED' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Resolution Summary Note *</label>
                    <textarea
                      required
                      rows={2}
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Detailed explanation of the mechanical / electrical / network fix applied..."
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Resolution Image URL (Proof)</label>
                    <input
                      type="url"
                      value={resolutionImageUrl}
                      onChange={(e) => setResolutionImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Save Status Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Assign Technician (Admin) */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-gray-900">Dispatch Maintenance Staff</h3>
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Technician</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                >
                  {staffList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} ({st.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Assign Technician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Submit Student Feedback */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-lg text-gray-900">Rate Campus Repair Quality</h3>
            <p className="text-xs text-gray-500">Your rating helps the administration evaluate staff SLAs and efficiency.</p>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Satisfaction Rating (1-5)</label>
                <div className="flex gap-2 justify-center py-2 text-2xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="hover:scale-125 transition-transform"
                    >
                      {star <= rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Feedback Comments</label>
                <textarea
                  rows={3}
                  value={feedbackComments}
                  onChange={(e) => setFeedbackComments(e.target.value)}
                  placeholder="Was the repair prompt? Did the technician test the equipment?"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Submit & Close Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintDetailPage;
