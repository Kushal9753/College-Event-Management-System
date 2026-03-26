import React from 'react';
import CalendarView from '../../components/common/CalendarView';

const Scheduling = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Event Scheduling</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage event calendars, check faculty availability, and schedule new events without conflicts.
        </p>
      </div>

      <CalendarView />
    </div>
  );
};

export default Scheduling;
