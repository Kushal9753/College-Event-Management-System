import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import EventDetailsModal from '../../components/common/EventDetailsModal';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  
  const socket = useSocket();

  const categories = ['All', 'hackathon', 'seminar', 'workshop', 'cultural', 'sports', 'technical', 'other'];
  const statuses = ['All', 'pending', 'approved', 'ongoing', 'completed', 'rejected', 'archived'];

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      setEvents(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('event_created', fetchEvents);
    socket.on('event_updated', fetchEvents);
    socket.on('event_archived', fetchEvents);
    
    return () => {
      socket.off('event_created', fetchEvents);
      socket.off('event_updated', fetchEvents);
      socket.off('event_archived', fetchEvents);
    };
  }, [socket]);

  const handleArchive = async (id) => {
    if (!window.confirm('Are you sure you want to archive this event?')) return;
    
    try {
      setActionLoading(id);
      await api.patch(`/events/${id}/archive`);
      setEvents(events.map(ev => ev._id === id ? { ...ev, status: 'archived' } : ev));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to archive event');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = (event.title || event.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || event.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const renderStatusBadge = (status) => {
    const baseClasses = "px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider";
    switch (status?.toLowerCase()) {
      case 'approved':
        return <span className={`${baseClasses} bg-green-100 text-green-700 border border-green-200`}>Approved</span>;
      case 'pending':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-700 border border-yellow-200`}>Pending</span>;
      case 'rejected':
        return <span className={`${baseClasses} bg-red-100 text-red-700 border border-red-200`}>Rejected</span>;
      case 'ongoing':
        return <span className={`${baseClasses} bg-blue-100 text-blue-700 border border-blue-200`}>Ongoing</span>;
      case 'completed':
        return <span className={`${baseClasses} bg-purple-100 text-purple-700 border border-purple-200`}>Completed</span>;
      case 'archived':
        return <span className={`${baseClasses} bg-gray-100 text-gray-600 border border-gray-200`}>Archived</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-700 border border-gray-200`}>{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Manage Events</h1>
          <p className="text-gray-600">Review, organize, and manage all campus events in one place.</p>
        </div>

        <Link
          to="/admin/events/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Event
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search events by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all text-sm"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-sm bg-white"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-sm bg-white"
        >
          {statuses.map(status => (
            <option key={status} value={status}>{status === 'All' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Event List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Fetching events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-8">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium">No events found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Event Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Venue</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Creator</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEvents.map((event) => (
                  <tr key={event._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 line-clamp-1">{event.title || event.name}</span>
                        <span className="text-xs text-gray-500 mt-1 capitalize bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded w-fit">{event.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900 font-medium">{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="text-xs text-gray-500 mt-0.5">{event.time || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 line-clamp-1">{event.venue || event.location}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                          {event.createdBy?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-sm text-gray-700">{event.createdBy?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {renderStatusBadge(event.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                          title="View Details"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        
                        {event.status !== 'archived' && (
                          <button
                            onClick={() => handleArchive(event._id)}
                            disabled={actionLoading === event._id}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                            title="Archive Event"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                          </button>
                        )}
                      </div>
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

export default ManageEvents;
