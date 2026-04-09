import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminPayments = () => {
  const [registrations, setRegistrations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [bankDetails, setBankDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [bankForm, setBankForm] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: '',
  });
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankSaving, setBankSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, bankRes, paymentsRes] = await Promise.all([
        api.get('/events'),
        api.get('/bank').catch(() => ({ data: { data: null } })),
        api.get('/payments/all').catch(() => ({ data: { data: [] } })),
      ]);

      // Extract all registrations from events
      const events = eventsRes.data.data || [];
      // Fetch registrations for all paid events (we need the registration model data)
      // We'll collect pending registrations by fetching participants for each event
      const allRegs = [];
      for (const event of events) {
        if (event.registrationFees > 0 && event.registrations?.length > 0) {
          try {
            const partRes = await api.get(`/events/${event._id}/participants`);
            const participants = partRes.data?.data?.participants || [];
            // We need the Registration model data, not just User data from event.registrations
            // However, participants endpoint returns User data from event.registrations array
            // We need a different approach: use the event ID to get registrations  
            participants.forEach(p => {
              allRegs.push({
                participantId: p._id,
                participantName: p.name,
                participantEmail: p.email,
                participantEnrollment: p.enrollmentNumber,
                eventId: event._id,
                eventTitle: event.title || event.name,
                eventFees: event.registrationFees,
              });
            });
          } catch (e) {
            // skip
          }
        }
      }

      setBankDetails(bankRes.data?.data || null);
      setPayments(paymentsRes.data?.data || []);
      
      // For bank form initialization
      if (bankRes.data?.data) {
        const bd = bankRes.data.data;
        setBankForm({
          accountHolderName: bd.accountHolderName || '',
          accountNumber: bd.accountNumber || '',
          ifscCode: bd.ifscCode || '',
          bankName: bd.bankName || '',
          upiId: bd.upiId || '',
        });
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBankSave = async () => {
    try {
      setBankSaving(true);
      const res = await api.post('/bank', bankForm);
      setBankDetails(res.data.data);
      setShowBankForm(false);
      setToast({ type: 'success', text: 'Bank details saved successfully!' });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ type: 'error', text: err.response?.data?.message || 'Failed to save bank details' });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setBankSaving(false);
    }
  };

  const handleVerifyPayment = async (registrationId, action) => {
    try {
      setActionLoading(registrationId);
      await api.post(`/payments/verify/${registrationId}`, {
        transactionId: `TXN_${Date.now()}`,
        status: action === 'approve' ? 'success' : 'fail',
      });
      setToast({ type: 'success', text: `Payment ${action === 'approve' ? 'verified' : 'rejected'} successfully!` });
      setTimeout(() => setToast(null), 3000);
      fetchData();
    } catch (err) {
      setToast({ type: 'error', text: err.response?.data?.message || 'Failed to verify payment' });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading payment data...</div>;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={`mb-6 px-4 py-3 rounded-xl flex items-center justify-between text-sm font-medium ${
          toast.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
        }`}>
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)} className="ml-4 opacity-60 hover:opacity-100">&times;</button>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments & Bank Details</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage bank details and verify student payments.</p>
      </div>

      {/* Bank Details Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-blue-600 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
            Bank Details (for UPI QR Generation)
          </h3>
          <button
            onClick={() => setShowBankForm(!showBankForm)}
            className="px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg transition-colors"
          >
            {showBankForm ? 'Cancel' : bankDetails ? 'Edit' : 'Add Bank Details'}
          </button>
        </div>

        {bankDetails && !showBankForm ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Account Holder</p>
              <p className="font-bold text-gray-900 dark:text-white">{bankDetails.accountHolderName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Account Number</p>
              <p className="font-bold text-gray-900 dark:text-white">{bankDetails.accountNumber}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">IFSC Code</p>
              <p className="font-bold text-gray-900 dark:text-white">{bankDetails.ifscCode}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bank Name</p>
              <p className="font-bold text-gray-900 dark:text-white">{bankDetails.bankName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">UPI ID</p>
              <p className="font-bold text-indigo-600 dark:text-indigo-400">{bankDetails.upiId || 'Not set'}</p>
            </div>
          </div>
        ) : showBankForm ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['accountHolderName', 'accountNumber', 'ifscCode', 'bankName', 'upiId'].map(field => (
                <div key={field}>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                    {field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                    {field === 'upiId' && <span className="text-red-500 ml-1">*Required for QR</span>}
                  </label>
                  <input
                    type="text"
                    value={bankForm[field]}
                    onChange={(e) => setBankForm(prev => ({ ...prev, [field]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={field === 'upiId' ? 'e.g. name@paytm' : ''}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleBankSave}
                disabled={bankSaving || !bankForm.accountHolderName || !bankForm.upiId}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all"
              >
                {bankSaving ? 'Saving...' : 'Save Bank Details'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p className="font-medium">No bank details configured yet.</p>
            <p className="text-sm mt-1">Add bank details with UPI ID to enable payment QR codes for students.</p>
          </div>
        )}
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 dark:text-white">Payment Records</h3>
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-900/50 p-1 rounded-lg">
            {['verified', 'all'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                {tab === 'verified' ? 'Verified Payments' : 'All Payments'}
              </button>
            ))}
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"/>
            </svg>
            <p className="font-medium">No payment records yet</p>
            <p className="text-sm mt-1">Verified payments will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Verified By</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {payments.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{p.studentId?.name}</div>
                      <div className="text-xs text-gray-500">{p.studentId?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">{p.eventId?.title}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">₹{p.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${getStatusColor(p.paymentStatus)}`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.verifiedBy?.name}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
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
