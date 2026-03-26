import React, { useState, useRef } from 'react';

const FileUpload = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [accessType, setAccessType] = useState('department');
  const [accessTarget, setAccessTarget] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    
    // Mock upload delay
    setTimeout(() => {
      const newFileObj = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        sharedWith: {
          type: accessType,
          target: accessTarget || 'All'
        },
        uploadDate: new Date().toISOString(),
      };
      
      if (onUpload) {
        onUpload(newFileObj);
      }
      
      // Reset form
      setFile(null);
      setAccessTarget('');
      setIsUploading(false);
    }, 1500);
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Share Resource</h3>
      
      <form onSubmit={handleUploadSubmit} className="space-y-6">
        {/* Drag and Drop Zone */}
        <div 
          className={`relative w-full h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 transition-all duration-300 ease-in-out cursor-pointer
            ${isDragging 
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-400 scale-[1.02]' 
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:bg-gray-800'
            }
            ${file ? 'border-green-400 bg-green-50/30 dark:bg-green-900/10 dark:border-green-500' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          
          {file ? (
            <div className="flex flex-col items-center text-center space-y-2 animate-in fade-in zoom-in duration-300">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[200px]">
                {file.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatBytes(file.size)}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  <span className="text-blue-600 dark:text-blue-400 hover:underline">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  PDF, DOCX, XLSX, or ZIP (max. 50MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Access Configuration */}
        <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-2">
            Access Configuration
          </h4>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5 uppercase font-medium tracking-wide">Share With</label>
              <select 
                value={accessType}
                onChange={(e) => setAccessType(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-shadow appearance-none cursor-pointer"
              >
                <option value="department">Entire Department</option>
                <option value="faculty">Specific Faculty</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5 uppercase font-medium tracking-wide">
                {accessType === 'department' ? 'Department Name' : 'Faculty Email/ID'}
              </label>
              <input 
                type="text" 
                placeholder={accessType === 'department' ? 'e.g., Computer Science' : 'e.g., faculty@college.edu'}
                value={accessTarget}
                onChange={(e) => setAccessTarget(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-shadow placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!file || isUploading}
          className={`w-full py-3 px-4 flex items-center justify-center rounded-xl font-medium transition-all duration-300
            ${!file 
              ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900'
            }
          `}
        >
          {isUploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading securely...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Share Resource
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default FileUpload;
