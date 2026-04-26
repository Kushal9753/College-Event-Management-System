import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  BarChart2, 
  Tent, 
  ClipboardSignature, 
  IndianRupee, 
  GraduationCap, 
  Users, 
  History,
  Download,
  X,
  PieChart,
  Clock,
  Inbox,
  BadgeCheck,
  Hourglass,
  Wallet,
  Users2
} from 'lucide-react';

const REPORT_TYPES = [
  { id: 'summary', label: 'Summary', icon: <BarChart2 size={18} />, desc: 'Platform overview with key metrics' },
  { id: 'events', label: 'Events', icon: <Tent size={18} />, desc: 'All events with registrations & revenue' },
  { id: 'registrations', label: 'Registrations', icon: <ClipboardSignature size={18} />, desc: 'Student registrations & payment status' },
  { id: 'revenue', label: 'Revenue', icon: <IndianRupee size={18} />, desc: 'Payment analytics & revenue breakdown' },
  { id: 'students', label: 'Students', icon: <GraduationCap size={18} />, desc: 'All registered students & activity' },
  { id: 'faculty', label: 'Faculty', icon: <Users size={18} />, desc: 'Faculty members & assignments' },
  { id: 'activity', label: 'Activity Log', icon: <History size={18} />, desc: 'System actions & audit trail' },
];

const Reports = () => {
  const [activeReport, setActiveReport] = useState('summary');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReport = async (type) => {
    try {
      setLoading(true);
      const params = { type };
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
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
  }, [activeReport, startDate, endDate]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const params = { type: activeReport };
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-400 mb-2">
            Reports & Analytics
          </h1>
          <p className="text-gray-500 font-medium tracking-wide">Generate comprehensive insights and explore data seamlessly.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          {/* Date Range Picker */}
          <div className="flex items-center gap-2 bg-white/60 backdrop-blur-xl border border-gray-100 rounded-full px-4 py-2.5 shadow-[0_2px_10px_rgb(0,0,0,0.03)]">
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
              className="bg-transparent border-none text-[13px] font-bold text-gray-700 cursor-pointer focus:outline-none" 
            />
            <span className="text-gray-400 font-bold text-[11px] uppercase tracking-widest px-1">to</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
              className="bg-transparent border-none text-[13px] font-bold text-gray-700 cursor-pointer focus:outline-none" 
            />
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); }} 
                className="ml-1 p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors" 
                title="Clear Dates"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            )}
          </div>

          <button onClick={handleDownload} disabled={downloading || loading}
            className="group relative flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full transition-all disabled:opacity-50 shadow-[0_8px_20px_rgb(37,99,235,0.25)] hover:shadow-[0_12px_25px_rgb(37,99,235,0.35)] overflow-hidden">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative z-10 flex items-center gap-2">
              <Download className="w-5 h-5 drop-shadow-sm" strokeWidth={2.5} />
              {downloading ? 'Processing...' : 'Export CSV'}
            </span>
          </button>
        </div>
      </div>

      {/* Report Type Pills */}
      <div className="flex flex-wrap gap-2 mb-10 p-1.5 bg-white/60 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] filter backdrop-saturate-150">
        {REPORT_TYPES.map(rt => (
          <button key={rt.id} onClick={() => handleTabClick(rt.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
              activeReport === rt.id
              ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgb(37,99,235,0.3)] scale-[1.02]'
              : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}>
            <span className={activeReport === rt.id ? 'opacity-100' : 'opacity-70 grayscale shrink-0'}>{rt.icon}</span>
            {rt.label}
          </button>
        ))}
      </div>

      {/* Report Content */}
      <div className="relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-3xl z-10 border border-gray-100/50">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute top-0 w-16 h-16 border-4 border-blue-100 rounded-full"></div>
              <div className="absolute top-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">Generating Report</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
    </div>
  );
};

/* ══════════════════════════════════════════════════
   SUMMARY REPORT
   ══════════════════════════════════════════════════ */
const SummaryReport = ({ data }) => {
  const o = data.overview;
  const metrics = [
    { label: 'Total Events', value: o.totalEvents, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', icon: <Tent size={24} /> },
    { label: 'Approved Events', value: o.approvedEvents, bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100', icon: <BadgeCheck size={24} /> },
    { label: 'Pending Events', value: o.pendingEvents, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', icon: <Hourglass size={24} /> },
    { label: 'Total Students', value: o.totalStudents, bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', icon: <GraduationCap size={24} /> },
    { label: 'Total Faculty', value: o.totalFaculty, bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-100', icon: <Users2 size={24} /> },
    { label: 'Total Registrations', value: o.totalRegistrations, bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', icon: <ClipboardSignature size={24} /> },
    { label: 'Total Revenue', value: `₹${o.totalRevenue?.toLocaleString() || 0}`, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', icon: <IndianRupee size={24} /> },
    { label: 'Paid Registrations', value: o.paidRegistrations, bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-100', icon: <Wallet size={24} /> },
  ];

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {metrics.map(m => (
          <div key={m.label} className={`group rounded-3xl border p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white relative overflow-hidden flex flex-col justify-between h-full`}>
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${m.bg} opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out`}></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className={`w-12 h-12 flex items-center justify-center rounded-2xl ${m.bg} ${m.border} border text-2xl shadow-sm`}>{m.icon}</span>
            </div>
            <div className="relative z-10">
              <p className={`text-3xl font-black mb-1 ${m.text} tracking-tight`}>{m.value}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Category Breakdown + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_5px_20px_rgb(0,0,0,0.03)] p-8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Events by Category</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <PieChart className="w-5 h-5" strokeWidth={2.5} />
            </div>
          </div>
          {data.categoryBreakdown?.length > 0 ? (
            <div className="space-y-5">
              {data.categoryBreakdown.map(cat => {
                const total = data.categoryBreakdown.reduce((s, c) => s + c.count, 0);
                const pct = total > 0 ? ((cat.count / total) * 100).toFixed(0) : 0;
                return (
                  <div key={cat._id || 'other'} className="group">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-800 font-bold capitalize tracking-wide">{cat._id || 'Other'}</span>
                      <span className="text-gray-500 font-medium bg-gray-50 px-2 py-0.5 rounded-md">{cat.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100/80 rounded-full h-3 overflow-hidden shadow-inner">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full transition-all duration-1000 ease-out group-hover:from-blue-600 group-hover:to-blue-500" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-sm text-gray-400 italic font-medium p-4 bg-gray-50 rounded-xl text-center">No event data yet.</p>}
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_5px_20px_rgb(0,0,0,0.03)] p-8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Recent Activity</h3>
             <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Clock className="w-5 h-5" strokeWidth={2.5} />
            </div>
          </div>
          {data.recentActivity?.length > 0 ? (
            <div className="space-y-1 pl-2">
              {data.recentActivity.map((log, i) => (
                <div key={log._id || i} className="relative flex gap-4 pl-6 py-3">
                  {/* Timeline Line */}
                  {i !== data.recentActivity.length - 1 && (
                    <div className="absolute left-[-5px] top-6 bottom-[-16px] w-[2px] bg-gray-100"></div>
                  )}
                  {/* Dot */}
                  <div className={`absolute left-[-11px] top-4 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                    log.action === 'registered' ? 'bg-blue-500' :
                    log.action === 'approved' ? 'bg-emerald-500' :
                    log.action === 'rejected' ? 'bg-red-500' :
                    log.action === 'payment_completed' ? 'bg-green-500' :
                    'bg-gray-400'
                  }`}></div>
                  <div className="min-w-0 flex-1 bg-gray-50/50 hover:bg-blue-50/30 p-3 rounded-2xl transition-colors">
                    <p className="text-sm font-semibold text-gray-800 tracking-tight">{log.details || log.action}</p>
                    <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 italic font-medium p-4 bg-gray-50 rounded-xl text-center">No activity yet.</p>}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   TABLE RENDERING FRAMEWORK
   ══════════════════════════════════════════════════ */
const ReportTable = ({ data, columns, title, emptyLabel, renderRow }) => {
  if (!data || data.length === 0) return <EmptyState label={emptyLabel} />;
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_5px_20px_rgb(0,0,0,0.03)] overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-lg font-extrabold text-gray-900">{title}</h3>
        <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-500 shadow-sm">
          {data.length} Records
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-white">
            <tr>
              {columns.map(h => (
                <th key={h} className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {data.map((row, i) => renderRow(row, i))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   REPORTS VARIANTS
   ══════════════════════════════════════════════════ */
const EventsReport = ({ data }) => (
  <ReportTable 
    data={data} 
    title="Event Archive" 
    emptyLabel="events"
    columns={['Event', 'Category', 'Date', 'Status', 'Fee', 'Registrations', 'Revenue', 'Created By']}
    renderRow={(e) => (
      <tr key={e._id} className="hover:bg-blue-50/30 transition-colors group">
        <td className="px-6 py-4 text-sm font-bold text-gray-800">{e.title}</td>
        <td className="px-6 py-4">
          <span className="px-3 py-1 bg-gray-50 border border-gray-100 text-gray-600 rounded-lg text-xs font-bold capitalize tracking-wide">{e.category || 'N/A'}</span>
        </td>
        <td className="px-6 py-4 text-sm font-medium text-gray-500">{new Date(e.date).toLocaleDateString()}</td>
        <td className="px-6 py-4"><StatusBadge status={e.status} /></td>
        <td className="px-6 py-4 text-sm font-bold text-gray-800">{e.fee > 0 ? `₹${e.fee}` : <span className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">Free</span>}</td>
        <td className="px-6 py-4 text-sm font-bold text-gray-600">{e.registrations}</td>
        <td className="px-6 py-4 text-sm font-black text-emerald-600">₹{e.revenue}</td>
        <td className="px-6 py-4 text-sm font-medium text-gray-500">{e.createdBy}</td>
      </tr>
    )}
  />
);

const RegistrationsReport = ({ data }) => (
  <ReportTable 
    data={data} 
    title="Student Registrations" 
    emptyLabel="registrations"
    columns={['Student', 'Email', 'Event', 'Amount', 'Payment', 'Method', 'TXN ID', 'Date']}
    renderRow={(r) => (
      <tr key={r._id} className="hover:bg-blue-50/30 transition-colors">
        <td className="px-6 py-4 text-sm font-bold text-gray-800">{r.studentName}</td>
        <td className="px-6 py-4 text-sm font-medium text-gray-500">{r.email}</td>
        <td className="px-6 py-4 text-sm font-semibold text-gray-700">{r.eventId?.title || 'N/A'}</td>
        <td className="px-6 py-4 text-sm font-black text-gray-800">₹{r.amount}</td>
        <td className="px-6 py-4"><StatusBadge status={r.paymentStatus} /></td>
        <td className="px-6 py-4 text-sm font-bold text-gray-500 capitalize">{r.paymentMethod || '—'}</td>
        <td className="px-6 py-4 text-xs font-mono font-medium text-gray-400 bg-gray-50 rounded-md px-2 py-1 mx-4 w-fit">{r.transactionId || '—'}</td>
        <td className="px-6 py-4 text-sm font-medium text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
      </tr>
    )}
  />
);

const RevenueReport = ({ data }) => {
  if (!data) return <EmptyState label="revenue data" />;
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <MetricCard icon={<IndianRupee size={32} />} label="Total Revenue" value={`₹${data.totalRevenue?.toLocaleString() || 0}`} color="emerald" />
        <MetricCard icon={<BadgeCheck size={32} />} label="Paid Registrations" value={data.totalPaid || 0} color="blue" />
        <MetricCard icon={<Hourglass size={32} />} label="Pending Amount" value={`₹${data.pendingAmount?.toLocaleString() || 0}`} color="amber" />
        <MetricCard icon={<ClipboardSignature size={32} />} label="Pending Payments" value={data.pendingCount || 0} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_5px_20px_rgb(0,0,0,0.03)] p-8">
          <h3 className="text-xl font-extrabold text-gray-900 mb-6 tracking-tight">Payment Methods</h3>
          {data.methodBreakdown?.length > 0 ? (
            <div className="space-y-4">
              {data.methodBreakdown.map(m => (
                <div key={m._id || 'unknown'} className="group flex items-center justify-between p-4 bg-gray-50/80 hover:bg-white rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 group-hover:scale-110 group-hover:text-blue-600 transition-all">
                      {m._id === 'card' ? <CreditCard strokeWidth={2} /> : m._id === 'upi' ? <IndianRupee strokeWidth={2} /> : <Wallet strokeWidth={2} />}
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 capitalize tracking-wide">{m._id || 'Unknown'}</span>
                      <p className="text-xs font-semibold text-gray-400 mt-1">{m.count} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-gray-900">₹{m.total.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 italic p-4 bg-gray-50 rounded-xl text-center">No payment data yet.</p>}
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_5px_20px_rgb(0,0,0,0.03)] p-8">
          <h3 className="text-xl font-extrabold text-gray-900 mb-6 tracking-tight">Top Revenue Events</h3>
          {data.topEvents?.length > 0 ? (
            <div className="space-y-4">
              {data.topEvents.map((e, i) => (
                <div key={e._id || i} className="group flex items-center gap-4 p-4 bg-gray-50/80 hover:bg-white rounded-2xl border border-gray-100 hover:border-yellow-100 hover:shadow-md transition-all">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-2xl text-white text-sm font-black shadow-sm ${
                    i === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                    i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' : 
                    'bg-gradient-to-br from-orange-300 to-orange-500'
                  }`}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{e.eventTitle || 'Untitled'}</p>
                    <p className="text-xs font-semibold text-gray-400 mt-0.5">{e.count} registrations</p>
                  </div>
                  <p className="text-base font-black text-emerald-600">₹{e.total.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 italic p-4 bg-gray-50 rounded-xl text-center">No revenue data yet.</p>}
        </div>
      </div>
    </div>
  );
};

const StudentsReport = ({ data }) => (
  <ReportTable 
    data={data} 
    title="Registered Students" 
    emptyLabel="students"
    columns={['Name', 'Email', 'College', 'Events', 'Spent', 'Joined']}
    renderRow={(s) => (
      <tr key={s._id} className="hover:bg-blue-50/30 transition-colors">
        <td className="px-6 py-4 text-sm font-bold text-gray-800">{s.name}</td>
        <td className="px-6 py-4 text-sm font-medium text-gray-500">{s.email}</td>
        <td className="px-6 py-4 text-sm font-medium text-gray-600">{s.collegeName || '—'}</td>
        <td className="px-6 py-4"><span className="px-3 py-1 bg-blue-50 text-blue-700 font-black rounded-lg text-xs">{s.eventsRegistered}</span></td>
        <td className="px-6 py-4 text-sm font-black text-emerald-600">₹{s.totalSpent}</td>
        <td className="px-6 py-4 text-sm font-medium text-gray-400">{new Date(s.joinedOn).toLocaleDateString()}</td>
      </tr>
    )}
  />
);

const FacultyReport = ({ data }) => (
  <ReportTable 
    data={data} 
    title="Faculty Directory" 
    emptyLabel="faculty"
    columns={['Name', 'Email', 'Department', 'Designation', 'Events', 'Joined']}
    renderRow={(f) => (
      <tr key={f._id} className="hover:bg-blue-50/30 transition-colors">
        <td className="px-6 py-4 text-sm font-bold text-gray-800">{f.name}</td>
        <td className="px-6 py-4 text-sm font-medium text-gray-500">{f.email}</td>
        <td className="px-6 py-4 text-sm font-medium text-gray-600">{f.department || '—'}</td>
        <td className="px-6 py-4 text-sm font-medium text-gray-500"><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{f.designation || '—'}</span></td>
        <td className="px-6 py-4"><span className="px-3 py-1 bg-blue-50 text-blue-700 font-black rounded-lg text-xs">{f.eventsAssigned}</span></td>
        <td className="px-6 py-4 text-sm font-medium text-gray-400">{new Date(f.joinedOn).toLocaleDateString()}</td>
      </tr>
    )}
  />
);

const ActivityReport = ({ data }) => (
  <ReportTable 
    data={data} 
    title="System Activity Audit" 
    emptyLabel="activity logs"
    columns={['Action', 'Event', 'Performed By', 'Details', 'Timestamp']}
    renderRow={(log, i) => (
      <tr key={log._id || i} className="hover:bg-blue-50/30 transition-colors">
        <td className="px-6 py-4">
          <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
            log.action === 'created' ? 'bg-blue-50 text-blue-700 border-blue-100' :
            log.action === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
            log.action === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
            log.action === 'registered' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
            log.action === 'payment_completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
            'bg-gray-50 text-gray-600 border-gray-200'
          }`}>
            {log.action?.replace(/_/g, ' ')}
          </span>
        </td>
        <td className="px-6 py-4 text-sm font-bold text-gray-700">{log.event?.title || '—'}</td>
        <td className="px-6 py-4 text-sm font-semibold text-gray-600">{log.performedBy?.name || '—'}</td>
        <td className="px-6 py-4 text-sm font-medium text-gray-500 max-w-xs truncate">{log.details || '—'}</td>
        <td className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">{new Date(log.createdAt).toLocaleString()}</td>
      </tr>
    )}
  />
);

/* ══════════════════════════════════════════════════
   SHARED UTILITIES
   ══════════════════════════════════════════════════ */
const StatusBadge = ({ status }) => {
  const styles = {
    approved: 'bg-green-50 text-green-700 border-green-100',
    pending: 'bg-amber-50 text-amber-700 border-amber-100',
    rejected: 'bg-red-50 text-red-700 border-red-100',
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    failed: 'bg-rose-50 text-rose-700 border-rose-100',
    completed: 'bg-blue-50 text-blue-700 border-blue-100',
    archived: 'bg-gray-50 text-gray-500 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-[11px] font-black uppercase tracking-widest ${styles[status?.toLowerCase()] || styles.archived}`}>
      {status}
    </span>
  );
};

const MetricCard = ({ icon, label, value, color }) => {
  const styles = {
    emerald: 'from-emerald-50 to-white border-emerald-100 text-emerald-700 icon-emerald-100',
    blue: 'from-blue-50 to-white border-blue-100 text-blue-700 icon-blue-100',
    amber: 'from-amber-50 to-white border-amber-100 text-amber-700 icon-amber-100',
    red: 'from-red-50 to-white border-red-100 text-red-700 icon-red-100',
  };
  const s = styles[color] || styles.blue;
  return (
    <div className={`rounded-3xl border p-6 bg-gradient-to-br ${s.split('icon-')[0]} shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}>
      <span className={`absolute -right-4 -bottom-4 text-7xl opacity-10 filter grayscale contrast-200 blur-[2px] flex items-center justify-center w-32 h-32`}>{icon}</span>
      <div className="relative z-10">
        <span className="text-3xl drop-shadow-sm mb-3 block">{icon}</span>
        <p className={`text-3xl font-black mb-1 tracking-tight ${s.split('text-')[1].split(' ')[0]}`}>{value}</p>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
};

const EmptyState = ({ label }) => (
  <div className="bg-white rounded-3xl border border-gray-200/60 p-16 flex flex-col items-center justify-center text-center shadow-sm">
    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
      <Inbox className="w-10 h-10 text-gray-300" strokeWidth={1.5} />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">No {label} available</h3>
    <p className="text-gray-500 max-w-sm">There is currently no data to display for the selected period. Check back later.</p>
  </div>
);

export default Reports;
