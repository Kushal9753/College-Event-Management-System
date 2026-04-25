import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import EventDetailsModal from '../../components/common/EventDetailsModal';
import { 
  CalendarDays, MapPin, Clock, User, ArrowRight,
  ClipboardList, AlertCircle, Calendar
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
    const defaultStyle = 'bg-white/20 text-white border-white/30 backdrop-blur-sm';
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-lg border shadow-sm ${defaultStyle}`}>
        {category?.charAt(0).toUpperCase() + category?.slice(1)}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 animate-fade-in font-sans">
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20 text-white">
          <CalendarDays className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Assigned Events</h1>
          <p className="text-sm text-gray-500 mt-1">Events assigned to you by the admin for coordination.</p>
        </div>
      </div>

      <div className="mb-10"></div>

      {error && (
        <div className="mb-8 p-4 rounded-xl bg-red-50 text-red-700 border border-red-100 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading assigned events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ClipboardList className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No events assigned to you yet</h3>
          <p className="text-gray-500">Events will appear here when assigned by the administrator.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-600/5 hover:-translate-y-1 transition-all duration-300 group flex flex-col"
            >
              {/* Card Header with Glassmorphism */}
              <div className="bg-gradient-to-br from-indigo-500 to-blue-600 px-6 py-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
                  <CalendarDays className="w-32 h-32" />
                </div>
                <div className="relative z-10 flex justify-between items-start">
                  {getCategoryBadge(event.category)}
                  <div className="bg-white/90 backdrop-blur-md rounded-full shadow-sm">
                    {getStatusBadge(event.status)}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mt-4 line-clamp-1 relative z-10">{event.name}</h3>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-sm text-gray-600 line-clamp-2 mb-6 leading-relaxed flex-1">{event.description}</p>

                <div className="space-y-3 text-sm bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                    </div>
                    <span className="font-medium">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                      <Clock className="w-4 h-4 text-indigo-500" />
                    </div>
                    <span className="font-medium">{event.time} • {event.duration}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                      <MapPin className="w-4 h-4 text-indigo-500" />
                    </div>
                    <span className="font-medium truncate">{event.venue}</span>
                  </div>
                </div>

                {/* Created By */}
                {event.createdBy && (
                  <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>Created by <strong className="text-gray-900 font-semibold">{event.createdBy.name}</strong></span>
                  </div>
                )}

                <button
                  onClick={() => setSelectedEvent(event)}
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 py-3 rounded-xl transition-all duration-300"
                >
                  View Details
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
