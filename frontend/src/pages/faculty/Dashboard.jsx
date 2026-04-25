import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import EventService from '../../services/eventService';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import EventDetailsModal from '../../components/common/EventDetailsModal';
import {
  Plus, Search, ArrowRight, Activity, CalendarDays,
  CheckCircle2, Users, LayoutDashboard, Bookmark, Filter
} from 'lucide-react';

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
        api.get('/events/assigned'),
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
      approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      rejected: 'bg-red-50 text-red-700 border-red-200',
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      completed: 'bg-blue-50 text-blue-700 border-blue-200',
      archived: 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return (
      <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full border ${styles[status] || styles.pending}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const defaultStyle = 'bg-gray-50 text-gray-700 border-gray-200';
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-lg border ${defaultStyle}`}>
        {category?.charAt(0).toUpperCase() + category?.slice(1)}
      </span>
    );
  };

  const totalCreated = createdEvents.length;
  const approvedCount = createdEvents.filter(e => e.status === 'approved').length;
  const totalRegistrations = Object.values(registrationCounts).reduce((sum, c) => sum + c, 0);

  const stats = [
    { label: 'Created Events', value: totalCreated, icon: CalendarDays, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Assigned to Me', value: assignedEvents.length, icon: Bookmark, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Approved Projects', value: approvedCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Participants', value: totalRegistrations, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', live: true },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20 text-white">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Faculty Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your events and track participant analytics.</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/faculty/create-event')} 
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-xl bg-red-50 text-red-700 border border-red-100 flex items-center gap-3 text-sm">
          <Activity className="w-5 h-5 text-red-500 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                    {stat.label}
                    {stat.live && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative h-2 w-2 bg-emerald-500 rounded-full"></span>
                      </span>
                    )}
                  </p>
                  <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                  <Icon className="w-6 h-6" strokeWidth={2} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-2 pl-4 mb-10 shadow-sm flex flex-col md:flex-row gap-2 items-center">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            name="search" 
            placeholder="Search events by name, venue or category..." 
            value={filters.search} 
            onChange={handleFilterChange} 
            className="w-full pl-9 pr-4 py-3 text-sm bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400" 
          />
        </div>
        <div className="h-8 w-px bg-gray-200 hidden md:block mx-2"></div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              name="category" 
              value={filters.category} 
              onChange={handleFilterChange} 
              className="w-full pl-9 pr-8 py-3 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all appearance-none text-gray-700 font-medium"
            >
              <option value="">Category: All</option>
              {['hackathon', 'seminar', 'workshop', 'cultural', 'sports', 'technical', 'other'].map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
            </select>
          </div>
          <div className="relative w-full md:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              name="status" 
              value={filters.status} 
              onChange={handleFilterChange} 
              className="w-full pl-9 pr-8 py-3 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all appearance-none text-gray-700 font-medium"
            >
              <option value="">Status: All</option>
              {['pending', 'approved', 'completed', 'archived', 'rejected'].map(st => <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading && createdEvents.length === 0 ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading your events...</p>
        </div>
      ) : (
        <div className="space-y-10 pb-12">
          {/* Main Events Table */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Primary Events</h2>
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{createdEvents.length} total</span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Event Details</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Participants</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {createdEvents.map(event => (
                      <tr key={event._id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex-shrink-0 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                              <CalendarDays className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900 mb-0.5">{event.name}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-2">
                                <span>{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span>{event.venue}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-middle">
                          {getCategoryBadge(event.category)}
                        </td>
                        <td className="px-6 py-4 align-middle text-center">
                          <div className="inline-flex items-center justify-center min-w-[70px] px-3 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded-lg border border-gray-200">
                            <Users className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                            {registrationCounts[event._id] || 0}
                            <span className="text-gray-400 mx-1">/</span>
                            {event.maxParticipants || '∞'}
                          </div>
                        </td>
                        <td className="px-6 py-4 align-middle">
                          {getStatusBadge(event.status)}
                        </td>
                        <td className="px-6 py-4 align-middle text-right">
                          <button 
                            onClick={() => setSelectedEvent(event)} 
                            className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group-hover:text-blue-600"
                            title="Manage Event"
                          >
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {createdEvents.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <CalendarDays className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="font-medium text-base">No primary events found</p>
                            <p className="text-sm mt-1">Adjust your filters or create a new event.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Assigned Section */}
          {assignedEvents.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-6 mt-10">Assigned Tasks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignedEvents.map(event => (
                  <div 
                    key={event._id} 
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all cursor-pointer group" 
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex justify-between items-start mb-5">
                      {getCategoryBadge(event.category)}
                      {getStatusBadge(event.status)}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">{event.name}</h3>
                    <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed">{event.description}</p>
                    <div className="flex items-center justify-between text-sm font-semibold text-blue-600 pt-4 border-t border-gray-50">
                      <span className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Manage Event
                      </span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
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
