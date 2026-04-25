import React, { useState } from 'react';
import { useEvents } from '../../context/EventContext';
import EventList from '../../components/student/events/EventList';
import EventDetailsModal from '../../components/common/EventDetailsModal';

const AvailableEvents = () => {
 const { events, loading, error, refreshEvents } = useEvents();
 const [selectedEvent, setSelectedEvent] = useState(null);

 // Show events that are NOT registered yet (userStatus is null)
 const availableEvents = events.filter(e => !e.userStatus);

 const handleOpenDetails = (event) => setSelectedEvent(event);
 const handleCloseDetails = () => setSelectedEvent(null);

 if (loading) {
 return (
 <div className="max-w-7xl mx-auto">
 <div className="mb-8">
 <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Events</h1>
 <p className="text-gray-600 text-lg">Discover and register for upcoming events across departments.</p>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 {[...Array(3)].map((_, i) => (
 <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-200 p-5 h-56">
 <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
 <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
 <div className="space-y-2">
 <div className="h-4 bg-gray-200 rounded w-1/2"></div>
 <div className="h-4 bg-gray-200 rounded w-1/3"></div>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
 }

 if (error && availableEvents.length === 0) {
 return (
 <div className="max-w-7xl mx-auto">
 <div className="mb-8">
 <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Events</h1>
 <p className="text-gray-600 text-lg">Discover and register for upcoming events across departments.</p>
 </div>
 <div className="text-center p-12 bg-red-50 rounded-2xl border border-red-200 ">
 <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <p className="text-red-600 text-lg font-medium mb-2">{error}</p>
 <p className="text-gray-500 text-sm">Please make sure you are logged in as a student and the server is running.</p>
 </div>
 </div>
 );
 }

 return (
 <div className="max-w-7xl mx-auto">
 <div className="mb-8">
 <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Events</h1>
 <p className="text-gray-600 text-lg">Discover and register for upcoming events across departments.</p>
 </div>

 <EventList 
 events={availableEvents} 
 onViewDetails={handleOpenDetails}
 emptyMessage="No new events available at the moment. Check back later!"
 />

 {selectedEvent && (
 <EventDetailsModal 
 event={selectedEvent} 
 onClose={handleCloseDetails} 
 onUpdate={() => {
  refreshEvents();
  setSelectedEvent(null);
 }}
 />
 )}
 </div>
 );
};

export default AvailableEvents;
