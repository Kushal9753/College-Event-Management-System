import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useSocket } from './SocketContext';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const clearError = () => setError(null);
  const socket = useSocket();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      // Map backend data to component-friendly format
      const fetchedEvents = response.data.data.map(ev => ({
        ...ev,
        id: ev._id,
        // Set userStatus and payment attributes
        userStatus: ev.isRegistered ? 'Registered' : null,
        paymentStatus: ev.paymentStatus,
        qrCode: ev.qrCode,
      }));
      setEvents(fetchedEvents);
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
    
    // Auto-refresh events when related socket triggers arrive
    socket.on('event_created', fetchEvents);
    socket.on('event_updated', fetchEvents);
    
    return () => {
      socket.off('event_created', fetchEvents);
      socket.off('event_updated', fetchEvents);
    };
  }, [socket]);

  // Register for an event via backend API
  const registerEvent = async (eventId) => {
    try {
      const response = await api.post(`/events/${eventId}/register`);
      // Update local state immediately for snappy UX
      setEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, userStatus: 'Registered' } : event
      ));
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to register for event';
      setError(message);
      // Re-fetch to ensure consistency
      fetchEvents();
      throw err;
    }
  };

  // Cancel registration via backend API
  const cancelRegistration = async (eventId) => {
    try {
      await api.delete(`/events/${eventId}/register`);
      // Update local state immediately
      setEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, userStatus: null } : event
      ));
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to cancel registration';
      setError(message);
      fetchEvents();
    }
  };

  const markAsAttended = (eventId) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, userStatus: 'Attended' } : event
    ));
  };

  return (
    <EventContext.Provider value={{ 
      events, 
      loading,
      error,
      registerEvent, 
      cancelRegistration, 
      markAsAttended,
      clearError,
      refreshEvents: fetchEvents 
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
