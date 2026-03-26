import React, { useState, useRef, useEffect } from 'react';

import api from '../../services/api';

/* ─── SVG icon paths (Heroicons outline) ──────────────────────── */
const ICONS = {
  send:      'M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5',
  user:      'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
  broadcast: 'M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46',
  group:     'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
  chevDown:  'M19.5 8.25l-7.5 7.5-7.5-7.5',
  check:     'M4.5 12.75l6 6 9-13.5',
  x:         'M6 18L18 6M6 6l12 12',
  attach:    'M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13',
};

const Icon = ({ d, size = 20, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth={1.5} stroke="currentColor" width={size} height={size} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

/* ══════════════════════════════════════════════════════════════
   MessagingPanel
   ══════════════════════════════════════════════════════════════ */
const MessagingPanel = () => {
  /* ── form state ───────────────────────────────────────────── */
  const [messageType, setMessageType] = useState('individual'); // individual | broadcast | group
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('normal');           // low | normal | high
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [fetchError, setFetchError] = useState('');
  const [apiError, setApiError] = useState('');


  /* ── individual recipient ──────────────────────────────────── */
  const [recipientSearch, setRecipientSearch] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  /* ── group multi-select ────────────────────────────────────── */
  const [groupMembers, setGroupMembers] = useState([]);         // array of faculty objects
  const [groupSearch, setGroupSearch] = useState('');
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const groupDropdownRef = useRef(null);
  const bodyRef = useRef(null);

  /* fetch faculty from DB */
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await api.get('/faculty');
        setFacultyList(res.data.data);
      } catch (err) {

        console.error('Error fetching faculty:', err);
        setFetchError('Failed to load faculty list');
      }
    };
    fetchFaculty();
  }, []);

  /* close dropdowns on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
      if (groupDropdownRef.current && !groupDropdownRef.current.contains(e.target)) setShowGroupDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── helpers ───────────────────────────────────────────────── */
  const filteredFaculty = facultyList.filter(f =>
    f.name.toLowerCase().includes((messageType === 'group' ? groupSearch : recipientSearch).toLowerCase())
  );

  const toggleGroupMember = (faculty) => {
    setGroupMembers(prev =>
      prev.find(m => m._id === faculty._id)
        ? prev.filter(m => m._id !== faculty._id)
        : [...prev, faculty]
    );
  };

  const removeGroupMember = (id) =>
    setGroupMembers(prev => prev.filter(m => m._id !== id));

  const isValid =
    subject.trim() &&
    body.trim() &&
    (messageType === 'broadcast'
      ? true
      : messageType === 'individual'
        ? !!selectedRecipient
        : groupMembers.length >= 1);

  const handleSend = async () => {
    if (!isValid) return;
    setSending(true);
    setApiError('');

    try {
      const payload = {
        message: body,
        type: messageType,
        receivers: messageType === 'broadcast' 
          ? [] // backend logic for broadcast
          : messageType === 'individual'
            ? [selectedRecipient._id]
            : groupMembers.map(m => m._id)
      };

      await api.post('/messages/send', payload);
      
      setSending(false);
      setSent(true);

      // reset after flash
      setTimeout(() => {
        setSent(false);
        setSubject('');
        setBody('');
        setSelectedRecipient(null);
        setGroupMembers([]);
        setPriority('normal');
      }, 1800);
    } catch (err) {
      console.error('Error sending message:', err);
      setSending(false);
      setApiError('Failed to send message. Please try again.');
    }
  };

  /* ── type button helper ────────────────────────────────────── */
  const TypeBtn = ({ type, icon, label }) => (
    <button
      type="button"
      onClick={() => {
        setMessageType(type);
        setSelectedRecipient(null);
        setGroupMembers([]);
      }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        messageType === type
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      <Icon d={icon} size={18} />
      {label}
    </button>
  );

  /* ════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════ */
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* ── header ─────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 flex items-center justify-center">
          <Icon d={ICONS.send} size={18} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Compose Message</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Send messages to faculty, students, or broadcast to all</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* ── error display ────────────────────────────────────── */}
        {apiError && (
          <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
            {apiError}
          </div>
        )}

        {/* ── message type selector ────────────────────────────── */}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message Type</label>
          <div className="flex flex-wrap gap-2">
            <TypeBtn type="individual" icon={ICONS.user}      label="Individual" />
            <TypeBtn type="broadcast"  icon={ICONS.broadcast} label="Broadcast" />
            <TypeBtn type="group"      icon={ICONS.group}     label="Group" />
          </div>
        </div>

        {/* ── individual: single recipient ─────────────────────── */}
        {messageType === 'individual' && (
          <div ref={dropdownRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recipient</label>

            {selectedRecipient ? (
              <div className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                <span className="text-sm text-gray-900 dark:text-white font-medium">
                  {selectedRecipient.name}
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({selectedRecipient.department})</span>
                </span>
                <button type="button" onClick={() => setSelectedRecipient(null)}
                  className="text-gray-400 hover:text-red-500 transition-colors">
                  <Icon d={ICONS.x} size={16} />
                </button>
              </div>
            ) : (
              <input
                type="text"
                placeholder="Search faculty by name…"
                value={recipientSearch}
                onChange={(e) => { setRecipientSearch(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
                  border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            )}

            {showDropdown && !selectedRecipient && (
              <ul className="absolute z-30 mt-1 w-full max-h-48 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                {filteredFaculty.length ? filteredFaculty.map(f => (
                  <li key={f._id}
                    onClick={() => { setSelectedRecipient(f); setShowDropdown(false); setRecipientSearch(''); }}
                    className="px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                      {f.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{f.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{f.department}</p>
                    </div>
                  </li>
                )) : (
                  <li className="px-4 py-3 text-sm text-gray-400 text-center">No results found</li>
                )}
              </ul>
            )}
          </div>
        )}

        {/* ── broadcast: info banner ───────────────────────────── */}
        {messageType === 'broadcast' && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
            <Icon d={ICONS.broadcast} size={20} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Broadcast Message</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                This message will be sent to <strong>all faculty & students</strong> across every department.
              </p>
            </div>
          </div>
        )}

        {/* ── group: multi-select ──────────────────────────────── */}
        {messageType === 'group' && (
          <div ref={groupDropdownRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Faculty <span className="text-gray-400 font-normal">({groupMembers.length} selected)</span>
            </label>

            {/* selected chips */}
            {groupMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {groupMembers.map(m => (
                  <span key={m._id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                    {m.name}
                    <button type="button" onClick={() => removeGroupMember(m._id)}
                      className="hover:text-red-500 transition-colors">
                      <Icon d={ICONS.x} size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <input
              type="text"
              placeholder="Search and select faculty…"
              value={groupSearch}
              onChange={(e) => { setGroupSearch(e.target.value); setShowGroupDropdown(true); }}
              onFocus={() => setShowGroupDropdown(true)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
                border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />

            {showGroupDropdown && (
              <ul className="absolute z-30 mt-1 w-full max-h-48 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                {filteredFaculty.length ? filteredFaculty.map(f => {
                  const isSelected = groupMembers.some(m => m._id === f._id);
                  return (
                    <li key={f._id}
                      onClick={() => toggleGroupMember(f)}
                      className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors
                        ${isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                          {f.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{f.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{f.department}</p>
                        </div>
                      </div>
                      {isSelected && <Icon d={ICONS.check} size={16} className="text-blue-600 dark:text-blue-400" />}
                    </li>
                  );
                }) : (
                  <li className="px-4 py-3 text-sm text-gray-400 text-center">No results found</li>
                )}
              </ul>
            )}
          </div>
        )}

        {/* ── subject ──────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
          <input
            type="text"
            placeholder="Enter message subject…"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
              border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* ── body ─────────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
          <textarea
            ref={bodyRef}
            rows={5}
            placeholder="Write your message here…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-y
              border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{body.length} characters</p>
        </div>

        {/* ── priority ─────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
          <div className="flex gap-2">
            {[
              { value: 'low',    label: 'Low',    color: 'emerald' },
              { value: 'normal', label: 'Normal', color: 'blue'    },
              { value: 'high',   label: 'High',   color: 'red'     },
            ].map(p => (
              <button key={p.value} type="button"
                onClick={() => setPriority(p.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                  priority === p.value
                    ? p.color === 'emerald'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                      : p.color === 'blue'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── actions ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <button type="button"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Attach file">
            <Icon d={ICONS.attach} size={20} />
          </button>

          <button
            type="button"
            disabled={!isValid || sending}
            onClick={handleSend}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300
              ${sent
                ? 'bg-emerald-500 text-white'
                : isValid
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
          >
            {sending ? (
              <>
                <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending…
              </>
            ) : sent ? (
              <>
                <Icon d={ICONS.check} size={16} />
                Sent!
              </>
            ) : (
              <>
                <Icon d={ICONS.send} size={16} />
                Send Message
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagingPanel;
