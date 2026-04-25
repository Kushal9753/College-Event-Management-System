import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const REPORT_TYPES = [
 { id: 'summary', label: 'Summary', icon: '📊', desc: 'Platform overview with key metrics' },
 { id: 'events', label: 'Events', icon: '🎪', desc: 'All events with registrations & revenue' },
 { id: 'registrations', label: 'Registrations', icon: '📝', desc: 'Student registrations & payment status' },
 { id: 'revenue', label: 'Revenue', icon: '💰', desc: 'Payment analytics & revenue breakdown' },
 { id: 'students', label: 'Students', icon: '🎓', desc: 'All registered students & activity' },
 { id: 'faculty', label: 'Faculty', icon: '👨‍🏫', desc: 'Faculty members & assignments' },
 { id: 'activity', label: 'Activity Log', icon: '📋', desc: 'System actions & audit trail' },
];

const Reports = () => {
 const [activeReport, setActiveReport] = useState('summary');
 const [reportData, setReportData] = useState(null);
 const [loading, setLoading] = useState(false);
 const [startDate, setStartDate] = useState('');
 const [endDate, setEndDate] = useState('');
 const [downloading, setDownloading] = useState(false);

 const fetchReport = async (type) => {
 try {
 setLoading(true);
 const params = { type };
 if (startDate) params.startDate = startDate;
 if (endDate) params.endDate = endDate;
 const res = await api.get('/admin/reports', { params });
 setReportData(res.data.data);
 } catch (err) {
 console.error('Failed to fetch report:', err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchReport(activeReport);
 }, [activeReport]);

 const handleFilter = () => fetchReport(activeReport);

 const handleClearDates = () => {
 setStartDate('');
 setEndDate('');
 fetchReport(activeReport);
 };

 const handleDownload = async () => {
 try {
 setDownloading(true);
 const params = { type: activeReport };
 if (startDate) params.startDate = startDate;
 if (endDate) params.endDate = endDate;
 const res = await api.get('/admin/reports/download', {
 params,
 responseType: 'blob',
 });
 const url = window.URL.createObjectURL(new Blob([res.data]));
 const link = document.createElement('a');
 link.href = url;
 link.setAttribute('download', `${activeReport}_report.csv`);
 document.body.appendChild(link);
 link.click();
 link.remove();
 window.URL.revokeObjectURL(url);
 } catch (err) {
 console.error('Download failed:', err);
 alert('Failed to download report');
 } finally {
 setDownloading(false);
 }
 };

 const handleTabClick = (id) => {
 if (activeReport === id) return;
 setReportData(null);
 setLoading(true);
 setActiveReport(id);
 };

 return (
 <div className="max-w-7xl mx-auto">
 {/* Header */}
 <div className="mb-8">
 <h1 className="text-3xl font-bold text-gray-900 mb-1">Reports & Analytics</h1>
 <p className="text-gray-500">Generate comprehensive reports and download data for analysis.</p>
 </div>

 {/* Report Type Pills */}
 <div className="flex flex-wrap gap-2 mb-6">
 {REPORT_TYPES.map(rt => (
 <button key={rt.id} onClick={() => handleTabClick(rt.id)}
 className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
  activeReport === rt.id
  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/25'
  : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:shadow-sm'
 }`}>
 <span>{rt.icon}</span>
 {rt.label}
 </button>
 ))}
 </div>

 {/* Date Filter & Download Bar */}
 <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6 flex flex-col sm:flex-row items-center gap-4">
 <div className="flex items-center gap-2 flex-1">
 <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
 <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
 className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
 <span className="text-gray-400 text-sm">to</span>
 <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
 className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
 <button onClick={handleFilter}
 className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
 Apply
 </button>
 {(startDate || endDate) && (
 <button onClick={handleClearDates} className="text-sm text-gray-500 hover:text-gray-700 underline">Clear</button>
 )}
 </div>
 <button onClick={handleDownload} disabled={downloading || loading}
 className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
 {downloading ? 'Downloading...' : 'Download CSV'}
 </button>
 </div>

 {/* Report Content */}
 {loading ? (
 <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
 <p className="text-gray-500 text-sm">Generating report...</p>
 </div>
 ) : (
 <div>
 {activeReport === 'summary' && reportData && <SummaryReport data={reportData} />}
 {activeReport === 'events' && reportData && <EventsReport data={reportData} />}
 {activeReport === 'registrations' && reportData && <RegistrationsReport data={reportData} />}
 {activeReport === 'revenue' && reportData && <RevenueReport data={reportData} />}
 {activeReport === 'students' && reportData && <StudentsReport data={reportData} />}
 {activeReport === 'faculty' && reportData && <FacultyReport data={reportData} />}
 {activeReport === 'activity' && reportData && <ActivityReport data={reportData} />}
 </div>
 )}
 </div>
 );
};

/* ══════════════════════════════════════════════════
   SUMMARY REPORT
   ══════════════════════════════════════════════════ */
const SummaryReport = ({ data }) => {
 const o = data.overview;
 const metrics = [
 { label: 'Total Events', value: o.totalEvents, color: 'indigo', icon: '🎪' },
 { label: 'Approved Events', value: o.approvedEvents, color: 'emerald', icon: '✅' },
 { label: 'Pending Events', value: o.pendingEvents, color: 'amber', icon: '⏳' },
 { label: 'Total Students', value: o.totalStudents, color: 'blue', icon: '🎓' },
 { label: 'Total Faculty', value: o.totalFaculty, color: 'purple', icon: '👨‍🏫' },
 { label: 'Total Registrations', value: o.totalRegistrations, color: 'pink', icon: '📝' },
 { label: 'Total Revenue', value: `₹${o.totalRevenue?.toLocaleString() || 0}`, color: 'green', icon: '💰' },
 { label: 'Paid Registrations', value: o.paidRegistrations, color: 'teal', icon: '✓' },
 ];

 const colorMap = {
 indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
 emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
 amber: 'bg-amber-50 border-amber-200 text-amber-700',
 blue: 'bg-blue-50 border-blue-200 text-blue-700',
 purple: 'bg-purple-50 border-purple-200 text-purple-700',
 pink: 'bg-pink-50 border-pink-200 text-pink-700',
 green: 'bg-green-50 border-green-200 text-green-700',
 teal: 'bg-teal-50 border-teal-200 text-teal-700',
 };

 return (
 <div className="space-y-6">
 {/* Metric Cards */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
 {metrics.map(m => (
 <div key={m.label} className={`rounded-xl border p-5 shadow-sm ${colorMap[m.color]}`}>
 <div className="flex items-center justify-between mb-2">
 <span className="text-2xl">{m.icon}</span>
 </div>
 <p className="text-2xl font-bold">{m.value}</p>
 <p className="text-xs font-medium opacity-75 mt-1">{m.label}</p>
 </div>
 ))}
 </div>

 {/* Category Breakdown + Recent Activity */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
 <h3 className="font-bold text-gray-900 mb-4">Events by Category</h3>
 {data.categoryBreakdown?.length > 0 ? (
 <div className="space-y-3">
 {data.categoryBreakdown.map(cat => {
 const total = data.categoryBreakdown.reduce((s, c) => s + c.count, 0);
 const pct = total > 0 ? ((cat.count / total) * 100).toFixed(0) : 0;
 return (
 <div key={cat._id || 'other'}>
 <div className="flex justify-between text-sm mb-1">
 <span className="text-gray-700 font-medium capitalize">{cat._id || 'Other'}</span>
 <span className="text-gray-500">{cat.count} ({pct}%)</span>
 </div>
 <div className="w-full bg-gray-100 rounded-full h-2.5">
 <div className="bg-indigo-500 h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
 </div>
 </div>
 );
 })}
 </div>
 ) : <p className="text-sm text-gray-400 italic">No event data yet.</p>}
 </div>

 <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
 <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
 {data.recentActivity?.length > 0 ? (
 <div className="space-y-3">
 {data.recentActivity.map((log, i) => (
 <div key={log._id || i} className="flex gap-3 items-start">
 <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
  log.action === 'registered' ? 'bg-indigo-500' :
  log.action === 'approved' ? 'bg-emerald-500' :
  log.action === 'rejected' ? 'bg-red-500' :
  log.action === 'payment_completed' ? 'bg-green-500' :
  'bg-gray-400'
 }`}></div>
 <div className="min-w-0">
 <p className="text-sm text-gray-800 truncate">{log.details || log.action}</p>
 <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</p>
 </div>
 </div>
 ))}
 </div>
 ) : <p className="text-sm text-gray-400 italic">No activity yet.</p>}
 </div>
 </div>
 </div>
 );
};

/* ══════════════════════════════════════════════════
   EVENTS REPORT
   ══════════════════════════════════════════════════ */
const EventsReport = ({ data }) => {
 if (!data || data.length === 0) return <EmptyState label="events" />;
 return (
 <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 <table className="min-w-full divide-y divide-gray-200">
 <thead className="bg-gray-50">
 <tr>
 {['Event', 'Category', 'Date', 'Status', 'Fee', 'Registrations', 'Revenue', 'Created By'].map(h => (
 <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {data.map(e => (
 <tr key={e._id} className="hover:bg-gray-50 transition-colors">
 <td className="px-5 py-3 text-sm font-semibold text-gray-900">{e.title}</td>
 <td className="px-5 py-3"><span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium capitalize">{e.category || 'N/A'}</span></td>
 <td className="px-5 py-3 text-sm text-gray-600">{new Date(e.date).toLocaleDateString()}</td>
 <td className="px-5 py-3"><StatusBadge status={e.status} /></td>
 <td className="px-5 py-3 text-sm font-medium text-gray-900">{e.fee > 0 ? `₹${e.fee}` : 'Free'}</td>
 <td className="px-5 py-3 text-sm text-gray-700 font-medium">{e.registrations}</td>
 <td className="px-5 py-3 text-sm font-bold text-green-700">₹{e.revenue}</td>
 <td className="px-5 py-3 text-sm text-gray-600">{e.createdBy}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <div className="px-5 py-3 bg-gray-50 border-t text-xs text-gray-500">
 Showing {data.length} event(s) • Total Revenue: ₹{data.reduce((s, e) => s + (e.revenue || 0), 0).toLocaleString()}
 </div>
 </div>
 );
};

/* ══════════════════════════════════════════════════
   REGISTRATIONS REPORT
   ══════════════════════════════════════════════════ */
const RegistrationsReport = ({ data }) => {
 if (!data || data.length === 0) return <EmptyState label="registrations" />;
 return (
 <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 <table className="min-w-full divide-y divide-gray-200">
 <thead className="bg-gray-50">
 <tr>
 {['Student', 'Email', 'Event', 'Amount', 'Payment', 'Method', 'TXN ID', 'Date'].map(h => (
 <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {data.map(r => (
 <tr key={r._id} className="hover:bg-gray-50 transition-colors">
 <td className="px-5 py-3 text-sm font-semibold text-gray-900">{r.studentName}</td>
 <td className="px-5 py-3 text-sm text-gray-600">{r.email}</td>
 <td className="px-5 py-3 text-sm text-gray-700">{r.eventId?.title || 'N/A'}</td>
 <td className="px-5 py-3 text-sm font-medium">₹{r.amount}</td>
 <td className="px-5 py-3"><StatusBadge status={r.paymentStatus} /></td>
 <td className="px-5 py-3 text-sm text-gray-600 capitalize">{r.paymentMethod || '—'}</td>
 <td className="px-5 py-3 text-xs font-mono text-gray-500">{r.transactionId || '—'}</td>
 <td className="px-5 py-3 text-sm text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <div className="px-5 py-3 bg-gray-50 border-t text-xs text-gray-500">
 Showing {data.length} registration(s)
 </div>
 </div>
 );
};

/* ══════════════════════════════════════════════════
   REVENUE REPORT
   ══════════════════════════════════════════════════ */
const RevenueReport = ({ data }) => {
 if (!data) return <EmptyState label="revenue data" />;
 return (
 <div className="space-y-6">
 {/* Revenue Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
 <MetricCard icon="💰" label="Total Revenue" value={`₹${data.totalRevenue?.toLocaleString() || 0}`} color="green" />
 <MetricCard icon="✅" label="Paid Registrations" value={data.totalPaid || 0} color="emerald" />
 <MetricCard icon="⏳" label="Pending Amount" value={`₹${data.pendingAmount?.toLocaleString() || 0}`} color="amber" />
 <MetricCard icon="📝" label="Pending Payments" value={data.pendingCount || 0} color="red" />
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Payment Method Breakdown */}
 <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
 <h3 className="font-bold text-gray-900 mb-4">Payment Methods</h3>
 {data.methodBreakdown?.length > 0 ? (
 <div className="space-y-4">
 {data.methodBreakdown.map(m => (
 <div key={m._id || 'unknown'} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
 <div className="flex items-center gap-3">
 <span className="text-lg">{m._id === 'card' ? '💳' : m._id === 'upi' ? '📱' : '❓'}</span>
 <span className="font-medium text-gray-800 capitalize">{m._id || 'Unknown'}</span>
 </div>
 <div className="text-right">
 <p className="text-sm font-bold text-gray-900">₹{m.total.toLocaleString()}</p>
 <p className="text-xs text-gray-500">{m.count} payments</p>
 </div>
 </div>
 ))}
 </div>
 ) : <p className="text-sm text-gray-400 italic">No payment data yet.</p>}
 </div>

 {/* Top Revenue Events */}
 <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
 <h3 className="font-bold text-gray-900 mb-4">Top Revenue Events</h3>
 {data.topEvents?.length > 0 ? (
 <div className="space-y-3">
 {data.topEvents.map((e, i) => (
 <div key={e._id || i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
 <span className={`w-7 h-7 flex items-center justify-center rounded-full text-white text-xs font-bold ${
  i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-orange-400'
 }`}>{i + 1}</span>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-gray-900 truncate">{e.eventTitle || 'Untitled'}</p>
 <p className="text-xs text-gray-500">{e.count} registrations</p>
 </div>
 <p className="text-sm font-bold text-green-700">₹{e.total.toLocaleString()}</p>
 </div>
 ))}
 </div>
 ) : <p className="text-sm text-gray-400 italic">No revenue data yet.</p>}
 </div>
 </div>

 {/* Monthly Revenue */}
 {data.monthlyRevenue?.length > 0 && (
 <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
 <h3 className="font-bold text-gray-900 mb-4">Monthly Revenue</h3>
 <div className="overflow-x-auto">
 <div className="flex items-end gap-3 min-h-[160px]">
 {data.monthlyRevenue.map(m => {
 const maxVal = Math.max(...data.monthlyRevenue.map(d => d.total));
 const h = maxVal > 0 ? (m.total / maxVal) * 140 : 10;
 return (
 <div key={m._id} className="flex flex-col items-center flex-1 min-w-[60px]">
 <p className="text-xs font-bold text-gray-900 mb-1">₹{m.total.toLocaleString()}</p>
 <div className="w-full bg-indigo-500 rounded-t-lg transition-all" style={{ height: `${h}px` }}></div>
 <p className="text-[10px] text-gray-500 mt-2 font-medium">{m._id}</p>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

/* ══════════════════════════════════════════════════
   STUDENTS REPORT
   ══════════════════════════════════════════════════ */
const StudentsReport = ({ data }) => {
 if (!data || data.length === 0) return <EmptyState label="students" />;
 return (
 <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 <table className="min-w-full divide-y divide-gray-200">
 <thead className="bg-gray-50">
 <tr>
 {['Name', 'Email', 'Phone', 'College', 'Enrollment #', 'Events', 'Spent', 'Joined'].map(h => (
 <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {data.map(s => (
 <tr key={s._id} className="hover:bg-gray-50 transition-colors">
 <td className="px-5 py-3 text-sm font-semibold text-gray-900">{s.name}</td>
 <td className="px-5 py-3 text-sm text-gray-600">{s.email}</td>
 <td className="px-5 py-3 text-sm text-gray-600">{s.phone || '—'}</td>
 <td className="px-5 py-3 text-sm text-gray-600">{s.collegeName || '—'}</td>
 <td className="px-5 py-3 text-xs font-mono text-gray-500">{s.enrollmentNumber || '—'}</td>
 <td className="px-5 py-3 text-sm font-medium text-indigo-700">{s.eventsRegistered}</td>
 <td className="px-5 py-3 text-sm font-bold text-green-700">₹{s.totalSpent}</td>
 <td className="px-5 py-3 text-sm text-gray-500">{new Date(s.joinedOn).toLocaleDateString()}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <div className="px-5 py-3 bg-gray-50 border-t text-xs text-gray-500">
 Showing {data.length} student(s)
 </div>
 </div>
 );
};

/* ══════════════════════════════════════════════════
   FACULTY REPORT
   ══════════════════════════════════════════════════ */
const FacultyReport = ({ data }) => {
 if (!data || data.length === 0) return <EmptyState label="faculty" />;
 return (
 <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 <table className="min-w-full divide-y divide-gray-200">
 <thead className="bg-gray-50">
 <tr>
 {['Name', 'Email', 'Phone', 'Department', 'Designation', 'Events Assigned', 'Joined'].map(h => (
 <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {data.map(f => (
 <tr key={f._id} className="hover:bg-gray-50 transition-colors">
 <td className="px-5 py-3 text-sm font-semibold text-gray-900">{f.name}</td>
 <td className="px-5 py-3 text-sm text-gray-600">{f.email}</td>
 <td className="px-5 py-3 text-sm text-gray-600">{f.phone || '—'}</td>
 <td className="px-5 py-3 text-sm text-gray-600">{f.department || '—'}</td>
 <td className="px-5 py-3 text-sm text-gray-600">{f.designation || '—'}</td>
 <td className="px-5 py-3 text-sm font-medium text-indigo-700">{f.eventsAssigned}</td>
 <td className="px-5 py-3 text-sm text-gray-500">{new Date(f.joinedOn).toLocaleDateString()}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <div className="px-5 py-3 bg-gray-50 border-t text-xs text-gray-500">
 Showing {data.length} faculty member(s)
 </div>
 </div>
 );
};

/* ══════════════════════════════════════════════════
   ACTIVITY LOG REPORT
   ══════════════════════════════════════════════════ */
const ActivityReport = ({ data }) => {
 if (!data || data.length === 0) return <EmptyState label="activity logs" />;

 const actionColors = {
 created: 'bg-blue-100 text-blue-800',
 approved: 'bg-green-100 text-green-800',
 rejected: 'bg-red-100 text-red-800',
 registered: 'bg-indigo-100 text-indigo-800',
 payment_completed: 'bg-emerald-100 text-emerald-800',
 registration_cancelled: 'bg-orange-100 text-orange-800',
 archived: 'bg-gray-100 text-gray-800',
 attendance_marked: 'bg-teal-100 text-teal-800',
 winners_added: 'bg-yellow-100 text-yellow-800',
 };

 return (
 <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 <table className="min-w-full divide-y divide-gray-200">
 <thead className="bg-gray-50">
 <tr>
 {['Action', 'Event', 'Performed By', 'Details', 'Timestamp'].map(h => (
 <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {data.map((log, i) => (
 <tr key={log._id || i} className="hover:bg-gray-50 transition-colors">
 <td className="px-5 py-3">
 <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}>
 {log.action?.replace(/_/g, ' ')}
 </span>
 </td>
 <td className="px-5 py-3 text-sm text-gray-700">{log.event?.title || '—'}</td>
 <td className="px-5 py-3 text-sm text-gray-600">{log.performedBy?.name || '—'}</td>
 <td className="px-5 py-3 text-sm text-gray-500 max-w-xs truncate">{log.details || '—'}</td>
 <td className="px-5 py-3 text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <div className="px-5 py-3 bg-gray-50 border-t text-xs text-gray-500">
 Showing {data.length} log(s)
 </div>
 </div>
 );
};

/* ══════════════════════════════════════════════════
   SHARED COMPONENTS
   ══════════════════════════════════════════════════ */
const StatusBadge = ({ status }) => {
 const colors = {
 approved: 'bg-green-100 text-green-800',
 pending: 'bg-yellow-100 text-yellow-800',
 rejected: 'bg-red-100 text-red-800',
 paid: 'bg-green-100 text-green-800',
 failed: 'bg-red-100 text-red-800',
 completed: 'bg-blue-100 text-blue-800',
 archived: 'bg-gray-100 text-gray-600',
 };
 return (
 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
 {status}
 </span>
 );
};

const MetricCard = ({ icon, label, value, color }) => {
 const colorMap = {
 green: 'bg-green-50 border-green-200 text-green-700',
 emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
 amber: 'bg-amber-50 border-amber-200 text-amber-700',
 red: 'bg-red-50 border-red-200 text-red-700',
 };
 return (
 <div className={`rounded-xl border p-5 shadow-sm ${colorMap[color]}`}>
 <span className="text-2xl">{icon}</span>
 <p className="text-2xl font-bold mt-2">{value}</p>
 <p className="text-xs font-medium opacity-75 mt-1">{label}</p>
 </div>
 );
};

const EmptyState = ({ label }) => (
 <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
 <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
 <p className="text-gray-400 font-medium">No {label} found for the selected period.</p>
 </div>
);

export default Reports;
