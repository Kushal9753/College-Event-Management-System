import React, { useState, useCallback } from 'react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useQuery } from '../../hooks/useQuery';
import EventDetailsModal from '../../components/common/EventDetailsModal';
import { SearchX } from 'lucide-react';

const Dashboard = () => {
 // Cached data fetching — data persists across navigations
 const { data: events = [], loading, error, refetch, setOptimistic } = useQuery(
 'admin-events',
 async () => {
 const response = await api.get('/events');
 return response.data.data || [];
 },
 { staleTime: 30000 } // 30s cache
 );

 const { data: stats } = useQuery(
 'admin-stats',
 async () => {
 const response = await api.get('/admin/stats');
 return response.data?.data || null;
 },
 { staleTime: 60000 } // 60s cache for stats
 );

 const socket = useSocket();
 
 // Tabs State
 const tabs = ['All', 'Pending', 'Approved', 'Rejected'];
 const [activeTab, setActiveTab] = useState('All');
 
 // State for rejection inline form
 const [rejectingId, setRejectingId] = useState(null);
 const [rejectionReason, setRejectionReason] = useState('');
 const [actionLoading, setActionLoading] = useState(null);
 const [selectedEvent, setSelectedEvent] = useState(null);

 // Socket: debounced background refresh instead of full refetch
 React.useEffect(() => {
 if (!socket) return;
 const handleUpdate = () => refetch();
 socket.on('event_created', handleUpdate);
 socket.on('event_updated', handleUpdate);
 
 return () => {
 socket.off('event_created', handleUpdate);
 socket.off('event_updated', handleUpdate);
 };
 }, [socket, refetch]);

 const handleApprove = async (id) => {
 try {
 setActionLoading(id);
 await api.patch(`/events/${id}/approve`);
 // Update event status instantly in local state
 setEvents(events.map(event => event._id === id ? { ...event, status: 'approved' } : event));
 } catch (err) {
 alert(err.response?.data?.message || 'Failed to approve event');
 } finally {
 setActionLoading(null);
 }
 };

 const handleStartReject = (id) => {
 setRejectingId(id);
 setRejectionReason('');
 };

 const handleCancelReject = () => {
 setRejectingId(null);
 setRejectionReason('');
 };

 const handleSubmitReject = async (id) => {
 if (!rejectionReason.trim()) {
 alert('Please provide a rejection reason');
 return;
 }
 
 try {
 setActionLoading(id);
 await api.patch(`/events/${id}/reject`, { rejection_reason: rejectionReason });
 // Update event status instantly in local state
 setEvents(events.map(event => event._id === id ? { ...event, status: 'rejected', rejectionReason } : event));
 setRejectingId(null);
 setRejectionReason('');
 } catch (err) {
 alert(err.response?.data?.message || 'Failed to reject event');
 } finally {
 setActionLoading(null);
 }
 };

 // Filter events based on active tab
 const filteredEvents = events.filter(event => 
 activeTab === 'All' ? true : event.status?.toLowerCase() === activeTab.toLowerCase()
 );

 const renderStatusBadge = (status) => {
 switch (status?.toLowerCase()) {
 case 'approved':
 return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ">Approved</span>;
 case 'rejected':
 return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 ">Rejected</span>;
 case 'pending':
 default:
 return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ">Pending</span>;
 }
 };

 return (
 <div className="container mx-auto px-4 py-8">
 <div className="mb-6">
 <h1 className="text-2xl font-bold text-gray-900 ">Admin Dashboard</h1>
 <p className="text-gray-600 mt-1">Review and manage event requests submitted by faculty.</p>
 </div>

 {stats && (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
 <StatCard title="Total Students" value={stats.users.students} color="blue" />
 <StatCard title="Total Faculty" value={stats.users.faculty} color="emerald" />
 <StatCard title="Approved Events" value={stats.events.approved} color="indigo" />
 <StatCard title="Pending Events" value={stats.events.pending} color="amber" />
 </div>
 )}

 {error && (
 <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
 {error}
 </div>
 )}

 <div className="bg-white shadow rounded-lg overflow-hidden">
 {/* Header and Tabs */}
 <div className="px-4 py-5 sm:px-6 border-b border-gray-200 ">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
 <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 sm:mb-0">
 Event Applications
 </h3>
 
 <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
 {tabs.map(tab => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
 activeTab === tab
 ? 'bg-white text-indigo-600 shadow-sm'
 : 'text-gray-500 hover:text-gray-700 '
 }`}
 >
 {tab}
 </button>
 ))}
 </div>
 </div>
 </div>
 
 {loading ? (
 <div className="p-8 text-center text-gray-500 ">Loading events...</div>
 ) : filteredEvents.length === 0 ? (
 <div className="p-12 text-center border-t border-gray-200 ">
 <SearchX className="mx-auto h-12 w-12 text-gray-400" strokeWidth={1.5} />
 <h3 className="mt-2 text-sm font-medium text-gray-900 ">No events found</h3>
 <p className="mt-1 text-sm text-gray-500 ">There are no events matching the "{activeTab}" filter.</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="min-w-full divide-y divide-gray-200 ">
 <thead className="bg-gray-50 ">
 <tr>
 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name & Details</th>
 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
 <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200 ">
 {filteredEvents.map((event) => (
 <tr key={event._id} className="hover:bg-gray-50 transition-colors">
 <td className="px-6 py-4">
 <div className="flex flex-col">
 <span className="text-sm font-semibold text-gray-900 ">{event.name || event.title}</span>
 <div className="text-xs text-gray-500 flex items-center mt-1 space-x-2">
 {event.category && (
 <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-xs border border-indigo-100 ">
 {event.category}
 </span>
 )}
 <span>By: {event.createdBy?.name || event.organizer?.name || 'Unknown'}</span>
 </div>
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="text-sm text-gray-900 ">{new Date(event.date).toLocaleDateString()}</div>
 <div className="text-sm text-gray-500 ">{event.time || new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="text-sm text-gray-900 ">{event.venue || event.location}</div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="flex flex-col items-start gap-1">
 {renderStatusBadge(event.status)}
 {event.status === 'rejected' && event.rejectionReason && (
 <span className="text-xs text-red-500 truncate max-w-[150px]" title={event.rejectionReason}>Res: {event.rejectionReason}</span>
 )}
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
 {event.status === 'pending' ? (
 rejectingId === event._id ? (
 <div className="flex flex-col items-end space-y-2 min-w-[200px]">
 <input
 type="text"
 autoFocus
 value={rejectionReason}
 onChange={(e) => setRejectionReason(e.target.value)}
 className="w-full text-sm rounded border-gray-300 shadow-sm focus:border-red-500 py-1 px-2"
 placeholder="Reason..."
 />
 <div className="flex space-x-2">
 <button onClick={handleCancelReject} className="text-gray-500 hover:text-gray-700">Cancel</button>
 <button onClick={() => handleSubmitReject(event._id)} className="text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded">Reject</button>
 </div>
 </div>
 ) : (
 <div className="flex justify-end space-x-2">
 <button
 onClick={() => handleApprove(event._id)}
 disabled={actionLoading === event._id}
 className="text-green-600 hover:text-green-800 "
 >
 Approve
 </button>
 <button
 onClick={() => handleStartReject(event._id)}
 disabled={actionLoading === event._id}
 className="text-red-600 hover:text-red-800 "
 >
 Reject
 </button>
 <button
 onClick={() => setSelectedEvent(event)}
 className="text-indigo-600 hover:text-indigo-800 ml-2"
 >
 Details
 </button>
 </div>
 )
 ) : (
 <button
 onClick={() => setSelectedEvent(event)}
 className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
 >
 Details
 </button>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>

 {selectedEvent && (
 <EventDetailsModal 
 event={selectedEvent} 
 onClose={() => setSelectedEvent(null)} 
 />
 )}
 </div>
 );
};

const StatCard = ({ title, value, color }) => {
 const colors = {
 blue: 'bg-blue-50 text-blue-600 border-blue-100 ',
 emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 ',
 indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 ',
 amber: 'bg-amber-50 text-amber-600 border-amber-100 ',
 };

 return (
 <div className={`p-6 rounded-xl border ${colors[color]} shadow-sm`}>
 <p className="text-sm font-medium opacity-80">{title}</p>
 <p className="text-2xl font-bold mt-1">{value}</p>
 </div>
 );
};

export default Dashboard;
