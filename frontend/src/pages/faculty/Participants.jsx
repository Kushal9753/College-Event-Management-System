import React from 'react';
import { Users2 } from 'lucide-react';

const Participants = () => {
  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 animate-fade-in font-sans">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20 text-white">
          <Users2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Participants</h1>
          <p className="text-sm text-gray-500 mt-1">Manage participants for your assigned events.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
          <Users2 className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Participant Management</h3>
        <p className="text-gray-500 max-w-sm">This module is currently being built. You will soon be able to manage all event participants directly from this view.</p>
      </div>
    </div>
  );
};

export default Participants;
