import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import EventService from '../../services/eventService';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import EventDetailsModal from '../../components/common/EventDetailsModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [createdEvents, setCreatedEvents] = useState([]);
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrationCounts, setRegistrationCounts] = useState({});
  
  // Filtering states
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [createdRes, assignedRes] = await Promise.all([
        EventService.getMyEvents(filters),
        api.get('/events/assigned'), // Assuming assigned doesn't need complex filters yet or use EventService
      ]);
      const created = createdRes.data || [];
      const assigned = assignedRes.data.data || [];
      setCreatedEvents(created);
      setAssignedEvents(assigned);

      const counts = {};
      [...created, ...assigned].forEach((ev) => {
        counts[ev._id] = ev.registrations?.length || 0;
      });
      setRegistrationCounts(counts);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchData]);

  useEffect(() => {
    if (!socket) return;
    const allEventIds = [...createdEvents.map(e => e._id), ...assignedEvents.map(e => e._id)];
    const uniqueIds = [...new Set(allEventIds)];
    uniqueIds.forEach(id => socket.emit('subscribe_event', id));

    const handleRegistrationUpdate = (data) => {
      if (data?.eventId) {
        setRegistrationCounts(prev => ({ ...prev, [data.eventId]: data.registrationCount }));
      }
    };

    socket.on('registration_update', handleRegistrationUpdate);
    socket.on('event_created', fetchData);
    socket.on('event_updated', fetchData);

    return () => {
      uniqueIds.forEach(id => socket.emit('unsubscribe_event', id));
      socket.off('registration_update', handleRegistrationUpdate);
      socket.off('event_created', fetchData);
      socket.off('event_updated', fetchData);
    };
  }, [socket, createdEvents.length, assignedEvents.length, fetchData]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      archived: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    };
    return (
      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || styles.pending}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const colors = {
      hackathon: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      seminar: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      workshop: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      cultural: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
      sports: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      technical: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
      other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${colors[category] || colors.other}`}>
        {category?.charAt(0).toUpperCase() + category?.slice(1)}
      </span>
    );
  };

  const totalCreated = createdEvents.length;
  const approvedCount = createdEvents.filter(e => e.status === 'approved').length;
  const totalRegistrations = Object.values(registrationCounts).reduce((sum, c) => sum + c, 0);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in p-4 lg:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Faculty Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Refined event management & real-time analytics.</p>
        </div>
        <button onClick={() => navigate('/faculty/create-event')} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg transition-all active:scale-95">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
          New Event
        </button>
      </div>

      {error && <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm">{error}</div>}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Created', value: totalCreated, color: 'text-blue-600' },
          { label: 'Assigned', value: assignedEvents.length, color: 'text-indigo-600' },
          { label: 'Approved', value: approvedCount, color: 'text-green-600' },
          { label: 'Live Registrations', value: totalRegistrations, color: 'text-emerald-600', live: true },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              {stat.label} {stat.live && <span className="flex h-2 w-2 relative"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative h-2 w-2 bg-emerald-500 rounded-full"></span></span>}
            </p>
            <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Advanced Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 mb-8 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input type="text" name="search" placeholder="Search events..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white" />
        </div>
        <select name="category" value={filters.category} onChange={handleFilterChange} className="w-full md:w-48 py-2 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white">
          <option value="">All Categories</option>
          {['hackathon', 'seminar', 'workshop', 'cultural', 'sports', 'technical', 'other'].map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
        </select>
        <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full md:w-48 py-2 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white">
          <option value="">All Statuses</option>
          {['pending', 'approved', 'completed', 'archived', 'rejected'].map(st => <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>)}
        </select>
      </div>

      {loading && createdEvents.length === 0 ? <div className="p-12 text-center text-gray-500">Loading experience...</div> : (
        <div className="space-y-8 pb-12">
          {/* Main Events Table */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Your Primary Events</h2>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Event Details</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Registrations</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Analytics</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {createdEvents.map(event => (
                      <tr key={event._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">{event.name}</div>
                          <div className="text-xs text-gray-500 flex gap-2 mt-1"><span>{new Date(event.date).toLocaleDateString()}</span><span>•</span><span>{event.venue}</span></div>
                        </td>
                        <td className="px-6 py-4">{getCategoryBadge(event.category)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full">
                            {registrationCounts[event._id] || 0} / {event.maxParticipants || '∞'}
                          </span>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(event.status)}</td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => setSelectedEvent(event)} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 underline uppercase">Manage →</button>
                        </td>
                      </tr>
                    ))}
                    {createdEvents.length === 0 && <tr><td colSpan="5" className="p-12 text-center text-gray-500 italic">No events found matching current criteria.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Assigned Section */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Assigned Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {assignedEvents.map(event => (
                <div key={event._id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border dark:border-gray-800 shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer" onClick={() => setSelectedEvent(event)}>
                  <div className="flex justify-between items-start mb-4">{getCategoryBadge(event.category)}{getStatusBadge(event.status)}</div>
                  <h3 className="font-bold dark:text-white mb-2 line-clamp-1">{event.name}</h3>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{event.description}</p>
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-600">
                    <span>Manage Analytics</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                  </div>
                </div>
              ))}
              {assignedEvents.length === 0 && <div className="col-span-full py-8 text-center bg-gray-50 dark:bg-gray-800/30 rounded-2xl text-gray-400 text-sm italic">Nothing assigned to you currently.</div>}
            </div>
          </div>
        </div>
      )}

      {selectedEvent && (
        <EventDetailsModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
          onUpdate={() => { fetchData(); setSelectedEvent(null); }}
        />
      )}
    </div>
  );
};

export default Dashboard;
