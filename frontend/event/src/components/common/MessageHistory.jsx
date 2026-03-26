import React, { useState, useMemo } from 'react';

import api from '../../services/api';

/* ─── SVG icon helper ─────────────────────────────────────────── */
const Icon = ({ d, size = 18, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth={1.5} stroke="currentColor" width={size} height={size} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const ICONS = {
  search:    'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
  user:      'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0',
  broadcast: 'M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09',
  group:     'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72',
  eye:       'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  chevDown:  'M19.5 8.25l-7.5 7.5-7.5-7.5',
  clock:     'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
  filter:    'M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z',
};

/* ── tiny status / priority / type renderers ──────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    sent:      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    delivered: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    read:      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    failed:    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] || map.sent}`}>
      {status}
    </span>
  );
};

const PriorityDot = ({ priority }) => {
  const colors = { low: 'bg-emerald-400', normal: 'bg-blue-400', high: 'bg-red-400' };
  return (
    <span className={`w-2 h-2 rounded-full inline-block ${colors[priority] || colors.normal}`}
      title={`${priority} priority`} />
  );
};

const TypeIcon = ({ type }) => {
  const map = { individual: ICONS.user, broadcast: ICONS.broadcast, group: ICONS.group };
  const colors = {
    individual: 'text-blue-500 dark:text-blue-400',
    broadcast:  'text-amber-500 dark:text-amber-400',
    group:      'text-violet-500 dark:text-violet-400',
  };
  return <Icon d={map[type] || map.individual} size={16} className={colors[type]} />;
};

/* ── time formatter ───────────────────────────────────────────── */
const timeAgo = (dateStr) => {
  const now = new Date();
  const past = new Date(dateStr);
  const diff = Math.floor((now - past) / 1000);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return past.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

/* ══════════════════════════════════════════════════════════════
   MessageHistory
   ══════════════════════════════════════════════════════════════ */
const MessageHistory = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');  // all | individual | broadcast | group
  const [expandedId, setExpandedId] = useState(null);
  const [messagesList, setMessagesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* fetch messages from DB */
  React.useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get('/messages/history');
        // Transform backend data to fit component structure
        const formatted = res.data.data.map(m => ({
          ...m,
          subject: m.message.length > 50 ? m.message.substring(0, 47) + '...' : m.message,
          sentAt: m.createdAt,
          recipients: m.type === 'broadcast' ? 'All Users' : m.receivers.map(r => r.name).join(', '),
          totalCount: m.receivers.length || (m.type === 'broadcast' ? 200 : 0),
          readCount: 0, // Placeholder as backend doesnt track read yet
          status: 'delivered'
        }));
        setMessagesList(formatted);
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, []);

  /* derive filtered list */
  const messages = useMemo(() => {
    return messagesList.filter(m => {
      const matchesSearch = m.subject.toLowerCase().includes(search.toLowerCase()) ||
        m.recipients.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'all' || m.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [search, filterType, messagesList]);

  const stats = useMemo(() => ({
    total:      messagesList.length,
    broadcast:  messagesList.filter(m => m.type === 'broadcast').length,
    individual: messagesList.filter(m => m.type === 'individual').length,
    group:      messagesList.filter(m => m.type === 'group').length,
  }), [messagesList]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* ── header ─────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-violet-600/10 dark:bg-violet-500/20 flex items-center justify-center">
            <Icon d={ICONS.clock} size={18} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Message History</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stats.total} messages sent</p>
          </div>
        </div>

        {/* mini stat pills */}
        <div className="flex gap-2">
          {[
            { label: 'Broadcast',  count: stats.broadcast,  color: 'amber'  },
            { label: 'Individual', count: stats.individual, color: 'blue'   },
            { label: 'Group',      count: stats.group,      color: 'violet' },
          ].map(s => (
            <span key={s.label}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                bg-${s.color}-100 dark:bg-${s.color}-900/20 text-${s.color}-700 dark:text-${s.color}-300`}>
              {s.count}
              <span className="hidden sm:inline">{s.label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── search + filter bar ────────────────────────────────── */}
      <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Icon d={ICONS.search} size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
              border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-colors"
          />
        </div>
        <div className="flex gap-1.5">
          {['all', 'individual', 'broadcast', 'group'].map(t => (
            <button key={t} type="button"
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200 ${
                filterType === t
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── message table ──────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
              <th className="px-6 py-3 w-8"></th>
              <th className="px-3 py-3">Subject</th>
              <th className="px-3 py-3 hidden md:table-cell">Type</th>
              <th className="px-3 py-3 hidden lg:table-cell">Recipient(s)</th>
              <th className="px-3 py-3 hidden sm:table-cell">Status</th>
              <th className="px-3 py-3 text-right hidden sm:table-cell">Read</th>
              <th className="px-6 py-3 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {messages.length > 0 ? messages.map(m => (
              <React.Fragment key={m._id}>
                <tr
                  onClick={() => setExpandedId(expandedId === m._id ? null : m._id)}
                  className="group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-3.5">
                    <PriorityDot priority={m.priority} />
                  </td>
                  <td className="px-3 py-3.5">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[240px]">{m.subject}</p>
                    <p className="text-xs text-gray-400 mt-0.5 md:hidden capitalize">{m.type}</p>
                  </td>
                  <td className="px-3 py-3.5 hidden md:table-cell">
                    <span className="inline-flex items-center gap-1.5 text-xs capitalize text-gray-600 dark:text-gray-300">
                      <TypeIcon type={m.type} />
                      {m.type}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 hidden lg:table-cell">
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                      {m.recipients}
                    </p>
                  </td>
                  <td className="px-3 py-3.5 hidden sm:table-cell">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-3 py-3.5 text-right hidden sm:table-cell">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {m.readCount}/{m.totalCount}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {timeAgo(m.sentAt)}
                    </span>
                  </td>
                </tr>

                {/* ── expanded detail row ──────────────────────── */}
                {expandedId === m._id && (
                  <tr className="bg-gray-50 dark:bg-gray-800/30">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Type</p>
                          <span className="inline-flex items-center gap-1.5 capitalize text-gray-800 dark:text-gray-200">
                            <TypeIcon type={m.type} /> {m.type}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Priority</p>
                          <span className="inline-flex items-center gap-1.5 capitalize text-gray-800 dark:text-gray-200">
                            <PriorityDot priority={m.priority} /> {m.priority}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Delivery</p>
                          <p className="text-gray-800 dark:text-gray-200">{m.readCount} of {m.totalCount} read</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Sent At</p>
                          <p className="text-gray-800 dark:text-gray-200">
                            {new Date(m.sentAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Resend</button>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <button className="text-xs text-red-500 hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )) : (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <Icon d={ICONS.search} size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No messages match your search</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── footer ─────────────────────────────────────────────── */}
      <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          Showing {messages.length} of {messagesList.length} messages
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-40" disabled>
            Previous
          </button>
          <button className="px-3 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-40" disabled>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageHistory;
