import React, { useState, useMemo } from 'react';

import api from '../../services/api';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 9 }, (_, i) => i + 9); // 9 AM to 5 PM (17:00)

/* ─── Icons ───────────────────────────────────────────────────── */
const Icon = ({ d, size = 18, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth={1.5} stroke="currentColor" width={size} height={size} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const ICONS = {
  calendar: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  clock: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
  x: 'M6 18L18 6M6 6l12 12',
  check: 'M4.5 12.75l6 6 9-13.5',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
};

/* ══════════════════════════════════════════════════════════════
   CalendarView Component
   ══════════════════════════════════════════════════════════════ */
const CalendarView = () => {
  const [selectedSlot, setSelectedSlot] = useState(null); // { day, hour }
  const [newEventTitle, setNewEventTitle] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [eventsList, setEventsList] = useState([]);

  // Fetch real data
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [facRes, evRes] = await Promise.all([
          api.get('/faculty'),
          api.get('/events')
        ]);
        setFacultyList(facRes.data);
        
        // Transform events to match grid expectations (need numeric day, start/end hours)
        const transformedEvents = evRes.data.data.map(ev => {
          const startDate = new Date(ev.startDate);
          const endDate = new Date(ev.endDate);
          // Day 0 = Sunday, but our DAYS start with Mon (index 0). So map 1-6 to 0-5.
          let dayIndex = startDate.getDay() - 1;
          if (dayIndex === -1) dayIndex = 6; // Sunday -> Sat (adjust as needed)

          return {
            _id: ev._id,
            title: ev.title,
            day: dayIndex,
            startHour: startDate.getHours(),
            endHour: endDate.getHours() || (startDate.getHours() + 1),
            faculty: [ev.faculty?._id] // Assuming single faculty for now or adjust based on model
          };
        }).filter(e => e.day >= 0 && e.day < 6); // Only show Mon-Sat

        setEventsList(transformedEvents);
      } catch (err) {
        console.error('Error fetching calendar data:', err);
      }
    };
    fetchData();
  }, []);

  // Check which faculty are busy at the selected slot
  const slotConflicts = useMemo(() => {
    if (!selectedSlot) return [];
    const busy = new Set();
    eventsList.forEach(ev => {
      if (ev.day === selectedSlot.day && selectedSlot.hour >= ev.startHour && selectedSlot.hour < ev.endHour) {
        ev.faculty.forEach(fId => busy.add(fId));
      }
    });
    return Array.from(busy);
  }, [selectedSlot, eventsList]);

  const handleSlotClick = (dayIndex, hour) => {
    setSelectedSlot({ day: dayIndex, hour });
    setSelectedFaculty([]);
    setNewEventTitle('');
  };

  const toggleFaculty = (fId) => {
    setSelectedFaculty(prev => 
      prev.includes(fId) ? prev.filter(id => id !== fId) : [...prev, fId]
    );
  };

  const isFacultyBusy = (fId) => slotConflicts.includes(fId);
  const selectedConflicts = selectedFaculty.filter(fId => isFacultyBusy(fId));

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      
      {/* ── Calendar Grid (Left/Main) ────────────────────────────── */}
      <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/10 dark:bg-indigo-500/20 flex items-center justify-center">
              <Icon d={ICONS.calendar} size={18} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Schedule</h2>
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Week</div>
        </div>

        <div className="p-4 overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header Row (Days) */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <div className="w-16 shrink-0 border-r border-gray-200 dark:border-gray-700"></div>
              {DAYS.map(day => (
                <div key={day} className="flex-1 py-2 text-center text-sm font-bold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Time Rows */}
            <div className="relative">
              {HOURS.map(hour => (
                <div key={hour} className="flex border-b border-gray-100 dark:border-gray-800 group">
                  {/* Time Label */}
                  <div className="w-16 shrink-0 py-3 pr-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                    {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                  </div>
                  
                  {/* Day Slots */}
                  {DAYS.map((_, dayIndex) => {
                    // Find events overlapping this specific hour
                    const slotEvents = eventsList.filter(e => e.day === dayIndex && hour >= e.startHour && hour < e.endHour);
                    const isSelected = selectedSlot?.day === dayIndex && selectedSlot?.hour === hour;
                    
                    return (
                      <div 
                        key={`${dayIndex}-${hour}`}
                        onClick={() => handleSlotClick(dayIndex, hour)}
                        className={`flex-1 min-h-[60px] p-1 border-r border-gray-100 dark:border-gray-800 last:border-0 cursor-pointer transition-colors relative
                          ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-inset ring-indigo-500' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                      >
                        {slotEvents.map(e => (
                          <div key={e._id} className="mb-1 p-1.5 rounded bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 truncate font-semibold shadow-sm">
                            {e.title}
                          </div>
                        ))}
                        {isSelected && !slotEvents.length && (
                          <div className="absolute inset-0 flex items-center justify-center text-xs text-indigo-500 font-medium">
                            Book Slot
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Side Panel: Scheduling & Availability ────────────────── */}
      <div className="w-full xl:w-96 shrink-0">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sticky top-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Book Timeslot</h3>
          
          {!selectedSlot ? (
            <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              <Icon d={ICONS.clock} size={32} className="mx-auto text-gray-400 dark:text-gray-500 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Select a slot on the calendar to check faculty availability.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Selected Time Info */}
              <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg">
                <Icon d={ICONS.calendar} className="text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {DAYS[selectedSlot.day]}, {selectedSlot.hour > 12 ? `${selectedSlot.hour - 12} PM` : selectedSlot.hour === 12 ? '12 PM' : `${selectedSlot.hour} AM`}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">1 hour duration</p>
                </div>
              </div>

              {/* Event Details Form */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Title</label>
                <input
                  type="text"
                  placeholder="E.g., Project Review"
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white mb-4"
                />
              </div>

              {/* Faculty Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Faculty
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {facultyList.map(f => {
                    const isBusy = isFacultyBusy(f._id);
                    const isSelected = selectedFaculty.includes(f._id);
                    
                    return (
                      <div 
                        key={f._id}
                        onClick={() => toggleFaculty(f._id)}
                        className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors
                          ${isSelected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}
                          ${isBusy && !isSelected ? 'opacity-60' : ''}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                            ${isBusy ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'}
                          `}>
                            {f.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{f.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{isBusy ? 'Busy in another event' : 'Available'}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <Icon d={ICONS.check} className="text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Conflict Warnings */}
              {selectedConflicts.length > 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3 items-start">
                  <Icon d={ICONS.warning} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">Scheduling Conflict</p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {selectedConflicts.length} selected faculty member(s) are already booked for this timeslot.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button 
                type="button"
                disabled={!newEventTitle || selectedFaculty.length === 0}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 text-white font-medium rounded-lg transition-colors shadow-sm disabled:cursor-not-allowed"
              >
                Schedule Event
              </button>

            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default CalendarView;
