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
 const [qrData, setQrData] = useState(event.qrCode || null);
 const [registrationSuccess, setRegistrationSuccess] = useState(event.isRegistered || false);
 
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
 // Filter out empty winners
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

 const handleRegister = async () => {
 try {
 setIsRegistering(true);
 const res = await EventService.registerForEvent(event._id);
 
 if (res.data?.qrCode) {
 setQrData(res.data.qrCode);
 }
 setRegistrationSuccess(true);
 alert(res.message || 'Registered successfully!');
 if (onUpdate) onUpdate();
 } catch (err) {
 alert('Registration failed: ' + err.message);
 } finally {
 setIsRegistering(false);
 }
 };

 const statusBadge = (status) => {
 const styles = {
 approved: 'bg-green-100 text-green-800 ',
 rejected: 'bg-red-100 text-red-800 ',
 pending: 'bg-yellow-100 text-yellow-800 ',
 completed: 'bg-blue-100 text-blue-800 ',
 pending_approval: 'bg-purple-100 text-purple-800 ',
 published: 'bg-emerald-100 text-emerald-800 ',
 archived: 'bg-gray-100 text-gray-800 ',
 };
 return (
 <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
 {status?.replace('_', ' ').charAt(0).toUpperCase() + status?.replace('_', ' ').slice(1)}
 </span>
 );
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
 {[
 { id: 'details', label: 'Details' },
 { id: 'participants', label: 'Participants' },
 { id: 'payments', label: 'Payments' },
 { id: 'winners', label: 'Winners' },
 { id: 'history', label: 'History' },
 ].map(tab => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
 activeTab === tab.id 
 ? 'border-indigo-500 text-indigo-600 ' 
 : 'border-transparent text-gray-500 hover:text-gray-700 '
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
 </div>
 <div className="space-y-4">
 <DetailItem icon="user" label="Organizer" value={organizerName} />
 </div>
 </div>

 <div>
 <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 border-b pb-2">Assigned Faculty</h4>
 {event.assignedFaculty?.length > 0 ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {event.assignedFaculty.map(f => (
 <div key={f._id || f.email} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
 <div className="flex items-start gap-4">
 <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl shrink-0">
 {f.name?.charAt(0).toUpperCase()}
 </div>
 <div className="flex-1 min-w-0">
 <h5 className="text-sm font-bold text-gray-900 truncate">{f.name}</h5>
 <p className="text-xs text-indigo-600 font-medium truncate mb-2.5">{f.designation || 'Assistant Professor'}</p>
 
 <div className="space-y-1.5 mt-2">
 <div className="flex items-center text-xs text-gray-600 ">
 <svg className="w-3.5 h-3.5 mr-2 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
 <span className="truncate">{f.email}</span>
 </div>
 <div className="flex items-center text-xs text-gray-600 ">
 <svg className="w-3.5 h-3.5 mr-2 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
 <span>{f.phone || 'N/A'}</span>
 </div>
 <div className="flex items-center text-xs text-gray-600 ">
 <svg className="w-3.5 h-3.5 mr-2 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
 <span className="truncate">{f.department || 'General'} • {f.collegeName || 'CDGI'}</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-sm bg-gray-50 p-3 rounded-lg border italic text-gray-500">
 No faculty currently assigned.
 </p>
 )}
 </div>

 <div>
 <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 border-b pb-2">Description</h4>
 <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">{event.description}</p>
 </div>
 
 {/* Registration Flow for Students */}
 {userRole === 'student' && event.status === 'approved' && (
 <div className="pt-6 border-t ">
 {registrationSuccess ? (
 <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
 <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
 <svg className="h-6 w-6 text-green-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
 </div>
 <h3 className="text-lg font-bold text-green-900 mb-2">Registration Confirmed</h3>
 <p className="text-green-700 text-sm mb-4">You are successfully registered for this event.</p>
 
 {qrData ? (
 <div className="mt-4 p-4 bg-white rounded-lg inline-block text-center border border-gray-200 w-full sm:w-auto">
 <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Scan to Pay (₹{event.registrationFees})</p>
 <img src={qrData} alt="UPI Payment QR Code" className="w-48 h-48 object-contain mx-auto border rounded" />
 <p className="text-[10px] text-gray-400 mt-2">After paying, wait or check your Dashboard for status.</p>
 </div>
 ) : (event.registrationFees > 0 && (
 <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-center text-sm">
 <p className="font-bold text-yellow-800 ">Payment Pending (₹{event.registrationFees})</p>
 <p className="text-yellow-700 mt-1">UPI QR is currently unavailable. You will be able to pay later or via cash.</p>
 </div>
 ))}
 </div>
 ) : (
 <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
 <div>
 <h4 className="text-base font-bold text-gray-900 flex items-center">
 Registration is Open
 {event.registrationFees > 0 && <span className="ml-2 px-2 py-0.5 rounded text-xs bg-indigo-100 text-indigo-700 ">₹{event.registrationFees} Fee</span>}
 </h4>
 <p className="text-sm text-gray-600 mt-1">
 {event.maxParticipants > 0 ? `${Math.max(0, event.maxParticipants - (event.registrationCount || 0))} spots remaining` : 'Unlimited spots available'}
 </p>
 </div>
 <button 
 onClick={handleRegister}
 disabled={isRegistering || (event.maxParticipants > 0 && event.registrationCount >= event.maxParticipants)}
 className="px-6 py-3 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 whitespace-nowrap"
 >
 {isRegistering ? 'Registering...' : (event.maxParticipants > 0 && event.registrationCount >= event.maxParticipants ? 'Event Full' : 'Register Now')}
 </button>
 </div>
 )}
 </div>
 )}

 {/* Actions for Faculty/Admin */}
 {userRole !== 'student' && (
 <div className="flex flex-wrap gap-3 pt-6 border-t ">
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
 <h3 className="font-bold text-gray-900 ">Participants ({participants.length})</h3>
 <button 
 onClick={saveAttendance} 
 disabled={isSaving}
 className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95"
 >
 {isSaving ? 'Processing...' : 'Sync Attendance'}
 </button>
 </div>
 {loading ? <div className="text-center py-12">Fetching digital roster...</div> : (
 <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 ">
 <table className="min-w-full divide-y divide-gray-200 ">
 <thead className="bg-white ">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Student</th>
 <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Enrollment</th>
 <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Present</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 ">
 {participants.map(p => (
 <tr key={p._id} className="hover:bg-white transition-colors">
 <td className="px-6 py-3">
 <div className="text-sm font-bold ">{p.name}</div>
 <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{p.collegeName || 'CDGI Student'}</div>
 </td>
 <td className="px-6 py-3 text-xs text-gray-500 font-mono italic">{p.enrollmentNumber}</td>
 <td className="px-6 py-3 text-center">
 <input 
 type="checkbox" 
 checked={attendedIds.includes(p._id)}
 onChange={() => handleAttendanceToggle(p._id)}
 className="w-5 h-5 text-indigo-600 rounded-lg border-gray-300 focus:ring-indigo-500 cursor-pointer"
 />
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 {participants.length === 0 && <div className="p-12 text-center text-gray-400 italic">Zero registrations detected.</div>}
 </div>
 )}
 </div>
 )}

 {activeTab === 'payments' && (
 <div className="animate-in slide-in-from-bottom-2 duration-300">
 <div className="flex justify-between items-center mb-4">
 <h3 className="font-bold text-gray-900 ">Payments ({paymentsData.data.length})</h3>
 <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
 Total Paid: {paymentsData.totalPaidStudentsCount}
 </span>
 </div>
 {loading ? <div className="text-center py-12">Fetching payment records...</div> : (
 <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 ">
 <div className="overflow-x-auto w-full">
 <table className="min-w-full divide-y divide-gray-200 w-full table-auto">
 <thead className="bg-white ">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Student Details</th>
 <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Amount</th>
 <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Transaction ID</th>
 <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Date</th>
 <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 ">
 {paymentsData.data.map(p => (
 <tr key={p._id} className="hover:bg-white transition-colors">
 <td className="px-6 py-3 whitespace-nowrap">
 <div className="text-sm font-bold ">{p.studentName || p.studentId?.name}</div>
 <div className="text-xs text-gray-500 ">{p.email || p.studentId?.email}</div>
 <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter mt-0.5">{p.phone || p.studentId?.phone || 'No phone'}</div>
 </td>
 <td className="px-6 py-3 text-sm font-bold text-indigo-600 whitespace-nowrap">₹{p.amount}</td>
 <td className="px-6 py-3 text-xs text-gray-500 font-mono italic max-w-[120px] truncate" title={p.transactionId}>{p.transactionId || '—'}</td>
 <td className="px-6 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(p.paymentDate || p.createdAt).toLocaleDateString()}</td>
 <td className="px-6 py-3 text-center whitespace-nowrap">
 {statusBadge(p.paymentStatus)}
 </td>
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
 <button 
 onClick={saveWinners} 
 disabled={isSaving || event.status !== 'completed'}
 className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-20 transition-all active:scale-95"
 >
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
 value={winners.find(w => w.position === item.pos)?.student || ''}
 onChange={(e) => handleWinnerChange(item.pos, e.target.value)}
 disabled={event.status === 'published' || event.status === 'pending_approval'}
 className="w-full bg-white border-none rounded-xl text-sm p-2 focus:ring-1 focus:ring-indigo-500"
 >
 <option value="">Select Student</option>
 {participants.map(p => (
 <option key={p._id} value={p._id}>{p.name} ({p.enrollmentNumber})</option>
 ))}
 </select>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {activeTab === 'history' && (
 <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300 max-h-[400px]">
 <h3 className="font-bold text-gray-900 mb-4">Diagnostic Audit Trail</h3>
 {loading ? <div className="text-center py-12">Replaying transaction history...</div> : (
 <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 pl-8">
 {logs.length === 0 ? <p className="text-gray-500 text-sm italic">No state changes logged yet.</p> : logs.map(log => (
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

 <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
 <button onClick={onClose} className="w-full py-3 text-xs font-bold uppercase tracking-widest text-gray-600 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition-all active:scale-[0.99]">Dismiss Modal</button>
 </div>
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
