import React, { useState } from 'react';
import { useEvents } from '../../context/EventContext';
import EventList from '../../components/student/events/EventList';
import EventDetails from '../../components/student/events/EventDetails';

const MyEvents = () => {
  const { events, cancelRegistration } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Show events that are Registered, Attended, or Missed
  const myEvents = events.filter(e => e.userStatus);

  const handleOpenDetails = (event) => setSelectedEvent(event);
  const handleCloseDetails = () => setSelectedEvent(null);

  const handleCancel = (id) => {
    if (window.confirm('Are you sure you want to cancel your registration?')) {
      cancelRegistration(id);
      if (selectedEvent && selectedEvent.id === id) {
        handleCloseDetails();
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Events</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Track all the events you have registered for.</p>
      </div>

      <EventList 
        events={myEvents} 
        onCancel={handleCancel} 
        onViewDetails={handleOpenDetails}
        emptyMessage="You haven't registered for any events yet. Browse 'Available Events' to get started!"
      />

      {selectedEvent && (
        <EventDetails 
          event={selectedEvent} 
          onClose={handleCloseDetails} 
          onCancel={handleCancel}
          onRegister={() => {}} // Not needed here as already registered
        />
      )}
    </div>
  );
};

export default MyEvents;

