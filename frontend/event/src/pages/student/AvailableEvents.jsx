import React, { useState } from 'react';
import { useEvents } from '../../context/EventContext';
import EventList from '../../components/student/events/EventList';
import EventDetails from '../../components/student/events/EventDetails';

const AvailableEvents = () => {
  const { events, registerEvent } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Show events that are NOT registered yet (userStatus is null)
  const availableEvents = events.filter(e => !e.userStatus);

  const handleOpenDetails = (event) => setSelectedEvent(event);
  const handleCloseDetails = () => setSelectedEvent(null);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Available Events</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Discover and register for upcoming events across departments.</p>
      </div>

      <EventList 
        events={availableEvents} 
        onRegister={registerEvent} 
        onViewDetails={handleOpenDetails}
        emptyMessage="No new events available at the moment. Check back later!"
      />

      {selectedEvent && (
        <EventDetails 
          event={selectedEvent} 
          onClose={handleCloseDetails} 
          onRegister={registerEvent} 
        />
      )}
    </div>
  );
};

export default AvailableEvents;

