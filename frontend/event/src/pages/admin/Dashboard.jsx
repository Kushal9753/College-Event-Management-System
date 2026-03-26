import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for rejection inline form
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, statsRes] = await Promise.all([
        api.get('/events/pending'),
        api.get('/admin/stats')
      ]);
      setEvents(eventsRes.data.data || []);
      setStats(statsRes.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    try {
      setActionLoading(id);
      await api.put(`/events/${id}/approve`);
      // Remove approved event from list
      setEvents(events.filter(event => event._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve event');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartReject = (id) => {
    setRejectingId(id);
    setRejectionReason('');
  };

  const handleCancelReject = () => {
    setRejectingId(null);
    setRejectionReason('');
  };

  const handleSubmitReject = async (id) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    
    try {
      setActionLoading(id);
      await api.put(`/events/${id}/reject`, { rejection_reason: rejectionReason });
      // Remove rejected event from list
      setEvents(events.filter(event => event._id !== id));
      setRejectingId(null);
      setRejectionReason('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject event');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Review and manage pending event requests submitted by faculty.</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Students" value={stats.users.students} color="blue" />
          <StatCard title="Total Faculty" value={stats.users.faculty} color="emerald" />
          <StatCard title="Approved Events" value={stats.events.approved} color="indigo" />
          <StatCard title="Pending Events" value={stats.events.pending} color="amber" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Pending Events</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            {events.length} pending
          </span>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center border-t border-gray-200 dark:border-gray-700">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">All caught up!</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">There are no pending events requiring your approval.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {events.map((event) => (
              <li key={event._id} className="p-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate">{event.title}</h4>
                    <p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300 mr-1">Organizer:</span>
                      {event.organizer?.name || 'Unknown'} {event.organizer?.enrollmentNumber ? `(${event.organizer.enrollmentNumber})` : ''}
                    </p>
                    <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-1">
                      <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-1">
                      <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 flex flex-col items-end space-y-2">
                    {rejectingId === event._id ? (
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-red-200 dark:border-red-900 w-full sm:w-72 shadow-sm">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Reason for rejection:</label>
                        <textarea
                          autoFocus
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-red-500 focus:ring-red-500 py-1.5 px-2"
                          rows="2"
                          placeholder="Please provide details..."
                        ></textarea>
                        <div className="mt-2 flex justify-end space-x-2">
                          <button
                            onClick={handleCancelReject}
                            disabled={actionLoading === event._id}
                            className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-2 py-1"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSubmitReject(event._id)}
                            disabled={actionLoading === event._id}
                            className="text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 px-3 py-1 disabled:bg-red-400"
                          >
                            {actionLoading === event._id ? 'Rejecting...' : 'Confirm Reject'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleApprove(event._id)}
                          disabled={actionLoading === event._id}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 dark:focus:ring-offset-gray-800"
                        >
                          <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Approve
                        </button>
                        <button
                          onClick={() => handleStartReject(event._id)}
                          disabled={actionLoading === event._id}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 dark:focus:ring-offset-gray-800"
                        >
                          <svg className="-ml-1 mr-2 h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800',
  };

  return (
    <div className={`p-6 rounded-xl border ${colors[color]} shadow-sm`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
};

export default Dashboard;
