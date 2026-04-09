import React from 'react';

const PaymentQRModal = ({ isOpen, onClose, registration, eventName }) => {
  if (!isOpen || !registration) return null;

  const { amount, qrCode, paymentStatus } = registration;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 text-center border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Registration Payment</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Complete your registration for {eventName}</p>
        </div>

        <div className="p-8 flex flex-col items-center">
          {/* Amount Display */}
          <div className="mb-6 text-center">
            <span className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-widest block mb-1">Amount to Pay</span>
            <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">₹{amount}</span>
          </div>

          {/* QR Code Container */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-indigo-500/10 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-4 bg-white rounded-[2rem] shadow-xl border border-gray-100">
              <img 
                src={qrCode} 
                alt="Payment QR Code" 
                className="w-56 h-56 rounded-xl"
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 space-y-4 w-full">
            <div className="flex items-start gap-3 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/30">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full shrink-0">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
              </div>
              <p className="text-xs text-blue-800 dark:text-blue-300 font-medium leading-relaxed">
                Scan this QR code using any UPI app (PhonePe, Google Pay, Paytm) to initiate the payment.
              </p>
            </div>
            
            <div className="text-center p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Payment Status</p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Waiting for transaction...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 transition-all active:scale-[0.98]"
          >
            Pay Later
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98]"
          >
            I've Paid
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentQRModal;
