import React from 'react';

const TaskManagement = () => {
  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Task Management</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Assign, track, and manage tasks for faculty members.
        </p>
      </div>

      {/* Empty-state card */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/30 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-amber-600 dark:text-amber-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">No tasks assigned</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          Create and assign tasks to faculty. Track progress and deadlines here.
        </p>
        <button
          disabled
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white opacity-50 cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Task
        </button>
      </div>
    </div>
  );
};

export default TaskManagement;
