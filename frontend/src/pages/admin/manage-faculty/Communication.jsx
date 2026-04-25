import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import { Send, MessageSquare, CheckCircle, XCircle, X, Users, Clock, User } from 'lucide-react';

const Communication = () => {
  const [messages, setMessages] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Compose modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
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
      setMessages(messagesRes.data.data || []);
      setFacultyList(facultyRes.data.data || []);
    } catch (error) {
      showToast('Failed to load communication data', 'error');
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
    if (formData.receivers.length === 0) return showToast('Select at least one recipient', 'error');
    
    setIsSending(true);
    try {
      const type = formData.receivers.length === facultyList.length ? 'broadcast' : 'group';
      await api.post('/messages/send', { ...formData, type });
      showToast('Message successfully dispatched!');
      setIsModalOpen(false);
      setFormData({ receivers: [], message: '' });
      fetchData(); 
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
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Communication Log</h2>
          <p className="mt-1 text-sm text-gray-500 max-w-lg">
            Send official announcements and track all dispatched messages to your faculty team.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
        >
          <Send className="w-4 h-4" />
          Compose Message
        </button>
      </div>

      {/* Content */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full shadow-md"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.15)] mb-5">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Messages Dispatched</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm">
              Your communication log is completely clear. Send your first broadcast to faculty members to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map((msg) => (
              <div key={msg._id} className="p-6 hover:bg-blue-50/30 transition-colors group">
                <div className="flex flex-col md:flex-row gap-5">
                  
                  {/* Left block: Avatar & Name */}
                  <div className="flex items-start gap-4 md:w-1/4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
                      <User className="w-5 h-5 text-white/90" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {msg.sender?.name || 'Administrator'}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        {msg.sender?.role === 'admin' ? 'Admin Office' : 'Faculty'}
                      </p>
                    </div>
                  </div>

                  {/* Center block: Message Content */}
                  <div className="flex-1">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-gray-800 text-sm leading-relaxed shadow-inner">
                      {msg.message}
                    </div>
                  </div>

                  {/* Right block: Meta details */}
                  <div className="md:w-1/5 flex flex-col items-end text-right justify-start gap-2">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      <Users className="w-3.5 h-3.5" />
                      {msg.receivers?.length || 0} Recipients
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400 mt-1">
                      {msg.type}
                    </span>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compose Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg p-7 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" />
                Dispatch Message
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSend} className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-bold text-gray-700">
                    Recipients <span className="text-blue-600">({formData.receivers.length} selected)</span>
                  </label>
                  <button type="button" onClick={selectAllRecipients} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                    Select All Faculty
                  </button>
                </div>
                <div className="border border-gray-200 rounded-xl max-h-48 overflow-y-auto p-2 bg-gray-50/50 shadow-inner">
                  {facultyList.length === 0 ? (
                    <p className="text-sm font-medium text-gray-500 p-4 text-center">No faculty members found in database.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-1">
                      {facultyList.map(faculty => (
                        <label key={faculty._id} className="flex items-center gap-3 p-2.5 hover:bg-white rounded-lg cursor-pointer border border-transparent hover:border-gray-200 transition-all select-none">
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={formData.receivers.includes(faculty._id)}
                              onChange={() => toggleRecipient(faculty._id)}
                              className="peer w-5 h-5 appearance-none border border-gray-300 rounded bg-white checked:bg-blue-600 checked:border-blue-600 transition-colors cursor-pointer"
                            />
                            <CheckCircle className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{faculty.name} <span className="text-gray-400 font-medium">({faculty.department})</span></span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message Content</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-all text-sm shadow-inner"
                  placeholder="Type your official announcement here..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSending} className="px-6 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 disabled:opacity-50 transition-all flex items-center justify-center min-w-[140px]">
                  {isSending ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>Send <Send className="w-4 h-4 ml-2" /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Premium Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[60] px-5 py-3.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-sm font-bold text-white transition-all flex items-center gap-2 animate-bounce-in ${toast.type === 'error' ? 'bg-red-500' : 'bg-gray-900'}`}>
          {toast.type === 'error' ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5 text-blue-400" />}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Communication;
