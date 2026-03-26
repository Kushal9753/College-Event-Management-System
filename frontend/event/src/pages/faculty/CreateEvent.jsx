import React from 'react';
import EventForm from '../../components/common/EventForm';

const CreateEvent = () => {
  return (
    <div className="animate-fade-in pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create Event</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Fill out the form below to submit a new event request. The event will be pending admin approval.
        </p>
      </div>

      {/* Render the generic EventForm component */}
      <EventForm />
    </div>
  );
};

export default CreateEvent;
