import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../../context/EventContext';
import EventCard from '../../components/student/events/EventCard';

const Dashboard = () => {
  const { events } = useEvents();
  const navigate = useNavigate();

  const availableCount = events.filter(e => !e.userStatus).length;
  const registeredCount = events.filter(e => e.userStatus === 'Registered').length;
  const attendedCount = events.filter(e => e.userStatus === 'Attended').length;

  const quickPreview = events.filter(e => !e.userStatus).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back!</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Here's what's happening in your event circle.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Available Events</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white">{availableCount}</h3>
            <button 
              onClick={() => navigate('/student/available-events')}
              className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline"
            >
              Browse all →
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">My Registrations</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white">{registeredCount}</h3>
            <button 
              onClick={() => navigate('/student/my-events')}
              className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline"
            >
              View list →
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Events Attended</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white">{attendedCount}</h3>
            <span className="text-gray-400 dark:text-gray-600 text-sm">Well done!</span>
          </div>
        </div>
      </div>

      {/* Quick Preview Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Preview</h2>
          <button 
            onClick={() => navigate('/student/available-events')}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium"
          >
            View More
          </button>
        </div>
        
        {quickPreview.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickPreview.map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
                layout="compact"
                onRegister={() => navigate('/student/available-events')}
                onViewDetails={() => navigate('/student/available-events')}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400">No new events to preview.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;


