import React, { useState, useEffect } from 'react';
import EventService from '../../services/eventService';

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

  const statusBadge = (status) => {
    const styles = {
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      pending_approval: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      published: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      archived: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
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
      <div className="bg-white dark:bg-gray-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
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
        <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-6">
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
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
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
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Assigned Faculty</h4>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border dark:border-gray-700">
                      {event.assignedFaculty?.length > 0 ? event.assignedFaculty.map(f => f.name).join(', ') : 'None'}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 border-b pb-2">Description</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">{event.description}</p>
              </div>
              
              {/* Actions for Faculty/Admin */}
              <div className="flex flex-wrap gap-3 pt-6 border-t dark:border-gray-800">
                <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M7 10l5 5m0 0l5-5m-5 5V3"/></svg>
                  Export CSV
                </button>
                {event.status !== 'archived' && (
                  <button onClick={handleArchive} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
                    Archive
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'participants' && (
            <div className="animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">Participants ({participants.length})</h3>
                <button 
                  onClick={saveAttendance} 
                  disabled={isSaving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isSaving ? 'Processing...' : 'Sync Attendance'}
                </button>
              </div>
              {loading ? <div className="text-center py-12">Fetching digital roster...</div> : (
                <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-black/20">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-white dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Enrollment</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Present</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {participants.map(p => (
                        <tr key={p._id} className="hover:bg-white dark:hover:bg-gray-800/10 transition-colors">
                          <td className="px-6 py-3">
                            <div className="text-sm font-bold dark:text-white">{p.name}</div>
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
                <h3 className="font-bold text-gray-900 dark:text-white">Payments ({paymentsData.data.length})</h3>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-bold">
                  Total Paid: {paymentsData.totalPaidStudentsCount}
                </span>
              </div>
              {loading ? <div className="text-center py-12">Fetching payment records...</div> : (
                <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-black/20">
                  <div className="overflow-x-auto w-full">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 w-full table-auto">
                      <thead className="bg-white dark:bg-gray-900">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Student Details</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Transaction ID</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Date</th>
                          <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {paymentsData.data.map(p => (
                          <tr key={p._id} className="hover:bg-white dark:hover:bg-gray-800/10 transition-colors">
                            <td className="px-6 py-3 whitespace-nowrap">
                              <div className="text-sm font-bold dark:text-white">{p.studentName || p.studentId?.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{p.email || p.studentId?.email}</div>
                              <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter mt-0.5">{p.phone || p.studentId?.phone || 'No phone'}</div>
                            </td>
                            <td className="px-6 py-3 text-sm font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">₹{p.amount}</td>
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
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">Podium Finishes</h3>
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
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-400 text-xs flex gap-2 items-center">
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
                  <div key={item.pos} className={`flex flex-col sm:flex-row gap-3 items-center p-4 bg-gray-50 dark:bg-black/20 rounded-2xl border-l-4 ${item.color}`}>
                    <div className="text-2xl">{item.icon}</div>
                    <div className="flex-grow w-full">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{item.label}</label>
                      <select 
                        value={winners.find(w => w.position === item.pos)?.student || ''}
                        onChange={(e) => handleWinnerChange(item.pos, e.target.value)}
                        disabled={event.status === 'published' || event.status === 'pending_approval'}
                        className="w-full bg-white dark:bg-gray-800 border-none rounded-xl text-sm p-2 focus:ring-1 focus:ring-indigo-500"
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
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Diagnostic Audit Trail</h3>
              {loading ? <div className="text-center py-12">Replaying transaction history...</div> : (
                <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800 pl-8">
                  {logs.length === 0 ? <p className="text-gray-500 text-sm italic">No state changes logged yet.</p> : logs.map(log => (
                    <div key={log._id} className="relative group">
                      <div className={`absolute -left-[24px] top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 group-hover:scale-125 transition-transform ${getActionColor(log.action)}`}></div>
                      <div className="p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                        <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{log.details}</div>
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

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 shrink-0">
          <button onClick={onClose} className="w-full py-3 text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:shadow-lg transition-all active:scale-[0.99]">Dismiss Modal</button>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ icon, label, value, subValue }) => (
  <div className="group">
    <h4 className="flex items-center text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[2px] mb-1.5">
      {icon === 'calendar' && <svg className="w-3 h-3 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
      {icon === 'location' && <svg className="w-3 h-3 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
      {icon === 'user' && <svg className="w-3 h-3 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
      {label}
    </h4>
    <p className="text-gray-900 dark:text-white font-bold text-sm group-hover:text-indigo-500 transition-colors">{value}</p>
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
