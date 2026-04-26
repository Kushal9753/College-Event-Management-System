import React from 'react';
import EventForm from '../../components/common/EventForm';
import { CalendarPlus } from 'lucide-react';

const CreateEvent = () => {
  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 animate-fade-in font-sans">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20 text-white">
          <CalendarPlus className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Event</h1>
          <p className="text-sm text-gray-500 mt-1">Submit a new event proposal. The event will be pending admin approval.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-2 md:p-6 overflow-hidden">
        {/* Render the generic EventForm component */}
        <EventForm />
      </div>
    </div>
  );
};

export default CreateEvent;
