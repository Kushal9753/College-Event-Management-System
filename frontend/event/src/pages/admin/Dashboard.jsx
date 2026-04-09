import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import EventDetailsModal from '../../components/common/EventDetailsModal';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket();
  
  // Tabs State
  const tabs = ['All', 'Pending', 'Approved', 'Rejected'];
  const [activeTab, setActiveTab] = useState('All');
  
  // State for rejection inline form
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, statsRes] = await Promise.all([
        api.get('/events'), // Fetch all events
        api.get('/admin/stats').catch(() => ({ data: { data: null } })) // Ignore stats error if not implemented
      ]);
      setEvents(eventsRes.data.data || []);
      if (statsRes.data?.data) {
        setStats(statsRes.data.data);
      }
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

  useEffect(() => {
    if (!socket) return;
    socket.on('event_created', fetchData);
    socket.on('event_updated', fetchData);
    
    return () => {
      socket.off('event_created', fetchData);
      socket.off('event_updated', fetchData);
    };
  }, [socket]);

  const handleApprove = async (id) => {
    try {
      setActionLoading(id);
      await api.patch(`/events/${id}/approve`);
      // Update event status instantly in local state
      setEvents(events.map(event => event._id === id ? { ...event, status: 'approved' } : event));
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
      await api.patch(`/events/${id}/reject`, { rejection_reason: rejectionReason });
      // Update event status instantly in local state
      setEvents(events.map(event => event._id === id ? { ...event, status: 'rejected', rejectionReason } : event));
      setRejectingId(null);
      setRejectionReason('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject event');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter events based on active tab
  const filteredEvents = events.filter(event => 
    activeTab === 'All' ? true : event.status?.toLowerCase() === activeTab.toLowerCase()
  );

  const renderStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Rejected</span>;
      case 'pending':
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Pending</span>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Review and manage event requests submitted by faculty.</p>
      </div>

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
        {/* Header and Tabs */}
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4 sm:mb-0">
              Event Applications
            </h3>
            
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-900/50 p-1 rounded-lg">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab
                      ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center border-t border-gray-200 dark:border-gray-700">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No events found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">There are no events matching the "{activeTab}" filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Event Name & Details</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Venue</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEvents.map((event) => (
                  <tr key={event._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{event.name || event.title}</span>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1 space-x-2">
                          {event.category && (
                            <span className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded text-xs border border-indigo-100 dark:border-indigo-800">
                              {event.category}
                            </span>
                          )}
                          <span>By: {event.createdBy?.name || event.organizer?.name || 'Unknown'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-300">{new Date(event.date).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{event.time || new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-300">{event.venue || event.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col items-start gap-1">
                        {renderStatusBadge(event.status)}
                        {event.status === 'rejected' && event.rejectionReason && (
                           <span className="text-xs text-red-500 truncate max-w-[150px]" title={event.rejectionReason}>Res: {event.rejectionReason}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {event.status === 'pending' ? (
                        rejectingId === event._id ? (
                          <div className="flex flex-col items-end space-y-2 min-w-[200px]">
                            <input
                              type="text"
                              autoFocus
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              className="w-full text-sm rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-red-500 py-1 px-2"
                              placeholder="Reason..."
                            />
                            <div className="flex space-x-2">
                              <button onClick={handleCancelReject} className="text-gray-500 hover:text-gray-700">Cancel</button>
                              <button onClick={() => handleSubmitReject(event._id)} className="text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded">Reject</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleApprove(event._id)}
                              disabled={actionLoading === event._id}
                              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStartReject(event._id)}
                              disabled={actionLoading === event._id}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => setSelectedEvent(event)}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 ml-2"
                            >
                              Details
                            </button>
                          </div>
                        )
                      ) : (
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium"
                        >
                          Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedEvent && (
        <EventDetailsModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}
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
