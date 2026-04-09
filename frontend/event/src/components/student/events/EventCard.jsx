import React, { useState } from 'react';

const EventCard = ({ event, onRegister, onCancel, onViewDetails, layout = 'full' }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegistered = event.userStatus === 'Registered';
  
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${layout === 'compact' ? 'scale-95 hover:scale-100' : ''}`}>
      <div className={layout === 'compact' ? 'p-4' : 'p-5'}>
        <div className="flex justify-between items-start mb-4">
          <span className={`px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${
            event.category === 'technical' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
            event.category === 'cultural' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
            event.category === 'workshop' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
            event.category === 'hackathon' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
            event.category === 'seminar' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400' :
            event.category === 'sports' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            {event.category}
          </span>
          {event.userStatus && (
            <span className={`text-xs font-medium ${
              event.userStatus === 'Registered' ? 'text-blue-600 dark:text-blue-400' :
              event.userStatus === 'Attended' ? 'text-green-600 dark:text-green-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              • {event.userStatus}
            </span>
          )}
        </div>
        
        <h3 className={`${layout === 'compact' ? 'text-base' : 'text-lg'} font-bold text-gray-900 dark:text-white mb-2 line-clamp-1`}>{event.title || event.name}</h3>
        
        <div className={`space-y-2 ${layout === 'compact' ? 'mb-4' : 'mb-6'}`}>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          {layout !== 'compact' && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {event.time} {event.duration ? `(${event.duration})` : ''}
            </div>
          )}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{event.venue}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {layout !== 'compact' && (
            <button 
              onClick={() => onViewDetails(event)}
              className="flex-1 min-w-[80px] px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Details
            </button>
          )}
          {isRegistered ? (
            <button 
              onClick={() => onCancel(event.id || event._id)}
              className="flex-1 min-w-[80px] px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Cancel
            </button>
          ) : (
            <button 
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  await onRegister(event.id || event._id);
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={event.userStatus === 'Attended' || isSubmitting}
              className={`flex-1 min-w-[80px] px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                event.userStatus === 'Attended'
                  ? 'bg-green-100 text-green-600 cursor-default dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              }`}
            >
              {isSubmitting ? '...' : event.userStatus === 'Attended' ? 'Attended' : 'Register'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


export default EventCard;
