import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import PaymentQRModal from '../../components/student/events/PaymentQRModal';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReg, setSelectedReg] = useState(null);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/events/my-registrations');
      if (data.success) {
        setRegistrations(data.data);
      }
    } catch (err) {
      // Fallback: fetch from events list and filter registered ones
      try {
        const eventsRes = await api.get('/events');
        if (eventsRes.data.success) {
          const registeredEvents = eventsRes.data.data.filter(e => e.isRegistered);
          setRegistrations(registeredEvents.map(e => ({
            _id: e._id,
            event: e,
            paymentStatus: e.paymentStatus || (e.registrationFees > 0 ? 'pending' : 'paid'),
            amount: e.registrationFees,
            qrCode: e.qrCode,
          })));
        }
      } catch (fallbackErr) {
        setError('Failed to load registrations');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading your registrations...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Registrations</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your event registrations and payment statuses.</p>
      </div>

      {registrations.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">You haven't registered for any events yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {registrations.map((reg) => (
            <div key={reg._id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 w-full">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{reg.event?.title || reg.event?.name || 'Event'}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(reg.event?.date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Fee</p>
                  <p className="font-bold text-gray-900 dark:text-white">₹{reg.amount || 0}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(reg.paymentStatus)}`}>
                    {reg.paymentStatus}
                  </span>
                </div>

                {reg.paymentStatus === 'pending' && reg.qrCode && (
                  <button 
                    onClick={() => setSelectedReg(reg)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                  >
                    View QR
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReg && (
        <PaymentQRModal 
          isOpen={!!selectedReg}
          onClose={() => setSelectedReg(null)}
          registration={selectedReg}
          eventName={selectedReg.event?.title || selectedReg.event?.name}
        />
      )}
    </div>
  );
};

export default MyRegistrations;
