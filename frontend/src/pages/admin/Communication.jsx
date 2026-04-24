import React, { useState } from 'react';
import MessagingPanel from '../../components/common/MessagingPanel';
import MessageHistory from '../../components/common/MessageHistory';

const Communication = () => {
  const [activeTab, setActiveTab] = useState('compose'); // inbox | compose | history

 return (
 <div>
 {/* page header */}
 <div className="mb-6">
 <h1 className="text-2xl font-bold text-gray-900 mb-1">Communication</h1>
 <p className="text-gray-600 ">
 Send messages to faculty, students, or broadcast announcements.
 </p>
 </div>

 {/* tab bar */}
 <div className="flex gap-1 p-1 mb-6 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'inbox'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 '
          }`}
        >
          📥 Inbox
        </button>
        <button
          onClick={() => setActiveTab('compose')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'compose'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 '
          }`}
        >
          ✉️ Compose
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'history'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 '
          }`}
        >
          📋 Sent
        </button>
      </div>

      {activeTab === 'inbox' && <MessageHistory mode="inbox" />}
      {activeTab === 'compose' && <MessagingPanel />}
      {activeTab === 'history' && <MessageHistory mode="sent" />}
    </div>
 );
};

export default Communication;
