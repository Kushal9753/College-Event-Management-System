import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import EventDetailsModal from '../../components/common/EventDetailsModal';
import { 
  CalendarDays, MapPin, Clock, User, ArrowRight,
  ClipboardList, AlertCircle, Calendar, Users, Target, Activity
} from 'lucide-react';

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchAssignedEvents = async () => {
      try {
        setLoading(true);
        const res = await api.get('/events/assigned');
        setEvents(res.data.data || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load assigned events');
      } finally {
        setLoading(false);
      }
    };
    fetchAssignedEvents();
  }, []);

  const getStatusConfig = (status) => {
    const configs = {
      approved: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
      rejected: { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-500/20', dot: 'bg-rose-500' },
      pending: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20', dot: 'bg-amber-500' },
      completed: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20', dot: 'bg-blue-500' },
      archived: { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-500/20', dot: 'bg-slate-500' },
      ongoing: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20', dot: 'bg-blue-500' },
      pending_approval: { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/20', dot: 'bg-orange-500' },
      published: { bg: 'bg-teal-500/10', text: 'text-teal-600', border: 'border-teal-500/20', dot: 'bg-teal-500' },
    };
    return configs[status?.toLowerCase()] || configs.pending;
  };

  const StatusBadge = ({ status }) => {
    const config = getStatusConfig(status);
    return (
      <div className={`px-3 py-1.5 flex items-center gap-2 rounded-full border ${config.bg} ${config.text} ${config.border}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
        <span className="text-xs font-semibold tracking-wide uppercase">{status?.replace('_', ' ')}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex flex-col items-center justify-center space-y-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-t-4 border-b-4 border-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-r-4 border-l-4 border-blue-500 rounded-full animate-spin-slow"></div>
          <CalendarDays className="absolute inset-0 m-auto w-8 h-8 text-indigo-600 animate-pulse" />
        </div>
        <div className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
          Loading your events...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8 animate-fade-in font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-600 blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-2xl"></div>
              <div className="relative p-4 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-xl shadow-indigo-500/20 text-white transform group-hover:scale-105 transition-transform duration-300">
                <Activity className="w-8 h-8" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Assigned Events</h1>
              <p className="text-slate-500 font-medium mt-1">Events requiring your coordination & management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-semibold text-sm flex items-center gap-2">
              <Target className="w-4 h-4" />
              {events.length} Total Events
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 p-4 rounded-r-2xl flex items-start gap-3 shadow-sm transform transition-all hover:translate-x-1">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="text-red-800 font-bold text-sm">Error Loading Events</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {events.length === 0 && !error ? (
          <div className="relative bg-white rounded-[2rem] border border-slate-100 p-16 text-center shadow-2xl shadow-slate-200/50 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="relative z-10 w-24 h-24 bg-white shadow-xl shadow-slate-200/50 rounded-full flex items-center justify-center mx-auto mb-8 transform group-hover:-translate-y-2 transition-transform duration-500">
              <ClipboardList className="w-12 h-12 text-indigo-500" />
            </div>
            <h3 className="relative z-10 text-2xl font-black text-slate-900 mb-3 tracking-tight">No Events Assigned</h3>
            <p className="relative z-10 text-slate-500 max-w-md mx-auto text-lg font-medium">
              You currently have no events assigned to you. When the admin assigns you to an event, it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <div
                key={event._id}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 border border-slate-100 transition-all duration-500 flex flex-col hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-48 bg-gradient-to-br from-slate-900 to-indigo-900 overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
                  
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-150"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl -ml-24 -mb-24 transition-transform duration-700 group-hover:scale-150"></div>

                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
                    <span className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-xl text-white text-xs font-bold tracking-wider uppercase border border-white/20 shadow-xl">
                      {event.category || 'General'}
                    </span>
                    <StatusBadge status={event.status || 'pending'} />
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col justify-end">
                    <h3 className="text-2xl font-black text-white leading-tight line-clamp-2 drop-shadow-md group-hover:text-indigo-200 transition-colors">
                      {event.title}
                    </h3>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col bg-white">
                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-6 flex-1 font-medium">
                    {event.description}
                  </p>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-4 text-slate-700 group/item p-3 rounded-2xl hover:bg-slate-50 transition-colors duration-300">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm group-hover/item:scale-110 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all duration-300">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Date & Time</p>
                        <p className="font-semibold text-sm">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {event.time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-slate-700 group/item p-3 rounded-2xl hover:bg-slate-50 transition-colors duration-300">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm group-hover/item:scale-110 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all duration-300">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Location</p>
                        <p className="font-semibold text-sm truncate max-w-[200px]">{event.venue}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-auto">
                    {event.createdBy ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs ring-2 ring-white shadow-sm">
                          {event.createdBy.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Created By</span>
                          <span className="text-xs font-bold text-slate-700">{event.createdBy.name}</span>
                        </div>
                      </div>
                    ) : (
                      <div />
                    )}

                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="group/btn relative overflow-hidden flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30"
                    >
                      <span className="relative z-10">Details</span>
                      <ArrowRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedEvent && (
        <EventDetailsModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)}
          onUpdate={() => { 
            setSelectedEvent(null); 
            const fn = async () => { 
              try { 
                const res = await api.get('/events/assigned'); 
                setEvents(res.data.data || []); 
              } catch(e){} 
            }; 
            fn(); 
          }}
        />
      )}
    </div>
  );
};

export default MyEvents;
