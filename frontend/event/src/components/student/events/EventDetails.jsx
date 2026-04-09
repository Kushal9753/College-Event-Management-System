import React, { useState, useEffect } from 'react';
import { useEvents } from '../../../context/EventContext';
import PaymentQRModal from './PaymentQRModal';

const EventDetails = ({ event, onClose, onRegister, onCancel }) => {
  const { error, clearError } = useEvents();
  const [showQR, setShowQR] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If the event is already registered but pending, initialize the QR state
  useEffect(() => {
    if (event.paymentStatus === 'pending' && event.qrCode) {
      setRegistration({
        amount: event.registrationFees,
        qrCode: event.qrCode,
        paymentStatus: 'pending'
      });
      setShowQR(true);
    }
  }, [event]);

  if (!event) return null;

  const isRegistered = event.userStatus === 'Registered';

  // Derive registration status from event date
  const eventDate = new Date(event.date);
  const now = new Date();
  const registrationOpen = eventDate > now ? 'Open' : 'Closed';

  // Get organizer name from populated createdBy or fallback
  const organizerName = event.createdBy?.name || 'Admin';

  const formatAssignedFaculty = (facultyArray) => {
    if (!facultyArray || facultyArray.length === 0) return 'No faculty assigned yet';
    return facultyArray.map(f => f.name || f.email || 'Unknown').join(', ');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200">
        <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 flex items-end">
          <button 
            onClick={() => {
              clearError();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="animate-in slide-in-from-left duration-500 delay-100">
            <span className="px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-white/20 text-white mb-2 inline-block">
              {event.category}
            </span>
            <h2 className="text-3xl font-bold text-white">{event.title || event.name}</h2>
          </div>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Date & Time</h4>
                <p className="text-gray-900 dark:text-white font-medium">
                  {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-gray-600 dark:text-gray-400">{event.time} {event.duration ? `(${event.duration})` : ''}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Venue</h4>
                <p className="text-gray-900 dark:text-white font-medium">{event.venue}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Organizer</h4>
                <p className="text-gray-900 dark:text-white font-medium">{organizerName}</p>
              </div>
              
              {event.assignedFaculty && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Assigned Faculty</h4>
                  <p className="text-gray-900 dark:text-white font-medium text-sm">
                    {formatAssignedFaculty(event.assignedFaculty)}
                  </p>
                </div>
              )}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Status</h4>
                <div className="flex items-center mt-1">
                  <span className={`h-2.5 w-2.5 rounded-full mr-2 ${registrationOpen === 'Open' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <p className="text-gray-900 dark:text-white font-medium">Registration {registrationOpen}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Description</h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {event.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
            <div>
              {event.userStatus && (
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 italic">
                  Currently: {event.userStatus}
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                Close
              </button>
              {isRegistered ? (
                <button 
                  onClick={() => onCancel(event.id || event._id)}
                  className="px-8 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20 rounded-xl transition-all"
                >
                  Cancel Registration
                </button>
              ) : (
                <div className="flex flex-col items-end gap-2">
                  {error && (
                    <p className="text-[10px] font-bold text-red-500 animate-pulse uppercase tracking-wider bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                      {error}
                    </p>
                  )}
                  <button 
                    onClick={async () => {
                      try {
                        clearError();
                        setIsSubmitting(true);
                        const result = await onRegister(event.id || event._id);
                        if (result?.data?.qrCode) {
                          setRegistration(result.data);
                          setShowQR(true);
                        } else {
                          // If no payment needed, just close or show success
                          alert('Registration successful!');
                          onClose();
                        }
                      } catch (err) {
                        // Error handled by context (setError called), modal stays open to show it
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    disabled={event.userStatus === 'Attended' || registrationOpen === 'Closed' || isSubmitting}
                    className={`px-8 py-2.5 text-sm font-bold rounded-xl transition-all ${
                      event.userStatus === 'Attended'
                        ? 'bg-green-100 text-green-600 cursor-default dark:bg-green-900/20 dark:text-green-400'
                        : registrationOpen === 'Closed'
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'
                    }`}
                  >
                    {isSubmitting ? 'Processing...' : event.userStatus === 'Attended' ? 'Attended' : registrationOpen === 'Closed' ? 'Registration Closed' : 'Register Now'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment QR Modal */}
        <PaymentQRModal 
          isOpen={showQR} 
          onClose={() => {
            setShowQR(false);
            clearError();
            onClose();
          }} 
          registration={registration}
          eventName={event.name}
        />
      </div>
    </div>
  );
};


export default EventDetails;
