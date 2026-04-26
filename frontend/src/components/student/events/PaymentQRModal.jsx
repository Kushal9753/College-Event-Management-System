import React, { useState } from 'react';
import api from '../../../services/api';
import { CreditCard, Wallet, Lock, CheckCircle2, ChevronRight, Fingerprint, RefreshCcw } from 'lucide-react';

const PaymentQRModal = ({ isOpen, onClose, registration, eventName }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [methodOptions, setMethodOptions] = useState([
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
    { id: 'upi', name: 'UPI / BHIM', icon: Wallet },
  ]);
  const [formData, setFormData] = useState({
    cardNumber: '4111 1111 1111 1111',
    cardExpiry: '12/28',
    cardCvv: '123',
    cardName: 'JOHN DOE',
    upiId: 'johndoe@paytm'
  });
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !registration) return null;

  const { amount, _id } = registration;

  const handleProcessPayment = async () => {
    setProcessing(true);
    try {
      const payload = {
        paymentMethod,
        ...formData
      };
      // Short delay for realistic feel
      await new Promise(r => setTimeout(r, 1500));
      await api.post(`/events/registration/${_id}/pay`, payload);
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setProcessing(false);
      }, 2500);
    } catch (err) {
      console.error('Payment failed', err);
      alert(err.response?.data?.message || 'Payment simulation failed');
      setProcessing(false);
    }
  };

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 flex flex-col items-center">
        
        {success ? (
          <div className="p-12 text-center w-full flex flex-col items-center">
             <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <CheckCircle2 size={48} strokeWidth={2.5} />
             </div>
             <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Payment Successful!</h2>
             <p className="text-gray-500 font-medium tracking-wide">You are fully registered for the event.</p>
          </div>
        ) : (
          <>
            <div className="w-full bg-slate-900 text-white p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               <div className="relative z-10">
                 <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-widest mb-4">
                   <Lock size={12} strokeWidth={3} /> Secure Checkout
                 </div>
                 <div className="flex items-end justify-between">
                    <div>
                      <p className="text-slate-400 font-medium mb-1">Payable Amount</p>
                      <p className="text-5xl font-black tracking-tighter">₹{amount}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-slate-400 font-medium mb-1 truncate max-w-[150px]">{eventName}</p>
                       <p className="text-sm font-bold text-white tracking-wide">Registration Fee</p>
                    </div>
                 </div>
               </div>
            </div>

            <div className="w-full p-8 bg-slate-50 border-b border-gray-100">
              <div className="flex bg-gray-200/50 p-1.5 rounded-2xl">
                {methodOptions.map(m => {
                   const Icon = m.icon;
                   const active = paymentMethod === m.id;
                   return (
                     <button 
                       key={m.id}
                       onClick={() => setPaymentMethod(m.id)}
                       className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${active ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                     >
                       <Icon size={16} strokeWidth={active ? 2.5 : 2} /> {m.name}
                     </button>
                   );
                })}
              </div>
            </div>

            <div className="w-full p-8">
               {paymentMethod === 'card' ? (
                 <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                      <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Card Number</label>
                      <input type="text" value={formData.cardNumber} onChange={e => handleInputChange('cardNumber', e.target.value)} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 tracking-widest" />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Expiry</label>
                        <input type="text" value={formData.cardExpiry} onChange={e => handleInputChange('cardExpiry', e.target.value)} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 tracking-widest" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">CVV</label>
                        <input type="password" value={formData.cardCvv} onChange={e => handleInputChange('cardCvv', e.target.value)} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 tracking-widest" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Name on Card</label>
                      <input type="text" value={formData.cardName} onChange={e => handleInputChange('cardName', e.target.value)} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 tracking-widest uppercase" />
                    </div>
                 </div>
               ) : (
                 <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="text-center p-6 bg-indigo-50/50 border border-indigo-100 rounded-3xl">
                       <Fingerprint className="w-12 h-12 text-indigo-400 mx-auto mb-4" strokeWidth={1} />
                       <label className="block text-xs font-bold text-indigo-900 uppercase tracking-widest mb-3">Enter your UPI ID</label>
                       <input type="text" value={formData.upiId} onChange={e => handleInputChange('upiId', e.target.value)} className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-3.5 text-center text-sm font-bold text-indigo-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm" placeholder="username@bank" />
                    </div>
                 </div>
               )}
            </div>

            <div className="w-full p-8 pt-0 flex gap-4">
               <button onClick={onClose} disabled={processing} className="flex-1 py-4 text-sm font-bold text-gray-500 hover:text-gray-800 bg-gray-100/50 hover:bg-gray-100 rounded-2xl transition-all">Cancel</button>
               <button 
                 onClick={handleProcessPayment} 
                 disabled={processing}
                 className="flex-[2] flex items-center justify-center gap-2 py-4 text-sm font-bold text-white bg-slate-900 hover:bg-black rounded-2xl shadow-[0_8px_20px_rgb(0,0,0,0.15)] hover:shadow-[0_10px_25px_rgb(0,0,0,0.25)] transition-all disabled:opacity-50"
               >
                 {processing ? <><RefreshCcw className="w-5 h-5 animate-spin" /> Processing...</> : <><Fingerprint className="w-5 h-5" /> Pay ₹{amount} Securely</>}
               </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentQRModal;
