import React from 'react';

const FileList = ({ files = [], onRevoke }) => {
  if (!files || files.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center transition-colors duration-200">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-700/50 mb-4">
          <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">No resources shared yet</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
          Files you upload and share will appear here. You can manage their access at any time.
        </p>
      </div>
    );
  }

  // File icon helper
  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) {
      return (
        <div className="p-2.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </div>
      );
    }
    if (['doc', 'docx'].includes(ext)) {
      return (
        <div className="p-2.5 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      );
    }
    // Default file icon
    return (
      <div className="p-2.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-lg">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/80">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Active Resources</h3>
        <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
          {files.length} {files.length === 1 ? 'file' : 'files'}
        </span>
      </div>
      
      <ul className="divide-y divide-gray-100 dark:divide-gray-700">
        {files.map((file, index) => (
          <li 
            key={file.id} 
            className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150 animate-in fade-in slide-in-from-right-4"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* File Info */}
              <div className="flex items-center space-x-4">
                {getFileIcon(file.name)}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate pr-4">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center space-x-3">
                    <span className="inline-flex items-center">
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(file.uploadDate).toLocaleDateString()}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {file.sharedWith.type}: {file.sharedWith.target || 'All'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center sm:ml-4 sm:shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => onRevoke && onRevoke(file.id)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  Revoke Access
                </button>
              </div>

            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
