import React from 'react';
import ResultsView from '../../components/common/ResultsView';
import { Award } from 'lucide-react';

/**
 * Faculty Results Page
 * --------------------
 * Shows results only for events assigned to this faculty.
 */
const Results = () => {
  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 animate-fade-in font-sans">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20 text-white">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Event Results</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and publish results for your assigned events.</p>
        </div>
      </div>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-2 md:p-6 overflow-hidden">
        <ResultsView role="faculty" />
      </div>
    </div>
  );
};

export default Results;
