import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import EventDetailsModal from '../../components/common/EventDetailsModal';

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
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
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

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Assigned Events</h1>
        <p className="text-gray-600 dark:text-gray-400">Events assigned to you by the admin for coordination.</p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-gray-500 dark:text-gray-400">Loading assigned events...</div>
      ) : events.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-16 text-center">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No events assigned to you yet.</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Events will appear here when assigned by the admin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-5 py-4">
                <div className="flex justify-between items-start">
                  {getCategoryBadge(event.category)}
                  {getStatusBadge(event.status)}
                </div>
                <h3 className="text-lg font-bold text-white mt-2 line-clamp-1">{event.name}</h3>
              </div>

              {/* Card Body */}
              <div className="p-5">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{event.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{event.time} • {event.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.venue}</span>
                  </div>
                </div>

                {/* Created By */}
                {event.createdBy && (
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Created by <span className="font-medium text-gray-700 dark:text-gray-300">{event.createdBy.name}</span>
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="w-full text-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 py-2 rounded transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedEvent && (
        <EventDetailsModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}
    </div>
  );
};

export default MyEvents;
