import React, { useState } from 'react';
import MessagingPanel from '../../components/common/MessagingPanel';
import MessageHistory from '../../components/common/MessageHistory';
import { MessageSquare, Inbox, Edit3, Send } from 'lucide-react';

const Communication = () => {
  const [activeTab, setActiveTab] = useState('inbox'); // inbox | compose | history

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 animate-fade-in font-sans">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20 text-white">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Communication</h1>
          <p className="text-sm text-gray-500 mt-1">
            Send messages to faculty and students about your events.
          </p>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 mb-8 bg-gray-100/80 rounded-2xl w-fit border border-gray-200/50 shadow-sm">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
            activeTab === 'inbox'
              ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Inbox
        </button>
        <button
          onClick={() => setActiveTab('compose')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
            activeTab === 'compose'
              ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          Compose
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
            activeTab === 'history'
              ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
          }`}
        >
          <Send className="w-4 h-4" />
          Sent
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 md:p-6 overflow-hidden min-h-[500px]">
        {activeTab === 'inbox' && <MessageHistory mode="inbox" />}
        {activeTab === 'compose' && <MessagingPanel />}
        {activeTab === 'history' && <MessageHistory mode="sent" />}
      </div>
    </div>
  );
};

export default Communication;
