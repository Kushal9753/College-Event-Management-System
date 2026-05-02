/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import { useSocket } from './SocketContext';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
 const [events, setEvents] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const clearError = () => setError(null);
 const socket = useSocket();
 const debounceRef = useRef(null);

 const fetchEvents = async () => {
 try {
 setLoading(true);
 const response = await api.get('/events');
 // Map backend data to component-friendly format
 const fetchedEvents = response.data.data.map(ev => ({
 ...ev,
 id: ev._id,
 // Set userStatus and payment attributes
 userStatus: ev.isAttended ? 'Attended' : (ev.isRegistered ? 'Registered' : null),
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

 // Debounced refresh (max once per 2 seconds) to prevent refetch storms
 const debouncedRefresh = useCallback(() => {
 if (debounceRef.current) clearTimeout(debounceRef.current);
 debounceRef.current = setTimeout(() => {
 fetchEvents();
 }, 2000);
 }, []);

 // Surgical update for known events, debounced fallback for unknown
 const handleEventUpdate = useCallback((updatedEvent) => {
 if (!updatedEvent) {
 // Null signal means "refresh everything"
 debouncedRefresh();
 return;
 }
 // Update the specific event in local state without API call
 setEvents(prev => {
 const eventId = updatedEvent._id || updatedEvent.id;
 const idx = prev.findIndex(e => e.id === eventId);
 if (idx >= 0) {
  const updated = [...prev];
  updated[idx] = { ...updated[idx], ...updatedEvent, id: eventId };
  return updated;
 }
 // New event — add it
 return [...prev, { ...updatedEvent, id: updatedEvent._id }];
 });
 }, [debouncedRefresh]);

 useEffect(() => {
 if (!socket) return;
 
 // Use surgical updates instead of full refetch on each socket event
 socket.on('event_created', handleEventUpdate);
 socket.on('event_updated', handleEventUpdate);
 
 return () => {
 socket.off('event_created', handleEventUpdate);
 socket.off('event_updated', handleEventUpdate);
 if (debounceRef.current) clearTimeout(debounceRef.current);
 };
 }, [socket, handleEventUpdate]);

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

  // Submit payment proof screenshot
  const submitPaymentProof = async (registrationId, formData) => {
    try {
      const response = await api.post(`/events/registration/${registrationId}/payment`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Optionally re-fetch to update status
      fetchEvents();
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to upload payment proof';
      setError(message);
      throw err;
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
 submitPaymentProof,
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
