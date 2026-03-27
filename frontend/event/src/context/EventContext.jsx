import React, { createContext, useContext, useState } from 'react';
import { dummyEvents } from '../data/dummyEvents';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState(dummyEvents);

  const registerEvent = (eventId) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, userStatus: 'Registered' } : event
    ));
  };

  const cancelRegistration = (eventId) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, userStatus: null } : event
    ));
  };

  const markAsAttended = (eventId) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, userStatus: 'Attended' } : event
    ));
  };

  return (
    <EventContext.Provider value={{ 
      events, 
      registerEvent, 
      cancelRegistration, 
      markAsAttended 
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
