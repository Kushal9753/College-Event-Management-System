import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';

const Communication = () => {
  const [messages, setMessages] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Compose modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    type: 'announcement',
    receivers: [],
    message: ''
  });
  
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch both history and faculty list
      const [messagesRes, facultyRes] = await Promise.all([
        api.get('/messages/history'),
        api.get('/faculty')
      ]);
      setMessages(messagesRes.data.data);
      setFacultyList(facultyRes.data.data);
    } catch (error) {
      showToast('Failed to load data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) return showToast('Message cannot be empty', 'error');
    if (formData.receivers.length === 0) return showToast('Please select at least one recipient', 'error');
    
    setIsSending(true);
    try {
      await api.post('/messages/send', formData);
      showToast('Message sent successfully!');
      setIsModalOpen(false);
      setFormData({ type: 'announcement', receivers: [], message: '' });
      fetchData(); // Refresh history
    } catch (error) {
      showToast('Failed to send message', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const toggleRecipient = (id) => {
    setFormData(prev => ({
      ...prev,
      receivers: prev.receivers.includes(id) 
        ? prev.receivers.filter(r => r !== id)
        : [...prev.receivers, id]
    }));
  };

  const selectAllRecipients = () => {
    setFormData(prev => ({
      ...prev,
      receivers: facultyList.map(f => f._id)
    }));
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Communication</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Send announcements, messages, and notifications to faculty.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          Compose Message
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-violet-500 border-t-transparent rounded-full"></div>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 dark:bg-violet-900/30 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-violet-600 dark:text-violet-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">No messages yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            Broadcast announcements or send direct messages to faculty members.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4">Date Sent</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 w-1/2">Message Preview</th>
                <th className="px-6 py-4">Recipients</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {messages.map((msg) => (
                <tr key={msg._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(msg.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 capitalize">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${msg.type === 'announcement' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                      {msg.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-800 dark:text-gray-200 truncate max-w-xs">{msg.message}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                    {msg.receivers.length} person(s)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Compose Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compose Message</h3>
            <form onSubmit={handleSend} className="space-y-5">
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-violet-500 outline-none"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="direct">Direct Message</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Recipients ({formData.receivers.length} selected)</label>
                  <button type="button" onClick={selectAllRecipients} className="text-xs text-violet-600 hover:text-violet-800 dark:text-violet-400">Select All</button>
                </div>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg h-40 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900/30">
                  {facultyList.length === 0 ? (
                    <p className="text-sm text-gray-500 p-2">No faculty members found in database.</p>
                  ) : (
                    facultyList.map(faculty => (
                      <label key={faculty._id} className="flex items-center gap-3 p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.receivers.includes(faculty._id)}
                          onChange={() => toggleRecipient(faculty._id)}
                          className="rounded text-violet-600 focus:ring-violet-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{faculty.name} ({faculty.department})</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message Body</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-violet-500 outline-none resize-none"
                  placeholder="Type your message here..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium">Cancel</button>
                <button type="submit" disabled={isSending} className="px-5 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 font-medium flex items-center justify-center min-w-[120px]">
                  {isSending ? 'Sending...' : 'Send Message'}
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

export default Communication;
