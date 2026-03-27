import React from 'react';
import EventCard from './EventCard';

const EventList = ({ events, onRegister, onCancel, onViewDetails, emptyMessage = "No events found." }) => {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in duration-300">
        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
      {events.map(event => (
        <EventCard 
          key={event.id} 
          event={event} 
          onRegister={onRegister} 
          onCancel={onCancel}
          onViewDetails={onViewDetails} 
        />
      ))}
    </div>
  );
};


export default EventList;
