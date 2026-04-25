import React, { useState, useEffect, useMemo } from 'react';
import resultService from '../../services/resultService';

const MEDAL = { '1st': '🥇', '2nd': '🥈', '3rd': '🥉' };
const POSITION_STYLES = {
 '1st': { row: 'bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-l-amber-400', badge: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-500/30' },
 '2nd': { row: 'bg-gradient-to-r from-slate-50 to-gray-50 border-l-4 border-l-slate-400', badge: 'bg-gradient-to-r from-slate-400 to-gray-400 text-white shadow-lg shadow-slate-400/30' },
 '3rd': { row: 'bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-l-orange-400', badge: 'bg-gradient-to-r from-orange-400 to-amber-600 text-white shadow-lg shadow-orange-500/30' },
};

const MyResult = () => {
 const [results, setResults] = useState([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');

 useEffect(() => {
 const fetchResults = async () => {
 try {
 setLoading(true);
 const res = await resultService.getAllResults();
 setResults(res?.data || []);
 } catch (err) {
 console.error('Failed to fetch results:', err);
 } finally {
 setLoading(false);
 }
 };
 fetchResults();
 }, []);

 const filteredResults = useMemo(() => {
 if (!search.trim()) return results;
 const q = search.toLowerCase();
 return results.filter(r =>
 r.eventName?.toLowerCase().includes(q) ||
 r.eventId?.title?.toLowerCase().includes(q) ||
 r.winners?.some(w => w.name?.toLowerCase().includes(q) || w.rollNumber?.toLowerCase().includes(q))
 );
 }, [results, search]);

 if (loading) {
 return (
 <div className="flex items-center justify-center min-h-[400px]">
 <div className="flex flex-col items-center gap-4">
 <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
 <p className="text-sm text-gray-500 font-medium">Loading results…</p>
 </div>
 </div>
 );
 }

 return (
 <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
 {/* Header */}
 <div className="mb-8">
 <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600 mb-2">
 Event Results
 </h1>
 <p className="text-gray-600 text-lg">View winners and results for completed events.</p>
 </div>

 {/* Search */}
 <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
 <div className="relative">
 <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
 </svg>
 <input
 type="text"
 placeholder="Search by event name, winner, or roll number..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
 />
 </div>
 </div>

 {/* Results Content */}
 {filteredResults.length === 0 ? (
 <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center">
 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
 <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
 </svg>
 </div>
 <p className="text-lg font-semibold text-gray-700">No results yet</p>
 <p className="text-sm text-gray-500 mt-1">Results will appear here once they are published for completed events.</p>
 </div>
 ) : (
 <div className="space-y-6">
 {filteredResults.map((result) => {
 const eventData = result.eventId || {};
 const eventTitle = eventData.title || result.eventName || 'Unknown Event';
 const eventDate = eventData.date ? new Date(eventData.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
 const category = eventData.category || '';

 return (
 <div key={result._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
 {/* Event Header */}
 <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 relative overflow-hidden">
 <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
 <div className="relative">
 <h2 className="text-xl font-bold text-white flex items-center gap-2">🏆 {eventTitle}</h2>
 <div className="flex items-center gap-3 mt-1.5">
 {eventDate && (
 <span className="text-xs font-medium text-white/70 flex items-center gap-1">
 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
 {eventDate}
 </span>
 )}
 {category && (
 <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white">
 {category}
 </span>
 )}
 </div>
 </div>
 </div>

 {/* Winners Table */}
 <div className="overflow-x-auto">
 <table className="min-w-full divide-y divide-gray-200">
 <thead className="bg-gray-50">
 <tr>
 <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Position</th>
 <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
 <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Roll Number</th>
 <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Branch</th>
 <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Prize</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {(result.winners || [])
 .sort((a, b) => {
 const order = { '1st': 1, '2nd': 2, '3rd': 3 };
 return (order[a.position] || 9) - (order[b.position] || 9);
 })
 .map((w, idx) => {
 const ps = POSITION_STYLES[w.position] || {};
 return (
 <tr key={idx} className={`${ps.row || ''} hover:bg-gray-50 transition-colors`}>
 <td className="px-6 py-4">
 <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${ps.badge || 'bg-gray-100 text-gray-700'}`}>
 <span className="text-base">{MEDAL[w.position] || ''}</span>
 {w.position}
 </span>
 </td>
 <td className="px-6 py-4">
 <div className="text-sm font-bold text-gray-900">{w.name}</div>
 <div className="text-xs text-gray-500">{w.email}</div>
 </td>
 <td className="px-6 py-4 text-sm font-medium text-gray-700">{w.rollNumber}</td>
 <td className="px-6 py-4 text-sm text-gray-700">{w.branch} — {w.year}</td>
 <td className="px-6 py-4"><span className="text-sm font-semibold text-indigo-600">{w.prize}</span></td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>

 {/* Footer */}
 <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
 <span className="text-[11px] font-medium text-gray-400">
 Published {result.createdAt ? new Date(result.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
 </span>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
};

export default MyResult;
