import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';

const TIME_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
];

const Scheduling = () => {
  const [schedules, setSchedules] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    facultyId: '',
    date: '',
    timeSlot: '',
    status: 'available',
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [availRes, facultyRes] = await Promise.all([
        api.get('/availability'),
        api.get('/faculty')
      ]);
      setSchedules(availRes.data.data);
      setFacultyList(facultyRes.data.data);
    } catch (error) {
      showToast('Failed to load schedules', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // First check conflict
      const conflictRes = await api.post('/availability/check-conflict', {
        facultyId: formData.facultyId,
        date: formData.date,
        timeSlot: formData.timeSlot
      });

      if (conflictRes.data.isConflict) {
        showToast('This slot is already booked for this faculty', 'error');
        setIsSubmitting(false);
        return;
      }

      await api.post('/availability', formData);
      showToast('Schedule created successfully!');
      setIsModalOpen(false);
      setFormData({ facultyId: '', date: '', timeSlot: '', status: 'available' });
      fetchData();
    } catch (error) {
      if (error.response && error.response.status === 409) {
        showToast('Slot already exists for this faculty', 'error');
      } else {
        showToast('Failed to save schedule', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Scheduling</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage faculty schedules, availability, and event assignments.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Schedule
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-rose-500 border-t-transparent rounded-full"></div>
        </div>
      ) : schedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-900/30 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-rose-600 dark:text-rose-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">No schedules created</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            Create schedules, set availability windows, and assign faculty to events.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Time Slot</th>
                <th className="px-6 py-4">Faculty</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {schedules.map((schedule) => (
                <tr key={schedule._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{schedule.date}</td>
                  <td className="px-6 py-4">{schedule.timeSlot}</td>
                  <td className="px-6 py-4">
                    {schedule.facultyId ? `${schedule.facultyId.name} (${schedule.facultyId.department})` : 'Unknown User'}
                  </td>
                  <td className="px-6 py-4 capitalize">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${schedule.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                      {schedule.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Schedule</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Faculty</label>
                <select
                  value={formData.facultyId}
                  onChange={(e) => setFormData({...formData, facultyId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-rose-500 outline-none"
                  required
                >
                  <option value="">-- Choose Faculty --</option>
                  {facultyList.map(f => (
                    <option key={f._id} value={f._id}>{f.name} ({f.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-rose-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Slot</label>
                <select
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({...formData, timeSlot: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-rose-500 outline-none"
                  required
                >
                  <option value="">-- Choose Slot --</option>
                  {TIME_SLOTS.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-rose-500 outline-none"
                >
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 flex items-center">
                  {isSubmitting ? 'Saving...' : 'Save Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Scheduling;
