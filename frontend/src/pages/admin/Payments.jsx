import React, { useState } from 'react';
import api from '../../services/api';
import { useQuery } from '../../hooks/useQuery';
import { 
  IndianRupee, 
  CreditCard, 
  Wallet, 
  Search, 
  TrendingUp, 
  CircleDollarSign, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';

const AdminPayments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('processed');

  const { data: registrations = [], loading, error, refetch } = useQuery(
    'admin-payments',
    async () => {
      const eventsRes = await api.get('/events');
      const events = eventsRes.data.data || [];
      
      const allRegs = [];
      
      // Fetch participants for events that have fees
      const feeEvents = events.filter(e => e.registrationFees > 0 && e.registrations?.length > 0);
      
      if (feeEvents.length > 0) {
        const results = await Promise.allSettled(
          feeEvents.map(e => api.get(`/events/${e._id}/participants`))
        );
        
        results.forEach((r, i) => {
          if (r.status === 'fulfilled') {
            const participants = r.value.data?.data?.participants || [];
            const event = feeEvents[i];
            
            participants.forEach(p => {
              allRegs.push({
                participantId: p._id,
                participantName: p.name,
                participantEmail: p.email,
                participantEnrollment: p.enrollmentNumber,
                registrationId: p.registrationId,
                paymentStatus: p.paymentStatus,
                transactionId: p.transactionId,
                paymentMethod: p.paymentMethod || 'card',
                paymentScreenshot: p.paymentScreenshot,
                eventId: event._id,
                eventTitle: event.title || event.name,
                eventFees: event.registrationFees,
                date: p.paymentDate ? new Date(p.paymentDate) : new Date(),
              });
            });
          }
        });
      }

      return allRegs.sort((a, b) => b.date - a.date);
    },
    { staleTime: 30000 }
  );

  const processedPayments = registrations.filter(r => r.paymentStatus === 'paid');
  const pendingPayments = registrations.filter(r => r.paymentStatus !== 'paid');

  const totalRevenue = processedPayments.reduce((acc, curr) => acc + (curr.eventFees || 0), 0);
  const cardPayments = processedPayments.filter(r => r.paymentMethod === 'card').length;
  const upiPayments = processedPayments.filter(r => r.paymentMethod === 'upi').length;

  const displayData = (activeTab === 'processed' ? processedPayments : pendingPayments).filter(r => 
    r.participantName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.eventTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMethodIcon = (method) => {
    if (method === 'card') return <CreditCard className="w-5 h-5 text-indigo-500" strokeWidth={2} />;
    if (method === 'upi') return <Wallet className="w-5 h-5 text-emerald-500" strokeWidth={2} />;
    return <IndianRupee className="w-5 h-5 text-blue-500" strokeWidth={2} />;
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in">
         <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
         <p className="text-gray-500 font-bold tracking-widest uppercase text-sm">Synchronizing Ledger...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-indigo-400 mb-2 flex items-center gap-3">
             <ShieldCheck size={36} className="text-indigo-600 shrink-0" strokeWidth={2.5} />
             Payment Gateway Ledger
          </h1>
          <p className="text-gray-500 font-medium tracking-wide">Monitor real-time simulated transactions and revenue flows.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_5px_20px_rgb(0,0,0,0.03)] relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-emerald-100/50 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
               <TrendingUp className="w-7 h-7 text-emerald-600" strokeWidth={2.5} />
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Total Revenue</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter">₹{totalRevenue.toLocaleString()}</h2>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_5px_20px_rgb(0,0,0,0.03)] relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-indigo-100/50 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100">
               <CheckCircle2 className="w-7 h-7 text-indigo-600" strokeWidth={2.5} />
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Processed TXNs</p>
            <div className="flex items-end gap-3 tracking-tighter">
              <h2 className="text-4xl font-black text-gray-900">{processedPayments.length}</h2>
              <span className="text-sm font-bold text-indigo-600 mb-1 flex items-center"><ArrowUpRight size={16} /></span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_5px_20px_rgb(0,0,0,0.03)] relative overflow-hidden group hover:shadow-md transition-all flex flex-col justify-between">
          <div className="relative z-10 w-full h-full flex flex-col justify-center">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Payment Methods Breakdown</p>
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                       <CreditCard size={20} strokeWidth={2.5} />
                     </div>
                     <span className="font-bold text-gray-700 text-sm">Credit / Debit</span>
                   </div>
                   <span className="font-black text-gray-900">{cardPayments}</span>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                       <Wallet size={20} strokeWidth={2.5} />
                     </div>
                     <span className="font-bold text-gray-700 text-sm">UPI / BHIM</span>
                   </div>
                   <span className="font-black text-gray-900">{upiPayments}</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-[2.5rem] p-4 sm:p-8 border border-gray-100 shadow-[0_5px_20px_rgb(0,0,0,0.02)]">
         
         <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full lg:w-auto overflow-x-auto">
               <button 
                 onClick={() => setActiveTab('processed')}
                 className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'processed' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
               >
                 <CheckCircle2 size={16} strokeWidth={2.5} /> Processed
                 <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full ml-1">{processedPayments.length}</span>
               </button>
               <button 
                 onClick={() => setActiveTab('pending')}
                 className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'pending' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
               >
                 <Clock size={16} strokeWidth={2.5} /> Pending Actions
                 <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full ml-1">{pendingPayments.length}</span>
               </button>
            </div>

            <div className="relative w-full lg:w-80 group shrink-0">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} strokeWidth={2.5} />
               <input 
                 type="text" 
                 placeholder="Search name, TXN ID, event..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-gray-50/50 border border-gray-200 rounded-full pl-12 pr-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow"
               />
            </div>
         </div>

         {displayData.length === 0 ? (
            <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
               <div className="w-20 h-20 bg-white shadow-sm rounded-[1.5rem] flex items-center justify-center mx-auto mb-5">
                  <CircleDollarSign className="w-10 h-10 text-gray-300" strokeWidth={1.5} />
               </div>
               <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-1">No Transactions Found</h3>
               <p className="text-gray-500 text-sm">There are no records matching your current filters.</p>
            </div>
         ) : (
            <div className="overflow-x-auto custom-scrollbar">
               <table className="w-full text-left border-separate border-spacing-y-3 shrink-0">
                  <thead>
                    <tr>
                       <th className="px-6 pb-2 text-[11px] font-black tracking-widest uppercase text-gray-400">Student & Event</th>
                       <th className="px-6 pb-2 text-[11px] font-black tracking-widest uppercase text-gray-400">Transaction Details</th>
                       <th className="px-6 pb-2 text-[11px] font-black tracking-widest uppercase text-gray-400">Method</th>
                       <th className="px-6 pb-2 text-[11px] font-black tracking-widest uppercase text-gray-400 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                     {displayData.map((reg, idx) => (
                       <tr key={reg.registrationId || idx} className="group hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-4 bg-white border border-gray-100 rounded-l-2xl shadow-[0_2px_10px_rgb(0,0,0,0.01)] group-hover:border-indigo-100/50 transition-colors">
                             <div className="font-bold text-gray-900 truncate max-w-[200px]">{reg.participantName}</div>
                             <div className="text-xs text-gray-500 font-medium truncate max-w-[200px] mt-0.5">{reg.eventTitle}</div>
                          </td>
                          <td className="px-6 py-4 bg-white border-y border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.01)] group-hover:border-indigo-100/50 transition-colors">
                             <div className="flex items-center gap-2">
                               {reg.paymentStatus === 'paid' ? (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                               ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                               )}
                               <span className="font-bold text-gray-900 text-sm">
                                  {reg.transactionId ? (
                                    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{reg.transactionId}</span>
                                  ) : 'N/A'}
                               </span>
                             </div>
                             <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">
                                {new Date(reg.date).toLocaleString()}
                             </div>
                          </td>
                          <td className="px-6 py-4 bg-white border-y border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.01)] group-hover:border-indigo-100/50 transition-colors">
                             {reg.paymentStatus === 'paid' ? (
                               <div className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-widest">
                                 {getMethodIcon(reg.paymentMethod)}
                                 {reg.paymentMethod}
                               </div>
                             ) : (
                               <span className="text-xs font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1">
                                 Pending Verification
                               </span>
                             )}
                          </td>
                          <td className="px-6 py-4 bg-white border border-gray-100 rounded-r-2xl shadow-[0_2px_10px_rgb(0,0,0,0.01)] text-right group-hover:border-indigo-100/50 transition-colors">
                             <span className="text-lg font-black text-indigo-600">₹{reg.eventFees}</span>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>
    </div>
  );
};

export default AdminPayments;
