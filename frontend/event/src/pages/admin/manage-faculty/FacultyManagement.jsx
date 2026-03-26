import React from 'react';

const FacultyManagement = () => {
  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Faculty Management</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Add, edit, or remove faculty members and manage their roles.
        </p>
      </div>

      {/* Empty-state card */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-blue-600 dark:text-blue-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">No faculty members yet</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          Faculty members will appear here once they are added to the system.
        </p>
        <button
          disabled
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white opacity-50 cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Faculty
        </button>
      </div>
    </div>
  );
};

export default FacultyManagement;
