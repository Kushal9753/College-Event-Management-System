import React, { useState, useEffect } from 'react';
import EventService from '../../services/eventService';
import { getUserData } from '../../utils/tokenHandler';

const EventDetailsModal = ({ event, onClose, onUpdate }) => {
 const [activeTab, setActiveTab] = useState('details');
 const [participants, setParticipants] = useState([]);
 const [logs, setLogs] = useState([]);
 const [paymentsData, setPaymentsData] = useState({ data: [], totalPaidStudentsCount: 0 });
 const [loading, setLoading] = useState(false);
 const [attendedIds, setAttendedIds] = useState(event.attended || []);
 const [winners, setWinners] = useState(event.winners || [
 { position: 1, student: '' },
 { position: 2, student: '' },
 { position: 3, student: '' }
 ]);
 const [isSaving, setIsSaving] = useState(false);
 const [isRegistering, setIsRegistering] = useState(false);
 const [registrationSuccess, setRegistrationSuccess] = useState(event.isRegistered || false);
 const [registrationId, setRegistrationId] = useState(null);

 // Payment gateway state
 const [paymentStep, setPaymentStep] = useState(event.isRegistered && event.paymentStatus === 'pending' ? 'gateway' : 'idle');
 const [paymentMethod, setPaymentMethod] = useState('card');
 const [cardNumber, setCardNumber] = useState('');
 const [cardExpiry, setCardExpiry] = useState('');
 const [cardCvv, setCardCvv] = useState('');
 const [cardName, setCardName] = useState('');
 const [upiId, setUpiId] = useState('');
 const [isProcessingPayment, setIsProcessingPayment] = useState(false);
 const [paymentError, setPaymentError] = useState('');
 const [txnResult, setTxnResult] = useState(null);

 // Admin action states
 const [rejectReason, setRejectReason] = useState('');
 const [showRejectInput, setShowRejectInput] = useState(false);
 const [showResultRejectInput, setShowResultRejectInput] = useState('');
 const [actionLoading, setActionLoading] = useState(null);

 const userData = getUserData();
 const userRole = userData?.user?.role || userData?.role || 'student';

 useEffect(() => {
 if (activeTab === 'participants' || activeTab === 'winners') {
 fetchParticipants();
 } else if (activeTab === 'history') {
 fetchLogs();
 } else if (activeTab === 'payments') {
 fetchPayments();
 }
 }, [activeTab]);

 const fetchParticipants = async () => {
 try {
 setLoading(true);
 const res = await EventService.getEventParticipants(event._id);
 setParticipants(res.data.participants || []);
 } catch (err) {
 console.error('Failed to fetch participants', err);
 } finally {
 setLoading(false);
 }
 };

 const fetchLogs = async () => {
 try {
 setLoading(true);
 const res = await EventService.getEventLogs(event._id);
 setLogs(res.data || []);
 } catch (err) {
 console.error('Failed to fetch logs', err);
 } finally {
 setLoading(false);
 }
 };

 const fetchPayments = async () => {
 try {
 setLoading(true);
 const res = await EventService.getEventPayments(event._id);
 setPaymentsData({
 data: res.data || [],
 totalPaidStudentsCount: res.totalPaidStudentsCount || 0
 });
 } catch (err) {
 console.error('Failed to fetch payments', err);
 } finally {
 setLoading(false);
 }
 };

 const handleAttendanceToggle = (userId) => {
 setAttendedIds(prev =>
 prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
 );
 };

 const saveAttendance = async () => {
 try {
 setIsSaving(true);
 await EventService.markAttendance(event._id, attendedIds);
 if (onUpdate) onUpdate();
 alert('Attendance saved successfully!');
 } catch (err) {
 alert('Failed to save attendance: ' + err.message);
 } finally {
 setIsSaving(false);
 }
 };

 const handleWinnerChange = (position, studentId) => {
 setWinners(prev => prev.map(w => w.position === position ? { ...w, student: studentId } : w));
 };

 const saveWinners = async () => {
 try {
 setIsSaving(true);
 const validWinners = winners.filter(w => w.student !== '');
 if (validWinners.length === 0) {
 alert('Please select at least one winner');
 return;
 }
 await EventService.addWinners(event._id, validWinners);
 if (onUpdate) onUpdate();
 alert('Winners submitted for admin approval!');
 } catch (err) {
 alert('Failed to save winners: ' + err.message);
 } finally {
 setIsSaving(false);
 }
 };

 const handleExport = async () => {
 await EventService.exportEventParticipants(event._id);
 };

 const handleArchive = async () => {
 if (window.confirm('Are you sure you want to archive this event?')) {
 await EventService.archiveEvent(event._id);
 if (onUpdate) onUpdate();
 onClose();
 }
 };

 const organizerName = event.createdBy?.name || 'Unknown';

 /* ─── Student Registration Flow ─── */
 const handleRegister = async () => {
 try {
 setIsRegistering(true);
 const res = await EventService.registerForEvent(event._id);
 const regData = res.data;

 setRegistrationId(regData?._id);
 setRegistrationSuccess(true);

 if (regData?.paymentStatus === 'pending') {
 // Paid event — show payment gateway
 setPaymentStep('gateway');
 } else {
 // Free event — done
 setPaymentStep('done');
 if (onUpdate) onUpdate();
 }
 } catch (err) {
 alert('Registration failed: ' + err.message);
 } finally {
 setIsRegistering(false);
 }
 };

 /* ─── Payment Gateway Handler ─── */
 const handlePayment = async () => {
 setPaymentError('');
 setIsProcessingPayment(true);
 try {
 const paymentData = { paymentMethod };
 if (paymentMethod === 'card') {
 const cleanNumber = cardNumber.replace(/\s/g, '');
 if (cleanNumber.length !== 16) { setPaymentError('Card number must be 16 digits'); setIsProcessingPayment(false); return; }
 if (!cardExpiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) { setPaymentError('Expiry must be MM/YY'); setIsProcessingPayment(false); return; }
 if (cardCvv.length < 3) { setPaymentError('CVV must be 3+ digits'); setIsProcessingPayment(false); return; }
 if (!cardName.trim()) { setPaymentError('Cardholder name required'); setIsProcessingPayment(false); return; }
 paymentData.cardNumber = cleanNumber;
 paymentData.cardExpiry = cardExpiry;
 paymentData.cardCvv = cardCvv;
 paymentData.cardName = cardName;
 } else {
 if (!upiId.includes('@')) { setPaymentError('Enter a valid UPI ID (e.g. name@upi)'); setIsProcessingPayment(false); return; }
 paymentData.upiId = upiId;
 }

 // Simulate a brief processing delay for realism
 await new Promise(r => setTimeout(r, 1500));

 const res = await EventService.processPayment(registrationId, paymentData);
 setTxnResult(res.data);
 setPaymentStep('done');
 if (onUpdate) onUpdate();
 } catch (err) {
 setPaymentError(err.message || 'Payment failed. Please try again.');
 } finally {
 setIsProcessingPayment(false);
 }
 };

 const formatCardNumber = (v) => {
 const digits = v.replace(/\D/g, '').slice(0, 16);
 return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
 };



 /* ─── Admin Approve / Reject ─── */
 const handleApproveEvent = async () => {
 try {
 setActionLoading('approve');
 await EventService.approveEvent(event._id);
 if (onUpdate) onUpdate();
 onClose();
 } catch (err) {
 alert('Failed: ' + err.message);
 } finally {
 setActionLoading(null);
 }
 };

 const handleRejectEvent = async () => {
 if (!rejectReason.trim()) { alert('Please provide a reason'); return; }
 try {
 setActionLoading('reject');
 await EventService.rejectEvent(event._id, rejectReason);
 if (onUpdate) onUpdate();
 onClose();
 } catch (err) {
 alert('Failed: ' + err.message);
 } finally {
 setActionLoading(null);
 }
 };

 const handleApproveResults = async () => {
 try {
 setActionLoading('approve_results');
 await EventService.approveResults(event._id);
 if (onUpdate) onUpdate();
 onClose();
 } catch (err) {
 alert('Failed: ' + err.message);
 } finally {
 setActionLoading(null);
 }
 };

 const handleRejectResults = async () => {
 if (!showResultRejectInput.trim()) { alert('Please provide a reason'); return; }
 try {
 setActionLoading('reject_results');
 await EventService.rejectResults(event._id, showResultRejectInput);
 if (onUpdate) onUpdate();
 onClose();
 } catch (err) {
 alert('Failed: ' + err.message);
 } finally {
 setActionLoading(null);
 }
 };

 const handleCompleteEvent = async () => {
 try {
 setActionLoading('complete');
 await EventService.completeEvent(event._id);
 if (onUpdate) onUpdate();
 alert('Event marked as completed!');
 } catch (err) {
 alert('Failed: ' + err.message);
 } finally {
 setActionLoading(null);
 }
 };

 const statusBadge = (status) => {
 const styles = {
 approved: 'bg-green-100 text-green-800',
 rejected: 'bg-red-100 text-red-800',
 pending: 'bg-yellow-100 text-yellow-800',
 completed: 'bg-blue-100 text-blue-800',
 pending_approval: 'bg-purple-100 text-purple-800',
 published: 'bg-emerald-100 text-emerald-800',
 archived: 'bg-gray-100 text-gray-800',
 };
 return (
 <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
 {status?.replace('_', ' ').charAt(0).toUpperCase() + status?.replace('_', ' ').slice(1)}
 </span>
 );
 };

 // Determine visible tabs based on role
 const getTabs = () => {
 if (userRole === 'student') return [{ id: 'details', label: 'Details' }];
 return [
 { id: 'details', label: 'Details' },
 { id: 'participants', label: 'Participants' },
 { id: 'payments', label: 'Payments' },
 { id: 'winners', label: 'Winners' },
 { id: 'history', label: 'History' },
 ];
 };

 if (!event) return null;

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
 <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

 {/* Header */}
 <div className="relative shrink-0 bg-gradient-to-r from-indigo-500 to-blue-600 p-6">
 <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors">
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
 </button>
 <div className="mt-4">
 <div className="flex items-center gap-2 mb-2">
 <span className="px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-white/20 text-white shadow-sm">
 {event.category || 'Event'}
 </span>
 {statusBadge(event.status)}
 </div>
 <h2 className="text-2xl font-bold text-white">{event.title || event.name}</h2>
 </div>
 </div>

 {/* Tabs Navigation */}
 <div className="flex border-b border-gray-200 bg-gray-50 px-6">
 {getTabs().map(tab => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
 activeTab === tab.id
 ? 'border-indigo-500 text-indigo-600'
 : 'border-transparent text-gray-500 hover:text-gray-700'
 }`}
 >
 {tab.label}
 </button>
 ))}
 </div>

 {/* Content Area */}
 <div className="p-6 md:p-8 overflow-y-auto flex-grow">
 {activeTab === 'details' && (
 <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="space-y-4">
 <DetailItem icon="calendar" label="Date & Time" value={new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} subValue={`${event.time} (${event.duration || 'N/A'})`} />
 <DetailItem icon="location" label="Venue" value={event.venue} />
 <DetailItem icon="ticket" label="Fee" value={event.registrationFees > 0 ? `₹${event.registrationFees}` : 'Free'} />
 </div>
 <div className="space-y-4">
 <DetailItem icon="user" label="Organizer" value={organizerName} />
 <DetailItem icon="trophy" label="Prize" value={event.prize || 'N/A'} />
 </div>
 </div>

 {/* Faculty Info — hidden from students */}
 {userRole !== 'student' && (
 <div>
 <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 border-b pb-2">Assigned Faculty</h4>
 {event.assignedFaculty?.length > 0 ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {event.assignedFaculty.map(f => (
 <div key={f._id || f.email} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
 <div className="flex items-start gap-3">
 <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shrink-0">
 {f.name?.charAt(0).toUpperCase()}
 </div>
 <div className="min-w-0">
 <h5 className="text-sm font-bold text-gray-900 truncate">{f.name}</h5>
 <p className="text-xs text-indigo-600 font-medium">{f.designation || 'Faculty'}</p>
 <p className="text-xs text-gray-500 mt-1">{f.department || 'General'} • {f.collegeName || 'CDGI'}</p>
 </div>
 </div>
 </div>
 ))}
 </div>
 ) : (<p className="text-sm bg-gray-50 p-3 rounded-lg border italic text-gray-500">No faculty currently assigned.</p>)}
 </div>
 )}

 {/* Description */}
 <div>
 <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 border-b pb-2">Description</h4>
 <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">{event.description}</p>
 </div>

 {/* ─── ADMIN Approve/Reject for PENDING events ─── */}
 {userRole === 'admin' && event.status === 'pending' && (
 <div className="pt-6 border-t">
 <h4 className="text-sm font-bold text-gray-900 mb-3">Event Approval</h4>
 {!showRejectInput ? (
 <div className="flex gap-3">
 <button onClick={handleApproveEvent} disabled={actionLoading === 'approve'}
 className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all disabled:opacity-50">
 {actionLoading === 'approve' ? 'Approving...' : '✓ Approve Event'}
 </button>
 <button onClick={() => setShowRejectInput(true)}
 className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all">
 ✗ Reject Event
 </button>
 </div>
 ) : (
 <div className="space-y-3">
 <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
 placeholder="Enter rejection reason..."
 className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none" rows="3" />
 <div className="flex gap-3">
 <button onClick={() => setShowRejectInput(false)}
 className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">Cancel</button>
 <button onClick={handleRejectEvent} disabled={actionLoading === 'reject'}
 className="flex-1 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl disabled:opacity-50">
 {actionLoading === 'reject' ? 'Rejecting...' : 'Confirm Reject'}
 </button>
 </div>
 </div>
 )}
 </div>
 )}

 {/* ─── ADMIN Approve/Reject for PENDING_APPROVAL results ─── */}
 {userRole === 'admin' && event.status === 'pending_approval' && (
 <div className="pt-6 border-t">
 <h4 className="text-sm font-bold text-gray-900 mb-2">Result Approval</h4>
 <p className="text-xs text-gray-500 mb-3">Faculty has submitted winners for this event. Review and approve or reject.</p>
 {event.winners?.length > 0 && (
 <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
 {event.winners.map((w, i) => (
 <div key={i} className="flex items-center gap-3 text-sm">
 <span className="text-lg">{['🥇','🥈','🥉'][w.position - 1] || '🏅'}</span>
 <span className="font-medium text-gray-900">Position {w.position}</span>
 <span className="text-gray-500">— Student ID: {w.student?.name || w.student}</span>
 </div>
 ))}
 </div>
 )}
 {!showResultRejectInput ? (
 <div className="flex gap-3">
 <button onClick={handleApproveResults} disabled={actionLoading === 'approve_results'}
 className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl disabled:opacity-50">
 {actionLoading === 'approve_results' ? 'Publishing...' : '✓ Approve & Publish'}
 </button>
 <button onClick={() => setShowResultRejectInput(' ')}
 className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl">
 ✗ Reject Results
 </button>
 </div>
 ) : (
 <div className="space-y-3">
 <textarea value={showResultRejectInput} onChange={(e) => setShowResultRejectInput(e.target.value)}
 placeholder="Enter rejection reason..." className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none" rows="3" />
 <div className="flex gap-3">
 <button onClick={() => setShowResultRejectInput('')}
 className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">Cancel</button>
 <button onClick={handleRejectResults} disabled={actionLoading === 'reject_results'}
 className="flex-1 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl disabled:opacity-50">
 {actionLoading === 'reject_results' ? 'Rejecting...' : 'Confirm Reject'}
 </button>
 </div>
 </div>
 )}
 </div>
 )}

 {/* ─── ADMIN/Faculty: Mark Complete button ─── */}
 {(userRole === 'admin' || userRole === 'faculty') && event.status === 'approved' && (
 <div className="pt-6 border-t">
 <button onClick={handleCompleteEvent} disabled={actionLoading === 'complete'}
 className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50">
 {actionLoading === 'complete' ? 'Processing...' : '✓ Mark Event as Completed'}
 </button>
 </div>
 )}

 {/* ─── Student Registration Flow ─── */}
 {userRole === 'student' && event.status === 'approved' && (
 <div className="pt-6 border-t">
 {!registrationSuccess ? (
 /* Not registered yet → Show register button */
 <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
 <div>
 <h4 className="text-base font-bold text-gray-900 flex items-center">
 Registration is Open
 {event.registrationFees > 0 && <span className="ml-2 px-2 py-0.5 rounded text-xs bg-indigo-100 text-indigo-700">₹{event.registrationFees} Fee</span>}
 </h4>
 <p className="text-sm text-gray-600 mt-1">
 {event.maxParticipants > 0 ? `${Math.max(0, event.maxParticipants - (event.registrationCount || 0))} spots remaining` : 'Unlimited spots available'}
 </p>
 </div>
 <button onClick={handleRegister} disabled={isRegistering}
 className="px-6 py-3 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 transform active:scale-95 whitespace-nowrap">
 {isRegistering ? 'Registering...' : 'Register Now'}
 </button>
 </div>
 ) : paymentStep === 'gateway' ? (
 /* ──── PAYMENT GATEWAY ──── */
 <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
 {/* Gateway Header */}
 <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
 </div>
 <div>
 <h3 className="text-white font-bold text-lg">Secure Payment</h3>
 <p className="text-white/70 text-xs">256-bit encrypted • Test Mode</p>
 </div>
 </div>
 <div className="text-right">
 <p className="text-white/70 text-xs">Amount</p>
 <p className="text-white font-bold text-xl">₹{event.registrationFees}</p>
 </div>
 </div>
 </div>

 <div className="p-6">
 {/* Method Tabs */}
 <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
 <button onClick={() => { setPaymentMethod('card'); setPaymentError(''); }}
 className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${paymentMethod === 'card' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
 Card
 </button>
 <button onClick={() => { setPaymentMethod('upi'); setPaymentError(''); }}
 className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${paymentMethod === 'upi' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
 <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.5 3l4.5 8h-3v10h-3V11h-3l4.5-8z"/></svg>
 UPI
 </button>
 </div>

 {/* Card Form */}
 {paymentMethod === 'card' && (
 <div className="space-y-4 animate-in fade-in duration-200">
 <div>
 <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Card Number</label>
 <input type="text" placeholder="1234 5678 9012 3456" maxLength={19}
 value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono text-base tracking-widest focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300" />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Expiry</label>
 <input type="text" placeholder="MM/YY" maxLength={5}
 value={cardExpiry} onChange={(e) => { const v = e.target.value.replace(/[^\d/]/g, ''); if (v.length === 2 && !v.includes('/') && cardExpiry.length < 2) setCardExpiry(v + '/'); else setCardExpiry(v); }}
 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono text-base tracking-widest focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300" />
 </div>
 <div>
 <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">CVV</label>
 <input type="password" placeholder="•••" maxLength={4}
 value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono text-base tracking-widest focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300" />
 </div>
 </div>
 <div>
 <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Cardholder Name</label>
 <input type="text" placeholder="Name on card"
 value={cardName} onChange={(e) => setCardName(e.target.value)}
 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300" />
 </div>
 </div>
 )}

 {/* UPI Form */}
 {paymentMethod === 'upi' && (
 <div className="space-y-4 animate-in fade-in duration-200">
 <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-2">
 <p className="text-sm text-indigo-700">Enter your UPI ID linked to any payment app (Google Pay, PhonePe, Paytm, etc.)</p>
 </div>
 <div>
 <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">UPI ID</label>
 <input type="text" placeholder="yourname@upi"
 value={upiId} onChange={(e) => setUpiId(e.target.value)}
 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300" />
 </div>
 </div>
 )}

 {/* Error */}
 {paymentError && (
 <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
 <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
 <p className="text-sm text-red-700">{paymentError}</p>
 </div>
 )}

 {/* Pay Button */}
 <button onClick={handlePayment} disabled={isProcessingPayment}
 className="w-full mt-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed transform active:scale-[0.98]">
 {isProcessingPayment ? (
 <span className="flex items-center justify-center gap-2">
 <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
 Processing Payment...
 </span>
 ) : (
 `Pay ₹${event.registrationFees}`
 )}
 </button>

 <p className="text-center text-[10px] text-gray-400 mt-3">This is a demo payment gateway. No real charges will be made.</p>
 </div>
 </div>
 ) : (
 /* ──── SUCCESS SCREEN ──── */
 <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
 <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-green-100 mb-4">
 <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
 </div>
 <h3 className="text-lg font-bold text-green-900 mb-2">
 {event.registrationFees > 0 ? 'Payment Successful!' : 'Registration Confirmed!'}
 </h3>
 <p className="text-green-700 text-sm mb-3">
 {event.registrationFees > 0 ? 'Your payment has been processed and you are now registered.' : 'You are successfully registered for this event.'}
 </p>
 {txnResult && (
 <div className="bg-white border border-green-200 rounded-lg p-3 inline-block">
 <p className="text-xs text-gray-500">Transaction ID</p>
 <p className="text-sm font-mono font-bold text-gray-900">{txnResult.transactionId}</p>
 </div>
 )}
 </div>
 )}
 </div>
 )}

 {/* Actions for Faculty/Admin */}
 {userRole !== 'student' && (
 <div className="flex flex-wrap gap-3 pt-6 border-t">
 <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 shadow-sm">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M7 10l5 5m0 0l5-5m-5 5V3"/></svg>
 Export CSV
 </button>
 {event.status !== 'archived' && (
 <button onClick={handleArchive} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 shadow-sm">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
 Archive
 </button>
 )}
 </div>
 )}
 </div>
 )}

 {activeTab === 'participants' && (
 <div className="animate-in slide-in-from-bottom-2 duration-300">
 <div className="flex justify-between items-center mb-4">
 <h3 className="font-bold text-gray-900">Participants ({participants.length})</h3>
 <button onClick={saveAttendance} disabled={isSaving}
 className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95">
 {isSaving ? 'Processing...' : 'Sync Attendance'}
 </button>
 </div>
 {loading ? <div className="text-center py-12">Fetching roster...</div> : (
 <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
 <table className="min-w-full divide-y divide-gray-200">
 <thead className="bg-white"><tr>
 <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Student</th>
 <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Enrollment</th>
 <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Present</th>
 </tr></thead>
 <tbody className="divide-y divide-gray-100">
 {participants.map(p => (
 <tr key={p._id} className="hover:bg-white transition-colors">
 <td className="px-6 py-3"><div className="text-sm font-bold">{p.name}</div><div className="text-[10px] text-gray-400 font-medium uppercase">{p.collegeName || 'Student'}</div></td>
 <td className="px-6 py-3 text-xs text-gray-500 font-mono italic">{p.enrollmentNumber}</td>
 <td className="px-6 py-3 text-center">
 <input type="checkbox" checked={attendedIds.includes(p._id)} onChange={() => handleAttendanceToggle(p._id)}
 className="w-5 h-5 text-indigo-600 rounded-lg border-gray-300 focus:ring-indigo-500 cursor-pointer" />
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 {participants.length === 0 && <div className="p-12 text-center text-gray-400 italic">No registrations yet.</div>}
 </div>
 )}
 </div>
 )}

 {activeTab === 'payments' && (
 <div className="animate-in slide-in-from-bottom-2 duration-300">
 <div className="flex justify-between items-center mb-4">
 <h3 className="font-bold text-gray-900">Payments ({paymentsData.data.length})</h3>
 <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">Total Paid: {paymentsData.totalPaidStudentsCount}</span>
 </div>
 {loading ? <div className="text-center py-12">Fetching payment records...</div> : (
 <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
 <div className="overflow-x-auto w-full">
 <table className="min-w-full divide-y divide-gray-200 w-full table-auto">
 <thead className="bg-white"><tr>
 <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Student</th>
 <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Amount</th>
 <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Proof</th>
 <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Date</th>
 <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Status</th>
 </tr></thead>
 <tbody className="divide-y divide-gray-100">
 {paymentsData.data.map(p => (
 <tr key={p._id} className="hover:bg-white transition-colors">
 <td className="px-6 py-3 whitespace-nowrap">
 <div className="text-sm font-bold">{p.studentName || p.studentId?.name}</div>
 <div className="text-xs text-gray-500">{p.email || p.studentId?.email}</div>
 </td>
 <td className="px-6 py-3 text-sm font-bold text-indigo-600 whitespace-nowrap">₹{p.amount}</td>
 <td className="px-6 py-3 text-xs text-gray-500 whitespace-nowrap">
 {p.paymentScreenshot ? (
 <a href={`${import.meta.env.VITE_API_URL || ''}${p.paymentScreenshot}`} target="_blank" rel="noopener noreferrer"
 className="text-indigo-600 hover:underline flex items-center gap-1">
 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
 View SS
 </a>
 ) : 'No SS'}
 </td>
 <td className="px-6 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(p.paymentDate || p.createdAt).toLocaleDateString()}</td>
 <td className="px-6 py-3 text-center whitespace-nowrap">{statusBadge(p.paymentStatus)}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 {paymentsData.data.length === 0 && <div className="p-12 text-center text-gray-400 italic">No payments recorded yet.</div>}
 </div>
 )}
 </div>
 )}

 {activeTab === 'winners' && (
 <div className="animate-in slide-in-from-bottom-2 duration-300 space-y-6">
 <div className="flex justify-between items-center mb-2">
 <div>
 <h3 className="font-bold text-gray-900 text-lg">Podium Finishes</h3>
 <p className="text-xs text-gray-500">Record event winners only after competition ends.</p>
 </div>
 <button onClick={saveWinners} disabled={isSaving || event.status !== 'completed'}
 className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-20 transition-all active:scale-95">
 {isSaving ? 'Submitting...' : 'Post Results'}
 </button>
 </div>

 {event.status !== 'completed' && event.status !== 'pending_approval' && event.status !== 'published' && (
 <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs flex gap-2 items-center">
 <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
 Event must be marked "Completed" to submit official results.
 </div>
 )}

 <div className="space-y-4">
 {[
 { pos: 1, label: '1st Place (Gold)', icon: '🏆', color: 'border-yellow-400 text-yellow-600' },
 { pos: 2, label: '2nd Place (Silver)', icon: '🥈', color: 'border-gray-400 text-gray-500' },
 { pos: 3, label: '3rd Place (Bronze)', icon: '🥉', color: 'border-orange-400 text-orange-600' }
 ].map(item => (
 <div key={item.pos} className={`flex flex-col sm:flex-row gap-3 items-center p-4 bg-gray-50 rounded-2xl border-l-4 ${item.color}`}>
 <div className="text-2xl">{item.icon}</div>
 <div className="flex-grow w-full">
 <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{item.label}</label>
 <select
 value={(() => { const w = winners.find(w => w.position === item.pos); return w ? (typeof w.student === 'object' ? w.student?._id || '' : w.student) : ''; })()}
 onChange={(e) => handleWinnerChange(item.pos, e.target.value)}
 disabled={event.status === 'published' || event.status === 'pending_approval'}
 className="w-full bg-white border-none rounded-xl text-sm p-2 focus:ring-1 focus:ring-indigo-500">
 <option value="">Select Student</option>
 {participants.map(p => (<option key={p._id} value={p._id}>{p.name} ({p.enrollmentNumber})</option>))}
 </select>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {activeTab === 'history' && (
 <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300 max-h-[400px]">
 <h3 className="font-bold text-gray-900 mb-4">Audit Trail</h3>
 {loading ? <div className="text-center py-12">Loading history...</div> : (
 <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 pl-8">
 {logs.length === 0 ? <p className="text-gray-500 text-sm italic">No history yet.</p> : logs.map(log => (
 <div key={log._id} className="relative group">
 <div className={`absolute -left-[24px] top-1.5 w-3 h-3 rounded-full border-2 border-white group-hover:scale-125 transition-transform ${getActionColor(log.action)}`}></div>
 <div className="p-3 bg-gray-50/50 rounded-xl border border-transparent hover:border-gray-200 transition-all">
 <div className="font-semibold text-gray-800 text-sm">{log.details}</div>
 <div className="text-[10px] text-gray-500 mt-1 uppercase font-bold flex items-center gap-2">
 <span className="text-indigo-500">{log.performedBy?.name}</span>
 <span className="opacity-50">/</span>
 <span className="italic">{new Date(log.createdAt).toLocaleString()}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )}
 </div>

 {paymentStep !== 'gateway' && (
 <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
 <button onClick={onClose} className="w-full py-3 text-xs font-bold uppercase tracking-widest text-gray-600 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition-all active:scale-[0.99]">{paymentStep === 'done' ? 'Close' : 'Dismiss Modal'}</button>
 </div>
 )}
 </div>
 </div>
 );
};

const DetailItem = ({ icon, label, value, subValue }) => (
 <div className="group">
 <h4 className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-[2px] mb-1.5">
 {icon === 'calendar' && <svg className="w-3 h-3 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
 {icon === 'location' && <svg className="w-3 h-3 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
 {icon === 'user' && <svg className="w-3 h-3 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
 {icon === 'ticket' && <svg className="w-3 h-3 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>}
 {icon === 'trophy' && <svg className="w-3 h-3 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>}
 {label}
 </h4>
 <p className="text-gray-900 font-bold text-sm group-hover:text-indigo-500 transition-colors">{value}</p>
 {subValue && <p className="text-[10px] text-gray-400 font-medium italic">{subValue}</p>}
 </div>
);

const getActionColor = (action) => {
 switch (action) {
 case 'created': return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]';
 case 'approved': return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
 case 'rejected': return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
 case 'archived': return 'bg-gray-500 shadow-[0_0_8px_rgba(107,114,128,0.5)]';
 case 'registered': return 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]';
 case 'winners_added': return 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]';
 default: return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]';
 }
};

export default EventDetailsModal;
