import React, { useState } from 'react';

const EventCard = ({ event, onRegister, onCancel, onViewDetails, layout = 'full' }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegistered = event.userStatus === 'Registered';
  
  return (
    <div className={`group relative bg-white rounded-3xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgb(18,109,251,0.12)] hover:-translate-y-1 transition-all duration-400 border border-gray-100 ${layout === 'compact' ? 'scale-95 hover:scale-100' : ''}`}>
      {/* Decorative background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
      
      <div className={layout === 'compact' ? 'p-5 relative z-10' : 'p-6 relative z-10'}>
        <div className="flex justify-between items-start mb-5">
          <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold tracking-widest uppercase border ${
            event.category === 'technical' ? 'bg-blue-50 text-blue-600 border-blue-100' :
            event.category === 'cultural' ? 'bg-purple-50 text-purple-600 border-purple-100' :
            event.category === 'workshop' ? 'bg-green-50 text-green-600 border-green-100' :
            event.category === 'hackathon' ? 'bg-orange-50 text-orange-600 border-orange-100' :
            event.category === 'seminar' ? 'bg-teal-50 text-teal-600 border-teal-100' :
            event.category === 'sports' ? 'bg-red-50 text-red-600 border-red-100' :
            'bg-gray-50 text-gray-600 border-gray-200'
          }`}>
            {event.category}
          </span>
          {event.userStatus && (
            <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
              event.userStatus === 'Registered' ? 'bg-blue-50 text-blue-700' :
              event.userStatus === 'Attended' ? 'bg-green-50 text-green-700' :
              'bg-red-50 text-red-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                event.userStatus === 'Registered' ? 'bg-blue-500' :
                event.userStatus === 'Attended' ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              {event.userStatus}
            </span>
          )}
        </div>
        
        <h3 className={`${layout === 'compact' ? 'text-lg' : 'text-xl'} font-extrabold text-gray-900 mb-4 line-clamp-2 tracking-tight group-hover:text-blue-600 transition-colors duration-300`}>
          {event.title || event.name}
        </h3>
        
        <div className={`space-y-3 ${layout === 'compact' ? 'mb-5' : 'mb-8'}`}>
          <div className="flex items-center text-sm font-medium text-gray-500">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mr-3 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          {layout !== 'compact' && (
            <div className="flex items-center text-sm font-medium text-gray-500">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mr-3 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {event.time} {event.duration ? `(${event.duration})` : ''}
            </div>
          )}
          <div className="flex items-center text-sm font-medium text-gray-500">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mr-3 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="truncate">{event.venue}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3 pt-2">
          {layout !== 'compact' && (
            <button 
              onClick={() => onViewDetails(event)}
              className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-xl transition-all"
            >
              Details
            </button>
          )}
          {isRegistered ? (
            <button 
              onClick={() => onCancel?.(event.id || event._id)}
              className="flex-1 px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-500 hover:text-white border border-red-100 hover:border-red-500 rounded-xl transition-all"
            >
              Cancel
            </button>
          ) : (
            <button 
              onClick={() => onViewDetails(event)}
              className={`flex-1 px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${
                event.userStatus === 'Attended'
                ? 'bg-green-50 text-green-600 border border-green-100 cursor-default'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-[0_8px_20px_rgb(37,99,235,0.25)] hover:shadow-[0_10px_25px_rgb(37,99,235,0.4)]'
              }`}
              disabled={event.userStatus === 'Attended'}
            >
              {event.userStatus === 'Attended' ? 'Attended' : 'Register'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
