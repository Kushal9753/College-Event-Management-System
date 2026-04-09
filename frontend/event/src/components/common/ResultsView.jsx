import React, { useState, useEffect, useMemo } from 'react';
import resultService from '../../services/resultService';
import api from '../../services/api';

/* ───────────────────────── helpers ───────────────────────── */
const MEDAL = { '1st': '🥇', '2nd': '🥈', '3rd': '🥉' };

const POSITION_STYLES = {
  '1st': {
    row: 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20 border-l-4 border-l-amber-400',
    badge: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-500/30',
  },
  '2nd': {
    row: 'bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/30 dark:to-gray-900/20 border-l-4 border-l-slate-400',
    badge: 'bg-gradient-to-r from-slate-400 to-gray-400 text-white shadow-lg shadow-slate-400/30',
  },
  '3rd': {
    row: 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 border-l-4 border-l-orange-400',
    badge: 'bg-gradient-to-r from-orange-400 to-amber-600 text-white shadow-lg shadow-orange-500/30',
  },
};

const CATEGORY_COLORS = {
  hackathon: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  seminar: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  workshop: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  cultural: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  sports: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  technical: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

/**
 * ResultsView
 * -----------
 * Shared component used by both Admin and Faculty Results pages.
 *
 * Props:
 *  - role: 'admin' | 'faculty'
 *      admin  → fetches ALL results
 *      faculty → fetches all results then filters to assigned events
 */
const ResultsView = ({ role = 'admin' }) => {
  /* ── state ── */
  const [results, setResults] = useState([]);
  const [events, setEvents] = useState([]);        // for the event selector
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [toast, setToast] = useState(null);
  const [downloading, setDownloading] = useState({}); // { [eventId_format]: true }

  /* ── data fetching ── */
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [resultsRes, eventsRes] = await Promise.all([
        resultService.getAllResults(),
        role === 'faculty'
          ? api.get('/events/my-events').catch(() => ({ data: { data: [] } }))
          : api.get('/events').catch(() => ({ data: { data: [] } })),
      ]);

      const allResults = resultsRes?.data || [];
      const allEvents = eventsRes?.data?.data || eventsRes?.data || [];

      if (role === 'faculty') {
        // Only show results for events assigned to this faculty
        const myEventIds = new Set(allEvents.map((e) => e._id));
        setResults(allResults.filter((r) => myEventIds.has(r.eventId?._id || r.eventId)));
        setEvents(allEvents);
      } else {
        setResults(allResults);
        setEvents(allEvents);
      }
    } catch (err) {
      console.error('Failed to fetch results:', err);
      setToast({ type: 'error', text: err.message || 'Failed to load results' });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  /* ── handle download ── */
  const handleDownload = async (eventId, format, eventTitle) => {
    const downloadId = `${eventId}_${format}`;
    try {
      setDownloading(prev => ({ ...prev, [downloadId]: true }));
      
      const blob = await resultService.downloadResult(eventId, format);
      if (!blob) throw new Error('Download failed: No data received');

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${eventTitle.replace(/\s+/g, '_')}_Results.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setToast({ type: 'success', text: `${format.toUpperCase()} downloaded successfully!` });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Download error:', err);
      setToast({ type: 'error', text: err.message || 'Download failed' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setDownloading(prev => ({ ...prev, [downloadId]: false }));
    }
  };

  /* ── derived: unique categories from events that have results ── */
  const categories = useMemo(() => {
    const cats = new Set();
    results.forEach((r) => {
      const cat = r.eventId?.category;
      if (cat) cats.add(cat);
    });
    return [...cats].sort();
  }, [results]);

  /* ── derived: filtered results list ── */
  const filteredResults = useMemo(() => {
    let list = results;

    if (selectedEventId) {
      list = list.filter(
        (r) => (r.eventId?._id || r.eventId) === selectedEventId
      );
    }
    if (categoryFilter) {
      list = list.filter((r) => r.eventId?.category === categoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => {
        const eventMatch =
          r.eventName?.toLowerCase().includes(q) ||
          r.eventId?.title?.toLowerCase().includes(q);
        const winnerMatch = r.winners?.some(
          (w) =>
            w.name?.toLowerCase().includes(q) ||
            w.rollNumber?.toLowerCase().includes(q) ||
            w.branch?.toLowerCase().includes(q)
        );
        return eventMatch || winnerMatch;
      });
    }

    return list;
  }, [results, selectedEventId, categoryFilter, search]);

  /* ── currently selected result detail ── */
  const selectedResult = useMemo(() => {
    if (!selectedEventId) return null;
    return results.find(
      (r) => (r.eventId?._id || r.eventId) === selectedEventId
    );
  }, [results, selectedEventId]);

  /* ── stats ── */
  const stats = useMemo(
    () => ({
      totalResults: results.length,
      totalWinners: results.reduce((s, r) => s + (r.winners?.length || 0), 0),
      eventsWithResults: new Set(results.map((r) => r.eventId?._id || r.eventId))
        .size,
    }),
    [results]
  );

  /* ──────────────────────── render ──────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Loading results…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* ── Toast ── */}
      {toast && (
        <div
          className={`mb-6 px-4 py-3 rounded-xl flex items-center justify-between text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}
        >
          <span>{toast.text}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-4 opacity-60 hover:opacity-100"
          >
            &times;
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {role === 'faculty' ? 'My Event Results' : 'Event Results'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {role === 'faculty'
            ? 'View results for events assigned to you.'
            : 'View and manage results for all events.'}
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: 'Events with Results',
            value: stats.eventsWithResults,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ),
            color: 'from-indigo-500 to-blue-600',
          },
          {
            label: 'Total Results',
            value: stats.totalResults,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            ),
            color: 'from-emerald-500 to-green-600',
          },
          {
            label: 'Total Winners',
            value: stats.totalWinners,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            ),
            color: 'from-amber-500 to-orange-600',
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shrink-0`}
            >
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {s.value}
              </p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters Bar ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="results-search"
              type="text"
              placeholder="Search by event, student, roll number…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
            />
          </div>

          {/* Event Dropdown */}
          <select
            id="results-event-filter"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[200px]"
          >
            <option value="">All Events</option>
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.title}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          {categories.length > 0 && (
            <select
              id="results-category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[160px]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          )}

          {/* Clear Filters */}
          {(search || selectedEventId || categoryFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedEventId('');
                setCategoryFilter('');
              }}
              className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      {filteredResults.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-16 text-center">
          <svg
            className="mx-auto h-16 w-16 mb-4 text-gray-300 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
            />
          </svg>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            No results found
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {search || selectedEventId || categoryFilter
              ? 'Try adjusting your filters.'
              : 'Results will appear here once they are published.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredResults.map((result) => {
            const eventData = result.eventId || {};
            const eventTitle = eventData.title || result.eventName || 'Unknown Event';
            const eventDate = eventData.date
              ? new Date(eventData.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : '';
            const category = eventData.category || '';

            return (
              <div
                key={result._id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden group"
              >
                {/* ── Event Banner ── */}
                <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 relative overflow-hidden">
                  {/* Decorative circles */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full" />

                  <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        🏆 {eventTitle}
                      </h2>
                      <div className="flex items-center gap-3 mt-1.5">
                        {eventDate && (
                          <span className="text-xs font-medium text-white/70 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {eventDate}
                          </span>
                        )}
                        {category && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              CATEGORY_COLORS[category] || CATEGORY_COLORS.other
                            }`}
                          >
                            {category}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* ── Download Buttons ── */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleDownload(result.eventId?._id || result.eventId, 'pdf', eventTitle)}
                        disabled={downloading[`${result.eventId?._id || result.eventId}_pdf`]}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                      >
                        {downloading[`${result.eventId?._id || result.eventId}_pdf`] ? (
                          <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        )}
                        PDF
                      </button>
                      <button
                        onClick={() => handleDownload(result.eventId?._id || result.eventId, 'csv', eventTitle)}
                        disabled={downloading[`${result.eventId?._id || result.eventId}_csv`]}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                      >
                        {downloading[`${result.eventId?._id || result.eventId}_csv`] ? (
                          <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                        CSV
                      </button>
                      <div className="ml-2 text-white/60 text-[10px] font-bold uppercase tracking-widest hidden sm:block">
                        {result.winners?.length || 0} winners
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Winners Table ── */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Roll Number
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Branch
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Year
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Prize
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Score
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {(result.winners || [])
                        .sort((a, b) => {
                          const order = { '1st': 1, '2nd': 2, '3rd': 3 };
                          return (order[a.position] || 9) - (order[b.position] || 9);
                        })
                        .map((w, idx) => {
                          const ps = POSITION_STYLES[w.position] || {};
                          return (
                            <tr
                              key={idx}
                              className={`${
                                ps.row || ''
                              } hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}
                            >
                              {/* Position */}
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                                    ps.badge ||
                                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                  }`}
                                >
                                  <span className="text-base">
                                    {MEDAL[w.position] || ''}
                                  </span>
                                  {w.position}
                                </span>
                              </td>
                              {/* Student Name */}
                              <td className="px-6 py-4">
                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                  {w.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {w.email}
                                </div>
                              </td>
                              {/* Roll Number */}
                              <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {w.rollNumber}
                              </td>
                              {/* Branch */}
                              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                {w.branch}
                              </td>
                              {/* Year */}
                              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                {w.year}
                              </td>
                              {/* Prize */}
                              <td className="px-6 py-4">
                                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                  {w.prize}
                                </span>
                              </td>
                              {/* Score */}
                              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                {w.score || (
                                  <span className="text-gray-400 dark:text-gray-600">
                                    —
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* ── Footer ── */}
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                    Published{' '}
                    {result.createdAt
                      ? new Date(result.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                  </span>
                  {eventData.status && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        eventData.status === 'completed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {eventData.status}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResultsView;
