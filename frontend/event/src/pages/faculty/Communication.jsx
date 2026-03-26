import React, { useState } from 'react';
import MessagingPanel from '../../components/common/MessagingPanel';
import MessageHistory from '../../components/common/MessageHistory';

const Communication = () => {
  const [activeTab, setActiveTab] = useState('compose');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Communication</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Send messages to faculty and students about your events.
        </p>
      </div>

      <div className="flex gap-1 p-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('compose')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'compose'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          ✉️ Compose
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'history'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          📋 History
        </button>
      </div>

      {activeTab === 'compose' ? <MessagingPanel /> : <MessageHistory />}
    </div>
  );
};

export default Communication;
