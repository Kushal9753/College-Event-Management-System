import React, { useState } from 'react';
import { useEvents } from '../../../context/EventContext';

const PaymentQRModal = ({ isOpen, onClose, registration, eventName }) => {
  const { submitPaymentProof } = useEvents();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  if (!isOpen || !registration) return null;

  const { amount, qrCode, _id } = registration;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a screenshot first');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('screenshot', file);

    try {
      await submitPaymentProof(_id, formData);
      alert('Payment proof submitted successfully! Admin will verify it soon.');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 text-center border-b border-gray-100 bg-gray-50/50 ">
          <h3 className="text-xl font-bold text-gray-900 ">Registration Payment</h3>
          <p className="text-sm text-gray-500 mt-1">Complete your registration for {eventName}</p>
        </div>

        <div className="p-8 flex flex-col items-center max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Amount Display */}
          <div className="mb-6 text-center">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-widest block mb-1">Amount to Pay</span>
            <span className="text-4xl font-black text-indigo-600 ">₹{amount}</span>
          </div>

          {/* QR Code Container */}
          <div className="relative group mb-8">
            <div className="absolute -inset-4 bg-indigo-500/10 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-4 bg-white rounded-[2rem] shadow-xl border border-gray-100">
              <img 
                src={qrCode} 
                alt="Payment QR Code" 
                className="w-48 h-48 rounded-xl"
              />
            </div>
          </div>

          {/* Screenshot Upload Section */}
          <div className="w-full space-y-4">
            <div className="text-center">
              <label className="block text-sm font-bold text-gray-700 mb-2">Upload Payment Screenshot</label>
              <div className="relative group cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`p-6 border-2 border-dashed rounded-2xl transition-all ${preview ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-indigo-400 bg-gray-50'}`}>
                  {preview ? (
                    <div className="flex flex-col items-center">
                      <img src={preview} alt="Screenshot preview" className="h-32 object-contain rounded-lg mb-2 shadow-sm" />
                      <span className="text-xs text-green-600 font-medium">Click or drag to change image</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-gray-500 font-medium text-center">Tap here to upload your payment proof image (Screenshot)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 ">
              <div className="p-2 bg-blue-100 rounded-full shrink-0">
                <svg className="w-4 h-4 text-blue-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
              </div>
              <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
                Scan QR $\rightarrow$ Pay $\rightarrow$ Take Screenshot $\rightarrow$ Upload above and click "Submit Proof".
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 flex gap-3 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 text-sm font-bold text-gray-600 hover:text-gray-900 bg-white rounded-xl border border-gray-200 transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button 
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`flex-1 py-3 px-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${(!file || uploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {uploading ? (
              <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> Submitting...</>
            ) : 'Submit Proof'}
          </button>
        </div>
      </div>
    </div>
  );
};


export default PaymentQRModal;
