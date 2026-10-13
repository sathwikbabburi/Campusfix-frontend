import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { complaintsApi } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TrackTicketPage = () => {
  const [searchParams] = useSearchParams();
  const [ticketInput, setTicketInput] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookupTicket = async (ticketNum) => {
    if (!ticketNum) return;
    setLoading(true);
    setError('');
    try {
      const res = await complaintsApi.getByTicket(ticketNum.trim());
      if (res.success && res.data) {
        setComplaint(res.data);
      } else {
        throw new Error('Ticket not found');
      }
    } catch (err) {
      setComplaint(null);
      setError(err.message || 'No complaint matches this ticket number');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const queryTicket = searchParams.get('ticket');
    if (queryTicket) {
      setTicketInput(queryTicket);
      lookupTicket(queryTicket);
    }
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    lookupTicket(ticketInput);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl mb-2">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Public Ticket Status Tracker</h1>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          Enter any campus complaint ticket code to view real-time technician progress without logging in.
        </p>
      </div>

      {/* Tracker Search Input */}
      <form onSubmit={handleSubmit} className="bg-white p-2.5 rounded-2xl border border-gray-200 shadow-md flex gap-2">
        <input
          type="text"
          value={ticketInput}
          onChange={(e) => setTicketInput(e.target.value)}
          placeholder="e.g. CF-2026-001 or CF-2026-002"
          className="flex-1 px-4 py-3 text-sm bg-transparent focus:outline-none font-mono text-gray-800 uppercase"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition active:scale-95"
        >
          Track Issue
        </button>
      </form>

      {/* Quick sample chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400">
        <span>Try Sample Tickets:</span>
        {['CF-2026-001', 'CF-2026-002', 'CF-2026-003'].map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => {
              setTicketInput(code);
              lookupTicket(code);
            }}
            className="font-mono text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 transition"
          >
            {code}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner text="Locating ticket in database..." size="md" />}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center text-xs text-red-700 font-semibold">
          {error}
        </div>
      )}

      {complaint && !loading && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6 animate-in fade-in zoom-in-95">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl">
                {complaint.ticketNumber}
              </span>
              <StatusBadge status={complaint.status} />
            </div>
            <PriorityBadge priority={complaint.priority} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">{complaint.title}</h2>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{complaint.description}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/70 p-4 rounded-2xl border border-gray-100 text-xs">
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase">Category</div>
              <div className="font-semibold text-gray-800 mt-0.5">{complaint.category?.name}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase">Location</div>
              <div className="font-semibold text-gray-800 mt-0.5">{complaint.locationBlock}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase">Assigned Staff</div>
              <div className="font-semibold text-blue-600 mt-0.5">
                {complaint.assignedStaff ? complaint.assignedStaff.fullName : 'Pending Allocation'}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase">SLA Target</div>
              <div className="font-semibold text-emerald-600 mt-0.5">{complaint.category?.slaHours} Hours</div>
            </div>
          </div>

          {/* Audit Timeline */}
          {complaint.timeline && complaint.timeline.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Progress Timeline</h3>
              <div className="space-y-2.5">
                {complaint.timeline.map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs bg-gray-50/50 p-2.5 rounded-xl">
                    <span className="text-emerald-500 font-bold">●</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-800">{entry.newStatus}</span>
                        <span className="text-[10px] text-gray-400">{new Date(entry.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-gray-600 mt-0.5">{entry.actionComment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 text-center">
            <Link
              to={`/complaints/${complaint.id}`}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              Open Full Detailed View & Upvote →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackTicketPage;
