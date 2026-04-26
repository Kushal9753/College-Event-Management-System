import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../services/api';
import {
  Users2, Search, Filter, Download, ChevronDown, ChevronUp,
  Calendar, CreditCard, CheckCircle2, XCircle, Clock, AlertCircle,
  Mail, Phone, Building2, Hash, ArrowUpDown, RefreshCw, UserCheck,
  Banknote, TrendingUp, Eye, X
} from 'lucide-react';

/* ──────────────── helpers ──────────────── */
const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

const paymentBadge = (status) => {
  const map = {
    paid:    { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Paid' },
    pending: { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500',   label: 'Pending' },
    failed:  { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    dot: 'bg-rose-500',    label: 'Failed' },
  };
  return map[status] || map.pending;
};

/* ──────────────── COMPONENT ──────────────── */
const Participants = () => {
  /* ── state ── */
  const [events, setEvents]           = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('all');
  const [participantsMap, setParticipantsMap] = useState({});   // eventId → { eventName, participants[] }
  const [loading, setLoading]         = useState(true);
  const [loadingParts, setLoadingParts] = useState(false);
  const [error, setError]             = useState(null);

  // filters
  const [searchQuery, setSearchQuery]       = useState('');
  const [paymentFilter, setPaymentFilter]   = useState('all');
  const [sortField, setSortField]           = useState('name');
  const [sortOrder, setSortOrder]           = useState('asc');
  const [showFilters, setShowFilters]       = useState(false);
  const [detailRow, setDetailRow]           = useState(null);

  /* ── fetch events ── */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get('/events/assigned');
        const evts = res.data.data || [];
        setEvents(evts);

        // Fetch participants for all events in parallel
        if (evts.length > 0) {
          setLoadingParts(true);
          const results = await Promise.allSettled(
            evts.map(e => api.get(`/events/${e._id}/participants`))
          );
          const map = {};
          results.forEach((r, i) => {
            if (r.status === 'fulfilled') {
              const d = r.value.data.data;
              map[evts[i]._id] = {
                eventName: d.eventName || evts[i].title,
                eventDate: evts[i].date,
                eventCategory: evts[i].category,
                eventStatus: evts[i].status,
                totalRegistered: d.totalRegistered,
                maxParticipants: d.maxParticipants,
                participants: d.participants || [],
              };
            }
          });
          setParticipantsMap(map);
          setLoadingParts(false);
        }
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── refresh ── */
  const refresh = useCallback(async () => {
    try {
      setLoadingParts(true);
      const eventIds = selectedEventId === 'all' ? events.map(e => e._id) : [selectedEventId];
      const results = await Promise.allSettled(
        eventIds.map(id => api.get(`/events/${id}/participants`))
      );
      const newMap = { ...participantsMap };
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          const d = r.value.data.data;
          const evt = events.find(e => e._id === eventIds[i]);
          newMap[eventIds[i]] = {
            eventName: d.eventName || evt?.title,
            eventDate: evt?.date,
            eventCategory: evt?.category,
            eventStatus: evt?.status,
            totalRegistered: d.totalRegistered,
            maxParticipants: d.maxParticipants,
            participants: d.participants || [],
          };
        }
      });
      setParticipantsMap(newMap);
    } catch {} finally {
      setLoadingParts(false);
    }
  }, [events, selectedEventId, participantsMap]);

  /* ── build flat list with event metadata ── */
  const allParticipants = useMemo(() => {
    const list = [];
    const targetIds = selectedEventId === 'all'
      ? Object.keys(participantsMap)
      : [selectedEventId];
    targetIds.forEach(eid => {
      const data = participantsMap[eid];
      if (!data) return;
      data.participants.forEach(p => {
        list.push({
          ...p,
          eventId: eid,
          eventName: data.eventName,
          eventDate: data.eventDate,
          eventCategory: data.eventCategory,
          eventStatus: data.eventStatus,
        });
      });
    });
    return list;
  }, [participantsMap, selectedEventId]);

  /* ── filtered + sorted ── */
  const filteredParticipants = useMemo(() => {
    let arr = [...allParticipants];

    // search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      arr = arr.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.email || '').toLowerCase().includes(q) ||
        (p.phone || '').toLowerCase().includes(q) ||
        (p.enrollmentNumber || '').toLowerCase().includes(q) ||
        (p.collegeName || '').toLowerCase().includes(q) ||
        (p.eventName || '').toLowerCase().includes(q)
      );
    }

    // payment
    if (paymentFilter !== 'all') {
      arr = arr.filter(p => p.paymentStatus === paymentFilter);
    }

    // sort
    arr.sort((a, b) => {
      const valA = (a[sortField] || '').toString().toLowerCase();
      const valB = (b[sortField] || '').toString().toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return arr;
  }, [allParticipants, searchQuery, paymentFilter, sortField, sortOrder]);

  /* ── stats ── */
  const stats = useMemo(() => {
    const total = allParticipants.length;
    const paid  = allParticipants.filter(p => p.paymentStatus === 'paid').length;
    const pending = allParticipants.filter(p => p.paymentStatus === 'pending').length;
    const failed = allParticipants.filter(p => p.paymentStatus === 'failed').length;
    const uniqueColleges = new Set(allParticipants.map(p => p.collegeName).filter(Boolean)).size;
    return { total, paid, pending, failed, uniqueColleges };
  }, [allParticipants]);

  /* ── CSV export ── */
  const exportCSV = () => {
    if (filteredParticipants.length === 0) return;
    const headers = ['#', 'Name', 'Email', 'Phone', 'Enrollment No.', 'College', 'Event', 'Payment Status', 'Transaction ID'];
    const rows = filteredParticipants.map((p, i) => [
      i + 1, p.name || '', p.email || '', p.phone || '', p.enrollmentNumber || '',
      p.collegeName || '', p.eventName || '', p.paymentStatus || '', p.transactionId || ''
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const evtName = selectedEventId === 'all' ? 'All-Events' : (participantsMap[selectedEventId]?.eventName || 'Event');
    a.download = `Participants_${evtName}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── sort toggle ── */
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300" />;
    return sortOrder === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 text-indigo-600" />
      : <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />;
  };

  /* ──────── RENDER ──────── */

  /* loading */
  if (loading) {
    return (
      <div className="min-h-screen p-8 flex flex-col items-center justify-center space-y-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-t-4 border-b-4 border-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-r-4 border-l-4 border-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          <Users2 className="absolute inset-0 m-auto w-8 h-8 text-indigo-600 animate-pulse" />
        </div>
        <div className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
          Loading participants…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8 animate-fade-in font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* ━━━ HEADER ━━━ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-600 blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-2xl" />
              <div className="relative p-4 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-xl shadow-indigo-500/20 text-white transform group-hover:scale-105 transition-transform duration-300">
                <Users2 className="w-8 h-8" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Participants</h1>
              <p className="text-slate-500 font-medium mt-1">Manage & track all event participants</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={refresh} disabled={loadingParts}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-indigo-200 transition-all shadow-sm disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loadingParts ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button onClick={exportCSV} disabled={filteredParticipants.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* ━━━ ERROR ━━━ */}
        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 p-4 rounded-r-2xl flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-red-800 font-bold text-sm">Error Loading Data</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* ━━━ STAT CARDS ━━━ */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Participants', value: stats.total, icon: Users2, bgBlob: 'bg-indigo-500/5', gradient: 'from-indigo-500 to-blue-600', shadow: 'shadow-indigo-500/20' },
            { label: 'Payment Received', value: stats.paid, icon: CheckCircle2, bgBlob: 'bg-emerald-500/5', gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
            { label: 'Payment Pending', value: stats.pending, icon: Clock, bgBlob: 'bg-amber-500/5', gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20' },
            { label: 'Payment Failed', value: stats.failed, icon: XCircle, bgBlob: 'bg-rose-500/5', gradient: 'from-rose-500 to-red-600', shadow: 'shadow-rose-500/20' },
            { label: 'Colleges', value: stats.uniqueColleges, icon: Building2, bgBlob: 'bg-violet-500/5', gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/20' },
          ].map(({ label, value, icon: Icon, bgBlob, gradient, shadow }, i) => (
            <div key={i} className="group relative bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 ${bgBlob} rounded-full blur-2xl -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500`} />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{label}</p>
                  <p className="text-3xl font-black text-slate-900">{value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg ${shadow}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ━━━ FILTERS BAR ━━━ */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full lg:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, enrollment, college…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>

            {/* Event selector */}
            <div className="relative w-full lg:w-64">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={selectedEventId}
                onChange={e => setSelectedEventId(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all cursor-pointer"
              >
                <option value="all">All Events ({events.length})</option>
                {events.map(e => (
                  <option key={e._id} value={e._id}>
                    {e.title} ({participantsMap[e._id]?.totalRegistered || 0})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Payment filter */}
            <div className="relative w-full lg:w-48">
              <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={paymentFilter}
                onChange={e => setPaymentFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all cursor-pointer"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Result count */}
            <div className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-semibold text-sm whitespace-nowrap">
              <TrendingUp className="w-4 h-4" />
              {filteredParticipants.length} result{filteredParticipants.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* ━━━ TABLE ━━━ */}
        {events.length === 0 ? (
          <div className="relative bg-white rounded-[2rem] border border-slate-100 p-16 text-center shadow-2xl shadow-slate-200/50 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 w-24 h-24 bg-white shadow-xl shadow-slate-200/50 rounded-full flex items-center justify-center mx-auto mb-8 transform group-hover:-translate-y-2 transition-transform duration-500">
              <Users2 className="w-12 h-12 text-indigo-500" />
            </div>
            <h3 className="relative z-10 text-2xl font-black text-slate-900 mb-3 tracking-tight">No Events Assigned</h3>
            <p className="relative z-10 text-slate-500 max-w-md mx-auto text-lg font-medium">
              You don't have any events assigned yet. Once you're assigned to events, participants will appear here.
            </p>
          </div>
        ) : filteredParticipants.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Participants Found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              {searchQuery || paymentFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No students have registered for the selected event(s) yet.'}
            </p>
            {(searchQuery || paymentFilter !== 'all') && (
              <button onClick={() => { setSearchQuery(''); setPaymentFilter('all'); }}
                className="mt-4 px-5 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* ── desktop table ── */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400 w-12">#</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400 cursor-pointer select-none hover:text-indigo-600 transition-colors"
                        onClick={() => toggleSort('name')}>
                      <span className="flex items-center gap-1.5">Student <SortIcon field="name" /></span>
                    </th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400 cursor-pointer select-none hover:text-indigo-600 transition-colors hidden md:table-cell"
                        onClick={() => toggleSort('email')}>
                      <span className="flex items-center gap-1.5">Email <SortIcon field="email" /></span>
                    </th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Phone</th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400 hidden xl:table-cell cursor-pointer select-none hover:text-indigo-600 transition-colors"
                        onClick={() => toggleSort('enrollmentNumber')}>
                      <span className="flex items-center gap-1.5">Enrollment <SortIcon field="enrollmentNumber" /></span>
                    </th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400 hidden xl:table-cell cursor-pointer select-none hover:text-indigo-600 transition-colors"
                        onClick={() => toggleSort('collegeName')}>
                      <span className="flex items-center gap-1.5">College <SortIcon field="collegeName" /></span>
                    </th>
                    {selectedEventId === 'all' && (
                      <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400 cursor-pointer select-none hover:text-indigo-600 transition-colors hidden md:table-cell"
                          onClick={() => toggleSort('eventName')}>
                        <span className="flex items-center gap-1.5">Event <SortIcon field="eventName" /></span>
                      </th>
                    )}
                    <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400 cursor-pointer select-none hover:text-indigo-600 transition-colors"
                        onClick={() => toggleSort('paymentStatus')}>
                      <span className="flex items-center gap-1.5">Payment <SortIcon field="paymentStatus" /></span>
                    </th>
                    <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400 w-16">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredParticipants.map((p, idx) => {
                    const badge = paymentBadge(p.paymentStatus);
                    const isExpanded = detailRow === (p.registrationId || idx);

                    return (
                      <React.Fragment key={p.registrationId || idx}>
                        <tr className={`group hover:bg-indigo-50/30 transition-colors duration-200 ${isExpanded ? 'bg-indigo-50/40' : ''}`}>
                          <td className="px-4 py-3.5 text-sm font-semibold text-slate-400">{idx + 1}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md shadow-indigo-500/20">
                                {(p.name || '?').charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate">{p.name || '—'}</p>
                                <p className="text-xs text-slate-400 md:hidden truncate">{p.email || ''}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-slate-600 hidden md:table-cell">
                            <span className="truncate block max-w-[200px]">{p.email || '—'}</span>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-slate-600 hidden lg:table-cell">{p.phone || '—'}</td>
                          <td className="px-4 py-3.5 text-sm text-slate-600 font-mono hidden xl:table-cell">{p.enrollmentNumber || '—'}</td>
                          <td className="px-4 py-3.5 text-sm text-slate-600 hidden xl:table-cell">
                            <span className="truncate block max-w-[160px]">{p.collegeName || '—'}</span>
                          </td>
                          {selectedEventId === 'all' && (
                            <td className="px-4 py-3.5 hidden md:table-cell">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold max-w-[160px] truncate">
                                <Calendar className="w-3 h-3 shrink-0" />
                                {p.eventName || '—'}
                              </span>
                            </td>
                          )}
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => setDetailRow(isExpanded ? null : (p.registrationId || idx))}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${isExpanded ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-100 text-slate-500 hover:bg-indigo-100 hover:text-indigo-600'}`}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>

                        {/* ── expanded detail row ── */}
                        {isExpanded && (
                          <tr className="bg-indigo-50/20">
                            <td colSpan={selectedEventId === 'all' ? 9 : 8} className="px-4 py-0">
                              <div className="py-4 px-4 animate-fade-in">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                  <DetailCard icon={Mail} label="Email" value={p.email} color="blue" />
                                  <DetailCard icon={Phone} label="Phone" value={p.phone} color="green" />
                                  <DetailCard icon={Hash} label="Enrollment No." value={p.enrollmentNumber} color="violet" />
                                  <DetailCard icon={Building2} label="College" value={p.collegeName} color="amber" />
                                  <DetailCard icon={Calendar} label="Event" value={p.eventName} color="indigo" />
                                  <DetailCard icon={Banknote} label="Transaction ID" value={p.transactionId || 'N/A'} color="emerald" />
                                  <DetailCard icon={CreditCard} label="Payment Status" value={p.paymentStatus?.toUpperCase()} color={p.paymentStatus === 'paid' ? 'emerald' : p.paymentStatus === 'pending' ? 'amber' : 'rose'} />
                                  <DetailCard icon={UserCheck} label="Registration ID" value={p.registrationId?.slice(-8) || '—'} color="slate" />
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── table footer ── */}
            <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-400 font-medium">
                Showing <span className="font-bold text-slate-600">{filteredParticipants.length}</span> of <span className="font-bold text-slate-600">{allParticipants.length}</span> participants
              </p>
              <p className="text-xs text-slate-400 font-medium">
                {events.length} event{events.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ──────── Detail Card sub-component ──────── */
const colorMap = {
  blue:    'bg-blue-50 text-blue-600',
  green:   'bg-green-50 text-green-600',
  violet:  'bg-violet-50 text-violet-600',
  amber:   'bg-amber-50 text-amber-600',
  indigo:  'bg-indigo-50 text-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  rose:    'bg-rose-50 text-rose-600',
  slate:   'bg-slate-50 text-slate-600',
};

const DetailCard = ({ icon: Icon, label, value, color = 'slate' }) => (
  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorMap[color] || colorMap.slate}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-800 truncate">{value || '—'}</p>
    </div>
  </div>
);

export default Participants;
